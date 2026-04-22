import { describe, expect, it } from "vitest";
import { useChecklist } from "@/composables/useChecklist";
import { STORAGE_KEYS } from "@/repositories/storage/storageKeys";
import type { ChecklistItem } from "@/types/checklist";

async function mountChecklistComposableWithSeed() {
  const checklist = useChecklist();

  await checklist.ready;

  return checklist;
}

describe("useChecklist", () => {
  it("computes checklist progress and updates it when toggling an item", async () => {
    const checklist = await mountChecklistComposableWithSeed();

    expect(checklist.doneCount.value).toBe(0);
    expect(checklist.totalCount.value).toBe(3);
    expect(checklist.progressPercentage.value).toBe(0);
    expect(checklist.progressText.value).toBe("0/3");

    await checklist.toggleItem("checklist-id-1");

    expect(checklist.doneCount.value).toBe(1);
    expect(checklist.totalCount.value).toBe(3);
    expect(checklist.progressPercentage.value).toBe(33);
    expect(checklist.progressText.value).toBe("1/3");
    expect(checklist.items.value.find((item) => item.id === "checklist-id-1")?.done).toBe(true);
  });

  it("ignores items with unknown categories when grouping stale storage", async () => {
    const items = [
      {
        id: "checklist-valid",
        title: "身份证",
        category: "证件证卡",
        done: false,
      },
      {
        id: "checklist-stale",
        title: "旧分类项目",
        category: "旧分类",
        done: false,
      },
      {
        id: "checklist-prototype-key",
        title: "原型键项目",
        category: "constructor",
        done: false,
      },
    ] as ChecklistItem[];
    uni.setStorageSync(STORAGE_KEYS.checklist, items);

    const checklist = await mountChecklistComposableWithSeed();

    expect(checklist.groupedItems.value["证件证卡"]).toHaveLength(1);
    expect(checklist.groupedItems.value["其他"]).toHaveLength(0);
  });
});
