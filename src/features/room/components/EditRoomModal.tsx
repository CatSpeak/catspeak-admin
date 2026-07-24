import React, { useState } from "react";
import {
  X,
  GraduationCap,
  Tag,
  Shield,
  Lock,
  Pencil,
  Eye,
  EyeOff,
} from "lucide-react";
import { useEditRoom } from "../hooks/useEditRoom";
import { REQUIRED_LEVELS, ROOM_TOPICS } from "../constants";
import type { Room, RequiredLevel, RoomPrivacy, RoomTopic } from "../types";
import { useLanguage } from "../../../stores/languageStore";

interface EditRoomModalProps {
  room: Room | null;
  onClose: () => void;
  onEdited: () => void;
}

// const PRIVACY_OPTIONS: { value: RoomPrivacy; label: string; desc: string }[] = [
//   { value: "Public", label: "Public", desc: "Anyone can join freely" },
//   { value: "Private", label: "Private", desc: "Password required to join" },
// ];

const EditRoomModal: React.FC<EditRoomModalProps> = ({
  room,
  onClose,
  onEdited,
}) => {
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const {
    form,
    errors,
    isSubmitting,
    hasChanges,
    updateField,
    toggleTopic,
    handleSubmit,
    resetForm,
  } = useEditRoom(room, () => {
    onEdited();
    onClose();
  });

  const privacyOptions: { value: RoomPrivacy; label: string; desc: string }[] =
    [
      { value: "Public", label: t.news.publicLabel, desc: t.room.publicDesc },
      {
        value: "Private",
        label: t.news.privateLabel,
        desc: t.room.privateDesc,
      },
    ];

  const handleClose = () => {
    resetForm();
    setShowPassword(false);
    onClose();
  };

  if (!room) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              <Pencil size={16} className="text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {t.room.editRoom}
              </h2>
              <p className="text-xs text-gray-400">ID #{room.roomId}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Name */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
              {t.room.roomName} <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder={t.room.roomNamePlaceholder}
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              className={`w-full px-3 py-2.5 text-sm bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                errors.name
                  ? "border-red-300 focus:ring-red-200"
                  : "border-gray-200 focus:ring-primary/30 focus:border-primary/50"
              }`}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Level */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
              <GraduationCap size={14} /> {t.room.level}
            </label>
            <select
              value={form.requiredLevel}
              onChange={(e) =>
                updateField(
                  "requiredLevel",
                  e.target.value as RequiredLevel | "",
                )
              }
              className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all appearance-none cursor-pointer"
            >
              <option value="">{t.room.selectLevel}</option>
              <optgroup label={t.room.levelGroups?.HSK || "HSK Levels"}>
                {REQUIRED_LEVELS.filter((l) => l.group === "HSK").map((l) => (
                  <option key={l.value} value={l.value}>
                    {t.room.levels?.[l.value as RequiredLevel] || l.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label={t.room.levelGroups?.CEFR || "CEFR Levels"}>
                {REQUIRED_LEVELS.filter((l) => l.group === "CEFR").map((l) => (
                  <option key={l.value} value={l.value}>
                    {t.room.levels?.[l.value as RequiredLevel] || l.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label={t.room.levelGroups?.Other || "Other Levels"}>
                {REQUIRED_LEVELS.filter((l) => l.group === "Other").map((l) => (
                  <option key={l.value} value={l.value}>
                    {t.room.levels?.[l.value as RequiredLevel] || l.label}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Topic */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
              <Tag size={14} /> {t.room.topic}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ROOM_TOPICS.map((top) => {
                const active = form.topics.includes(top.value as RoomTopic);
                return (
                  <button
                    key={top.value}
                    type="button"
                    onClick={() => toggleTopic(top.value as RoomTopic)}
                    className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium border transition-all duration-200 cursor-pointer ${
                      active
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {t.room.topics?.[top.value as RoomTopic] || top.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Privacy */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
              <Shield size={14} /> {t.room.privacy}
            </label>
            <div className="flex gap-2">
              {privacyOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateField("privacy", opt.value)}
                  className={`flex-1 px-4 py-2.5 rounded-lg border transition-all duration-200 text-left cursor-pointer ${
                    form.privacy === opt.value
                      ? "bg-primary/10 border-primary/30 shadow-sm"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <span
                    className={`block text-sm font-medium ${form.privacy === opt.value ? "text-primary" : "text-gray-600"}`}
                  >
                    {opt.label}
                  </span>
                  <span className="block text-[11px] text-gray-400 mt-0.5">
                    {opt.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Password */}
          {form.privacy === "Private" && (
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                <Lock size={14} /> {t.room.roomPassword}
                <span className="text-gray-400 text-xs font-normal">
                  {t.room.leaveBlankToKeepUnchanged}
                </span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={t.room.enterNewPassword}
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  className={`w-full pl-3 pr-10 py-2.5 text-sm bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.password
                      ? "border-red-300 focus:ring-red-200"
                      : "border-gray-200 focus:ring-primary/30 focus:border-primary/50"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password}</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <span className="text-xs text-gray-400">
            {hasChanges ? t.room.unsavedChanges : t.room.noChangesMade}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              {t.common.cancel}
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !hasChanges}
              className="px-5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? t.common.loading : t.common.save}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditRoomModal;
