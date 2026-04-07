import React from "react";
import type { DayCell } from "../hooks/useCalendar";
import EventPill from "./EventPill";

interface CalendarGridProps {
  days: DayCell[];
  onDayClick?: (date: Date) => void;
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Month view grid — click day number to switch to day view */
const CalendarGrid: React.FC<CalendarGridProps> = ({ days, onDayClick }) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day, index) => (
          <div
            key={index}
            className={`
              relative min-h-[100px] sm:min-h-[110px] p-1.5 border-b border-r border-gray-100 transition-colors
              ${!day.isCurrentMonth ? "bg-gray-50/60" : "bg-white"}
              ${day.isWeekend && day.isCurrentMonth ? "bg-orange-50/30" : ""}
              ${day.isToday ? "bg-primary/5" : ""}
              hover:bg-gray-50
            `}
          >
            <div className="flex items-center justify-center mb-1">
              <button
                type="button"
                onClick={() => onDayClick?.(day.date)}
                className={`
                  inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium cursor-pointer transition-colors
                  ${day.isToday
                    ? "bg-primary text-white font-bold hover:bg-primary-dark"
                    : day.isCurrentMonth
                      ? "text-gray-900 hover:bg-gray-200"
                      : "text-gray-300 hover:bg-gray-100"
                  }
                `}
              >
                {day.date.getDate()}
              </button>
            </div>

            <div className="space-y-0.5">
              {day.events.slice(0, 3).map((event) => (
                <EventPill key={event.id} event={event} />
              ))}
              {day.events.length > 3 && (
                <p className="text-[10px] text-gray-400 font-medium px-1.5 cursor-pointer hover:text-gray-600 transition-colors">
                  +{day.events.length - 3} more
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarGrid;
