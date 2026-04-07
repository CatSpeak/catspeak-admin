import React from "react";
import { Clock, Users } from "lucide-react";
import type { DayEvent } from "../types";
import { HOUR_HEIGHT } from "../types";
import { getColorClasses, formatTime } from "../constants";

interface EventBlockProps {
  event: DayEvent;
  /** Column index for overlap layout (0-based) */
  column?: number;
  /** Total columns in the overlap cluster */
  totalColumns?: number;
  onClick?: (event: DayEvent) => void;
}

const EventBlock: React.FC<EventBlockProps> = ({
  event,
  column = 0,
  totalColumns = 1,
  onClick,
}) => {
  const start = new Date(event.startTime);
  const end = new Date(event.endTime);
  const color = getColorClasses(event.color);

  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const durationMinutes = Math.max(
    (end.getTime() - start.getTime()) / 60000,
    15,
  );
  const clampedDuration = Math.min(durationMinutes, 24 * 60 - startMinutes);

  const top = (startMinutes / 60) * HOUR_HEIGHT;
  const height = Math.max((clampedDuration / 60) * HOUR_HEIGHT, 22);

  const timeStr = `${formatTime(event.startTime)} – ${formatTime(event.endTime)}`;

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
      className={`absolute rounded-md px-2 py-0.5 border-l-3 overflow-hidden cursor-pointer
        transition-all hover:shadow-lg hover:brightness-95 z-10 text-left ${color.bg} ${color.border}`}
      style={{
        top,
        height,
        left: `calc(${leftPercent}% + 2px)`,
        width: `calc(${widthPercent}% - 4px)`,
      }}
      title={`${event.title}\n${timeStr}`}
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
      {height > 56 && (
        <p className={`flex items-center gap-1 text-[10px] truncate opacity-75 ${color.text}`}>
          <Users size={10} className="shrink-0" />
          {event.currentParticipants}/{event.maxParticipants}
        </p>
      )}
    </button>
  );
};

export default EventBlock;
