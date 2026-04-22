import { describe, expect, it } from "vitest";
import { useItinerary } from "@/composables/useItinerary";
import { getTrip, updateTrip } from "@/repositories/tripRepository";

async function mountItineraryComposableWithSeed() {
  const itinerary = useItinerary();

  await itinerary.ready;

  return itinerary;
}

describe("useItinerary", () => {
  it("clamps active day index after refresh shortens the trip range", async () => {
    const itinerary = await mountItineraryComposableWithSeed();
    itinerary.setActiveDay(5);

    const trip = await getTrip();
    await updateTrip({
      ...trip,
      endDate: "2026-05-21",
    });
    await itinerary.refresh();

    expect(itinerary.days.value).toHaveLength(2);
    expect(itinerary.activeDayIndex.value).toBe(1);
  });
});
