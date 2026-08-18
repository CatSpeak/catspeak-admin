// The instructor service stores class-schedule wall-clock values as UTC
// (see ScheduleHelper.GetUtcStart — "Stored Date + StartTime are already UTC").
// These helpers interpret those values as UTC instants and present them in the
// viewer's own timezone (the class timezone field is not used anymore).

export interface LocalSession {
  date: string;
  startTime: string;
  endTime: string;
}

export interface LocalScheduleEntry {
  dayKey: string;
  startTime: string;
  endTime: string;
}

const TICK_TO_MS = 10000;
const EPOCH_OFFSET_MS = 62135596800000;

export function utcDateFromTick(tick: number): Date {
  return new Date(tick / TICK_TO_MS - EPOCH_OFFSET_MS);
}

function parseUtcDateTime(date: string, time: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return new Date(Date.UTC(y, m - 1, d, hh, mm));
}

// Builds a UTC start/end pair, pushing an end that is on/earlier than its start
// (a session crossing UTC midnight) onto the following UTC day.
function utcRange(
  date: string,
  startTime: string,
  endTime: string,
): { start: Date; end: Date } {
  const start = parseUtcDateTime(date, startTime);
  const end = parseUtcDateTime(date, endTime);
  if (endTime <= startTime) {
    end.setUTCDate(end.getUTCDate() + 1);
  }
  return { start, end };
}

function formatDate(d: Date, tz?: string): string {
  return d.toLocaleDateString("sv-SE", { timeZone: tz });
}

function formatTime(d: Date, tz?: string): string {
  return d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: tz,
  });
}

export function toLocalSession(
  date: string,
  startTime: string,
  endTime: string,
  timeZone?: string,
): LocalSession {
  const { start, end } = utcRange(date, startTime, endTime);
  return {
    date: formatDate(start, timeZone),
    startTime: formatTime(start, timeZone),
    endTime: formatTime(end, timeZone),
  };
}

const DAY_INDEX: Record<string, number> = {
  sun: 0,
  sunday: 0,
  mon: 1,
  monday: 1,
  tue: 2,
  tuesday: 2,
  wed: 3,
  wednesday: 3,
  thu: 4,
  thursday: 4,
  fri: 5,
  friday: 5,
  sat: 6,
  saturday: 6,
};

function weekdayKey(d: Date, tz?: string): string {
  const short = d.toLocaleDateString("en-US", { weekday: "short", timeZone: tz });
  return short.slice(0, 3).toUpperCase();
}

export function toLocalScheduleEntry(
  dayOfWeek: string,
  startTime: string,
  endTime: string,
  startDateTick: number,
  timeZone?: string,
): LocalScheduleEntry {
  const dayIndex = DAY_INDEX[dayOfWeek.toLowerCase()] ?? -1;
  if (dayIndex < 0) {
    return { dayKey: dayOfWeek, startTime, endTime };
  }

  // Anchor the recurring template to the week of the class start date, exactly
  // like ScheduleHelper.GenerateSessions does (first occurrence on/after it).
  const anchor = utcDateFromTick(startDateTick).toISOString().slice(0, 10);
  const base = parseUtcDateTime(anchor, "00:00");
  const daysToAdd = (dayIndex - base.getUTCDay() + 7) % 7;
  base.setUTCDate(base.getUTCDate() + daysToAdd);

  const { start, end } = utcRange(anchorDate(base), startTime, endTime);

  return {
    dayKey: weekdayKey(start, timeZone),
    startTime: formatTime(start, timeZone),
    endTime: formatTime(end, timeZone),
  };
}

function anchorDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}