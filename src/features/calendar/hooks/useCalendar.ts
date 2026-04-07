import { useCallback, useMemo, useState } from "react";
import type { CalendarEvent, CalendarViewMode, WeekDay } from "../types";
import { MOCK_EVENTS, formatDateKey } from "../constants";

export interface DayCell {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  events: CalendarEvent[];
}

export function useCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");
  const [events, setEvents] = useState<CalendarEvent[]>(MOCK_EVENTS);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  // ── Helpers ──

  const getEventsForDate = useCallback(
    (date: Date): CalendarEvent[] => {
      const key = formatDateKey(date);
      return events.filter((e) => {
        const d = new Date(e.startDate);
        return formatDateKey(d) === key;
      });
    },
    [events],
  );

  const getTimedEvents = useCallback(
    (date: Date) => getEventsForDate(date).filter((e) => !e.isAllDay),
    [getEventsForDate],
  );

  const getAllDayEvents = useCallback(
    (date: Date) => getEventsForDate(date).filter((e) => e.isAllDay),
    [getEventsForDate],
  );

  // ── Month view ──

  const monthDays = useMemo<DayCell[]>(() => {
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const start = new Date(first);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(last);
    end.setDate(end.getDate() + (6 - end.getDay()));

    const cells: DayCell[] = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      cells.push({
        date: new Date(cursor),
        isCurrentMonth: cursor.getMonth() === month,
        isToday: cursor.getTime() === today.getTime(),
        isWeekend: cursor.getDay() === 0 || cursor.getDay() === 6,
        events: getEventsForDate(cursor),
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    return cells;
  }, [year, month, today, getEventsForDate]);

  // ── Week view ──

  const weekStart = useMemo(() => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    return d;
  }, [selectedDate]);

  const weekDays = useMemo<WeekDay[]>(() => {
    const labels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return {
        date: new Date(d),
        dayOfWeek: labels[i],
        dateNum: d.getDate(),
        isToday: d.getTime() === today.getTime(),
      };
    });
  }, [weekStart, today]);

  // ── Labels ──

  const viewLabel = useMemo(() => {
    if (viewMode === "month") {
      return selectedDate.toLocaleString("default", { month: "long", year: "numeric" });
    }
    if (viewMode === "week") {
      const end = new Date(weekStart);
      end.setDate(end.getDate() + 6);
      const sameMonth = weekStart.getMonth() === end.getMonth();
      const startStr = weekStart.toLocaleString("default", { month: "short", day: "numeric" });
      const endStr = sameMonth
        ? end.getDate().toString()
        : end.toLocaleString("default", { month: "short", day: "numeric" });
      return `${startStr} – ${endStr}, ${end.getFullYear()}`;
    }
    return selectedDate.toLocaleString("default", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  }, [viewMode, selectedDate, weekStart]);

  // ── Navigation ──

  const goToPrev = useCallback(() => {
    setSelectedDate((d) => {
      switch (viewMode) {
        case "month": return new Date(d.getFullYear(), d.getMonth() - 1, 1);
        case "week": { const n = new Date(d); n.setDate(n.getDate() - 7); return n; }
        case "day": { const n = new Date(d); n.setDate(n.getDate() - 1); return n; }
      }
    });
  }, [viewMode]);

  const goToNext = useCallback(() => {
    setSelectedDate((d) => {
      switch (viewMode) {
        case "month": return new Date(d.getFullYear(), d.getMonth() + 1, 1);
        case "week": { const n = new Date(d); n.setDate(n.getDate() + 7); return n; }
        case "day": { const n = new Date(d); n.setDate(n.getDate() + 1); return n; }
      }
    });
  }, [viewMode]);

  const goToToday = useCallback(() => setSelectedDate(new Date()), []);

  const goToDate = useCallback((date: Date) => setSelectedDate(new Date(date)), []);

  // ── Events ──

  const addEvent = useCallback((event: CalendarEvent) => {
    setEvents((prev) => [...prev, event]);
  }, []);

  return {
    selectedDate,
    viewMode,
    setViewMode,
    events,
    today,
    monthDays,
    weekDays,
    weekStart,
    viewLabel,
    goToPrev,
    goToNext,
    goToToday,
    goToDate,
    addEvent,
    getEventsForDate,
    getTimedEvents,
    getAllDayEvents,
  };
}
