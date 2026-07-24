import React, { useState, useRef, useEffect } from "react";
import {
  Users,
  Trash2,
  Pencil,
  GraduationCap,
  Timer,
  MoreVertical,
  Lock,
  Globe,
} from "lucide-react";
import type { Room } from "../types";
import { LANGUAGE_FLAGS } from "../constants";
import { formatDate } from "../../../lib/utils";
import { useLanguage } from "../../../stores/languageStore";
import Badge from "../../../components/ui/Badge";

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
  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const flag = LANGUAGE_FLAGS[room.languageType];
  const isActive = room.status === 1;
  const createdDate = formatDate(room.createDate);

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
      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
        <Badge
          title={room.roomType === "OneToOne" ? t.room.oneToOneRooms : t.room.groupRooms}
          type={room.roomType === "OneToOne" ? "Blue" : "Orange"}
          icon={<Users size={12} />}
        />
      </td>

      {/* Language Column */}
      <td className="px-4 py-3 text-sm text-gray-700 font-medium whitespace-nowrap">
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
          <img
            src={flag}
            alt={room.languageType}
            className="w-4 h-3.5 rounded-sm shadow-sm object-cover"
          />
          <span>{room.languageType}</span>
        </span>
      </td>

      {/* Level Column */}
      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
        {room.requiredLevel ? (
          <Badge
            title={room.requiredLevel}
            type="Purple"
            icon={<GraduationCap size={12} />}
          />
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </td>

      {/* Topic Column */}
      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
        {room.topic ? (
          <Badge
            title={t.room.topics?.[room.topic] || room.topic}
            type="Gray"
          />
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </td>

      {/* Participants Column */}
      <td className="px-4 py-3 text-center text-sm font-medium text-gray-700 tabular-nums whitespace-nowrap">
        {room.currentParticipantCount}
        {room.maxParticipants != null ? `/${room.maxParticipants}` : ""}
      </td>

      {/* Duration Column */}
      <td className="px-4 py-3 text-center text-sm text-gray-700 whitespace-nowrap">
        {room.duration != null ? (
          <span className="inline-flex items-center gap-1 text-xs text-gray-500 justify-center whitespace-nowrap">
            <Timer size={12} />
            <span className="tabular-nums">{room.duration}m</span>
          </span>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </td>

      {/* Status Column */}
      <td className="px-4 py-3 text-center text-sm text-gray-700 whitespace-nowrap">
        <Badge
          title={isActive ? t.common.active : t.common.inactive}
          type={isActive ? "Green" : "Gray"}
          showDot
        />
      </td>

      {/* Privacy Column */}
      <td className="px-4 py-3 text-center text-sm text-gray-700 whitespace-nowrap">
        <Badge
          title={room.privacy === "Private" ? t.news.privateLabel : t.news.publicLabel}
          type={room.privacy === "Private" ? "Orange" : "Blue"}
          icon={room.privacy === "Private" ? <Lock size={12} /> : <Globe size={12} />}
        />
      </td>

      {/* Created At */}
      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
        {createdDate}
      </td>

      {/* Actions */}
      <td
        className="px-4 py-3 text-center text-sm relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div ref={menuRef} className="relative inline-block text-left">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none cursor-pointer"
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
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <Pencil size={14} className="text-gray-450" />
                {t.common.edit}
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(room.roomId);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-left text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <Trash2 size={14} />
                {t.common.delete}
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
  const { t } = useLanguage();

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-primary text-white sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-bold tracking-wider whitespace-nowrap">
                {t.room.roomName}
              </th>
              <th className="px-4 py-3 text-left text-sm font-bold tracking-wider whitespace-nowrap">
                {t.common.type}
              </th>
              <th className="px-4 py-3 text-left text-sm font-bold tracking-wider whitespace-nowrap">
                {t.room.language}
              </th>
              <th className="px-4 py-3 text-left text-sm font-bold tracking-wider whitespace-nowrap">
                {t.room.level}
              </th>
              <th className="px-4 py-3 text-left text-sm font-bold tracking-wider whitespace-nowrap">
                {t.room.topic}
              </th>
              <th className="px-4 py-3 text-center text-sm font-bold tracking-wider whitespace-nowrap">
                {t.room.participants}
              </th>
              <th className="px-4 py-3 text-center text-sm font-bold tracking-wider whitespace-nowrap">
                {t.room.duration}
              </th>
              <th className="px-4 py-3 text-center text-sm font-bold tracking-wider whitespace-nowrap">
                {t.common.status}
              </th>
              <th className="px-4 py-3 text-center text-sm font-bold tracking-wider whitespace-nowrap">
                {t.room.privacy}
              </th>
              <th className="px-4 py-3 text-left text-sm font-bold tracking-wider whitespace-nowrap">
                {t.common.createdDate}
              </th>
              <th className="px-4 py-3 text-center text-xs font-bold w-12">
                <span className="sr-only">{t.common.actions}</span>
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
