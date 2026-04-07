import React from "react";
import {
  X, Loader2, Calendar, Clock, MapPin, Users, Tag,
  Repeat, Globe, AlertCircle, Trash2,
} from "lucide-react";
import type { EventDetail } from "../types";
import { getColorClasses, formatDate, formatTime } from "../constants";

interface EventDetailModalProps {
  isOpen: boolean;
  event: EventDetail | null;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
  onDelete: (eventId: number) => void;
}

const SCOPE_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  PUBLIC: { label: "Public", icon: <Globe size={12} /> },
  COMMUNITY_ONLY: { label: "Community", icon: <Users size={12} /> },
  SHARED_LINK_ONLY: { label: "Shared Link", icon: <Tag size={12} /> },
};

const WEEKDAY_MAP: Record<string, string> = {
  MON: "Monday", TUE: "Tuesday", WED: "Wednesday",
  THU: "Thursday", FRI: "Friday", SAT: "Saturday", SUN: "Sunday",
};

const EventDetailModal: React.FC<EventDetailModalProps> = ({
  isOpen,
  event,
  isLoading,
  error,
  onClose,
  onDelete,
}) => {
  if (!isOpen) return null;

  const color = getColorClasses(event?.color);
  const scope = SCOPE_LABELS[event?.visibilityScope ?? ""] ?? SCOPE_LABELS.PUBLIC;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-start justify-between p-5 border-b border-gray-100`}>
          <div className="flex items-center gap-3 min-w-0">
            <span className={`w-3 h-3 rounded-full shrink-0 ${color.dot}`} />
            <h2 className="text-lg font-bold text-gray-900 truncate">
              {isLoading ? "Loading…" : event?.title ?? "Event Details"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 size={28} className="text-primary animate-spin mb-2" />
              <p className="text-sm text-gray-400">Loading event details…</p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {!isLoading && !error && event && (
            <div className="space-y-5">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  {scope.icon} {scope.label}
                </span>
                {event.isRecurring && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                    <Repeat size={12} /> Recurring
                  </span>
                )}
              </div>

              {/* Description */}
              {event.description && (
                <p className="text-sm text-gray-600 leading-relaxed">
                  {event.description}
                </p>
              )}

              {/* Info grid */}
              <div className="grid gap-3">
                {/* Date & Time */}
                {!event.isRecurring && event.startTime && event.endTime && (
                  <InfoRow icon={<Calendar size={15} />} label="Date">
                    {formatDate(event.startTime)}
                  </InfoRow>
                )}
                {!event.isRecurring && event.startTime && event.endTime && (
                  <InfoRow icon={<Clock size={15} />} label="Time">
                    {formatTime(event.startTime)} – {formatTime(event.endTime)}
                  </InfoRow>
                )}

                {/* Recurrence rule */}
                {event.isRecurring && event.recurrenceRule && (
                  <>
                    <InfoRow icon={<Repeat size={15} />} label="Repeats">
                      {event.recurrenceRule.frequency}, every {event.recurrenceRule.interval}{" "}
                      {event.recurrenceRule.frequency === "WEEKLY" ? "week(s)" : "interval(s)"}
                    </InfoRow>
                    <InfoRow icon={<Calendar size={15} />} label="Days">
                      {event.recurrenceRule.byWeekDay
                        .map((d) => WEEKDAY_MAP[d] ?? d)
                        .join(", ")}
                    </InfoRow>
                    <InfoRow icon={<Clock size={15} />} label="Time">
                      {event.recurrenceRule.startTime} – {event.recurrenceRule.endTime}
                    </InfoRow>
                    <InfoRow icon={<Calendar size={15} />} label="Period">
                      {formatDate(event.recurrenceRule.recurrenceStartDate)} →{" "}
                      {formatDate(event.recurrenceRule.recurrenceEndDate)}
                    </InfoRow>
                  </>
                )}

                {/* Location */}
                {event.location && (
                  <InfoRow icon={<MapPin size={15} />} label="Location">
                    {event.location}
                  </InfoRow>
                )}

                {/* Participants */}
                <InfoRow icon={<Users size={15} />} label="Max Participants">
                  {event.maxParticipants}
                </InfoRow>
              </div>

              {/* Conditions */}
              {event.conditions.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Conditions
                  </h4>
                  <div className="space-y-2">
                    {event.conditions.map((cond) => (
                      <div
                        key={cond.id}
                        className="p-2.5 rounded-lg bg-gray-50 border border-gray-100"
                      >
                        <p className="text-sm font-medium text-gray-800">{cond.title}</p>
                        {cond.description && (
                          <p className="text-xs text-gray-500 mt-0.5">{cond.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Created at */}
              <p className="text-xs text-gray-400">
                Created {formatDate(event.createdAt)}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isLoading && !error && event && (
          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 rounded-lg
                hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => onDelete(event.id)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium
                text-red-600 bg-red-50 rounded-lg hover:bg-red-100
                transition-colors cursor-pointer"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/** Small helper component for info rows */
const InfoRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}> = ({ icon, label, children }) => (
  <div className="flex items-start gap-3">
    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 text-gray-400 shrink-0">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm text-gray-800">{children}</p>
    </div>
  </div>
);

export default EventDetailModal;
