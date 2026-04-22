import { CHECKLIST_CATEGORIES } from "../constants/categories";
import { seedChecklist } from "../mock/seed";
import type { ChecklistItem } from "../types/checklist";
import { localStorageAdapter } from "./storage/localStorageAdapter";
import { STORAGE_KEYS } from "./storage/storageKeys";

function cloneChecklist(items: ChecklistItem[]): ChecklistItem[] {
  return items.map((item) => ({ ...item }));
}

function validateChecklistCategory(item: ChecklistItem): void {
  if (!CHECKLIST_CATEGORIES.includes(item.category)) {
    throw new Error(`Invalid checklist category: ${item.category}`);
  }
}

function persistChecklist(items: ChecklistItem[]): ChecklistItem[] {
  const nextItems = cloneChecklist(items);
  localStorageAdapter.set(STORAGE_KEYS.checklist, nextItems);

  return nextItems;
}

export async function getChecklistItems(): Promise<ChecklistItem[]> {
  const storedItems = localStorageAdapter.get<ChecklistItem[]>(STORAGE_KEYS.checklist);

  if (storedItems) {
    return cloneChecklist(storedItems);
  }

  return persistChecklist(seedChecklist);
}

export async function addChecklistItem(item: ChecklistItem): Promise<ChecklistItem> {
  validateChecklistCategory(item);

  const items = await getChecklistItems();
  const nextItem = { ...item };

  persistChecklist([...items, nextItem]);

  return nextItem;
}

export async function updateChecklistItem(item: ChecklistItem): Promise<ChecklistItem> {
  validateChecklistCategory(item);

  const items = await getChecklistItems();
  const nextItem = { ...item };

  persistChecklist(items.map((currentItem) => (currentItem.id === item.id ? nextItem : currentItem)));

  return nextItem;
}

export async function removeChecklistItem(id: string): Promise<ChecklistItem[]> {
  const items = await getChecklistItems();

  return persistChecklist(items.filter((item) => item.id !== id));
}
