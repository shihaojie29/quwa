export type TripStatus = "planning" | "active" | "completed" | "cancelled";

export interface TripReminder {
  id: string;
  title: string;
  note?: string;
  pinned: boolean;
  remindAt?: string;
}

export interface Member {
  id: string;
  name: string;
  initial: string;
  color: string;
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: TripStatus;
  members: Member[];
  reminders: TripReminder[];
}

export type ItineraryItem =
  | { id: string; kind: "activity"; title: string; time: string; note?: string; location?: string }
  | {
      id: string;
      kind: "transport";
      title: string;
      time: string;
      timeEnd?: string;
      from?: string;
      to?: string;
      note?: string;
    };

export interface ItineraryDay {
  date: string;
  label?: string;
  items: ItineraryItem[];
}

export type ExpenseCategory = "交通" | "住宿" | "餐饮" | "景点" | "其他";

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  paidBy: string;
  isAA: boolean;
  note?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ChecklistCategory = "证件证卡" | "衣物" | "电子" | "其他";

export interface ChecklistItem {
  id: string;
  title: string;
  category: ChecklistCategory;
  done: boolean;
  note?: string;
}

export interface BootstrapPayload {
  trip: Trip;
  itineraryDays: ItineraryDay[];
  expenses: Expense[];
  notes: Note[];
  checklistItems: ChecklistItem[];
}

