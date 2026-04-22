import type { BootstrapPayload, ChecklistItem, Expense, ItineraryDay, ItineraryItem, Note, Trip } from "../domain";
import { notFound } from "../errors";
import type { QuwaStore } from "./QuwaStore";

interface TripState {
  trip: Trip;
  itineraryDays: ItineraryDay[];
  expenses: Expense[];
  notes: Note[];
  checklistItems: ChecklistItem[];
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function buildTripDays(startDate: string, endDate: string): ItineraryDay[] {
  const days: ItineraryDay[] = [];
  const cursor = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T00:00:00.000Z`);
  let index = 1;

  while (cursor <= end) {
    days.push({
      date: cursor.toISOString().slice(0, 10),
      label: `第${index}天`,
      items: [],
    });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    index += 1;
  }

  return days;
}

function createSeedState(): TripState {
  const trip: Trip = {
    id: "trip-osaka-kyoto-2026",
    name: "大阪·京都 6日游",
    destination: "OSAKA",
    startDate: "2026-05-20",
    endDate: "2026-05-25",
    budget: 6800,
    status: "planning",
    members: [
      { id: "member-xiaoyu", name: "小鱼", initial: "鱼", color: "#F07A5A" },
      { id: "member-acheng", name: "阿橙", initial: "橙", color: "#FFB84D" },
    ],
    reminders: [
      {
        id: "reminder-pinned-1",
        title: "居酒屋预约",
        note: "5月21日 19:00 · 2位，出发前再确认一次。",
        pinned: true,
        remindAt: "2026-05-19",
      },
    ],
  };

  const itineraryDays = buildTripDays(trip.startDate, trip.endDate);
  itineraryDays[0].items = [
    {
      id: "item-flight-1",
      kind: "transport",
      title: "JL789 飞大阪",
      time: "08:50",
      timeEnd: "10:30",
      from: "上海浦东 PVG",
      to: "关西机场 KIX",
      note: "经济舱 · 约2h40m",
    },
  ];
  itineraryDays[1].items = [
    {
      id: "item-activity-2",
      kind: "activity",
      title: "大阪城公园",
      time: "10:00",
      location: "大阪",
      note: "天守阁和公园慢慢逛。",
    },
  ];

  return {
    trip,
    itineraryDays,
    expenses: [
      {
        id: "expense-transport-1",
        title: "机票定金",
        category: "交通",
        amount: 320,
        date: "2026-05-20",
        paidBy: "member-xiaoyu",
        isAA: true,
      },
      {
        id: "expense-hotel-1",
        title: "酒店 6 晚",
        category: "住宿",
        amount: 2400,
        date: "2026-05-20",
        paidBy: "member-acheng",
        isAA: true,
      },
    ],
    notes: [
      {
        id: "note-1",
        title: "行前提醒",
        content: "确认护照、机票和酒店订单。",
        pinned: true,
        createdAt: "2026-05-01T08:00:00.000Z",
        updatedAt: "2026-05-01T08:00:00.000Z",
      },
    ],
    checklistItems: [
      { id: "checklist-id-1", title: "护照", category: "证件证卡", done: false },
      { id: "checklist-electronic-1", title: "充电器", category: "电子", done: false },
    ],
  };
}

export class InMemoryQuwaStore implements QuwaStore {
  private readonly trips = new Map<string, TripState>();

  constructor(initialState: TripState = createSeedState()) {
    this.trips.set(initialState.trip.id, clone(initialState));
  }

  async getBootstrap(userId: string, tripId: string): Promise<BootstrapPayload> {
    const state = this.getState(tripId);

    return clone(state);
  }

  async getTrip(userId: string, tripId: string): Promise<Trip> {
    return clone(this.getState(tripId).trip);
  }

  async updateTrip(userId: string, tripId: string, trip: Trip): Promise<Trip> {
    const state = this.getState(tripId);
    state.trip = clone({ ...trip, id: tripId });

    return clone(state.trip);
  }

  async updateBudget(userId: string, tripId: string, budget: number): Promise<Trip> {
    const state = this.getState(tripId);
    state.trip.budget = budget;

    return clone(state.trip);
  }

  async getItineraryDays(userId: string, tripId: string): Promise<ItineraryDay[]> {
    return clone(this.getState(tripId).itineraryDays);
  }

  async createItineraryItem(userId: string, tripId: string, date: string, item: ItineraryItem): Promise<ItineraryDay> {
    const day = this.getDay(tripId, date);
    day.items = [...day.items, clone(item)];

    return clone(day);
  }

  async updateItineraryItem(userId: string, tripId: string, date: string, itemId: string, item: ItineraryItem): Promise<ItineraryDay> {
    const day = this.getDay(tripId, date);
    day.items = day.items.map((current) => (current.id === itemId ? clone({ ...item, id: itemId }) : current));

    return clone(day);
  }

  async deleteItineraryItem(userId: string, tripId: string, date: string, itemId: string): Promise<ItineraryDay> {
    const day = this.getDay(tripId, date);
    day.items = day.items.filter((item) => item.id !== itemId);

    return clone(day);
  }

  async getExpenses(userId: string, tripId: string): Promise<Expense[]> {
    return clone(this.getState(tripId).expenses);
  }

  async createExpense(userId: string, tripId: string, expense: Expense): Promise<Expense> {
    const state = this.getState(tripId);
    state.expenses = [...state.expenses, clone(expense)];

    return clone(expense);
  }

  async updateExpense(userId: string, tripId: string, expenseId: string, expense: Expense): Promise<Expense> {
    const state = this.getState(tripId);
    const nextExpense = clone({ ...expense, id: expenseId });
    state.expenses = state.expenses.map((current) => (current.id === expenseId ? nextExpense : current));

    return clone(nextExpense);
  }

  async deleteExpense(userId: string, tripId: string, expenseId: string): Promise<Expense[]> {
    const state = this.getState(tripId);
    state.expenses = state.expenses.filter((expense) => expense.id !== expenseId);

    return clone(state.expenses);
  }

  async getNotes(userId: string, tripId: string): Promise<Note[]> {
    return clone(this.getState(tripId).notes);
  }

  async createNote(userId: string, tripId: string, note: Note): Promise<Note> {
    const state = this.getState(tripId);
    state.notes = [...state.notes, clone(note)];

    return clone(note);
  }

  async updateNote(userId: string, tripId: string, noteId: string, note: Note): Promise<Note> {
    const state = this.getState(tripId);
    const nextNote = clone({ ...note, id: noteId });
    state.notes = state.notes.map((current) => (current.id === noteId ? nextNote : current));

    return clone(nextNote);
  }

  async deleteNote(userId: string, tripId: string, noteId: string): Promise<Note[]> {
    const state = this.getState(tripId);
    state.notes = state.notes.filter((note) => note.id !== noteId);

    return clone(state.notes);
  }

  async getChecklistItems(userId: string, tripId: string): Promise<ChecklistItem[]> {
    return clone(this.getState(tripId).checklistItems);
  }

  async createChecklistItem(userId: string, tripId: string, item: ChecklistItem): Promise<ChecklistItem> {
    const state = this.getState(tripId);
    state.checklistItems = [...state.checklistItems, clone(item)];

    return clone(item);
  }

  async updateChecklistItem(userId: string, tripId: string, itemId: string, item: ChecklistItem): Promise<ChecklistItem> {
    const state = this.getState(tripId);
    const nextItem = clone({ ...item, id: itemId });
    state.checklistItems = state.checklistItems.map((current) => (current.id === itemId ? nextItem : current));

    return clone(nextItem);
  }

  async deleteChecklistItem(userId: string, tripId: string, itemId: string): Promise<ChecklistItem[]> {
    const state = this.getState(tripId);
    state.checklistItems = state.checklistItems.filter((item) => item.id !== itemId);

    return clone(state.checklistItems);
  }

  private getState(tripId: string): TripState {
    const state = this.trips.get(tripId);

    if (!state) {
      throw notFound(`Trip not found: ${tripId}`);
    }

    return state;
  }

  private getDay(tripId: string, date: string): ItineraryDay {
    const day = this.getState(tripId).itineraryDays.find((candidate) => candidate.date === date);

    if (!day) {
      throw notFound(`Itinerary day not found: ${date}`);
    }

    return day;
  }
}

