import React, { useState } from "react";
import { Calendar, Pencil, Trash2, Trophy, Hash } from "lucide-react";
import type { ChallengeDto } from "../types";
import { formatDateLong } from "../../../lib/utils";

interface ChallengeCardProps {
  challenge: ChallengeDto;
  onEdit: (challenge: ChallengeDto) => void;
  onDelete: (challenge: ChallengeDto) => void;
  status: "Active" | "Upcoming" | "Completed";
}

const STATUS_BADGE_STYLE: Record<"Active" | "Upcoming" | "Completed", { wrapper: string; indicator: string }> = {
  Active: {
    wrapper: "bg-emerald-50 text-emerald-700 border-emerald-200",
    indicator: "bg-emerald-500 animate-[pulse_1.5s_infinite]"
  },
  Upcoming: {
    wrapper: "bg-blue-50 text-blue-700 border-blue-200",
    indicator: "bg-blue-500"
  },
  Completed: {
    wrapper: "bg-gray-100 text-gray-700 border-gray-200",
    indicator: "bg-gray-400"
  }
};

const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  onEdit,
  onDelete,
  status
}) => {
  const [imageError, setImageError] = useState(false);
  const styles = STATUS_BADGE_STYLE[status];

  // Helper to format Date nicely
  const renderDateRange = () => {
    return (
      <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
        <Calendar className="w-3.5 h-3.5 text-gray-400" />
        <span>{formatDateLong(challenge.startDate)}</span>
        <span className="text-gray-300">→</span>
        <span>{formatDateLong(challenge.endDate)}</span>
      </span>
    );
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl border border-gray-100 transition-all duration-300 overflow-hidden hover:shadow-lg hover:-translate-y-1">
      {/* Banner / Poster Image Container */}
      <div className="relative aspect-[16/9] w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 overflow-hidden">

        {/* Dynamic Status Badge overlay */}
        <div className="absolute top-3 right-3 z-10">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${styles.wrapper}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${styles.indicator}`} />
            {status}
          </span>
        </div>

        {/* Challenge Banner Image */}
        {challenge.bannerUrl && !imageError ? (
          <img
            src={challenge.bannerUrl}
            alt={challenge.name || "Challenge Banner"}
            loading="lazy"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center select-none bg-gradient-to-tr from-primary/10 via-primary/5 to-transparent text-primary/80">
            <Trophy className="w-10 h-10 stroke-[1.5] mb-2 animate-bounce" />
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Challenge Banner</span>
          </div>
        )}

        {/* Gradient Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Title overlay on bottom inside banner */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <div className="flex items-center gap-1 text-[11px] font-bold text-primary bg-white/10 backdrop-blur-md px-2 py-0.5 rounded-md w-fit mb-1 border border-white/10 uppercase tracking-wide">
            <Hash className="w-3 h-3 shrink-0 text-primary" />
            {challenge.hashtag?.replace("#", "") || "challenge"}
          </div>
          <h3 className="text-base font-bold leading-tight line-clamp-1 drop-shadow-sm">
            {challenge.name || "Untitled Challenge"}
          </h3>
        </div>
      </div>

      {/* Info Card Content */}
      <div className="flex flex-col flex-1 p-4 space-y-4 justify-between">

        {/* Description body */}
        <div className="space-y-1.5">
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
            {challenge.description || "No description provided for this dynamic community challenge."}
          </p>
        </div>

        {/* Footer date-range and action triggers */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-50 mt-auto">
          {renderDateRange()}

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onEdit(challenge)}
              aria-label={`Edit challenge ${challenge.name}`}
              className="p-2 rounded-lg bg-gray-50 text-gray-600 border border-gray-100 hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all duration-200"
            >
              <Pencil className="w-4 h-4" />
            </button>

            <button
              onClick={() => onDelete(challenge)}
              aria-label={`Delete challenge ${challenge.name}`}
              className="p-2 rounded-lg bg-gray-50 text-gray-600 border border-gray-100 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default React.memo(ChallengeCard);
