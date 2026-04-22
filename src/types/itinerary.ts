export type ItineraryItem =
  | { id: string; kind: "activity"; title: string; time: string; note?: string; location?: string }
  | {
      id: string;
      kind: "transport";
      title: string;
      time: string;
      timeEnd?: string;
      from?: string;
      to?: string;
      note?: string;
    };

export interface ItineraryDay {
  date: string;
  label?: string;
  items: ItineraryItem[];
}
