import React from "react";
import { Clock, Users } from "lucide-react";
import type { DayEvent } from "../types";
import { getColorClasses, formatTime } from "../constants";

interface EventPillProps {
  event: DayEvent;
  onClick?: (event: DayEvent) => void;
}

const EventPill: React.FC<EventPillProps> = ({ event, onClick }) => {
  const color = getColorClasses(event.color);
  const timeStr = `${formatTime(event.startTime)} – ${formatTime(event.endTime)}`;

  return (
    <button
      type="button"
      onClick={() => onClick?.(event)}
      className={`w-full text-left rounded-lg p-2.5 border-l-3 transition-all
        hover:shadow-md hover:brightness-95 cursor-pointer ${color.bg} ${color.border}`}
    >
      <p className={`text-sm font-semibold truncate ${color.text}`}>
        {event.title}
      </p>
      <div className="flex items-center gap-3 mt-1 flex-wrap">
        <span className="flex items-center gap-1 text-xs text-gray-500">
          <Clock size={11} className="shrink-0" />
          {timeStr}
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-500">
          <Users size={11} className="shrink-0" />
          {event.currentParticipants}/{event.maxParticipants}
        </span>
      </div>
      {event.isRegistered && (
        <span className="inline-block mt-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
          Registered
        </span>
      )}
    </button>
  );
};

export default EventPill;
