import React, { useEffect, useRef, useState } from "react";
import type { DayEvent, WeekDay } from "../types";
import { HOUR_HEIGHT, HOURS } from "../types";
import { formatHour } from "../constants";
import EventBlock from "./EventBlock";

// ── Overlap layout algorithm ──

interface LayoutedEvent {
  event: DayEvent;
  column: number;
  totalColumns: number;
}

function layoutOverlappingEvents(events: DayEvent[]): LayoutedEvent[] {
  if (events.length <= 1) {
    return events.map((e) => ({ event: e, column: 0, totalColumns: 1 }));
  }

  const sorted = [...events].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );

  const result: LayoutedEvent[] = [];

  // Build clusters of mutually overlapping events
  const clusters: DayEvent[][] = [];
  let currentCluster: DayEvent[] = [sorted[0]];
  let clusterEnd = new Date(sorted[0].endTime).getTime();

  for (let i = 1; i < sorted.length; i++) {
    const eStart = new Date(sorted[i].startTime).getTime();
    if (eStart < clusterEnd) {
      currentCluster.push(sorted[i]);
      clusterEnd = Math.max(clusterEnd, new Date(sorted[i].endTime).getTime());
    } else {
      clusters.push(currentCluster);
      currentCluster = [sorted[i]];
      clusterEnd = new Date(sorted[i].endTime).getTime();
    }
  }
  clusters.push(currentCluster);

  for (const cluster of clusters) {
    if (cluster.length === 1) {
      result.push({ event: cluster[0], column: 0, totalColumns: 1 });
      continue;
    }

    // Assign columns greedily
    const cols: DayEvent[][] = [];
    const eventCol = new Map<string, number>();

    for (const event of cluster) {
      const eStart = new Date(event.startTime).getTime();
      const eventKey = `${event.eventId}-${event.occurrenceId ?? "s"}`;
      let placed = false;

      for (let c = 0; c < cols.length; c++) {
        const last = cols[c][cols[c].length - 1];
        if (eStart >= new Date(last.endTime).getTime()) {
          cols[c].push(event);
          eventCol.set(eventKey, c);
          placed = true;
          break;
        }
      }

      if (!placed) {
        cols.push([event]);
        eventCol.set(eventKey, cols.length - 1);
      }
    }

    const totalCols = cols.length;
    for (const event of cluster) {
      const eventKey = `${event.eventId}-${event.occurrenceId ?? "s"}`;
      result.push({
        event,
        column: eventCol.get(eventKey) || 0,
        totalColumns: totalCols,
      });
    }
  }

  return result;
}

// ── Component ──

interface TimeGridViewProps {
  days: WeekDay[];
  dayEventsMap: Map<string, DayEvent[]>;
  onSlotClick: (date: Date, hour: number) => void;
  onEventClick?: (event: DayEvent) => void;
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

const TimeGridView: React.FC<TimeGridViewProps> = ({
  days,
  dayEventsMap,
  onSlotClick,
  onEventClick,
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
              className={`text-[11px] font-semibold tracking-wider ${day.isToday ? "text-primary" : "text-gray-400"
                }`}
            >
              {day.dayOfWeek}
            </p>
            <p
              className={`text-xl font-bold mt-0.5 inline-flex items-center justify-center w-10 h-10 rounded-full ${day.isToday ? "bg-primary text-white" : "text-gray-800"
                }`}
            >
              {day.dateNum}
            </p>
          </div>
        ))}
      </div>

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
            const eventsForDay = dayEventsMap.get(dateKey(day.date)) ?? [];
            const layouted = layoutOverlappingEvents(eventsForDay);
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
                    key={`${event.eventId}-${event.occurrenceId ?? "s"}`}
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
