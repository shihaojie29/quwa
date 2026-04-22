import { buildTripDays, getDaysLeft, getTotalDays } from "../../src/utils/date";

it("computes total days from inclusive trip dates", () => {
  expect(getTotalDays("2026-05-20", "2026-05-25")).toBe(6);
});

it("builds one itinerary day per trip date", () => {
  expect(buildTripDays("2026-05-20", "2026-05-22")).toHaveLength(3);
});

it("computes days left from an optional current date", () => {
  expect(getDaysLeft("2026-05-20", "2026-05-18")).toBe(2);
});
