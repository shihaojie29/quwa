import { computed, ref } from "vue";
import { CHECKLIST_CATEGORIES } from "../constants/categories";
import {
  addChecklistItem,
  getChecklistItems,
  removeChecklistItem,
  updateChecklistItem,
} from "../repositories/checklistRepository";
import type { ChecklistCategory, ChecklistItem } from "../types/checklist";

function createId(): string {
  return `checklist-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const checklistCategorySet = new Set<string>(CHECKLIST_CATEGORIES);

export function useChecklist() {
  const items = ref<ChecklistItem[]>([]);
  const loading = ref(false);

  async function refresh(): Promise<void> {
    loading.value = true;

    try {
      items.value = await getChecklistItems();
    } finally {
      loading.value = false;
    }
  }

  const ready = refresh();

  const groupedItems = computed<Record<ChecklistCategory, ChecklistItem[]>>(() => {
    const groups = {} as Record<ChecklistCategory, ChecklistItem[]>;

    for (const category of CHECKLIST_CATEGORIES) {
      groups[category] = [];
    }

    for (const item of items.value) {
      // Stale local storage can contain categories removed from the fixed list.
      if (checklistCategorySet.has(item.category)) {
        groups[item.category as ChecklistCategory].push(item);
      }
    }

    return groups;
  });

  const doneCount = computed(() => items.value.filter((item) => item.done).length);
  const totalCount = computed(() => items.value.length);
  const progressPercentage = computed(() => (totalCount.value === 0 ? 0 : Math.round((doneCount.value / totalCount.value) * 100)));
  const progressText = computed(() => `${doneCount.value}/${totalCount.value}`);

  async function toggleItem(id: string): Promise<ChecklistItem | undefined> {
    const item = items.value.find((candidate) => candidate.id === id);

    if (!item) {
      return undefined;
    }

    const nextItem = await updateChecklistItem({ ...item, done: !item.done });
    items.value = items.value.map((currentItem) => (currentItem.id === nextItem.id ? nextItem : currentItem));

    return nextItem;
  }

  async function addItem(payload: Omit<ChecklistItem, "id" | "done"> & Partial<Pick<ChecklistItem, "id" | "done">>): Promise<ChecklistItem> {
    const item: ChecklistItem = {
      id: payload.id ?? createId(),
      title: payload.title,
      category: payload.category,
      done: payload.done ?? false,
      note: payload.note,
    };
    const nextItem = await addChecklistItem(item);
    items.value = [...items.value, nextItem];

    return nextItem;
  }

  async function removeItem(id: string): Promise<void> {
    items.value = await removeChecklistItem(id);
  }

  return {
    items,
    loading,
    ready,
    refresh,
    groupedItems,
    doneCount,
    totalCount,
    progressPercentage,
    progressText,
    toggleItem,
    addItem,
    removeItem,
  };
}
