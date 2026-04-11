import React, { useState, useRef, useEffect } from "react";
import { Users, Clock, Trash2, Globe, GraduationCap, Timer, MoreVertical } from "lucide-react";
import type { Room, RoomCategory } from "../types";
import { ROOM_TYPE_STYLES, LANGUAGE_FLAGS } from "../constants";

interface RoomTableProps {
  rooms: Room[];
  onDelete: (id: number) => void;
}

function parseCategories(raw: string): RoomCategory[] {
  try {
    return JSON.parse(raw) as RoomCategory[];
  } catch {
    return [];
  }
}

/* ── Individual row with its own menu state ── */

interface RoomTableRowProps {
  room: Room;
  onDelete: (id: number) => void;
}

const RoomTableRow: React.FC<RoomTableRowProps> = ({ room, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const typeStyle = ROOM_TYPE_STYLES[room.roomType];
  const flag = LANGUAGE_FLAGS[room.languageType];
  const isActive = room.status === 1;
  const categories = parseCategories(room.categories);

  // Close menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <tr className="hover:bg-gray-50/60 transition-colors">
      <td className="px-4 py-3">
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 text-sm">{room.name}</span>
          {room.description && room.description !== "string" && (
            <span className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{room.description}</span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium ${typeStyle.bg} ${typeStyle.text}`}>
          <Users size={10} />
          {room.roomType === "OneToOne" ? "1:1" : "Group"}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1 text-sm text-gray-700">
          <Globe size={13} className="text-gray-400" />
          {flag} {room.languageType}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium bg-violet-50 text-violet-700">
          <GraduationCap size={10} />
          {room.requiredLevel}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1 max-w-[180px]">
          <span className="rounded-full px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-600">{room.topic}</span>
          {categories.map((cat) => (
            <span key={cat} className="rounded-full px-1.5 py-0.5 text-[10px] font-medium bg-primary/5 text-primary/70">{cat}</span>
          ))}
        </div>
      </td>
      <td className="px-4 py-3 text-center">
        <span className="text-sm text-gray-700">
          {room.currentParticipantCount}{room.maxParticipants != null ? `/${room.maxParticipants}` : ""}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        {room.duration != null ? (
          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
            <Timer size={12} />
            {room.duration}m
          </span>
        ) : (
          <span className="text-xs text-gray-300">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-center">
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${isActive ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-gray-400"}`} />
          {isActive ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1 text-xs text-gray-400">
          <Clock size={12} />
          {new Date(room.createDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        <div className="relative inline-block" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Room actions"
          >
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 z-20 w-36 bg-white rounded-lg border border-gray-200 shadow-lg py-1">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(room.roomId);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={14} />
                Delete room
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

/* ── Table component ── */

const RoomTable: React.FC<RoomTableProps> = ({ rooms, onDelete }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Room</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Language</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Level</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Topic</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Users</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rooms.map((room) => (
              <RoomTableRow key={room.roomId} room={room} onDelete={onDelete} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoomTable;
