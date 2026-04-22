export const TAB_ROUTES = {
  home: "/pages/home/index",
  itinerary: "/pages/itinerary/index",
  expense: "/pages/expense/index",
  notes: "/pages/notes/index",
} as const;

export type TabKey = keyof typeof TAB_ROUTES;

export function goToTab(tab: TabKey) {
  uni.redirectTo({ url: TAB_ROUTES[tab] });
}
