export type TripStatus = "planning" | "active" | "completed" | "cancelled";

export interface TripReminder {
  id: string;
  title: string;
  note?: string;
  pinned: boolean;
  remindAt?: string;
}

export interface Member {
  id: string;
  name: string;
  initial: string;
  color: string;
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: TripStatus;
  members: Member[];
  reminders: TripReminder[];
}
