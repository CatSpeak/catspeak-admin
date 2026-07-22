import React, { useRef, useState } from "react";
import {
  X,
  Users,
  Globe,
  GraduationCap,
  Tag,
  Shield,
  Lock,
  ImagePlus,
  Eye,
  EyeOff,
} from "lucide-react";
import { useCreateRoom } from "../hooks/useCreateRoom";
import {
  ROOM_TYPES,
  LANGUAGE_TYPES,
  REQUIRED_LEVELS,
  ROOM_TOPICS,
} from "../constants";
import type {
  LanguageType,
  RequiredLevel,
  RoomPrivacy,
  RoomTopic,
  RoomType,
} from "../types";
import { useLanguage } from "../../../stores/languageStore";

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

// const PRIVACY_OPTIONS: { value: RoomPrivacy; label: string; desc: string }[] = [
//   { value: "Public", label: "Public", desc: "Anyone can join freely" },
//   { value: "Private", label: "Private", desc: "Password required to join" },
// ];

const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const { form, errors, isSubmitting, updateField, handleSubmit, resetForm } =
    useCreateRoom(() => {
      onCreated();
      onClose();
    });
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    updateField("thumbnail", file);
  };

  if (!isOpen) return null;

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
          <h2 className="text-lg font-bold text-gray-900">
            {t.room.createRoom}
          </h2>
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

          {/* Room Type */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
              <Users size={14} /> {t.room.roomType}
            </label>
            <div className="flex gap-2">
              {ROOM_TYPES.map((tItem) => (
                <button
                  key={tItem.value}
                  onClick={() =>
                    updateField("roomType", tItem.value as RoomType)
                  }
                  className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border transition-all duration-200 cursor-pointer ${
                    form.roomType === tItem.value
                      ? "bg-primary/10 border-primary/30 text-primary shadow-sm"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {tItem.value === "OneToOne"
                    ? t.room.oneToOneRooms
                    : t.room.groupRooms}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
              <Globe size={14} /> {t.room.language}
            </label>
            <div className="flex gap-2">
              {LANGUAGE_TYPES.map((l) => (
                <button
                  key={l.value}
                  onClick={() =>
                    updateField("languageType", l.value as LanguageType)
                  }
                  className={`flex-1 px-3 py-2.5 text-sm font-medium rounded-lg border transition-all duration-200 cursor-pointer ${
                    form.languageType === l.value
                      ? "bg-primary/10 border-primary/30 text-primary shadow-sm"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <img
                    src={l.flag}
                    alt={l.label}
                    className="w-4 h-4 rounded-sm inline-block align-text-bottom"
                  />{" "}
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Level */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
              <GraduationCap size={14} />
              {t.room.level}
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
              <optgroup label="HSK Levels">
                {REQUIRED_LEVELS.filter((l) => l.group === "HSK").map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="CEFR Levels">
                {REQUIRED_LEVELS.filter((l) => l.group === "CEFR").map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Other Levels">
                {REQUIRED_LEVELS.filter((l) => l.group === "Other").map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Topic (single select) */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
              <Tag size={14} /> {t.room.topic}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ROOM_TOPICS.map((tItem) => {
                const active = form.topic === tItem.value;
                return (
                  <button
                    key={tItem.value}
                    onClick={() =>
                      updateField(
                        "topic",
                        active ? "" : (tItem.value as RoomTopic),
                      )
                    }
                    className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium border transition-all duration-200 cursor-pointer ${
                      active
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {tItem.label}
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

          {/* Password (shown only when Private) */}
          {form.privacy === "Private" && (
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                <Lock size={14} /> {t.room.roomPassword}{" "}
                <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={t.room.enterRoomPassword}
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

          {/* Thumbnail */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
              <ImagePlus size={14} /> {t.room.thumbnail}
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
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500 hover:border-primary/40 hover:text-primary/70 transition-colors cursor-pointer"
            >
              {form.thumbnail ? (
                <span className="truncate max-w-[280px]">
                  📎 {form.thumbnail.name}
                </span>
              ) : (
                <>
                  <ImagePlus size={16} />
                  {t.room.clickToUploadImage}
                </>
              )}
            </button>
            {form.thumbnail && (
              <button
                onClick={() => {
                  updateField("thumbnail", null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="text-xs text-red-400 hover:text-red-500 mt-1 transition-colors cursor-pointer"
              >
                {t.room.removeFile}
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            {t.common.cancel}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? t.common.loading : t.room.createRoom}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRoomModal;
