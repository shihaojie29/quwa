import type { ItineraryDay } from "../types/itinerary";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function parseDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function toDateOnly(value?: string): string {
  if (!value) {
    return new Date().toISOString().slice(0, 10);
  }

  return value;
}

export function getTotalDays(start: string, end: string): number {
  const startDate = parseDate(start);
  const endDate = parseDate(end);
  const diff = Math.round((endDate.getTime() - startDate.getTime()) / DAY_IN_MS);

  return diff + 1;
}

export function getDaysLeft(start: string, now?: string): number {
  const startDate = parseDate(start);
  const currentDate = parseDate(toDateOnly(now));
  const diff = Math.ceil((startDate.getTime() - currentDate.getTime()) / DAY_IN_MS);

  return Math.max(0, diff);
}

export function buildTripDays(start: string, end: string): ItineraryDay[] {
  const days = getTotalDays(start, end);
  const startDate = parseDate(start);

  return Array.from({ length: days }, (_value, index) => {
    const date = new Date(startDate.getTime() + index * DAY_IN_MS);

    return {
      date: date.toISOString().slice(0, 10),
      items: [],
    };
  });
}
