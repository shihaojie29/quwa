import { ref } from "vue";
import {
  createItineraryItem,
  removeItineraryItem,
  syncDaysFromTripRange,
  updateItineraryItem,
} from "../repositories/itineraryRepository";
import { getTrip } from "../repositories/tripRepository";
import type { ItineraryDay, ItineraryItem } from "../types/itinerary";

export type ItineraryView = "list" | "map";

export function useItinerary() {
  const days = ref<ItineraryDay[]>([]);
  const activeDayIndex = ref(0);
  const activeView = ref<ItineraryView>("list");
  const loading = ref(false);

  async function refresh(): Promise<void> {
    loading.value = true;

    try {
      const trip = await getTrip();
      days.value = await syncDaysFromTripRange(trip);
      activeDayIndex.value = days.value.length === 0 ? 0 : Math.min(activeDayIndex.value, days.value.length - 1);
    } finally {
      loading.value = false;
    }
  }

  const ready = refresh();

  function setActiveDay(index: number): void {
    if (index < 0 || index >= days.value.length) {
      return;
    }

    activeDayIndex.value = index;
  }

  function setActiveView(view: ItineraryView): void {
    activeView.value = view;
  }

  async function addItem(date: string, item: ItineraryItem): Promise<ItineraryDay> {
    const day = await createItineraryItem(date, item);
    days.value = days.value.map((currentDay) => (currentDay.date === date ? day : currentDay));

    return day;
  }

  async function updateItem(date: string, item: ItineraryItem): Promise<ItineraryDay> {
    const day = await updateItineraryItem(date, item);
    days.value = days.value.map((currentDay) => (currentDay.date === date ? day : currentDay));

    return day;
  }

  async function removeItem(date: string, itemId: string): Promise<ItineraryDay> {
    const day = await removeItineraryItem(date, itemId);
    days.value = days.value.map((currentDay) => (currentDay.date === date ? day : currentDay));

    return day;
  }

  return {
    days,
    activeDayIndex,
    activeView,
    loading,
    ready,
    refresh,
    setActiveDay,
    setActiveView,
    addItem,
    updateItem,
    removeItem,
  };
}
