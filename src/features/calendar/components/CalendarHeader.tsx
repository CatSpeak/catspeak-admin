import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CalendarViewMode } from "../types";

interface CalendarHeaderProps {
  viewLabel: string;
  viewMode: CalendarViewMode;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewModeChange: (mode: CalendarViewMode) => void;
}

const VIEW_MODES: { value: CalendarViewMode; label: string }[] = [
  { value: "month", label: "Month" },
  { value: "week", label: "Week" },
  { value: "day", label: "Day" },
];

/** Google Calendar-style toolbar — period label adapts to viewMode */
const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  viewLabel,
  viewMode,
  onPrev,
  onNext,
  onToday,
  onViewModeChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      {/* Left: navigation */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onToday}
          className="px-3.5 py-1.5 text-xs font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Today
        </button>

        <button
          onClick={onPrev}
          aria-label="Previous"
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>

        <button
          onClick={onNext}
          aria-label="Next"
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <ChevronRight size={20} className="text-gray-600" />
        </button>

        <h2 className="text-lg font-bold text-gray-900 ml-2 select-none whitespace-nowrap">
          {viewLabel}
        </h2>
      </div>

      {/* Right: view mode toggle */}
      <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
        {VIEW_MODES.map((mode) => (
          <button
            key={mode.value}
            onClick={() => onViewModeChange(mode.value)}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all duration-200 cursor-pointer ${
              viewMode === mode.value
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CalendarHeader;
