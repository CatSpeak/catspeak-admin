import React, { useRef } from "react";
import { X, Users, Globe, GraduationCap, Tag, Shield, Lock, ImagePlus, AlertCircle } from "lucide-react";
import { useCreateRoom } from "../hooks/useCreateRoom";
import { ROOM_TYPES, LANGUAGE_TYPES, REQUIRED_LEVELS, ROOM_TOPICS } from "../constants";
import type { LanguageType, RequiredLevel, RoomPrivacy, RoomTopic, RoomType } from "../types";

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const PRIVACY_OPTIONS: { value: RoomPrivacy; label: string; desc: string }[] = [
  { value: "Public", label: "Public", desc: "Anyone can join freely" },
  { value: "Private", label: "Private", desc: "Password required to join" },
];

const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ isOpen, onClose, onCreated }) => {
  const { form, errors, isSubmitting, updateField, handleSubmit, resetForm } = useCreateRoom(
    () => {
      onCreated();
      onClose();
    },
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    updateField("thumbnail", file);
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

          {/* Topic (single select) */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
              <Tag size={14} /> Topic
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ROOM_TOPICS.map((t) => {
                const active = form.topic === t.value;
                return (
                  <button
                    key={t.value}
                    onClick={() => updateField("topic", t.value as RoomTopic)}
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

          {/* Description
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Description</label>
            <textarea
              placeholder="What will participants talk about?"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all resize-none"
            />
          </div> */}

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
                <Lock size={14} /> Room Password <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                placeholder="Enter room password"
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
                className={`w-full px-3 py-2.5 text-sm bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.password ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-primary/30 focus:border-primary/50"
                  }`}
              />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>
          )}

          {/* Thumbnail */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
              <ImagePlus size={14} /> Thumbnail
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500 hover:border-primary/40 hover:text-primary/70 transition-colors"
            >
              {form.thumbnail ? (
                <span className="truncate max-w-[280px]">📎 {form.thumbnail.name}</span>
              ) : (
                <>
                  <ImagePlus size={16} />
                  Click to upload an image
                </>
              )}
            </button>
            {form.thumbnail && (
              <button
                onClick={() => {
                  updateField("thumbnail", null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="text-xs text-red-400 hover:text-red-500 mt-1 transition-colors"
              >
                Remove file
              </button>
            )}
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
