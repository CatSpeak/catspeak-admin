import React, { useState, useEffect, useRef } from "react";
import { Play, Eye, Calendar, Pencil, Trash2, ShieldAlert } from "lucide-react";
import type { ReelDto, ReelStatus } from "../types";
import { formatDate } from "../../../lib/utils";

interface ReelCardProps {
  reel: ReelDto;
  isSelected: boolean;
  onSelect: (reelId: number) => void;
  onPreview: (reel: ReelDto) => void;
  onEdit: (reel: ReelDto) => void;
  onDelete: (reel: ReelDto) => void;
  onTogglePublish: (reel: ReelDto) => Promise<void>;
  status: ReelStatus; // Mapped status
}

// ── Utility formatters ──
function formatDuration(seconds?: number): string {
  if (seconds === undefined || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

function formatViews(count?: number): string {
  if (!count) return "0";
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return String(count);
}

const STATUS_BADGE_STYLE: Record<ReelStatus, string> = {
  Published: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Draft: "bg-gray-100 text-gray-700 border-gray-200",
  Processing: "bg-amber-50 text-amber-700 border-amber-200 animate-pulse",
  Failed: "bg-red-50 text-red-700 border-red-200",
};

const ReelCardComponent: React.FC<ReelCardProps> = ({
  reel,
  isSelected,
  onSelect,
  onPreview,
  onEdit,
  onDelete,
  onTogglePublish,
  status,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Fallback IntersectionObserver for older browsers or lazy-loading enhancements
  useEffect(() => {
    if (!cardRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Native loading='lazy' will take care of fetch, observer can do fade-in logic
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "100px" }
    );

    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(reel.reelId);
  };

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (status !== "Processing") {
      onTogglePublish(reel);
    }
  };

  return (
    <div
      ref={cardRef}
      className={`group relative flex flex-col bg-white rounded-2xl border transition-all duration-300 overflow-hidden hover:shadow-lg hover:-translate-y-1 
        ${isSelected ? "border-primary ring-2 ring-primary/20" : "border-gray-100"}`}
    >
      {/* Thumbnail Frame */}
      <div
        className="relative aspect-[9/16] w-full bg-gray-900 cursor-pointer overflow-hidden"
        onClick={() => onPreview(reel)}
      >
        {/* Checkbox Selector overlay */}
        <div
          className="absolute top-3 left-3 z-10 flex items-center justify-center"
          onClick={handleCheckboxClick}
        >
          <input
            type="checkbox"
            checked={isSelected}
            readOnly
            aria-checked={isSelected}
            aria-label={`Select reel ${reel.title || "Untitled"}`}
            className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer accent-primary"
          />
        </div>

        {/* Mapped Status Badge overlay */}
        <div className="absolute top-3 right-3 z-10">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_BADGE_STYLE[status]}`}
          >
            {status}
          </span>
        </div>

        {/* Video Thumbnail Image */}
        {reel.coverUrl && !imageError ? (
          <img
            src={reel.coverUrl}
            alt={reel.title || "Video Cover"}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover transition-opacity duration-500 
              ${imageLoaded ? "opacity-100" : "opacity-0"}`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-gray-500 p-4 text-center">
            <span className="text-sm font-semibold text-gray-400">No Frame Preview</span>
          </div>
        )}

        {/* Duration Overlay */}
        <div className="absolute bottom-3 right-3 bg-black/70 px-2 py-0.5 rounded text-[11px] font-semibold text-white tracking-wider">
          {formatDuration(reel.duration)}
        </div>

        {/* Play Action Hover overlay */}
        <div className="absolute inset-0 bg-black/35 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 rounded-full bg-primary/90 text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>
      </div>

      {/* Info Card Content */}
      <div className="flex flex-col flex-1 p-4 space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            {/* Reel Title */}
            <h3
              onClick={() => onPreview(reel)}
              className="text-sm font-bold text-gray-900 line-clamp-1 hover:text-primary cursor-pointer leading-snug flex-1"
            >
              {reel.title || "Untitled Reel"}
            </h3>

            {/* View counter */}
            <div className="flex items-center text-xs text-gray-500 shrink-0 gap-1">
              <Eye className="w-3.5 h-3.5" />
              <span>{formatViews(reel.viewCount)}</span>
            </div>
          </div>

          {/* Description */}
          {reel.description ? (
            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
              {reel.description}
            </p>
          ) : (
            <p className="text-xs text-gray-400 italic">No description added.</p>
          )}
        </div>

        {/* Tags */}
        {reel.hashtags && reel.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {reel.hashtags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] bg-primary/5 text-primary border border-primary/10 rounded px-1.5 py-0.5 font-medium"
              >
                {tag}
              </span>
            ))}
            {reel.hashtags.length > 3 && (
              <span className="text-[10px] text-gray-400 font-medium px-1">
                +{reel.hashtags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Date and Moderation Issue */}
        <div className="flex flex-col space-y-1 border-t border-gray-50 pt-2.5 mt-auto">
          <div className="flex items-center justify-between text-[11px] text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(reel.createdAt)}
            </span>
            <span className="font-semibold text-gray-500">@{reel.username || "catspeak"}</span>
          </div>

          {/* Block Reason Warning */}
          {reel.blockReason && status === "Failed" && (
            <div className="flex items-start gap-1 p-2 bg-red-50 text-[10px] text-red-700 rounded-lg mt-2 border border-red-150 leading-relaxed">
              <ShieldAlert className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
              <span>{reel.blockReason}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action footer */}
      <div className="flex border-t border-gray-100 bg-gray-50/50 p-2 items-center justify-between gap-1">
        {/* Toggle Publish button */}
        <button
          onClick={handleToggleClick}
          disabled={status === "Processing"}
          className={`text-xs px-3 py-1.5 font-semibold rounded-lg flex-1 border transition-colors flex items-center justify-center gap-1.5
            ${status === "Published"
              ? "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
              : "bg-primary text-white border-transparent hover:bg-primary-dark disabled:opacity-50"
            }`}
        >
          {status === "Published" ? "Unpublish" : "Publish"}
        </button>

        {/* Edit Action */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(reel);
          }}
          className="p-1.5 hover:bg-gray-100 text-gray-500 hover:text-primary rounded-lg transition-colors border border-transparent hover:border-gray-200"
          title="Edit Metadata"
          aria-label="Edit Reel Metadata"
        >
          <Pencil className="w-4 h-4" />
        </button>

        {/* Delete Action */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(reel);
          }}
          className="p-1.5 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-lg transition-colors border border-transparent hover:border-red-100"
          title="Delete Reel"
          aria-label="Delete Reel"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export const ReelCard = React.memo(ReelCardComponent);
