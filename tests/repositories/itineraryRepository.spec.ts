import { STORAGE_KEYS } from "../../src/repositories/storage/storageKeys";
import {
  createItineraryItem,
  getItineraryDays,
  removeItineraryItem,
  syncDaysFromTripRange,
  updateItineraryItem,
} from "../../src/repositories/itineraryRepository";
import type { ItineraryItem } from "../../src/types/itinerary";

describe("itineraryRepository", () => {
  it("seeds itinerary days when storage is empty", async () => {
    const days = await getItineraryDays();

    expect(days).toHaveLength(6);
    expect(days[0]?.label).toBe("第1天");
    expect(uni.getStorageSync(STORAGE_KEYS.itinerary)).toEqual(days);
  });

  it("syncs itinerary days from trip date range and preserves same-date items", async () => {
    await getItineraryDays();

    const preservedItem: ItineraryItem = {
      id: "custom-item-1",
      kind: "activity",
      title: "保留项目",
      time: "14:00",
      location: "南京路",
    };

    await createItineraryItem("2026-05-21", preservedItem);

    const days = await syncDaysFromTripRange({
      startDate: "2026-05-20",
      endDate: "2026-05-22",
    });

    expect(days.map((day) => day.label)).toEqual(["Day 1", "Day 2", "Day 3"]);
    expect(days.find((day) => day.date === "2026-05-21")?.items).toContainEqual(preservedItem);
    expect(days).toHaveLength(3);
  });

  it("item crud only mutates items within existing day shells", async () => {
    const created = await createItineraryItem("2026-05-20", {
      id: "custom-item-2",
      kind: "activity",
      title: "新增项目",
      time: "09:00",
    });

    expect(created.items).toHaveLength(2);

    const updated = await updateItineraryItem("2026-05-20", {
      id: "custom-item-2",
      kind: "activity",
      title: "修改项目",
      time: "10:00",
    });

    expect(updated.items.find((item) => item.id === "custom-item-2")?.title).toBe("修改项目");
    expect(updated.items).toHaveLength(2);

    const removed = await removeItineraryItem("2026-05-20", "custom-item-2");

    expect(removed.items.find((item) => item.id === "custom-item-2")).toBeUndefined();
    expect((uni.getStorageSync(STORAGE_KEYS.itinerary) as Array<unknown>).length).toBe(6);
  });
});
