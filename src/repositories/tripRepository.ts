import { seedTrip } from "../mock/seed";
import type { Trip } from "../types/trip";
import { localStorageAdapter } from "./storage/localStorageAdapter";
import { STORAGE_KEYS } from "./storage/storageKeys";

function cloneTrip(trip: Trip): Trip {
  return {
    ...trip,
    members: trip.members.map((member) => ({ ...member })),
    reminders: trip.reminders.map((reminder) => ({ ...reminder })),
  };
}

function persistTrip(trip: Trip): Trip {
  const nextTrip = cloneTrip(trip);
  localStorageAdapter.set(STORAGE_KEYS.trip, nextTrip as unknown as Record<string, unknown>);

  return nextTrip;
}

export async function getTrip(): Promise<Trip> {
  const storedTrip = localStorageAdapter.get<Trip>(STORAGE_KEYS.trip);

  if (storedTrip) {
    return cloneTrip(storedTrip);
  }

  return persistTrip(seedTrip);
}

export async function updateBudget(amount: number): Promise<Trip> {
  const trip = await getTrip();

  return persistTrip({
    ...trip,
    budget: amount,
  });
}

export async function updateTrip(payload: Trip): Promise<Trip> {
  return persistTrip(payload);
}
