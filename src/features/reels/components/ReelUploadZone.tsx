import React, { useState, useRef } from "react";
import { Upload, X, FileVideo, Film, AlertCircle } from "lucide-react";
import { MAX_REEL_FILE_SIZE_MB, ALLOWED_VIDEO_TYPES, ALLOWED_IMAGE_TYPES } from "../constants";
import Button from "../../../components/ui/Button";

interface ReelUploadZoneProps {
  onClose: () => void;
  onUpload: (payload: {
    Title: string;
    Description: string;
    Privacy: "Public" | "FriendsOnly" | "Private";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState<"Public" | "FriendsOnly" | "Private">("Public");
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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSetVideo(file);
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalError(null);
    if (e.target.files && e.target.files[0]) {
      validateAndSetVideo(e.target.files[0]);
    }
  };

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setLocalError("Invalid cover image type. Choose JPG, PNG, or WebP.");
        return;
      }
      setCoverFile(file);
    }
  };

  const validateAndSetVideo = (file: File) => {
    // Validate type
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      setLocalError("Unsupported video format. Choose MP4, MOV, WebM, or MKV.");
      return;
    }

    // Validate size
    if (file.size > MAX_REEL_FILE_SIZE_MB * 1024 * 1024) {
      setLocalError(`File size exceeds the limit of ${MAX_REEL_FILE_SIZE_MB}MB.`);
      return;
    }

    setVideoFile(file);
    // Autofill title if empty
    if (!title) {
      const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
      setTitle(nameWithoutExt.substring(0, 50));
    }
  };

  const handleRemoveVideo = () => {
    setVideoFile(null);
    setCoverFile(null);
    setLocalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile) return;

    // Parse tag chips
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0 && !t.startsWith("#"))
      .map((t) => t.replace(/#/g, ""));

    try {
      await onUpload({
        Title: title,
        Description: description,
        Privacy: privacy,
        VideoFile: videoFile,
        CoverFile: coverFile,
        Tags: tags,
      });
      onClose();
    } catch (err) {
      console.error("Submission failed:", err);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => !isUploading && onClose()}
      />

      {/* Upload Panel Container */}
      <div className="relative bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl z-10 max-h-[90vh] flex flex-col animate-[scaleIn_200ms_ease-out]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-primary" />
            <h2 id="upload-modal-title" className="text-lg font-bold text-gray-900">
              Upload Video Reel
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            aria-label="Close upload modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Grid */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Validation Errors banner */}
          {(localError || uploadError) && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-150 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span className="font-semibold">{localError || uploadError}</span>
            </div>
          )}

          {/* Screening Screen Screen Readers Announcements */}
          <div aria-live="polite" className="sr-only">
            {isUploading && `Uploading reel, progress: ${uploadProgress}%`}
            {uploadProgress === 100 && "Upload complete. Processing video."}
          </div>

          {isUploading ? (
            /* Upload Progress state screen */
            <div className="flex flex-col items-center justify-center py-16 space-y-6">
              <div className="relative flex items-center justify-center">
                {/* Simulated circle loader */}
                <div className="w-20 h-20 rounded-full border-4 border-gray-100 flex items-center justify-center">
                  <div
                    className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"
                    style={{ animationDuration: "1.5s" }}
                  />
                  <span className="text-sm font-bold text-gray-700">{uploadProgress}%</span>
                </div>
              </div>

              <div className="text-center space-y-2 max-w-sm">
                <h3 className="text-base font-bold text-gray-900">
                  {uploadProgress < 100 ? "Uploading your reel..." : "Finalizing Upload..."}
                </h3>
                <p className="text-xs text-gray-500">
                  {uploadProgress < 100
                    ? "Transmitting video packages to the server. Please do not close the window."
                    : "Saving metadata and generating frame covers. Almost done!"}
                </p>
              </div>

              {/* Progress bar container */}
              <div className="w-full max-w-md bg-gray-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : !videoFile ? (
            /* Dropzone drag flow */
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 aspect-video
                ${isDragActive
                  ? "border-primary bg-primary/5 scale-[0.99] shadow-inner"
                  : "border-gray-300 hover:border-primary/50 hover:bg-gray-50/50"
                }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_VIDEO_TYPES.join(",")}
                onChange={handleVideoSelect}
                className="hidden"
                aria-label="Upload video file picker"
              />

              <div className="w-14 h-14 rounded-full bg-orange-50 text-primary flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Upload className="w-7 h-7" />
              </div>

              <h3 className="text-sm font-bold text-gray-900 mb-1">
                Drag and drop your video file here
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mb-4 leading-relaxed">
                Supports MP4, MOV, WebM, or MKV. Maximum file size is {MAX_REEL_FILE_SIZE_MB}MB.
              </p>

              <button
                type="button"
                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-lg shadow transition-colors"
              >
                Select File
              </button>
            </div>
          ) : (
            /* Meta Data form screen */
            <div className="space-y-4 animate-[fadeIn_200ms_ease-out]">
              {/* Video Info Preview Box */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <FileVideo className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate">{videoFile.name}</p>
                  <p className="text-[10px] text-gray-400">
                    {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveVideo}
                  className="p-1 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="Remove selected video"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Title input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Reel Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Give your reel an engaging title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value.substring(0, 80))}
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
                  rows={3}
                  placeholder="Tell the audience what this short video is about..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                />
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Hashtags (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="cats, funny, milo, coding"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <p className="text-[10px] text-gray-400">
                  Write tags separated by commas. No need to add '#' prefix.
                </p>
              </div>

              {/* Visibility and Custom Cover Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Privacy Mode */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Privacy Visibility
                  </label>
                  <select
                    value={privacy}
                    onChange={(e) => setPrivacy(e.target.value as any)}
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
