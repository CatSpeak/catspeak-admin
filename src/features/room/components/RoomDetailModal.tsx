import React from "react";
import {
  X, Users, Globe, GraduationCap, Tag, Timer,
  Shield, Calendar, Hash,
} from "lucide-react";
import type { Room } from "../types";
import { LANGUAGE_FLAGS, ROOM_TYPE_STYLES } from "../constants";

const DEFAULT_THUMBNAIL =
  "https://i.ibb.co/23fT32Dq/meeting-room-filled-with-chairs-and-a-large-table-in-a-modern-office-setting-details-free-photo.webp";

interface RoomDetailModalProps {
  room: Room | null;
  onClose: () => void;
}

interface DetailRowProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}

const DetailRow: React.FC<DetailRowProps> = ({ icon, label, children }) => (
  <div className="flex items-start gap-3 py-2.5">
    <span className="text-gray-400 shrink-0 mt-0.5">{icon}</span>
    <div className="flex-1 min-w-0">
      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      <div className="text-sm text-gray-800">{children}</div>
    </div>
  </div>
);

const RoomDetailModal: React.FC<RoomDetailModalProps> = ({ room, onClose }) => {
  if (!room) return null;

  const flag = LANGUAGE_FLAGS[room.languageType];
  const typeStyle = ROOM_TYPE_STYLES[room.roomType];
  const isActive = room.status === 1;
  const thumbnailSrc = room.thumbnailUrl || DEFAULT_THUMBNAIL;
  const createdDate = new Date(room.createDate).toLocaleDateString("en-US", {
    weekday: "short", month: "long", day: "numeric", year: "numeric",
  });
  const createdTime = new Date(room.createDate).toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-slideUp">
        {/* Thumbnail header */}
        <div className="relative h-48 sm:h-56 overflow-hidden bg-gray-100 shrink-0">
          <img
            src={thumbnailSrc}
            alt={room.name}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_THUMBNAIL; }}
          />


          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/30 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/50 transition-colors"
          >
            <X size={16} />
          </button>

          {/* Overlay badges */}
          <div className="absolute top-3 left-3 flex gap-1.5">
            <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold backdrop-blur-sm ${typeStyle.bg} ${typeStyle.text}`}>
              <Users size={10} />
              {room.roomType === "OneToOne" ? "1:1" : "Group"}
            </span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold backdrop-blur-sm ${isActive ? "bg-emerald-50/90 text-emerald-600" : "bg-gray-100/90 text-gray-500"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-gray-400"}`} />
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Room name */}
          <h2 className="text-lg font-bold text-gray-900 leading-snug mb-1">{room.name}</h2>
          {/* Description */}
          {room.description && room.description !== "string" && (
            <p className="text-sm text-gray-600 leading-relaxed mb-4 pb-4 border-b border-gray-100">
              {room.description}
            </p>
          )}

          {/* Detail rows */}
          <div className="divide-y divide-gray-50">
            <DetailRow icon={<Globe size={15} />} label="Language">
              <img src={flag} alt={room.languageType} className="w-4 h-4 rounded-sm inline-block align-text-bottom" /> {room.languageType}
            </DetailRow>

            {room.requiredLevel && (
              <DetailRow icon={<GraduationCap size={15} />} label="Required Level">
                {room.requiredLevel}
              </DetailRow>
            )}

            {room.topic && (
              <DetailRow icon={<Tag size={15} />} label="Topic">
                {room.topic}
              </DetailRow>
            )}

            <DetailRow icon={<Users size={15} />} label="Participants">
              <span className="font-medium">{room.currentParticipantCount}</span>
              {room.maxParticipants != null && (
                <span className="text-gray-400"> / {room.maxParticipants} max</span>
              )}
            </DetailRow>

            {room.duration != null && (
              <DetailRow icon={<Timer size={15} />} label="Duration">
                {room.duration} minutes
              </DetailRow>
            )}

            <DetailRow icon={<Shield size={15} />} label="Privacy">
              Public
            </DetailRow>

            <DetailRow icon={<Hash size={15} />} label="Room ID">
              #{room.roomId}
            </DetailRow>

            <DetailRow icon={<Calendar size={15} />} label="Created">
              {createdDate}
              <span className="text-gray-400 ml-1">at {createdTime}</span>
            </DetailRow>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-5 py-3 border-t border-gray-100 bg-gray-50/50 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailModal;
