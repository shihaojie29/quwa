import { afterEach, describe, expect, it, vi } from "vitest";
import { useTripData } from "@/composables/useTripData";
import { STORAGE_KEYS } from "@/repositories/storage/storageKeys";
import type { ItineraryDay } from "@/types/itinerary";

async function mountTripDataComposableWithSeed() {
  const tripData = useTripData();

  await tripData.ready;

  return tripData;
}

describe("useTripData", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("selects the next future transport by day date and item time", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 20, 9, 0));

    const days: ItineraryDay[] = [
      {
        date: "2026-05-21",
        items: [{ id: "transport-later", kind: "transport", title: "Later train", time: "08:00" }],
      },
      {
        date: "2026-05-20",
        items: [{ id: "transport-next", kind: "transport", title: "Next train", time: "10:00" }],
      },
      {
        date: "2026-05-19",
        items: [{ id: "transport-past", kind: "transport", title: "Past train", time: "20:00" }],
      },
    ];
    uni.setStorageSync(STORAGE_KEYS.itinerary, days);

    const { upcomingTransport } = await mountTripDataComposableWithSeed();

    expect(upcomingTransport.value?.id).toBe("transport-next");
  });

  it("falls back to the earliest transport when no future transport exists", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 22, 9, 0));

    const days: ItineraryDay[] = [
      {
        date: "2026-05-21",
        items: [{ id: "transport-later", kind: "transport", title: "Later train", time: "08:00" }],
      },
      {
        date: "2026-05-20",
        items: [{ id: "transport-earliest", kind: "transport", title: "Earliest train", time: "10:00" }],
      },
    ];
    uni.setStorageSync(STORAGE_KEYS.itinerary, days);

    const { upcomingTransport } = await mountTripDataComposableWithSeed();

    expect(upcomingTransport.value?.id).toBe("transport-earliest");
  });
});
