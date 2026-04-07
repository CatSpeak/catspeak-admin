import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarSidebarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  /** Start/end range to highlight (e.g. the current week) */
  highlightRange?: { start: Date; end: Date };
}

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

/** Compact mini-calendar + color legend sidebar (Google Calendar style) */
const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
  selectedDate,
  onDateSelect,
  highlightRange,
}) => {
  // Mini calendar has its own navigation state
  const [miniDate, setMiniDate] = useState(new Date(selectedDate));

  const miniYear = miniDate.getFullYear();
  const miniMonth = miniDate.getMonth();

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Generate mini calendar grid
  const miniDays = useMemo(() => {
    const first = new Date(miniYear, miniMonth, 1);
    const last = new Date(miniYear, miniMonth + 1, 0);
    const start = new Date(first);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(last);
    end.setDate(end.getDate() + (6 - end.getDay()));

    const cells: { date: Date; isCurrentMonth: boolean; isToday: boolean }[] = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      cells.push({
        date: new Date(cursor),
        isCurrentMonth: cursor.getMonth() === miniMonth,
        isToday: cursor.getTime() === today.getTime(),
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    return cells;
  }, [miniYear, miniMonth, today]);

  const miniLabel = miniDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const isInRange = (d: Date) => {
    if (!highlightRange) return false;
    const t = new Date(d);
    t.setHours(0, 0, 0, 0);
    const s = new Date(highlightRange.start);
    s.setHours(0, 0, 0, 0);
    const e = new Date(highlightRange.end);
    e.setHours(0, 0, 0, 0);
    return t >= s && t <= e;
  };

  const isSelectedDay =
    (d: Date) =>
      d.toDateString() === selectedDate.toDateString();

  return (
    <div className="w-60 shrink-0 hidden lg:block">
      <div className="sticky top-0 space-y-4">
        {/* Mini Calendar */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
          {/* Mini nav */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-800">{miniLabel}</h3>
            <div className="flex gap-0.5">
              <button
                onClick={() =>
                  setMiniDate(
                    new Date(miniYear, miniMonth - 1, 1),
                  )
                }
                className="p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="Previous month"
              >
                <ChevronLeft size={14} className="text-gray-500" />
              </button>
              <button
                onClick={() =>
                  setMiniDate(
                    new Date(miniYear, miniMonth + 1, 1),
                  )
                }
                className="p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="Next month"
              >
                <ChevronRight size={14} className="text-gray-500" />
              </button>
            </div>
          </div>

          {/* Weekday labels */}
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAY_LABELS.map((label, i) => (
              <div
                key={i}
                className="text-center text-[10px] font-semibold text-gray-400 py-0.5"
              >
                {label}
              </div>
            ))}
          </div>

          {/* Date grid */}
          <div className="grid grid-cols-7">
            {miniDays.map((day, i) => {
              const selected = isSelectedDay(day.date);
              const inRange = isInRange(day.date);

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onDateSelect(day.date)}
                  className={`
                    w-7 h-7 flex items-center justify-center text-[11px] rounded-full transition-all cursor-pointer
                    ${!day.isCurrentMonth ? "text-gray-300" : "text-gray-700"}
                    ${day.isToday && !selected ? "bg-primary/10 text-primary font-bold" : ""}
                    ${selected ? "bg-primary text-white font-bold" : ""}
                    ${inRange && !selected && !day.isToday ? "bg-primary/5" : ""}
                    ${!selected && !day.isToday ? "hover:bg-gray-100" : ""}
                  `}
                >
                  {day.date.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Color Legend */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            Event Colors
          </h4>
          <div className="space-y-2">
            {[
              { color: "bg-blue-500", label: "Meetings" },
              { color: "bg-emerald-500", label: "Reviews" },
              { color: "bg-purple-500", label: "Workshops" },
              { color: "bg-amber-500", label: "Milestones" },
              { color: "bg-orange-500", label: "External" },
              { color: "bg-red-500", label: "Important" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-sm ${item.color}`}
                />
                <span className="text-xs text-gray-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarSidebar;
