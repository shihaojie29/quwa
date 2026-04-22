export const STORAGE_KEYS = {
  trip: "quwa.trip",
  itinerary: "quwa.itinerary",
  expense: "quwa.expense",
  notes: "quwa.notes",
  checklist: "quwa.checklist",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
