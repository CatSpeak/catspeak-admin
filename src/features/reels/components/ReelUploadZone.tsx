import React, { useState, useRef } from "react";
import { Upload, X, FileVideo, Film, AlertCircle } from "lucide-react";
import { MAX_REEL_FILE_SIZE_MB, ALLOWED_VIDEO_TYPES, ALLOWED_IMAGE_TYPES } from "../constants";
import Button from "../../../components/ui/Button";
import type { ReelPrivacy } from "../types";
import { useLanguage } from "../../../stores/languageStore";

interface ReelUploadZoneProps {
  onClose: () => void;
  onUpload: (payload: {
    Title: string;
    Description: string;
    Privacy: ReelPrivacy;
    VideoFile: File;
    CoverFile?: File | null;
    Tags: string[];
  }) => Promise<void>;
  isUploading: boolean;
  uploadProgress: number;
  uploadError: string | null;
}

export default function ReelUploadZone({
  onClose,
  onUpload,
  isUploading,
  uploadProgress,
  uploadError,
}: ReelUploadZoneProps) {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState<ReelPrivacy>("Public");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [tagsInput, setTagsInput] = useState("");

  // UX states
  const [isDragActive, setIsDragActive] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Drag over handler
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  // Drag drop handler
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    setLocalError(null);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      validateAndSetVideo(files[0]);
    }
  };

  // Validate video file type & size
  const validateAndSetVideo = (file: File) => {
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      setLocalError("Invalid file type. Only MP4, MOV, or WEBM format videos are allowed.");
      return;
    }
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > MAX_REEL_FILE_SIZE_MB) {
      setLocalError(`File size exceeds limit (${MAX_REEL_FILE_SIZE_MB}MB).`);
      return;
    }
    setVideoFile(file);
    if (!title) {
      const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
      setTitle(nameWithoutExt);
    }
  };

  // Validate cover file
  const validateAndSetCover = (file: File) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setLocalError("Invalid cover image type. JPG, PNG, or WEBM allowed.");
      return;
    }
    setCoverFile(file);
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalError(null);
    if (e.target.files && e.target.files[0]) {
      validateAndSetVideo(e.target.files[0]);
    }
  };

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalError(null);
    if (e.target.files && e.target.files[0]) {
      validateAndSetCover(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!videoFile) {
      setLocalError("Please select or drop a video file to upload.");
      return;
    }

    if (!title.trim()) {
      setLocalError("Title is required.");
      return;
    }

    const parsedTags = tagsInput
      .split(",")
      .map((t) => t.trim().replace(/^#/, ""))
      .filter((t) => t.length > 0);

    try {
      await onUpload({
        Title: title.trim(),
        Description: description.trim(),
        Privacy: privacy,
        VideoFile: videoFile,
        CoverFile: coverFile,
        Tags: parsedTags,
      });
    } catch {
      // Handled by parent container via uploadError
    }
  };

  const activeError = localError || uploadError;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => !isUploading && onClose()}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-3xl w-full max-w-xl shadow-2xl flex flex-col z-10 overflow-hidden max-h-[90vh] border border-gray-100 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Film className="w-5 h-5 text-primary" />
            {t.reels.uploadReel}
          </h2>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Global Error Banner */}
          {activeError && (
            <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-red-50 text-red-700 text-xs border border-red-100 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{activeError}</span>
            </div>
          )}

          {/* Upload Progress Loader */}
          {isUploading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-bold text-gray-900">Uploading Reel Video...</p>
                <p className="text-xs text-gray-500 font-medium">Please do not close this window</p>
              </div>

              <div className="w-full max-w-md bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="text-xs font-bold text-primary">{uploadProgress}%</span>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Dropzone Container */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-3 ${
                  isDragActive
                    ? "border-primary bg-primary/5 scale-[0.99]"
                    : videoFile
                    ? "border-emerald-300 bg-emerald-50/30"
                    : "border-gray-200 hover:border-primary/50 hover:bg-gray-50/50"
                }`}
              >
                {/* Privacy Mode */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Privacy Visibility
                  </label>
                  <select
                    value={privacy}
                    onChange={(e) => setPrivacy(e.target.value as ReelPrivacy)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer transition-all"
                  >
                    <option value="Public">Public (Publish Immediately)</option>
                    <option value="Private">Private (Draft)</option>
                    <option value="FriendsOnly">Friends Only</option>
                  </select>
                </div>

                {/* Cover File Upload */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Custom Thumbnail Cover
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      ref={coverInputRef}
                      type="file"
                      accept={ALLOWED_IMAGE_TYPES.join(",")}
                      onChange={handleCoverSelect}
                      className="hidden"
                      aria-label="Upload custom thumbnail cover picker"
                    />
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      className="px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 flex-1 transition-all text-left truncate"
                    >
                      {coverFile ? coverFile.name : "Choose JPG, PNG, WebP..."}
                    </button>
                    {coverFile && (
                      <button
                        type="button"
                        onClick={() => setCoverFile(null)}
                        className="p-2.5 rounded-xl border border-red-100 hover:bg-red-50 text-red-500 transition-colors"
                        title="Remove cover thumbnail"
                      >
                        <X className="w-4.5 h-4.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer controls */}
        {!isUploading && (
          <div className="flex items-center justify-end gap-2 px-6 py-4 bg-gray-50 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={!videoFile || !title.trim()}
            >
              Upload Reel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
