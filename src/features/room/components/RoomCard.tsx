import React, { useState, useRef, useEffect } from "react";
import { Users, Clock, Trash2, GraduationCap, Tag, MoreVertical } from "lucide-react";
import type { Room } from "../types";
import { ROOM_TYPE_STYLES, LANGUAGE_FLAGS } from "../constants";

const DEFAULT_THUMBNAIL =
  "https://i.ibb.co/23fT32Dq/meeting-room-filled-with-chairs-and-a-large-table-in-a-modern-office-setting-details-free-photo.webp";

interface RoomCardProps {
  room: Room;
  onDelete: (id: number) => void;
  onClick?: (room: Room) => void;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, onDelete, onClick }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const typeStyle = ROOM_TYPE_STYLES[room.roomType];
  const flag = LANGUAGE_FLAGS[room.languageType];
  const isActive = room.status === 1;
  const thumbnailSrc = room.thumbnailUrl || DEFAULT_THUMBNAIL;
  const createdDate = new Date(room.createDate).toLocaleDateString("en-US", {
    month: "short", day: "numeric",
  });

  return (
    <div
      className="bg-white rounded-xl border border-gray-200/60 hover:border-gray-300 hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer flex flex-col"
      onClick={() => onClick?.(room)}
    >
      {/* Thumbnail — compact */}
      <div className="relative h-32 overflow-hidden bg-gray-100">
        <img
          src={thumbnailSrc}
          alt={room.name}
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_THUMBNAIL; }}
        />
        {/* Status */}
        <div className="absolute top-2 left-2">
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${isActive ? "bg-emerald-500 text-white" : "bg-gray-400 text-white"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-white animate-pulse" : "bg-white/60"}`} />
            {isActive ? "Active" : "Inactive"}
          </span>
        </div>
        {/* Menu — always visible on card */}
        <div className="absolute top-2 right-2" ref={menuRef} onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="p-1 rounded-md bg-black/20 text-white/80 hover:bg-black/40 hover:text-white transition-colors"
            aria-label="Room actions"
          >
            <MoreVertical size={14} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 z-20 w-36 bg-white rounded-lg border border-gray-200 shadow-lg py-1">
              <button
                onClick={() => { setMenuOpen(false); onDelete(room.roomId); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={14} />
                Delete room
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5 flex flex-col flex-1">
        {/* Name */}
        <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-1 mb-2">{room.name}</h3>

        {/* Info grid — 2 columns, fixed 2 rows */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] text-gray-500 mb-3">
          {/* Language */}
          <div className="flex items-center gap-1.5">
            <img src={flag} alt={room.languageType} className="w-3.5 h-3.5 rounded-sm shrink-0" />
            <span className="truncate">{room.languageType}</span>
          </div>
          {/* Type — styled tag */}
          <div className="flex items-center">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${typeStyle.bg} ${typeStyle.text}`}>
              <Users size={9} />
              {room.roomType === "OneToOne" ? "1:1" : "Group"}
            </span>
          </div>
          {/* Level */}
          <div className="flex items-center gap-1.5">
            <GraduationCap size={11} className="text-gray-400 shrink-0" />
            <span className="truncate">{room.requiredLevel || "N/A"}</span>
          </div>
          {/* Topic */}
          <div className="flex items-center gap-1.5">
            <Tag size={11} className="text-gray-400 shrink-0" />
            <span className="truncate">{room.topic || "N/A"}</span>
          </div>
        </div>

        {/* Footer divider */}
        <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 text-[11px] text-gray-400">
          <span className="inline-flex items-center gap-1">
            <Users size={11} />
            {room.currentParticipantCount}{room.maxParticipants != null ? `/${room.maxParticipants}` : ""} participants
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock size={11} />
            {createdDate}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
