import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getApiErrorMessage } from "../../../lib/axios";
import { getEventCounts, getEventsByDate, deleteEvent as deleteEventApi } from "../api/eventApi";
import { formatDateKey, toISODate } from "../constants";
import type { CalendarViewMode, DayEvent, DayEventCount, WeekDay } from "../types";

export interface DayCell {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  events: DayEvent[];
  eventCount: number;
  registeredEventCount: number;
}

export function useCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");

  // API data
  const [monthEventCounts, setMonthEventCounts] = useState<Map<string, DayEventCount>>(new Map());
  const [dayEvents, setDayEvents] = useState<DayEvent[]>([]);
  const [selectedDayDate, setSelectedDayDate] = useState<Date | null>(null);
  const monthRequestId = useRef(0);
  const dayRequestId = useRef(0);

  // Loading / error
  const [isLoadingCounts, setIsLoadingCounts] = useState(false);
  const [isLoadingDay, setIsLoadingDay] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  // ── Fetch event counts + events for the visible month ──

  const fetchMonthData = useCallback(async () => {
    const requestId = monthRequestId.current + 1;
    monthRequestId.current = requestId;
    setIsLoadingCounts(true);
    setError(null);
    try {
      const first = new Date(year, month, 1);
      const last = new Date(year, month + 1, 0);
      const response = await getEventCounts(toISODate(first), toISODate(last));
      const counts = response.counts ?? [];
      if (requestId !== monthRequestId.current) {
        return;
      }

      setMonthEventCounts(
        new Map(counts.map((count) => [formatDateKey(new Date(count.date)), count])),
      );
    } catch (err: unknown) {
      if (requestId !== monthRequestId.current) {
        return;
      }
      setError(getApiErrorMessage(err, "Failed to load calendar data."));
    } finally {
      if (requestId === monthRequestId.current) {
        setIsLoadingCounts(false);
      }
    }
  }, [year, month]);

  useEffect(() => {
    fetchMonthData();
  }, [fetchMonthData]);

  // ── Fetch events for a specific day (sidebar) ──

  const fetchDayEvents = useCallback(async (date: Date) => {
    const requestId = dayRequestId.current + 1;
    dayRequestId.current = requestId;
    setIsLoadingDay(true);
    setSelectedDayDate(date);
    setDayEvents([]);
    try {
      const response = await getEventsByDate(toISODate(date));
      if (requestId !== dayRequestId.current) {
        return;
      }
      setDayEvents(response.events ?? []);
    } catch (err: unknown) {
      if (requestId !== dayRequestId.current) {
        return;
      }
      setError(getApiErrorMessage(err, "Failed to load events for this day."));
    } finally {
      if (requestId === dayRequestId.current) {
        setIsLoadingDay(false);
      }
    }
  }, []);

  // ── Delete event ──

  const deleteEvent = useCallback(async (eventId: number) => {
    await deleteEventApi(eventId);
    await fetchMonthData();
    if (selectedDayDate) {
      await fetchDayEvents(selectedDayDate);
    }
  }, [fetchMonthData, fetchDayEvents, selectedDayDate]);

  // ── Month grid ──

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
      const key = formatDateKey(cursor);
      const count = monthEventCounts.get(key);
      const isSelectedDay =
        selectedDayDate !== null && formatDateKey(selectedDayDate) === key;
      cells.push({
        date: new Date(cursor),
        isCurrentMonth: cursor.getMonth() === month,
        isToday: cursor.getTime() === today.getTime(),
        isWeekend: cursor.getDay() === 0 || cursor.getDay() === 6,
        events: isSelectedDay ? dayEvents : [],
        eventCount: count?.totalEvents ?? 0,
        registeredEventCount: count?.registeredEvents ?? 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    return cells;
  }, [year, month, today, monthEventCounts, selectedDayDate, dayEvents]);

  // ── Week data ──

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

  // ── View label ──

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

  return {
    selectedDate,
    viewMode,
    setViewMode,
    monthDays,
    weekDays,
    weekStart,
    viewLabel,
    dayEvents,
    selectedDayDate,
    isLoadingCounts,
    isLoadingDay,
    error,
    goToPrev,
    goToNext,
    goToToday,
    goToDate,
    fetchDayEvents,
    deleteEvent,
    refetchCounts: fetchMonthData,
  };
}
