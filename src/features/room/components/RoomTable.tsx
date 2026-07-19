import React, { useState, useRef, useEffect } from "react";
import {
  Users,
  Clock,
  Trash2,
  Pencil,
  GraduationCap,
  Timer,
  MoreVertical,
  Lock,
  Globe,
} from "lucide-react";
import type { Room } from "../types";
import { ROOM_TYPE_STYLES, LANGUAGE_FLAGS } from "../constants";

interface RoomTableProps {
  rooms: Room[];
  onDelete: (id: number) => void;
  onEdit?: (room: Room) => void;
  onClick?: (room: Room) => void;
}

interface RoomTableRowProps {
  room: Room;
  onDelete: (id: number) => void;
  onEdit?: (room: Room) => void;
  onClick?: (room: Room) => void;
}

const RoomTableRow: React.FC<RoomTableRowProps> = ({
  room,
  onDelete,
  onEdit,
  onClick,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const typeStyle = ROOM_TYPE_STYLES[room.roomType] ?? { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" };
  const flag = LANGUAGE_FLAGS[room.languageType];
  const isActive = room.status === 1;

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
    <tr
      onClick={() => onClick?.(room)}
      className={`hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer`}
    >
      {/* Room Name Column */}
      <td className="px-4 py-3 text-sm text-gray-700">
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-gray-950 truncate">
            {room.name}
          </span>
          {room.description && room.description !== "string" && (
            <span className="text-[11px] text-gray-400 truncate leading-relaxed">
              {room.description}
            </span>
          )}
        </div>
      </td>

      {/* Type Column */}
      <td className="px-4 py-3 text-sm text-gray-700">
        <span
          className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-medium ${typeStyle.bg} ${typeStyle.text}`}
        >
          <Users size={12} />
          {room.roomType === "OneToOne" ? "1:1" : "Group"}
        </span>
      </td>

      {/* Language Column */}
      <td className="px-4 py-3 text-sm text-gray-700 font-medium">
        <span className="inline-flex items-center gap-1.5">
          <img
            src={flag}
            alt={room.languageType}
            className="w-4 h-3.5 rounded-sm shadow-sm object-cover"
          />
          <span>{room.languageType}</span>
        </span>
      </td>

      {/* Level Column */}
      <td className="px-4 py-3 text-sm text-gray-700">
        {room.requiredLevel ? (
          <span className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-medium bg-violet-50 text-violet-700 border border-violet-100">
            <GraduationCap size={12} />
            {room.requiredLevel}
          </span>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </td>

      {/* Topic Column */}
      <td className="px-4 py-3 text-sm text-gray-700">
        {room.topic ? (
          <span className="rounded-full px-2 py-0.5 text-[12px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
            {room.topic}
          </span>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </td>

      {/* Participants Column */}
      <td className="px-4 py-3 text-center text-sm font-medium text-gray-700 tabular-nums">
        {room.currentParticipantCount}
        {room.maxParticipants != null ? `/${room.maxParticipants}` : ""}
      </td>

      {/* Duration Column */}
      <td className="px-4 py-3 text-center text-sm text-gray-700">
        {room.duration != null ? (
          <span className="inline-flex items-center gap-1 text-xs text-gray-500 justify-center">
            <Timer size={12} />
            <span className="tabular-nums">{room.duration}m</span>
          </span>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </td>

      {/* Status Column */}
      <td className="px-4 py-3 text-center text-sm text-gray-700">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-semibold border ${
            isActive
              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
              : "bg-gray-150 text-gray-500 border-gray-200"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-gray-400"}`}
          />
          {isActive ? "Active" : "Inactive"}
        </span>
      </td>

      {/* Privacy Column */}
      <td className="px-4 py-3 text-center text-sm text-gray-700">
        <span
          className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-medium border ${
            room.privacy === "Private"
              ? "bg-amber-50 text-amber-700 border-amber-100"
              : "bg-sky-50 text-sky-700 border-sky-100"
          }`}
        >
          {room.privacy === "Private" ? (
            <Lock size={12} />
          ) : (
            <Globe size={12} />
          )}
          {room.privacy}
        </span>
      </td>

      {/* Created At Column */}
      <td className="px-4 py-3 text-sm text-gray-500 tabular-nums">
        <span className="inline-flex items-center gap-1.5">
          <Clock size={12} className="text-gray-400" />
          {new Date(room.createDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      </td>

      {/* Actions Column */}
      <td
        className="px-4 py-3 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative inline-block text-left" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
            aria-label="Room actions"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 z-20 mt-1 w-36 origin-top-right rounded-lg border border-gray-100 bg-white shadow-lg py-1"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit?.(room);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Pencil size={14} className="text-gray-450" />
                Edit room
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(room.roomId);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-left text-red-605 hover:bg-red-50 transition-colors"
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
const RoomTable: React.FC<RoomTableProps> = ({
  rooms,
  onDelete,
  onEdit,
  onClick,
}) => {
  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-primary text-white sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-bold tracking-wider whitespace-nowrap">
                Room Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-bold tracking-wider whitespace-nowrap">
                Type
              </th>
              <th className="px-4 py-3 text-left text-sm font-bold tracking-wider whitespace-nowrap">
                Language
              </th>
              <th className="px-4 py-3 text-left text-sm font-bold tracking-wider whitespace-nowrap">
                Level
              </th>
              <th className="px-4 py-3 text-left text-sm font-bold tracking-wider whitespace-nowrap">
                Topic
              </th>
              <th className="px-4 py-3 text-center text-sm font-bold tracking-wider whitespace-nowrap">
                Participants
              </th>
              <th className="px-4 py-3 text-center text-sm font-bold tracking-wider whitespace-nowrap">
                Duration
              </th>
              <th className="px-4 py-3 text-center text-sm font-bold tracking-wider whitespace-nowrap">
                Status
              </th>
              <th className="px-4 py-3 text-center text-sm font-bold tracking-wider whitespace-nowrap">
                Privacy
              </th>
              <th className="px-4 py-3 text-left text-sm font-bold tracking-wider whitespace-nowrap">
                Created At
              </th>
              <th className="px-4 py-3 text-center text-xs font-bold w-12">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rooms.map((room) => (
              <RoomTableRow
                key={room.roomId}
                room={room}
                onDelete={onDelete}
                onEdit={onEdit}
                onClick={onClick}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoomTable;
