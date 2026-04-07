import React from "react";
import { X, Users, Globe, GraduationCap, Tag, ToggleLeft, ToggleRight, AlertCircle } from "lucide-react";
import { useCreateRoom } from "../hooks/useCreateRoom";
import { ROOM_TYPES, LANGUAGE_TYPES, REQUIRED_LEVELS, ROOM_TOPICS } from "../constants";
import type { LanguageType, RequiredLevel, RoomType } from "../types";

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ isOpen, onClose, onCreated }) => {
  const { form, errors, isSubmitting, updateField, toggleTopic, handleSubmit, resetForm } = useCreateRoom(
    () => {
      onCreated();
      onClose();
    },
  );

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Create New Room</h2>
          <button onClick={handleClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* General error */}
          {errors.general && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle size={16} />
              {errors.general}
            </div>
          )}

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

          {/* Room Type */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
              <Users size={14} /> Room Type
            </label>
            <div className="flex gap-2">
              {ROOM_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => updateField("roomType", t.value as RoomType)}
                  className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border transition-all duration-200 ${form.roomType === t.value
                    ? "bg-primary/10 border-primary/30 text-primary shadow-sm"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
              <Globe size={14} /> Language
            </label>
            <div className="flex gap-2">
              {LANGUAGE_TYPES.map((l) => (
                <button
                  key={l.value}
                  onClick={() => updateField("languageType", l.value as LanguageType)}
                  className={`flex-1 px-3 py-2.5 text-sm font-medium rounded-lg border transition-all duration-200 ${form.languageType === l.value
                    ? "bg-primary/10 border-primary/30 text-primary shadow-sm"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  {l.flag} {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Level */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
              <GraduationCap size={14} /> Required Level
            </label>
            <select
              value={form.requiredLevel}
              onChange={(e) => updateField("requiredLevel", e.target.value as RequiredLevel)}
              className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all appearance-none"
            >
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
            </select>
          </div>

          {/* Topics */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
              <Tag size={14} /> Topics
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ROOM_TOPICS.map((t) => {
                const active = form.topics.includes(t.value);
                return (
                  <button
                    key={t.value}
                    onClick={() => toggleTopic(t.value)}
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
            {form.topics.length > 0 && (
              <p className="text-[11px] text-gray-400 mt-1">{form.topics.length} selected</p>
            )}
          </div>

          {/* Description */}
          {/* <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Description</label>
            <textarea
              placeholder="What will participants talk about?"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all resize-none"
            />
          </div> */}

          {/* Persistent toggle */}
          <div className="flex items-center justify-between p-3 bg-sky-50/70 rounded-lg border border-sky-100">
            <div>
              <p className="text-sm font-medium text-gray-800">Persistent Room</p>
              <p className="text-xs text-gray-500 mt-0.5">No expiration — room stays active indefinitely</p>
            </div>
            <button
              onClick={() => updateField("isPersistent", !form.isPersistent)}
              className="text-primary transition-colors"
            >
              {form.isPersistent ? <ToggleRight size={28} /> : <ToggleLeft size={28} className="text-gray-400" />}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating…" : "Create Room"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRoomModal;
