import type { BootstrapPayload, ChecklistItem, Expense, ItineraryDay, ItineraryItem, Note, Trip } from "../domain";

export interface QuwaStore {
  getBootstrap(userId: string, tripId: string): Promise<BootstrapPayload>;
  getTrip(userId: string, tripId: string): Promise<Trip>;
  updateTrip(userId: string, tripId: string, trip: Trip): Promise<Trip>;
  updateBudget(userId: string, tripId: string, budget: number): Promise<Trip>;
  getItineraryDays(userId: string, tripId: string): Promise<ItineraryDay[]>;
  createItineraryItem(userId: string, tripId: string, date: string, item: ItineraryItem): Promise<ItineraryDay>;
  updateItineraryItem(userId: string, tripId: string, date: string, itemId: string, item: ItineraryItem): Promise<ItineraryDay>;
  deleteItineraryItem(userId: string, tripId: string, date: string, itemId: string): Promise<ItineraryDay>;
  getExpenses(userId: string, tripId: string): Promise<Expense[]>;
  createExpense(userId: string, tripId: string, expense: Expense): Promise<Expense>;
  updateExpense(userId: string, tripId: string, expenseId: string, expense: Expense): Promise<Expense>;
  deleteExpense(userId: string, tripId: string, expenseId: string): Promise<Expense[]>;
  getNotes(userId: string, tripId: string): Promise<Note[]>;
  createNote(userId: string, tripId: string, note: Note): Promise<Note>;
  updateNote(userId: string, tripId: string, noteId: string, note: Note): Promise<Note>;
  deleteNote(userId: string, tripId: string, noteId: string): Promise<Note[]>;
  getChecklistItems(userId: string, tripId: string): Promise<ChecklistItem[]>;
  createChecklistItem(userId: string, tripId: string, item: ChecklistItem): Promise<ChecklistItem>;
  updateChecklistItem(userId: string, tripId: string, itemId: string, item: ChecklistItem): Promise<ChecklistItem>;
  deleteChecklistItem(userId: string, tripId: string, itemId: string): Promise<ChecklistItem[]>;
}

