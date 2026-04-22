import { computed, ref } from "vue";
import { getExpenses } from "../repositories/expenseRepository";
import { getItineraryDays } from "../repositories/itineraryRepository";
import { getTrip } from "../repositories/tripRepository";
import type { Expense } from "../types/expense";
import type { ItineraryDay, ItineraryItem } from "../types/itinerary";
import type { Trip } from "../types/trip";
import { getDaysLeft, getTotalDays } from "../utils/date";

interface StatCard {
  label: string;
  value: string | number;
}

interface TransportEntry {
  item: Extract<ItineraryItem, { kind: "transport" }>;
  dateTime: string;
}

function getCurrentDateTimeKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getTransportDateTime(day: ItineraryDay, item: ItineraryItem): string {
  const [hours = "00", minutes = "00"] = item.time.split(":");

  return `${day.date}T${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
}

export function useTripData() {
  const trip = ref<Trip>();
  const days = ref<ItineraryDay[]>([]);
  const expenses = ref<Expense[]>([]);
  const loading = ref(false);

  async function refresh(): Promise<void> {
    loading.value = true;

    try {
      const [nextTrip, nextDays, nextExpenses] = await Promise.all([getTrip(), getItineraryDays(), getExpenses()]);
      trip.value = nextTrip;
      days.value = nextDays;
      expenses.value = nextExpenses;
    } finally {
      loading.value = false;
    }
  }

  const ready = refresh();

  const daysLeft = computed(() => (trip.value ? getDaysLeft(trip.value.startDate) : 0));
  const totalDays = computed(() => (trip.value ? getTotalDays(trip.value.startDate, trip.value.endDate) : 0));
  const spentTotal = computed(() => expenses.value.reduce((total, expense) => total + expense.amount, 0));

  const statCards = computed<StatCard[]>(() => [
    {
      label: "距离出发",
      value: daysLeft.value,
    },
    {
      label: "行程天数",
      value: totalDays.value,
    },
    {
      label: "预算剩余",
      value: (trip.value?.budget ?? 0) - spentTotal.value,
    },
  ]);

  const upcomingTransport = computed<Extract<ItineraryItem, { kind: "transport" }> | undefined>(() => {
    const transports = days.value
      .flatMap((day) =>
        day.items
          .filter((item): item is Extract<ItineraryItem, { kind: "transport" }> => item.kind === "transport")
          .map<TransportEntry>((item) => ({
            item,
            dateTime: getTransportDateTime(day, item),
          })),
      )
      .sort((left, right) => left.dateTime.localeCompare(right.dateTime) || left.item.id.localeCompare(right.item.id));
    const now = getCurrentDateTimeKey();

    return (transports.find((transport) => transport.dateTime >= now) ?? transports[0])?.item;
  });

  const dayPreview = computed(() =>
    days.value.slice(0, 3).map((day) => ({
      date: day.date,
      label: day.label,
      items: day.items.slice(0, 2),
      totalItems: day.items.length,
    })),
  );

  const pinnedReminder = computed(() => trip.value?.reminders.find((reminder) => reminder.pinned));

  return {
    trip,
    loading,
    ready,
    refresh,
    daysLeft,
    totalDays,
    statCards,
    upcomingTransport,
    dayPreview,
    pinnedReminder,
  };
}
