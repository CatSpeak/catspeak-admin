import React, { useEffect, useMemo, useRef, useState } from "react";
import type { CalendarEvent, WeekDay } from "../types";
import { HOUR_HEIGHT, HOURS } from "../types";
import { formatHour, EVENT_COLORS } from "../constants";
import EventBlock from "./EventBlock";

// ── Overlap layout algorithm ──

interface LayoutedEvent {
  event: CalendarEvent;
  column: number;
  totalColumns: number;
}

function layoutOverlappingEvents(events: CalendarEvent[]): LayoutedEvent[] {
  if (events.length <= 1) {
    return events.map((e) => ({ event: e, column: 0, totalColumns: 1 }));
  }

  const sorted = [...events].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  );

  const result: LayoutedEvent[] = [];

  // Build clusters of mutually overlapping events
  const clusters: CalendarEvent[][] = [];
  let currentCluster: CalendarEvent[] = [sorted[0]];
  let clusterEnd = new Date(sorted[0].endDate).getTime();

  for (let i = 1; i < sorted.length; i++) {
    const eStart = new Date(sorted[i].startDate).getTime();
    if (eStart < clusterEnd) {
      currentCluster.push(sorted[i]);
      clusterEnd = Math.max(clusterEnd, new Date(sorted[i].endDate).getTime());
    } else {
      clusters.push(currentCluster);
      currentCluster = [sorted[i]];
      clusterEnd = new Date(sorted[i].endDate).getTime();
    }
  }
  clusters.push(currentCluster);

  for (const cluster of clusters) {
    if (cluster.length === 1) {
      result.push({ event: cluster[0], column: 0, totalColumns: 1 });
      continue;
    }

    // Assign columns greedily
    const cols: CalendarEvent[][] = [];
    const eventCol = new Map<string, number>();

    for (const event of cluster) {
      const eStart = new Date(event.startDate).getTime();
      let placed = false;

      for (let c = 0; c < cols.length; c++) {
        const last = cols[c][cols[c].length - 1];
        if (eStart >= new Date(last.endDate).getTime()) {
          cols[c].push(event);
          eventCol.set(event.id, c);
          placed = true;
          break;
        }
      }

      if (!placed) {
        cols.push([event]);
        eventCol.set(event.id, cols.length - 1);
      }
    }

    const totalCols = cols.length;
    for (const event of cluster) {
      result.push({
        event,
        column: eventCol.get(event.id) || 0,
        totalColumns: totalCols,
      });
    }
  }

  return result;
}

// ── Component ──

interface TimeGridViewProps {
  days: WeekDay[];
  events: CalendarEvent[];
  onSlotClick: (date: Date, hour: number) => void;
  onEventClick?: (event: CalendarEvent) => void;
  getTimedEvents: (date: Date) => CalendarEvent[];
  getAllDayEvents: (date: Date) => CalendarEvent[];
}

const TimeGridView: React.FC<TimeGridViewProps> = ({
  days,
  events: _events,
  onSlotClick,
  onEventClick,
  getTimedEvents,
  getAllDayEvents,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 7.5 * HOUR_HEIGHT;
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const indicatorTop = (nowMinutes / 60) * HOUR_HEIGHT;

  const allDayRows = useMemo(() => {
    return days.map((d) => getAllDayEvents(d.date));
  }, [days, getAllDayEvents]);
  const hasAnyAllDay = allDayRows.some((r) => r.length > 0);

  const isDay = days.length === 1;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
      {/* Day headers */}
      <div className="flex border-b border-gray-200 bg-gray-50/80 shrink-0">
        <div className="w-16 shrink-0" />
        {days.map((day, i) => (
          <div
            key={i}
            className={`flex-1 text-center py-2 border-l border-gray-100 ${isDay ? "px-4" : ""}`}
          >
            <p
              className={`text-[11px] font-semibold tracking-wider ${
                day.isToday ? "text-primary" : "text-gray-400"
              }`}
            >
              {day.dayOfWeek}
            </p>
            <p
              className={`text-xl font-bold mt-0.5 inline-flex items-center justify-center w-10 h-10 rounded-full ${
                day.isToday ? "bg-primary text-white" : "text-gray-800"
              }`}
            >
              {day.dateNum}
            </p>
          </div>
        ))}
      </div>

      {/* All-day events row */}
      {hasAnyAllDay && (
        <div className="flex border-b border-gray-200 shrink-0">
          <div className="w-16 shrink-0 flex items-center justify-center">
            <span className="text-[10px] text-gray-400 font-medium">all-day</span>
          </div>
          {allDayRows.map((dayEvents, i) => (
            <div key={i} className="flex-1 border-l border-gray-100 px-1 py-1 space-y-0.5 min-h-[32px]">
              {dayEvents.map((evt) => {
                const c = EVENT_COLORS[evt.color];
                return (
                  <button
                    key={evt.id}
                    type="button"
                    onClick={() => onEventClick?.(evt)}
                    className={`w-full text-left text-[11px] font-medium px-1.5 py-0.5 rounded truncate cursor-pointer ${c.bg} ${c.text}`}
                  >
                    {evt.title}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Scrollable time grid */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{ maxHeight: "calc(100vh - 300px)" }}
      >
        <div className="flex relative" style={{ height: 24 * HOUR_HEIGHT }}>
          {/* Hour labels */}
          <div className="w-16 shrink-0 relative">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="absolute w-full text-right pr-3 -translate-y-1/2 text-[11px] text-gray-400 font-medium select-none"
                style={{ top: hour * HOUR_HEIGHT }}
              >
                {hour > 0 ? formatHour(hour) : ""}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day, colIndex) => {
            const dayTimedEvents = getTimedEvents(day.date);
            const layouted = layoutOverlappingEvents(dayTimedEvents);
            const todayCol = day.date.toDateString() === now.toDateString();

            return (
              <div key={colIndex} className="flex-1 relative border-l border-gray-100">
                {/* Hour grid lines */}
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="absolute w-full border-t border-gray-100 cursor-pointer hover:bg-primary/5 transition-colors"
                    style={{ top: hour * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                    onClick={() => onSlotClick(day.date, hour)}
                  />
                ))}

                {/* Events with overlap layout */}
                {layouted.map(({ event, column, totalColumns }) => (
                  <EventBlock
                    key={event.id}
                    event={event}
                    column={column}
                    totalColumns={totalColumns}
                    onClick={onEventClick}
                  />
                ))}

                {/* Current time indicator */}
                {todayCol && (
                  <div
                    className="absolute left-0 right-0 z-20 pointer-events-none"
                    style={{ top: indicatorTop }}
                  >
                    <div className="relative">
                      <div className="absolute -left-1.5 -top-[5px] w-[11px] h-[11px] rounded-full bg-red-500" />
                      <div className="h-[2px] bg-red-500 w-full" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TimeGridView;
