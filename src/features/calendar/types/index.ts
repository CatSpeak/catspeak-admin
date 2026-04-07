export type CalendarViewMode = "month" | "week" | "day";

export type EventColor = "red" | "gold" | "green" | "orange" | "blue" | "purple";

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  isAllDay: boolean;
  color: EventColor;
}

export interface CreateEventPayload {
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  isAllDay: boolean;
  color: EventColor;
}

export interface UpdateEventPayload extends Partial<CreateEventPayload> {
  id: string;
}

export interface GetEventsResponse {
  data: CalendarEvent[];
  total: number;
}

/** A single day column in the week/day time grid */
export interface WeekDay {
  date: Date;
  dayOfWeek: string;
  dateNum: number;
  isToday: boolean;
}

/** Pre-fill values when creating an event from a time slot click */
export interface EventPrefill {
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
}

/** Shared config */
export const HOUR_HEIGHT = 60;
export const HOURS = Array.from({ length: 24 }, (_, i) => i);
