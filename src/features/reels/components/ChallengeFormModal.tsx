import React, { useState, useEffect, useRef } from "react";
import { X, Save, Trophy, Calendar, Upload, AlertCircle } from "lucide-react";
import type { ChallengeDto, ChallengeCreateDto } from "../types";
import Button from "../../../components/ui/Button";

interface ChallengeFormModalProps {
  challenge: ChallengeDto | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: ChallengeCreateDto) => Promise<void>;
  isSaving: boolean;
}

interface ChallengeFormValues {
  name: string;
  hashtag: string;
  description: string;
  bannerFile: File | null;
  bannerPreviewUrl: string;
  startDate: string;
  endDate: string;
}

const formatIsoToInput = (isoString?: string | null): string => {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
  } catch {
    return "";
  }
};

function getInitialFormValues(challenge: ChallengeDto | null): ChallengeFormValues {
  if (challenge) {
    return {
      name: challenge.name || "",
      hashtag: challenge.hashtag || "",
      description: challenge.description || "",
      bannerFile: null,
      bannerPreviewUrl: challenge.bannerUrl || "",
      startDate: formatIsoToInput(challenge.startDate),
      endDate: formatIsoToInput(challenge.endDate),
    };
  }

  const now = new Date();
  const start = new Date(now.getTime() + 10 * 60 * 1000);
  const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);

  return {
    name: "",
    hashtag: "",
    description: "",
    bannerFile: null,
    bannerPreviewUrl: "",
    startDate: formatIsoToInput(start.toISOString()),
    endDate: formatIsoToInput(end.toISOString()),
  };
}

export default function ChallengeFormModal({
  challenge,
  isOpen,
  onClose,
  onSave,
  isSaving
}: ChallengeFormModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const initialValues = getInitialFormValues(challenge);

  // Form states
  const [name, setName] = useState(initialValues.name);
  const [hashtag, setHashtag] = useState(initialValues.hashtag);
  const [description, setDescription] = useState(initialValues.description);
  const [bannerFile, setBannerFile] = useState<File | null>(initialValues.bannerFile);
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState(initialValues.bannerPreviewUrl);
  const [startDate, setStartDate] = useState(initialValues.startDate);
  const [endDate, setEndDate] = useState(initialValues.endDate);

  const [localError, setLocalError] = useState<string | null>(null);

  // Focus trap and ESC handler
  useEffect(() => {
    if (!isOpen) return;

    const previouslyActive = document.activeElement as HTMLElement;
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
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

  // Automatic hashtag prepending and space merging on input blur or submit
  const handleHashtagBlur = () => {
    let val = hashtag.trim();
    if (!val) return;
    // Replace all hash symbols and spaces, then prepend exactly one hash symbol to merge into a single hashtag
    val = val.replace(/#/g, "").replace(/\s+/g, "");
    if (val) {
      setHashtag(`#${val}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Form Trim validations
    const trimmedName = name.trim();
    let trimmedHashtag = hashtag.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName) {
      setLocalError("Challenge Name is required.");
      return;
    }

    if (!trimmedHashtag) {
      setLocalError("Hashtag is required.");
      return;
    }

    // Auto-fix hashtag prefix and merge multiple words/hashtags on submit if not already formatted
    trimmedHashtag = trimmedHashtag.replace(/#/g, "").replace(/\s+/g, "");
    if (!trimmedHashtag) {
      setLocalError("A valid hashtag is required.");
      return;
    }
    const finalHashtag = `#${trimmedHashtag}`;

    if (!trimmedDescription) {
      setLocalError("Challenge description is required.");
      return;
    }

    if (!startDate || !endDate) {
      setLocalError("Both Start and End dates are required.");
      return;
    }

    const startMs = new Date(startDate).getTime();
    const endMs = new Date(endDate).getTime();

    if (isNaN(startMs) || isNaN(endMs)) {
      setLocalError("Please enter valid dates.");
      return;
    }

    if (endMs <= startMs) {
      setLocalError("End Date must be strictly after the Start Date.");
      return;
    }

    // Validation passed, fire the mutation!
    try {
      const payload: ChallengeCreateDto = {
        name: trimmedName,
        hashtag: finalHashtag,
        description: trimmedDescription,
        bannerFile: bannerFile || null,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString()
      };

      await onSave(payload);
      onClose();
    } catch (err) {
      // API notifications will handle toast errors; we just set local error for modal
      console.error(err);
      setLocalError("Failed to save challenge. Please check the backend errors.");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Dynamic Glass Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-[fadeIn_200ms_ease-out]"
        onClick={onClose}
      />

      {/* Modal Dialog Panel */}
      <div
        ref={modalRef}
        className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col z-10 overflow-hidden animate-[scaleIn_200ms_ease-out] border border-gray-100 max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5 text-primary stroke-[2]" />
            </div>
            <h2 id="modal-title" className="text-lg font-bold text-gray-900 leading-tight">
              {challenge ? "Edit Challenge" : "Create Challenge"}
            </h2>
          </div>

          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {localError && (
            <div className="flex gap-2 p-3.5 rounded-2xl bg-red-50 text-red-700 text-xs border border-red-100 font-medium animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{localError}</span>
            </div>
          )}

          {/* Grid Layout fields: Name & Hashtag */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Challenge Name */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Challenge Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Cat Dance Fever"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-gray-300 font-medium"
              />
            </div>

            {/* Hashtag */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Hashtag <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={hashtag}
                onChange={(e) => setHashtag(e.target.value)}
                onBlur={handleHashtagBlur}
                placeholder="e.g. #catdance"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-gray-300 font-semibold text-primary accent-primary"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide clean instructions on what users need to capture or perform in their reels to join this community challenge..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none placeholder:text-gray-300"
            />
          </div>

          {/* Banner File Upload */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-gray-400" />
              Banner Image
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setBannerFile(file);
                  if (file) {
                    const url = URL.createObjectURL(file);
                    setBannerPreviewUrl(url);
                  } else {
                    setBannerPreviewUrl("");
                  }
                }}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              />
            </div>
            {bannerPreviewUrl && (
              <div className="mt-2 relative w-full max-w-[200px]">
                <img
                  src={bannerPreviewUrl}
                  alt="Banner preview"
                  className="w-full h-auto rounded-xl border border-gray-200 object-cover max-h-32"
                />
                <button
                  type="button"
                  onClick={() => {
                    setBannerFile(null);
                    setBannerPreviewUrl("");
                  }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] hover:bg-red-600 transition-colors shadow-sm"
                >
                  ✕
                </button>
              </div>
            )}
            <p className="text-[10px] text-gray-400">
              Upload a banner image (JPG, PNG, or WebP) for the challenge poster. If left blank, a default illustration will be used.
            </p>
          </div>

          {/* Dates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-50">
            {/* Start Date */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold"
              />
            </div>

            {/* End Date */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold"
              />
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 bg-gray-50 border-t border-gray-100 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={isSaving}
            disabled={isSaving}
            className="shadow-sm font-semibold"
          >
            <Save className="w-4 h-4 mr-2" />
            {challenge ? "Save Changes" : "Create Challenge"}
          </Button>
        </div>
      </div>
    </div>
  );
}
