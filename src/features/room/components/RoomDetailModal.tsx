import React from "react";
import {
  X, Users, Globe, GraduationCap, Tag, Timer,
  Shield, Calendar, Hash, Lock,
} from "lucide-react";
import type { Room, RoomTopic } from "../types";
import { LANGUAGE_FLAGS, ROOM_TYPE_STYLES } from "../constants";
import { useLanguage } from "../../../stores/languageStore";

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
  const { t } = useLanguage();
  if (!room) return null;

  const flag = room.languageType ? LANGUAGE_FLAGS[room.languageType] : undefined;
  const typeStyle = ROOM_TYPE_STYLES[room.roomType] ?? { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" };
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors backdrop-blur-sm cursor-pointer"
          >
            <X size={18} />
          </button>

          {/* Title overlay */}
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${typeStyle.bg} ${typeStyle.text} mb-1.5`}>
                <span className={`w-1.5 h-1.5 rounded-full ${typeStyle.dot}`} />
                {room.roomType === "OneToOne" ? t.room.oneToOneRooms : t.room.groupRooms}
              </span>
              <h2 className="text-lg font-bold text-white truncate drop-shadow-sm">{room.name}</h2>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm">
              <span
                className={`w-2 h-2 rounded-full ${isActive ? "bg-emerald-500 animate-pulse" : "bg-gray-400"
                  }`}
              />
              <span className={isActive ? "text-emerald-700" : "text-gray-600"}>
                {isActive ? t.common.active : t.common.inactive}
              </span>
            </div>
          </div>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-1">
          <div className="grid grid-cols-2 gap-x-4 divide-y divide-gray-100 sm:divide-y-0">

            <DetailRow icon={<Hash size={15} />} label={t.reels.id}>
              <span className="font-mono font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                #{room.roomId}
              </span>
            </DetailRow>

            <DetailRow icon={<Globe size={15} />} label={t.room.language}>
              <span className="flex items-center gap-1.5 font-medium">
                {flag && <img src={flag} alt={room.languageType ? (t.room.languages?.[room.languageType] || room.languageType) : ""} className="w-4 h-4 rounded-sm" />}
                {room.languageType ? (t.room.languages?.[room.languageType] || room.languageType) : "—"}
              </span>
            </DetailRow>

            <DetailRow icon={<GraduationCap size={15} />} label={t.room.level}>
              <span className="font-medium">{room.requiredLevel ? (t.room.levels?.[room.requiredLevel] || room.requiredLevel) : "—"}</span>
            </DetailRow>

            <DetailRow icon={<Tag size={15} />} label={t.room.topic}>
              {(() => {
                const topics = Array.isArray(room.topic)
                  ? room.topic
                  : typeof room.topic === "string"
                  ? (room.topic as string).split(",").map((t) => t.trim()).filter(Boolean) as RoomTopic[]
                  : [];
                if (topics.length === 0) {
                  return (
                    <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full font-medium">
                      General
                    </span>
                  );
                }
                return (
                  <div className="flex flex-wrap gap-1.5">
                    {topics.map((top) => (
                      <span
                        key={top}
                        className="inline-block bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full font-medium"
                      >
                        {t.room.topics?.[top] || top}
                      </span>
                    ))}
                  </div>
                );
              })()}
            </DetailRow>

            <DetailRow icon={<Users size={15} />} label={t.room.participants}>
              <span className="font-medium">
                {room.currentParticipantCount}
                {room.maxParticipants != null ? `/${room.maxParticipants}` : ""}
              </span>
            </DetailRow>

            <DetailRow icon={<Shield size={15} />} label={t.room.privacy}>
              <span className="font-medium flex items-center gap-1">
                {room.privacy === "Private" && <Lock size={13} className="text-amber-500" />}
                {room.privacy === "Private" ? t.news.privateLabel : t.news.publicLabel}
              </span>
            </DetailRow>

            <DetailRow icon={<Timer size={15} />} label={t.room.duration}>
              <span className="font-medium">{room.duration != null ? `${room.duration}m` : "—"}</span>
            </DetailRow>

            <DetailRow icon={<Calendar size={15} />} label={t.common.createdDate}>
              {createdDate}
              <span className="text-gray-400 ml-1">at {createdTime}</span>
            </DetailRow>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-5 py-3 border-t border-gray-100 bg-gray-50/50 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            {t.common.close}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailModal;
