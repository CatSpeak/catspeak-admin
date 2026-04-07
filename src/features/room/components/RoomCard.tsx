import React from "react";
import { Users, Clock, Trash2, Globe, GraduationCap, Tag, Timer } from "lucide-react";
import type { Room, RoomCategory } from "../types";
import { ROOM_TYPE_STYLES, LANGUAGE_FLAGS } from "../constants";

interface RoomCardProps {
  room: Room;
  onDelete: (id: number) => void;
}

/** Parse the JSON-encoded categories string */
function parseCategories(raw: string): RoomCategory[] {
  try {
    return JSON.parse(raw) as RoomCategory[];
  } catch {
    return [];
  }
}

const RoomCard: React.FC<RoomCardProps> = ({ room, onDelete }) => {
  const typeStyle = ROOM_TYPE_STYLES[room.roomType];
  const flag = LANGUAGE_FLAGS[room.languageType];
  const isActive = room.status === 1;
  const categories = parseCategories(room.categories);
  const createdDate = new Date(room.createDate).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <div className="group relative bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
      {/* Top accent bar */}
      <div className={`h-1 ${room.roomType === "OneToOne" ? "bg-indigo-500" : "bg-emerald-500"}`} />

      <div className="p-5 flex-1 flex flex-col">
        {/* Header: name + status */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 flex-1">{room.name}</h3>
          <span className={`inline-flex items-center gap-1 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${isActive ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-gray-400"}`} />
            {isActive ? "Active" : "Inactive"}
          </span>
        </div>

        {/* Description */}
        {room.description && room.description !== "string" && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">{room.description}</p>
        )}

        {/* Badges row */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium ${typeStyle.bg} ${typeStyle.text}`}>
            <Users size={11} />
            {room.roomType === "OneToOne" ? "1:1" : "Group"}
          </span>
          <span className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium bg-amber-50 text-amber-700">
            <Globe size={11} />
            {flag} {room.languageType}
          </span>
          <span className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium bg-violet-50 text-violet-700">
            <GraduationCap size={11} />
            {room.requiredLevel}
          </span>
          {room.duration != null && (
            <span className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium bg-sky-50 text-sky-700">
              <Timer size={11} />
              {room.duration}m
            </span>
          )}
        </div>

        {/* Topic + Categories */}
        <div className="flex flex-wrap gap-1 mb-4">
          <span className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200/60">
            <Tag size={9} />
            {room.topic}
          </span>
          {categories.map((cat) => (
            <span key={cat} className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-primary/5 text-primary/80 border border-primary/10">
              {cat}
            </span>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-3 text-[11px] text-gray-400">
            <span className="inline-flex items-center gap-1">
              <Users size={12} />
              {room.currentParticipantCount}{room.maxParticipants != null ? `/${room.maxParticipants}` : ""}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock size={12} />
              {createdDate}
            </span>
          </div>

          <button
            onClick={() => onDelete(room.roomId)}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"
            title="Delete room"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
