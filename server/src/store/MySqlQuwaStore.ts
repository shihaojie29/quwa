import type { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import type {
  BootstrapPayload,
  ChecklistItem,
  Expense,
  ExpenseCategory,
  ItineraryDay,
  ItineraryItem,
  Note,
  Trip,
  TripStatus,
} from "../domain";
import { notFound } from "../errors";
import type { QuwaStore } from "./QuwaStore";

type SqlParam = string | number | boolean | null;

interface TripRow extends RowDataPacket {
  id: string;
  name: string;
  destination: string;
  start_date: string;
  end_date: string;
  budget: string | number;
  status: TripStatus;
}

interface MemberRow extends RowDataPacket {
  id: string;
  name: string;
  initial: string;
  color: string;
}

interface ReminderRow extends RowDataPacket {
  id: string;
  title: string;
  note: string | null;
  pinned: 0 | 1;
  remind_at: string | null;
}

interface DayRow extends RowDataPacket {
  date: string;
  label: string | null;
}

interface ItineraryItemRow extends RowDataPacket {
  id: string;
  date: string;
  kind: "activity" | "transport";
  title: string;
  time: string;
  time_end: string | null;
  from_place: string | null;
  to_place: string | null;
  location: string | null;
  note: string | null;
}

interface ExpenseRow extends RowDataPacket {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: string | number;
  expense_date: string;
  paid_by_member_id: string;
  is_aa: 0 | 1;
  note: string | null;
}

interface NoteRow extends RowDataPacket {
  id: string;
  title: string;
  content: string;
  pinned: 0 | 1;
  created_at_text: string;
  updated_at_text: string;
}

interface ChecklistRow extends RowDataPacket {
  id: string;
  title: string;
  category: ChecklistItem["category"];
  done: 0 | 1;
  note: string | null;
}

function optional<T>(value: T | null): T | undefined {
  return value === null ? undefined : value;
}

function mapItem(row: ItineraryItemRow): ItineraryItem {
  if (row.kind === "transport") {
    return {
      id: row.id,
      kind: "transport",
      title: row.title,
      time: row.time,
      timeEnd: optional(row.time_end),
      from: optional(row.from_place),
      to: optional(row.to_place),
      note: optional(row.note),
    };
  }

  return {
    id: row.id,
    kind: "activity",
    title: row.title,
    time: row.time,
    location: optional(row.location),
    note: optional(row.note),
  };
}

export class MySqlQuwaStore implements QuwaStore {
  constructor(private readonly pool: Pool) {}

  async getBootstrap(userId: string, tripId: string): Promise<BootstrapPayload> {
    const [trip, itineraryDays, expenses, notes, checklistItems] = await Promise.all([
      this.getTrip(userId, tripId),
      this.getItineraryDays(userId, tripId),
      this.getExpenses(userId, tripId),
      this.getNotes(userId, tripId),
      this.getChecklistItems(userId, tripId),
    ]);

    return { trip, itineraryDays, expenses, notes, checklistItems };
  }

  async getTrip(userId: string, tripId: string): Promise<Trip> {
    const [tripRows] = await this.pool.query<TripRow[]>(
      "SELECT id, name, destination, start_date, end_date, budget, status FROM trips WHERE id = ? AND owner_user_id = ?",
      [tripId, userId],
    );
    const tripRow = tripRows[0];

    if (!tripRow) {
      throw notFound(`Trip not found: ${tripId}`);
    }

    const [members] = await this.pool.query<MemberRow[]>(
      "SELECT id, name, initial, color FROM trip_members WHERE trip_id = ? ORDER BY sort_order, id",
      [tripId],
    );
    const [reminders] = await this.pool.query<ReminderRow[]>(
      "SELECT id, title, note, pinned, remind_at FROM trip_reminders WHERE trip_id = ? ORDER BY pinned DESC, id",
      [tripId],
    );

    return {
      id: tripRow.id,
      name: tripRow.name,
      destination: tripRow.destination,
      startDate: tripRow.start_date,
      endDate: tripRow.end_date,
      budget: Number(tripRow.budget),
      status: tripRow.status,
      members: members.map((member) => ({
        id: member.id,
        name: member.name,
        initial: member.initial,
        color: member.color,
      })),
      reminders: reminders.map((reminder) => ({
        id: reminder.id,
        title: reminder.title,
        note: optional(reminder.note),
        pinned: Boolean(reminder.pinned),
        remindAt: optional(reminder.remind_at),
      })),
    };
  }

  async updateTrip(userId: string, tripId: string, trip: Trip): Promise<Trip> {
    const connection = await this.pool.getConnection();

    try {
      await connection.beginTransaction();
      const [result] = await connection.execute<ResultSetHeader>(
        "UPDATE trips SET name = ?, destination = ?, start_date = ?, end_date = ?, budget = ?, status = ? WHERE id = ? AND owner_user_id = ?",
        [trip.name, trip.destination, trip.startDate, trip.endDate, trip.budget, trip.status, tripId, userId],
      );

      if (result.affectedRows === 0) {
        throw notFound(`Trip not found: ${tripId}`);
      }

      await connection.execute("DELETE FROM trip_reminders WHERE trip_id = ?", [tripId]);
      await connection.execute("DELETE FROM trip_members WHERE trip_id = ?", [tripId]);

      for (const [index, member] of trip.members.entries()) {
        await connection.execute(
          "INSERT INTO trip_members (id, trip_id, name, initial, color, sort_order) VALUES (?, ?, ?, ?, ?, ?)",
          [member.id, tripId, member.name, member.initial, member.color, index],
        );
      }

      for (const reminder of trip.reminders) {
        await connection.execute(
          "INSERT INTO trip_reminders (id, trip_id, title, note, pinned, remind_at) VALUES (?, ?, ?, ?, ?, ?)",
          [reminder.id, tripId, reminder.title, reminder.note ?? null, reminder.pinned, reminder.remindAt ?? null],
        );
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    return this.getTrip(userId, tripId);
  }

  async updateBudget(userId: string, tripId: string, budget: number): Promise<Trip> {
    const [result] = await this.pool.execute<ResultSetHeader>(
      "UPDATE trips SET budget = ? WHERE id = ? AND owner_user_id = ?",
      [budget, tripId, userId],
    );

    if (result.affectedRows === 0) {
      throw notFound(`Trip not found: ${tripId}`);
    }

    return this.getTrip(userId, tripId);
  }

  async getItineraryDays(userId: string, tripId: string): Promise<ItineraryDay[]> {
    await this.ensureTrip(userId, tripId);

    const [days] = await this.pool.query<DayRow[]>(
      "SELECT date, label FROM itinerary_days WHERE trip_id = ? ORDER BY date",
      [tripId],
    );
    const [items] = await this.pool.query<ItineraryItemRow[]>(
      "SELECT id, date, kind, title, time, time_end, from_place, to_place, location, note FROM itinerary_items WHERE trip_id = ? ORDER BY date, sort_order, time",
      [tripId],
    );
    const itemsByDate = new Map<string, ItineraryItem[]>();

    for (const item of items) {
      const list = itemsByDate.get(item.date) ?? [];
      list.push(mapItem(item));
      itemsByDate.set(item.date, list);
    }

    return days.map((day) => ({
      date: day.date,
      label: optional(day.label),
      items: itemsByDate.get(day.date) ?? [],
    }));
  }

  async createItineraryItem(userId: string, tripId: string, date: string, item: ItineraryItem): Promise<ItineraryDay> {
    await this.ensureDay(userId, tripId, date);
    await this.pool.execute(
      "INSERT INTO itinerary_items (id, trip_id, date, kind, title, time, time_end, from_place, to_place, location, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      this.itemParams(tripId, date, item),
    );

    return this.getItineraryDay(userId, tripId, date);
  }

  async updateItineraryItem(userId: string, tripId: string, date: string, itemId: string, item: ItineraryItem): Promise<ItineraryDay> {
    await this.ensureDay(userId, tripId, date);
    const [result] = await this.pool.execute<ResultSetHeader>(
      "UPDATE itinerary_items SET kind = ?, title = ?, time = ?, time_end = ?, from_place = ?, to_place = ?, location = ?, note = ? WHERE id = ? AND trip_id = ? AND date = ?",
      [
        item.kind,
        item.title,
        item.time,
        item.kind === "transport" ? item.timeEnd ?? null : null,
        item.kind === "transport" ? item.from ?? null : null,
        item.kind === "transport" ? item.to ?? null : null,
        item.kind === "activity" ? item.location ?? null : null,
        item.note ?? null,
        itemId,
        tripId,
        date,
      ],
    );

    if (result.affectedRows === 0) {
      throw notFound(`Itinerary item not found: ${itemId}`);
    }

    return this.getItineraryDay(userId, tripId, date);
  }

  async deleteItineraryItem(userId: string, tripId: string, date: string, itemId: string): Promise<ItineraryDay> {
    await this.ensureDay(userId, tripId, date);
    await this.pool.execute("DELETE FROM itinerary_items WHERE id = ? AND trip_id = ? AND date = ?", [itemId, tripId, date]);

    return this.getItineraryDay(userId, tripId, date);
  }

  async getExpenses(userId: string, tripId: string): Promise<Expense[]> {
    await this.ensureTrip(userId, tripId);
    const [rows] = await this.pool.query<ExpenseRow[]>(
      "SELECT id, title, category, amount, expense_date, paid_by_member_id, is_aa, note FROM expenses WHERE trip_id = ? ORDER BY expense_date, created_at",
      [tripId],
    );

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      amount: Number(row.amount),
      date: row.expense_date,
      paidBy: row.paid_by_member_id,
      isAA: Boolean(row.is_aa),
      note: optional(row.note),
    }));
  }

  async createExpense(userId: string, tripId: string, expense: Expense): Promise<Expense> {
    await this.ensureTrip(userId, tripId);
    await this.pool.execute(
      "INSERT INTO expenses (id, trip_id, title, category, amount, expense_date, paid_by_member_id, is_aa, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [expense.id, tripId, expense.title, expense.category, expense.amount, expense.date, expense.paidBy, expense.isAA, expense.note ?? null],
    );

    return expense;
  }

  async updateExpense(userId: string, tripId: string, expenseId: string, expense: Expense): Promise<Expense> {
    await this.ensureTrip(userId, tripId);
    const [result] = await this.pool.execute<ResultSetHeader>(
      "UPDATE expenses SET title = ?, category = ?, amount = ?, expense_date = ?, paid_by_member_id = ?, is_aa = ?, note = ? WHERE id = ? AND trip_id = ?",
      [expense.title, expense.category, expense.amount, expense.date, expense.paidBy, expense.isAA, expense.note ?? null, expenseId, tripId],
    );

    if (result.affectedRows === 0) {
      throw notFound(`Expense not found: ${expenseId}`);
    }

    return { ...expense, id: expenseId };
  }

  async deleteExpense(userId: string, tripId: string, expenseId: string): Promise<Expense[]> {
    await this.ensureTrip(userId, tripId);
    await this.pool.execute("DELETE FROM expenses WHERE id = ? AND trip_id = ?", [expenseId, tripId]);

    return this.getExpenses(userId, tripId);
  }

  async getNotes(userId: string, tripId: string): Promise<Note[]> {
    await this.ensureTrip(userId, tripId);
    const [rows] = await this.pool.query<NoteRow[]>(
      "SELECT id, title, content, pinned, created_at_text, updated_at_text FROM notes WHERE trip_id = ? ORDER BY pinned DESC, updated_at DESC",
      [tripId],
    );

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      content: row.content,
      pinned: Boolean(row.pinned),
      createdAt: row.created_at_text,
      updatedAt: row.updated_at_text,
    }));
  }

  async createNote(userId: string, tripId: string, note: Note): Promise<Note> {
    await this.ensureTrip(userId, tripId);
    await this.pool.execute(
      "INSERT INTO notes (id, trip_id, title, content, pinned, created_at_text, updated_at_text) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [note.id, tripId, note.title, note.content, note.pinned, note.createdAt, note.updatedAt],
    );

    return note;
  }

  async updateNote(userId: string, tripId: string, noteId: string, note: Note): Promise<Note> {
    await this.ensureTrip(userId, tripId);
    const [result] = await this.pool.execute<ResultSetHeader>(
      "UPDATE notes SET title = ?, content = ?, pinned = ?, created_at_text = ?, updated_at_text = ? WHERE id = ? AND trip_id = ?",
      [note.title, note.content, note.pinned, note.createdAt, note.updatedAt, noteId, tripId],
    );

    if (result.affectedRows === 0) {
      throw notFound(`Note not found: ${noteId}`);
    }

    return { ...note, id: noteId };
  }

  async deleteNote(userId: string, tripId: string, noteId: string): Promise<Note[]> {
    await this.ensureTrip(userId, tripId);
    await this.pool.execute("DELETE FROM notes WHERE id = ? AND trip_id = ?", [noteId, tripId]);

    return this.getNotes(userId, tripId);
  }

  async getChecklistItems(userId: string, tripId: string): Promise<ChecklistItem[]> {
    await this.ensureTrip(userId, tripId);
    const [rows] = await this.pool.query<ChecklistRow[]>(
      "SELECT id, title, category, done, note FROM checklist_items WHERE trip_id = ? ORDER BY category, sort_order, id",
      [tripId],
    );

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      done: Boolean(row.done),
      note: optional(row.note),
    }));
  }

  async createChecklistItem(userId: string, tripId: string, item: ChecklistItem): Promise<ChecklistItem> {
    await this.ensureTrip(userId, tripId);
    await this.pool.execute(
      "INSERT INTO checklist_items (id, trip_id, title, category, done, note) VALUES (?, ?, ?, ?, ?, ?)",
      [item.id, tripId, item.title, item.category, item.done, item.note ?? null],
    );

    return item;
  }

  async updateChecklistItem(userId: string, tripId: string, itemId: string, item: ChecklistItem): Promise<ChecklistItem> {
    await this.ensureTrip(userId, tripId);
    const [result] = await this.pool.execute<ResultSetHeader>(
      "UPDATE checklist_items SET title = ?, category = ?, done = ?, note = ? WHERE id = ? AND trip_id = ?",
      [item.title, item.category, item.done, item.note ?? null, itemId, tripId],
    );

    if (result.affectedRows === 0) {
      throw notFound(`Checklist item not found: ${itemId}`);
    }

    return { ...item, id: itemId };
  }

  async deleteChecklistItem(userId: string, tripId: string, itemId: string): Promise<ChecklistItem[]> {
    await this.ensureTrip(userId, tripId);
    await this.pool.execute("DELETE FROM checklist_items WHERE id = ? AND trip_id = ?", [itemId, tripId]);

    return this.getChecklistItems(userId, tripId);
  }

  private itemParams(tripId: string, date: string, item: ItineraryItem): SqlParam[] {
    return [
      item.id,
      tripId,
      date,
      item.kind,
      item.title,
      item.time,
      item.kind === "transport" ? item.timeEnd ?? null : null,
      item.kind === "transport" ? item.from ?? null : null,
      item.kind === "transport" ? item.to ?? null : null,
      item.kind === "activity" ? item.location ?? null : null,
      item.note ?? null,
    ];
  }

  private async getItineraryDay(userId: string, tripId: string, date: string): Promise<ItineraryDay> {
    const days = await this.getItineraryDays(userId, tripId);
    const day = days.find((candidate) => candidate.date === date);

    if (!day) {
      throw notFound(`Itinerary day not found: ${date}`);
    }

    return day;
  }

  private async ensureDay(userId: string, tripId: string, date: string): Promise<void> {
    await this.ensureTrip(userId, tripId);
    const [rows] = await this.pool.query<DayRow[]>(
      "SELECT date, label FROM itinerary_days WHERE trip_id = ? AND date = ?",
      [tripId, date],
    );

    if (!rows[0]) {
      throw notFound(`Itinerary day not found: ${date}`);
    }
  }

  private async ensureTrip(userId: string, tripId: string): Promise<void> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      "SELECT id FROM trips WHERE id = ? AND owner_user_id = ?",
      [tripId, userId],
    );

    if (!rows[0]) {
      throw notFound(`Trip not found: ${tripId}`);
    }
  }
}
