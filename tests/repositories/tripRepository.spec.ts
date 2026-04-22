import { STORAGE_KEYS } from "../../src/repositories/storage/storageKeys";
import { getTrip, updateBudget, updateTrip } from "../../src/repositories/tripRepository";

describe("tripRepository", () => {
  it("initializes trip storage from seed when empty", async () => {
    const trip = await getTrip();

    expect(trip.name).toContain("大阪");
    expect(trip.members.map((member) => member.name)).toEqual(["小鱼", "阿橙"]);
    expect(uni.getStorageSync(STORAGE_KEYS.trip)).toEqual(trip);
  });

  it("persists budget changes to trip storage", async () => {
    const updatedTrip = await updateBudget(9999);

    expect(updatedTrip.budget).toBe(9999);
    expect(uni.getStorageSync(STORAGE_KEYS.trip)).toEqual(updatedTrip);
  });

  it("persists reminder edits through trip updates", async () => {
    const currentTrip = await getTrip();
    const nextTrip = {
      ...currentTrip,
      reminders: currentTrip.reminders.map((reminder) =>
        reminder.pinned
          ? {
              ...reminder,
              title: "已更新提醒",
              note: "新的提醒内容",
            }
          : reminder,
      ),
    };

    const updatedTrip = await updateTrip(nextTrip);

    expect(updatedTrip.reminders.find((reminder) => reminder.pinned)?.title).toBe("已更新提醒");
    expect(uni.getStorageSync(STORAGE_KEYS.trip)).toEqual(updatedTrip);
  });
});
