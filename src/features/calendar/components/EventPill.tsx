import React from "react";
import type { CalendarEvent } from "../types";
import { EVENT_COLORS } from "../constants";

interface EventPillProps {
  event: CalendarEvent;
}

const EventPill: React.FC<EventPillProps> = ({ event }) => {
  const color = EVENT_COLORS[event.color];

  const start = new Date(event.startDate);
  const timeStr = event.isAllDay
    ? "All day"
    : start.toLocaleTimeString("default", { hour: "2-digit", minute: "2-digit", hour12: true });

  const tooltipLines = [
    event.title,
    timeStr,
    event.location ? `📍 ${event.location}` : "",
    event.description ? event.description : "",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div
      className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium cursor-pointer truncate transition-opacity hover:opacity-80 ${color.bg} ${color.text}`}
      title={tooltipLines}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${color.dot}`} />
      <span className="truncate">{event.title}</span>
    </div>
  );
};

export default EventPill;
