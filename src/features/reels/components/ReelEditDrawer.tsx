import React, { useState, useEffect, useRef } from "react";
import { X, Save, Edit3, Tag, Calendar, Globe, Trash2, Plus } from "lucide-react";
import type { ReelDto, ReelPrivacy, UpdateReelMetadataPayload } from "../types";
import { ALLOWED_IMAGE_TYPES } from "../constants";
import Button from "../../../components/ui/Button";

interface ReelEditDrawerProps {
  reel: ReelDto | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (reelId: number, payload: UpdateReelMetadataPayload) => Promise<void>;
  isUpdating: boolean;
}

interface ReelEditFormValues {
  title: string;
  description: string;
  privacy: ReelPrivacy;
  tags: string[];
  coverUrl: string;
  isScheduled: boolean;
  scheduledDate: string;
  scheduledTime: string;
}

function getInitialFormValues(reel: ReelDto | null): ReelEditFormValues {
  if (!reel) {
    return {
      title: "",
      description: "",
      privacy: "Public",
      tags: [],
      coverUrl: "",
      isScheduled: false,
      scheduledDate: "",
      scheduledTime: "",
    };
  }

  const scheduledDate = reel.scheduledAt
    ? new Date(reel.scheduledAt).toISOString().split("T")[0]
    : "";
  const scheduledTime = reel.scheduledAt
    ? new Date(reel.scheduledAt).toTimeString().split(" ")[0].substring(0, 5)
    : "";

  return {
    title: reel.title || "",
    description: reel.description || "",
    privacy: reel.privacy || "Public",
    tags: reel.hashtags || [],
    coverUrl: reel.coverUrl || "",
    isScheduled: Boolean(reel.scheduledAt),
    scheduledDate,
    scheduledTime,
  };
}

export default function ReelEditDrawer({
  reel,
  isOpen,
  onClose,
  onSave,
  isUpdating,
}: ReelEditDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const initialValues = getInitialFormValues(reel);

  // Form states
  const [title, setTitle] = useState(initialValues.title);
  const [description, setDescription] = useState(initialValues.description);
  const [privacy, setPrivacy] = useState<ReelPrivacy>(initialValues.privacy);
  const [tags, setTags] = useState<string[]>(initialValues.tags);
  const [newTag, setNewTag] = useState("");
  const [coverUrl, setCoverUrl] = useState(initialValues.coverUrl);
  const [isScheduled, setIsScheduled] = useState(initialValues.isScheduled);
  const [scheduledDate, setScheduledDate] = useState(initialValues.scheduledDate);
  const [scheduledTime, setScheduledTime] = useState(initialValues.scheduledTime);

  const [localError, setLocalError] = useState<string | null>(null);

  // Focus trap & ESC close
  useEffect(() => {
    if (!isOpen) return;

    const previouslyActive = document.activeElement as HTMLElement;
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "Tab" && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      previouslyActive?.focus();
    };
  }, [isOpen, onClose]);

  // Tag chip handlers
  const handleAddTag = () => {
    const trimmed = newTag.trim().toLowerCase().replace(/#/g, "");
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setLocalError("Invalid cover image type. Choose JPG, PNG, or WebP.");
        return;
      }
      setCoverUrl(URL.createObjectURL(file));
      setLocalError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !reel) return;

    let scheduledAtStr: string | null = null;
    if (isScheduled && scheduledDate) {
      const timeStr = scheduledTime || "00:00";
      scheduledAtStr = new Date(`${scheduledDate}T${timeStr}`).toISOString();
    }

    const payload: UpdateReelMetadataPayload = {
      title,
      description,
      privacy,
      tags,
      coverUrl,
      scheduledAt: scheduledAtStr,
    };

    await onSave(reel.reelId, payload);
    onClose();
  };

  if (!isOpen || !reel) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-sm animate-[fadeIn_150ms_ease-out]"
        onClick={onClose}
      />

      {/* Drawer Body Panel */}
      <div
        ref={drawerRef}
        className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-[slideIn_250ms_ease-out]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-primary" />
            <h2 id="drawer-title" className="text-base font-bold text-gray-900">
              Edit Reel Metadata
            </h2>
          </div>

          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close edit drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">

          {localError && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-150 animate-fadeIn">
              {localError}
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Reel Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value.substring(0, 80))}
              placeholder="Reel Title"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <span className="block text-[10px] text-gray-400 text-right">
              {title.length}/80 characters
            </span>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description details..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            />
          </div>

          {/* Hashtags chip creator */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              Tags
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="p-2 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 text-gray-700 transition-colors"
                aria-label="Add tag chip"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Chips Container */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold bg-primary/5 text-primary border border-primary/10 rounded-full px-2.5 py-0.5"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:bg-primary/10 rounded-full p-0.5 transition-colors shrink-0"
                    aria-label={`Remove tag ${tag}`}
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
              {tags.length === 0 && (
                <span className="text-xs text-gray-400 italic">No tags added.</span>
              )}
            </div>
          </div>

          {/* Cover thumbnail frame selection */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Thumbnail Cover Image
            </label>
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-16 h-28 bg-gray-800 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                {coverUrl ? (
                  <img src={coverUrl} alt="Thumbnail cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500 font-semibold text-center p-1">
                    No Cover
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <input
                  ref={coverInputRef}
                  type="file"
                  accept={ALLOWED_IMAGE_TYPES.join(",")}
                  onChange={handleCoverUpload}
                  className="hidden"
                  aria-label="Change cover image file input"
                />
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-150 transition-colors w-full"
                >
                  Change Cover
                </button>
                {coverUrl && (
                  <button
                    type="button"
                    onClick={() => setCoverUrl("")}
                    className="text-[10px] text-red-500 hover:text-red-700 font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Reset cover image
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Privacy & Scheduling */}
          <div className="space-y-4 pt-4 border-t border-gray-150">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" />
                Visibility Setting
              </label>
              <select
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value as ReelPrivacy)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
              >
                <option value="Public">Public (Published)</option>
                <option value="Private">Private (Draft)</option>
                <option value="FriendsOnly">Friends Only</option>
              </select>
            </div>

            {/* Scheduled Release toggle checkbox */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isScheduled}
                  onChange={(e) => setIsScheduled(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                />
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Schedule publish release
                </span>
              </label>

              {isScheduled && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 border border-gray-100 rounded-2xl animate-[fadeIn_150ms_ease-out]">
                  <div>
                    <label className="block text-[10px] text-gray-500 font-semibold uppercase mb-1">Date</label>
                    <input
                      type="date"
                      required={isScheduled}
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 font-semibold uppercase mb-1">Time</label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

        </form>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 bg-gray-50 border-t border-gray-100 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={isUpdating}
            disabled={!title.trim() || isUpdating}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>

      </div>
    </div>
  );
}
