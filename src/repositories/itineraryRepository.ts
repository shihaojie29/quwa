import { seedItinerary } from "../mock/seed";
import type { ItineraryDay, ItineraryItem } from "../types/itinerary";
import type { Trip } from "../types/trip";
import { buildTripDays } from "../utils/date";
import { localStorageAdapter } from "./storage/localStorageAdapter";
import { STORAGE_KEYS } from "./storage/storageKeys";

type TripDateRange = Pick<Trip, "startDate" | "endDate">;

function cloneDays(days: ItineraryDay[]): ItineraryDay[] {
  return days.map((day) => ({
    ...day,
    items: day.items.map((item) => ({ ...item })),
  }));
}

function persistDays(days: ItineraryDay[]): ItineraryDay[] {
  const nextDays = cloneDays(days);
  localStorageAdapter.set(STORAGE_KEYS.itinerary, nextDays);

  return nextDays;
}

function findDay(days: ItineraryDay[], date: string): ItineraryDay {
  const day = days.find((candidate) => candidate.date === date);

  if (!day) {
    throw new Error(`Itinerary day not found for ${date}`);
  }

  return day;
}

export async function getItineraryDays(): Promise<ItineraryDay[]> {
  const storedDays = localStorageAdapter.get<ItineraryDay[]>(STORAGE_KEYS.itinerary);

  if (storedDays) {
    return cloneDays(storedDays);
  }

  return persistDays(seedItinerary);
}

export async function syncDaysFromTripRange(trip: TripDateRange): Promise<ItineraryDay[]> {
  const previousDays = await getItineraryDays();
  const previousByDate = new Map(previousDays.map((day) => [day.date, day]));
  const nextDays = buildTripDays(trip.startDate, trip.endDate).map((day, index) => ({
    ...day,
    label: `Day ${index + 1}`,
    items: previousByDate.get(day.date)?.items ?? [],
  }));

  return persistDays(nextDays);
}

export async function createItineraryItem(date: string, item: ItineraryItem): Promise<ItineraryDay> {
  const days = await getItineraryDays();
  const day = findDay(days, date);

  day.items = [...day.items, { ...item }];
  persistDays(days);

  return { ...day, items: day.items.map((currentItem) => ({ ...currentItem })) };
}

export async function updateItineraryItem(date: string, item: ItineraryItem): Promise<ItineraryDay> {
  const days = await getItineraryDays();
  const day = findDay(days, date);

  day.items = day.items.map((currentItem) => (currentItem.id === item.id ? { ...item } : currentItem));
  persistDays(days);

  return { ...day, items: day.items.map((currentItem) => ({ ...currentItem })) };
}

export async function removeItineraryItem(date: string, itemId: string): Promise<ItineraryDay> {
  const days = await getItineraryDays();
  const day = findDay(days, date);

  day.items = day.items.filter((item) => item.id !== itemId);
  persistDays(days);

  return { ...day, items: day.items.map((item) => ({ ...item })) };
}
