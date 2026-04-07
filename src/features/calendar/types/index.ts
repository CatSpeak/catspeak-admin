// ── Calendar Types — matching real API spec (/api/v1/events) ──

export type CalendarViewMode = "month" | "week" | "day";
export type VisibilityScope = "PUBLIC" | "COMMUNITY_ONLY" | "SHARED_LINK_ONLY";

// ── API response types ──

export interface EventCondition {
  id: string;
  title: string;
  description: string;
}

export interface RecurrenceRule {
  frequency: string;
  interval: number;
  byWeekDay: string[];
  startTime: string;
  endTime: string;
  recurrenceStartDate: string;
  recurrenceEndDate: string;
  timeZone: string;
}

/** GET /api/v1/events/{eventId} */
export interface EventDetail {
  id: number;
  title: string;
  description: string;
  location: string;
  color: string;
  maxParticipants: number;
  visibilityScope: VisibilityScope;
  isRecurring: boolean;
  startTime: string | null;
  endTime: string | null;
  recurrenceRule: RecurrenceRule | null;
  conditions: EventCondition[];
  createdAt: string;
}

/** GET /api/v1/events/counts → counts[] item */
export interface DayEventCount {
  date: string;
  totalEvents: number;
  registeredEvents: number;
}

/** GET /api/v1/events/by-date → events[] item */
export interface DayEvent {
  occurrenceId: number | null;
  eventId: number;
  title: string;
  startTime: string;
  endTime: string;
  color: string;
  isRegistered: boolean;
  currentParticipants: number;
  maxParticipants: number;
}

/** Response shape for /events/by-date */
export interface EventsByDateResponse {
  date: string;
  events: DayEvent[];
}

/** Response shape for /events/counts */
export interface EventCountsResponse {
  counts: DayEventCount[];
}

// ── UI-only types ──

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
