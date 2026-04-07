import React from "react";
import { Clock, MapPin } from "lucide-react";
import type { CalendarEvent } from "../types";
import { HOUR_HEIGHT } from "../types";
import { EVENT_COLORS } from "../constants";

interface EventBlockProps {
  event: CalendarEvent;
  /** Column index for overlap layout (0-based) */
  column?: number;
  /** Total columns in the overlap cluster */
  totalColumns?: number;
  onClick?: (event: CalendarEvent) => void;
}

const EventBlock: React.FC<EventBlockProps> = ({
  event,
  column = 0,
  totalColumns = 1,
  onClick,
}) => {
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);
  const color = EVENT_COLORS[event.color];

  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const durationMinutes = Math.max(
    (end.getTime() - start.getTime()) / 60000,
    15,
  );
  const clampedDuration = Math.min(durationMinutes, 24 * 60 - startMinutes);

  const top = (startMinutes / 60) * HOUR_HEIGHT;
  const height = Math.max((clampedDuration / 60) * HOUR_HEIGHT, 22);

  const timeStr = `${start.toLocaleTimeString("default", { hour: "2-digit", minute: "2-digit", hour12: true })} – ${end.toLocaleTimeString("default", { hour: "2-digit", minute: "2-digit", hour12: true })}`;

  // Overlap layout
  const leftPercent = (column / totalColumns) * 100;
  const widthPercent = (1 / totalColumns) * 100;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(event);
      }}
      className={`absolute rounded-md px-2 py-0.5 border-l-3 overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:brightness-95 z-10 text-left ${color.block}`}
      style={{
        top,
        height,
        left: `calc(${leftPercent}% + 2px)`,
        width: `calc(${widthPercent}% - 4px)`,
      }}
      title={`${event.title}\n${timeStr}${event.location ? `\n📍 ${event.location}` : ""}`}
    >
      <p className={`text-xs font-semibold truncate ${color.text}`}>
        {event.title}
      </p>
      {height > 36 && (
        <p className={`flex items-center gap-1 text-[10px] truncate opacity-75 ${color.text}`}>
          <Clock size={10} className="shrink-0" />
          {timeStr}
        </p>
      )}
      {height > 56 && event.location && (
        <p className={`flex items-center gap-1 text-[10px] truncate opacity-75 ${color.text}`}>
          <MapPin size={10} className="shrink-0" />
          {event.location}
        </p>
      )}
    </button>
  );
};

export default EventBlock;
