import { useCallback, useMemo, useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import Button from "../../../components/ui/Button";
import {
  CalendarHeader,
  CalendarGrid,
  CalendarSidebar,
  TimeGridView,
  CreateEventModal,
} from "../components";
import { useCalendar } from "../hooks/useCalendar";
import type { EventPrefill, WeekDay } from "../types";

export default function CalendarPage() {
  const {
    selectedDate,
    viewMode,
    setViewMode,
    events,
    monthDays,
    weekDays,
    weekStart,
    viewLabel,
    goToPrev,
    goToNext,
    goToToday,
    goToDate,
    addEvent,
    getTimedEvents,
    getAllDayEvents,
  } = useCalendar();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [eventPrefill, setEventPrefill] = useState<EventPrefill | undefined>();

  // ── Mini calendar ──

  const highlightRange = useMemo(() => {
    if (viewMode === "week") {
      const end = new Date(weekStart);
      end.setDate(end.getDate() + 6);
      return { start: weekStart, end };
    }
    return undefined;
  }, [viewMode, weekStart]);

  const handleMiniDateSelect = useCallback(
    (date: Date) => {
      goToDate(date);
    },
    [goToDate],
  );

  // ── Month view: click day number → switch to day view ──

  const handleDayClick = useCallback(
    (date: Date) => {
      goToDate(date);
      setViewMode("day");
    },
    [goToDate, setViewMode],
  );

  // ── Time grid: click slot → create event ──

  const handleSlotClick = useCallback(
    (date: Date, hour: number) => {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const startTime = `${String(hour).padStart(2, "0")}:00`;
      const endHour = Math.min(hour + 1, 23);
      const endTime = `${String(endHour).padStart(2, "0")}:00`;

      setEventPrefill({
        startDate: dateStr,
        startTime,
        endDate: dateStr,
        endTime,
      });
      setIsCreateModalOpen(true);
    },
    [],
  );

  const openCreateModal = useCallback(() => {
    setEventPrefill(undefined);
    setIsCreateModalOpen(true);
  }, []);

  // ── Day view data ──

  const selectedDayData = useMemo<WeekDay[]>(() => {
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

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-primary">Calendar</h1>
        <Button variant="primary" size="sm" onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Content: sidebar + main */}
      <div className="flex gap-4">
        {/* Mini calendar sidebar */}
        <CalendarSidebar
          selectedDate={selectedDate}
          onDateSelect={handleMiniDateSelect}
          highlightRange={highlightRange}
        />

        {/* Main calendar area */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Back to month navigation */}
          {viewMode !== "month" && (
            <button
              onClick={() => setViewMode("month")}
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors cursor-pointer group"
            >
              <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
              <span>Back</span>
            </button>
          )}

          {/* Toolbar */}
          <CalendarHeader
            viewLabel={viewLabel}
            viewMode={viewMode}
            onPrev={goToPrev}
            onNext={goToNext}
            onToday={goToToday}
            onViewModeChange={setViewMode}
          />

          {/* Calendar view */}
          {viewMode === "month" && (
            <CalendarGrid days={monthDays} onDayClick={handleDayClick} />
          )}

          {viewMode === "week" && (
            <TimeGridView
              days={weekDays}
              events={events}
              onSlotClick={handleSlotClick}
              getTimedEvents={getTimedEvents}
              getAllDayEvents={getAllDayEvents}
            />
          )}

          {viewMode === "day" && (
            <TimeGridView
              days={selectedDayData}
              events={events}
              onSlotClick={handleSlotClick}
              getTimedEvents={getTimedEvents}
              getAllDayEvents={getAllDayEvents}
            />
          )}
        </div>
      </div>

      {/* Create event modal */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onEventCreated={addEvent}
        prefill={eventPrefill}
      />
    </div>
  );
}
