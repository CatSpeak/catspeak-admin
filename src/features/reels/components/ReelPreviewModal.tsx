import React, { useCallback, useEffect, useRef, useState } from "react";
import { X, Play, Pause, Volume2, VolumeX, Eye, Heart, Calendar } from "lucide-react";
import type { ReelDto } from "../types";
import { formatDate } from "../../../lib/utils";

interface ReelPreviewModalProps {
  reel: ReelDto | null;
  onClose: () => void;
}

export default function ReelPreviewModal({ reel, onClose }: ReelPreviewModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Video play state sync handlers
  const handlePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    setIsPlaying((wasPlaying) => {
      if (wasPlaying) {
        video.pause();
      } else {
        video.play().catch((err: unknown) => {
          console.error("Video play failed:", err);
        });
      }

      return !wasPlaying;
    });
  }, []);

  const handleMuteToggle = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    setIsMuted((wasMuted) => {
      video.muted = !wasMuted;
      return !wasMuted;
    });
  }, []);

  // Focus trap on mount & ESC listener
  useEffect(() => {
    if (!reel) return;

    // Save previous active element
    const previouslyActive = document.activeElement as HTMLElement;

    // Focus the close button or modal container
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      // Keyboard trapping
      if (e.key === "Tab" && containerRef.current) {
        const focusable = containerRef.current.querySelectorAll<HTMLElement>(
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

      // Hotkey shortcuts
      if (e.key === " ") {
        e.preventDefault(); // Stop page scrolling
        handlePlayPause();
      } else if (e.key.toLowerCase() === "m") {
        handleMuteToggle();
      } else if (e.key === "ArrowRight" && videoRef.current) {
        videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 5, videoRef.current.duration);
      } else if (e.key === "ArrowLeft" && videoRef.current) {
        videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 5, 0);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      // Restore focus on close
      previouslyActive?.focus();
    };
  }, [reel, onClose, handlePlayPause, handleMuteToggle]);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const time = Number(e.target.value);
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  if (!reel) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-modal-title"
    >
      {/* Backdrop with elegant glassmorphism blur */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-md animate-[fadeIn_200ms_ease-out]"
        onClick={onClose}
      />

      {/* Main Grid Content Block */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[85vh] animate-[scaleIn_250ms_ease-out] z-10">

        {/* Left Side: Video Frame (9:16 aspect ratio bounds) */}
        <div className="relative flex-1 bg-black flex items-center justify-center md:max-w-[420px] aspect-[9/16] md:aspect-auto">
          {reel.videoUrl ? (
            <video
              ref={videoRef}
              src={reel.videoUrl}
              preload="none"
              onClick={handlePlayPause}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              className="w-full h-full object-contain cursor-pointer max-h-[70vh] md:max-h-[85vh]"
              loop
            >
              <track kind="captions" src="" label="English placeholders" default />
            </video>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-8 text-gray-500">
              <span className="text-sm font-semibold">Video currently processing. No player source.</span>
            </div>
          )}

          {/* Simple Control Overlays */}
          {reel.videoUrl && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col gap-2 opacity-100 md:opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
              {/* Timeline Slider */}
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleProgressChange}
                className="w-full h-1.5 rounded-lg appearance-none bg-gray-600 outline-none accent-primary cursor-pointer"
                aria-label="Video timeline progress"
              />

              <div className="flex items-center justify-between text-white text-xs mt-1">
                <div className="flex items-center gap-3">
                  {/* Play button */}
                  <button
                    onClick={handlePlayPause}
                    className="p-1 rounded hover:bg-white/10 transition-colors text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  </button>

                  {/* Mute button */}
                  <button
                    onClick={handleMuteToggle}
                    className="p-1 rounded hover:bg-white/10 transition-colors text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>

                {/* Duration Label */}
                <span>
                  {Math.floor(currentTime / 60)}:
                  {String(Math.floor(currentTime % 60)).padStart(2, "0")} /{" "}
                  {Math.floor(duration / 60)}:
                  {String(Math.floor(duration % 60)).padStart(2, "0")}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Metadata Description Panel */}
        <div className="flex-[1.2] flex flex-col p-6 bg-white overflow-y-auto max-h-[40vh] md:max-h-[85vh]">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <h2 id="preview-modal-title" className="text-xl font-bold text-gray-900 leading-snug">
                {reel.title || "Untitled Reel"}
              </h2>

              <div className="flex items-center gap-3 mt-2">
                <img
                  src={reel.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
                  alt=""
                  className="w-7 h-7 rounded-full object-cover border border-gray-100"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900 leading-none">
                    {reel.nickname || "CatPurr User"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">@{reel.username || "catspeak_user"}</p>
                </div>
              </div>
            </div>

            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all duration-200 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="Close preview modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Description Content */}
          <div className="py-5 space-y-4 flex-1">
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {reel.description || "No description provided for this video reel."}
              </p>
            </div>

            {/* Hashtags */}
            {reel.hashtags && reel.hashtags.length > 0 && (
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tags</h3>
                <div className="flex flex-wrap gap-1.5">
                  {reel.hashtags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2.5 py-0.5 rounded bg-primary/5 text-primary border border-primary/10 font-semibold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Counters & Insights footer */}
          <div className="pt-4 border-t border-gray-100 grid grid-cols-3 gap-4 text-center mt-auto">
            <div className="flex flex-col items-center justify-center p-2 bg-gray-50 rounded-xl">
              <Eye className="w-5 h-5 text-gray-500 mb-1" />
              <span className="text-sm font-bold text-gray-900">{reel.viewCount}</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">Views</span>
            </div>

            <div className="flex flex-col items-center justify-center p-2 bg-gray-50 rounded-xl">
              <Heart className="w-5 h-5 text-red-500 mb-1 fill-current" />
              <span className="text-sm font-bold text-gray-900">{reel.likesCount}</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">Likes</span>
            </div>

            <div className="flex flex-col items-center justify-center p-2 bg-gray-50 rounded-xl">
              <Calendar className="w-5 h-5 text-gray-500 mb-1" />
              <span className="text-[11px] font-bold text-gray-900 leading-tight">
                {formatDate(reel.createdAt)}
              </span>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">Uploaded</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
