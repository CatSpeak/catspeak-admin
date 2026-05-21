import React from "react";
import { X, GraduationCap, Tag, Shield, Lock, Pencil } from "lucide-react";
import { useEditRoom } from "../hooks/useEditRoom";
import { REQUIRED_LEVELS, ROOM_TOPICS } from "../constants";
import type { Room, RequiredLevel, RoomPrivacy, RoomTopic } from "../types";

interface EditRoomModalProps {
  room: Room | null;
  onClose: () => void;
  onEdited: () => void;
}

const PRIVACY_OPTIONS: { value: RoomPrivacy; label: string; desc: string }[] = [
  { value: "Public", label: "Public", desc: "Anyone can join freely" },
  { value: "Private", label: "Private", desc: "Password required to join" },
];

const EditRoomModal: React.FC<EditRoomModalProps> = ({ room, onClose, onEdited }) => {
  const { form, errors, isSubmitting, hasChanges, updateField, toggleTopic, handleSubmit, resetForm } =
    useEditRoom(room, () => {
      onEdited();
      onClose();
    });

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!room) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              <Pencil size={16} className="text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Edit Room</h2>
              <p className="text-xs text-gray-400">ID #{room.roomId}</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Name */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
              Room Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Daily Chinese Corner"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              className={`w-full px-3 py-2.5 text-sm bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.name ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-primary/30 focus:border-primary/50"
                }`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Privacy */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
              <Shield size={14} /> Privacy
            </label>
            <div className="flex gap-2">
              {PRIVACY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateField("privacy", opt.value)}
                  className={`flex-1 px-4 py-2.5 rounded-lg border transition-all duration-200 text-left ${form.privacy === opt.value
                    ? "bg-primary/10 border-primary/30 shadow-sm"
                    : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                >
                  <span className={`block text-sm font-medium ${form.privacy === opt.value ? "text-primary" : "text-gray-600"}`}>
                    {opt.label}
                  </span>
                  <span className="block text-[11px] text-gray-400 mt-0.5">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Password (shown only when Private) */}
          {form.privacy === "Private" && (
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                <Lock size={14} /> Room Password
                {room.privacy === "Public" && <span className="text-red-400">*</span>}
              </label>
              <input
                type="password"
                placeholder={room.hasPassword ? "Leave blank to keep current password" : "Enter room password"}
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
                className={`w-full px-3 py-2.5 text-sm bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.password ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-primary/30 focus:border-primary/50"
                  }`}
              />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
              {room.hasPassword && (
                <p className="text-[11px] text-gray-400 mt-1">This room already has a password. Leave blank to keep it unchanged.</p>
              )}
            </div>
          )}

          {/* Level */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
              <GraduationCap size={14} /> Level
            </label>
            <select
              value={form.requiredLevel}
              onChange={(e) => updateField("requiredLevel", e.target.value as RequiredLevel | "")}
              className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all appearance-none"
            >
              <option value="">Select a Level</option>
              <optgroup label="HSK Levels">
                {REQUIRED_LEVELS.filter((l) => l.group === "HSK").map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </optgroup>
              <optgroup label="CEFR Levels">
                {REQUIRED_LEVELS.filter((l) => l.group === "CEFR").map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </optgroup>
              <optgroup label="Other Levels">
                {REQUIRED_LEVELS.filter((l) => l.group === "Other").map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Topics (multi-select) */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
              <Tag size={14} /> Topics
              {form.topics.length > 0 && (
                <span className="text-[10px] text-gray-400 font-normal">({form.topics.length} selected)</span>
              )}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ROOM_TOPICS.map((t) => {
                const active = form.topics.includes(t.value as RoomTopic);
                return (
                  <button
                    key={t.value}
                    onClick={() => toggleTopic(t.value as RoomTopic)}
                    className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium border transition-all duration-200 ${active
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={resetForm}
            disabled={!hasChanges || isSubmitting}
            className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Reset changes
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !hasChanges}
              className="px-5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditRoomModal;
