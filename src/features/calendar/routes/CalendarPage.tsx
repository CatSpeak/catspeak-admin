import { useCallback, useMemo, useState } from "react";
import { ArrowLeft, AlertCircle, Loader2, Calendar } from "lucide-react";
import {
  CalendarHeader,
  CalendarGrid,
  CalendarSidebar,
  TimeGridView,
  EventDetailModal,
  DeleteEventDialog,
} from "../components";
import { useCalendar } from "../hooks/useCalendar";
import { useEventDetail } from "../hooks/useEventDetail";
import { getApiErrorMessage } from "../../../lib/axios";
import { formatDateKey } from "../constants";
import type { DayEvent, WeekDay } from "../types";

export default function CalendarPage() {
  const {
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
  } = useCalendar();

  // ── Event detail modal ──
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const { event: detailEvent, isLoading: isDetailLoading, error: detailError } = useEventDetail(selectedEventId);

  // ── Delete flow ──
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // ── Mini calendar highlight ──
  const highlightRange = useMemo(() => {
    if (viewMode === "week") {
      const end = new Date(weekStart);
      end.setDate(end.getDate() + 6);
      return { start: weekStart, end };
    }
    return undefined;
  }, [viewMode, weekStart]);

  // ── Day click from month grid → switch to day view ──
  const handleDayClick = useCallback(
    (date: Date) => {
      goToDate(date);
      setViewMode("day");
      fetchDayEvents(date);
    },
    [goToDate, setViewMode, fetchDayEvents],
  );

  const handleMiniDateSelect = useCallback(
    (date: Date) => {
      goToDate(date);
      fetchDayEvents(date);
    },
    [goToDate, fetchDayEvents],
  );

  // ── Event click → open detail modal ──
  const handleEventClick = useCallback((event: DayEvent) => {
    setSelectedEventId(event.eventId);
  }, []);

  // ── Delete from detail modal ──
  const handleDeleteRequest = useCallback((eventId: number) => {
    const title = detailEvent?.title ?? "this event";
    setSelectedEventId(null);
    setDeleteTarget({ id: eventId, title });
  }, [detailEvent]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteEvent(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err: unknown) {
      setDeleteError(getApiErrorMessage(err, "Failed to delete event."));
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, deleteEvent]);

  // ── Time grid: slot click (future: create event) ──
  const handleSlotClick = useCallback((_date: Date, _hour: number) => {
    // Placeholder for event creation
  }, []);

  // ── Day view data ──
  const selectedDayColumns = useMemo<WeekDay[]>(() => {
    const d = new Date(selectedDate);
    d.setHours(0, 0, 0, 0);
    const labels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    return [
      {
        date: d,
        dayOfWeek: labels[d.getDay()],
        dateNum: d.getDate(),
        isToday: d.toDateString() === new Date().toDateString(),
      },
    ];
  }, [selectedDate]);

  // ── Events map for time grid ──
  const dayEventsMap = useMemo(() => {
    const map = new Map<string, DayEvent[]>();
    if (selectedDayDate && dayEvents.length > 0) {
      map.set(formatDateKey(selectedDayDate), dayEvents);
    }
    return map;
  }, [selectedDayDate, dayEvents]);

  // Also fetch events when switching to day/week view
  const handleViewModeChange = useCallback(
    (mode: "month" | "week" | "day") => {
      setViewMode(mode);
      if (mode === "day") {
        fetchDayEvents(selectedDate);
      }
    },
    [setViewMode, fetchDayEvents, selectedDate],
  );

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Calendar size={24} className="text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        </div>
      </div>

      {/* Error state */}
      {(error || deleteError) && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <AlertCircle size={18} />
          <p className="text-sm">{error || deleteError}</p>
        </div>
      )}

      {/* Content: sidebar + main */}
      <div className="flex gap-4">
        {/* Mini calendar + day events sidebar */}
        <CalendarSidebar
          selectedDate={selectedDate}
          onDateSelect={handleMiniDateSelect}
          highlightRange={highlightRange}
          dayEvents={dayEvents}
          isLoadingDay={isLoadingDay}
          selectedDayDate={selectedDayDate}
          onEventClick={handleEventClick}
        />

        {/* Main calendar area */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Back to month */}
          {viewMode !== "month" && (
            <button
              onClick={() => setViewMode("month")}
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors cursor-pointer group"
            >
              <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Month</span>
            </button>
          )}

          {/* Toolbar */}
          <CalendarHeader
            viewLabel={viewLabel}
            viewMode={viewMode}
            onPrev={goToPrev}
            onNext={goToNext}
            onToday={goToToday}
            onViewModeChange={handleViewModeChange}
          />

          {/* Loading overlay */}
          {isLoadingCounts && viewMode === "month" && (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="text-primary animate-spin" />
            </div>
          )}

          {/* Month grid */}
          {viewMode === "month" && !isLoadingCounts && (
            <CalendarGrid days={monthDays} onDayClick={handleDayClick} onEventClick={handleEventClick} />
          )}

          {/* Week view — time grid */}
          {viewMode === "week" && (
            <TimeGridView
              days={weekDays}
              dayEventsMap={dayEventsMap}
              onSlotClick={handleSlotClick}
              onEventClick={handleEventClick}
            />
          )}

          {/* Day view — time grid */}
          {viewMode === "day" && (
            <>
              {isLoadingDay ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 size={28} className="text-primary animate-spin" />
                </div>
              ) : (
                <TimeGridView
                  days={selectedDayColumns}
                  dayEventsMap={dayEventsMap}
                  onSlotClick={handleSlotClick}
                  onEventClick={handleEventClick}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Event detail modal */}
      <EventDetailModal
        isOpen={selectedEventId !== null}
        event={detailEvent}
        isLoading={isDetailLoading}
        error={detailError}
        onClose={() => setSelectedEventId(null)}
        onDelete={handleDeleteRequest}
      />

      {/* Delete confirmation */}
      <DeleteEventDialog
        isOpen={!!deleteTarget}
        eventTitle={deleteTarget?.title ?? ""}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
