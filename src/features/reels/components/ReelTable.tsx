import type { ReelDto, ReelPrivacy } from "../types";
import { formatDate } from "../../../lib/utils";
import { Film, Link2 } from "lucide-react";

interface ReelTableProps {
  reels: ReelDto[];
  loading: boolean;
  selectedIds: number[];
  onSelect: (reelId: number) => void;
  onSelectAll: (currentIds: number[]) => void;
  onRowClick: (reel: ReelDto) => void;
  getMappedStatus: (reel: ReelDto) => string;
}

// ── Helpers ──
function extractFilename(videoUrl?: string | null, reelId?: number): string {
  if (!videoUrl) return `video_${reelId || "temp"}.mp4`;
  try {
    const url = new URL(videoUrl);
    const pathname = url.pathname;
    const filename = pathname.substring(pathname.lastIndexOf("/") + 1);
    return filename || `video_${reelId || "temp"}.mp4`;
  } catch {
    const lastSlash = videoUrl.lastIndexOf("/");
    if (lastSlash !== -1) {
      return videoUrl.substring(lastSlash + 1) || `video_${reelId || "temp"}.mp4`;
    }
    return `video_${reelId || "temp"}.mp4`;
  }
}

const PRIVACY_BADGE_STYLE: Record<ReelPrivacy, string> = {
  Public: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Private: "bg-red-50 text-red-600 border-red-150",
  FriendsOnly: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function ReelTable({
  reels,
  loading,
  selectedIds,
  onSelect,
  onSelectAll,
  onRowClick,
}: ReelTableProps) {
  const allSelected = reels.length > 0 && reels.every((r) => selectedIds.includes(r.reelId));

  const handleSelectAllChange = () => {
    onSelectAll(reels.map((r) => r.reelId));
  };

  // Skeleton Loader elements matching layout
  const renderSkeletons = () => {
    return (
      <div className="w-full space-y-4 animate-pulse">
        <div className="h-10 w-full bg-gray-150 rounded-xl" />
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="flex items-center space-x-4 py-3 border-b border-gray-100">
            <div className="h-4.5 w-4.5 bg-gray-200 rounded" />
            <div className="h-4 w-10 bg-gray-250 rounded" />
            <div className="h-4 w-20 bg-gray-250 rounded" />
            <div className="h-4 flex-1 bg-gray-200 rounded" />
            <div className="h-6 w-16 bg-gray-200 rounded-full" />
            <div className="h-4 w-28 bg-gray-200 rounded" />
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-4 w-12 bg-gray-250 rounded" />
          </div>
        ))}
      </div>
    );
  };

  if (loading && reels.length === 0) {
    return renderSkeletons();
  }

  if (reels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white border border-gray-100 rounded-3xl min-h-[40vh] text-center mx-auto my-4">
        <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mb-5 text-primary">
          <Film className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-gray-900 mb-1">No reels found</h3>
        <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
          There are no video reels matching your search criteria or status filters.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-gray-100/90 shadow-sm bg-white scrollbar-thin">
      <table className="w-full border-collapse text-left text-xs text-gray-500">
        <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 select-none">
          <tr>
            {/* Multi-selection header checkbox */}
            <th className="py-4 px-4 w-10 text-center">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={handleSelectAllChange}
                className="w-4.5 h-4.5 rounded border-gray-300 text-primary focus:ring-primary accent-primary cursor-pointer transition-all"
                aria-label="Select all reels"
              />
            </th>
            <th className="py-4 px-3 font-semibold text-gray-400">ID</th>
            <th className="py-4 px-3 font-semibold text-gray-400">Author</th>
            <th className="py-4 px-3 font-semibold text-gray-400 max-w-xs">Description</th>
            <th className="py-4 px-3 font-semibold text-gray-400">Privacy</th>
            <th className="py-4 px-3 font-semibold text-gray-400">File Upload</th>
            <th className="py-4 px-3 font-semibold text-gray-400">Date Uploaded</th>
            <th className="py-4 px-3 font-semibold text-gray-400">Last Edited</th>
            <th className="py-4 px-3 font-semibold text-gray-400">Total Reaction</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100/80">
          {reels.map((reel) => {
            const isSelected = selectedIds.includes(reel.reelId);
            const fileName = extractFilename(reel.videoUrl, reel.reelId);

            // Last edited: use createdAt or fallback nicely
            const lastEditedDate = reel.createdAt;

            // Total Reaction representation
            const totalReaction = reel.likesCount || 0;

            return (
              <tr
                key={reel.reelId}
                onClick={() => onRowClick(reel)}
                className={`group hover:bg-gray-50/70 transition-colors duration-150 cursor-pointer 
                  ${isSelected ? "bg-primary/[0.02]" : ""}`}
              >
                {/* Row Checkbox Selector */}
                <td
                  className="py-3.5 px-4 text-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onSelect(reel.reelId)}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary cursor-pointer transition-all"
                    aria-label={`Select reel ${reel.title || "Untitled"}`}
                  />
                </td>

                {/* ID Column */}
                <td className="py-3.5 px-3 font-bold text-gray-800 tabular-nums">
                  {String(reel.reelId).padStart(2, "0")}
                </td>

                {/* Author Column */}
                <td className="py-3.5 px-3 font-semibold text-gray-600">
                  {reel.username || "admin"}
                </td>

                {/* Description Column */}
                <td className="py-3.5 px-3 max-w-xs">
                  <div className="space-y-1">
                    <p className="text-gray-900 font-medium truncate group-hover:text-primary transition-colors">
                      {reel.title || "Untitled Reel"}
                    </p>
                    {reel.description ? (
                      <p className="text-gray-400 text-[11px] truncate leading-relaxed">
                        {reel.description}
                      </p>
                    ) : (
                      <p className="text-gray-300 italic text-[11px]">No description.</p>
                    )}
                  </div>
                </td>

                {/* Privacy Badge Column */}
                <td className="py-3.5 px-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${PRIVACY_BADGE_STYLE[reel.privacy] || PRIVACY_BADGE_STYLE.Public
                      }`}
                  >
                    {reel.privacy || "Public"}
                  </span>
                </td>

                {/* File Upload link Column */}
                <td className="py-3.5 px-3 text-blue-600 font-semibold hover:underline">
                  <div className="flex items-center gap-1">
                    <Link2 className="w-3.5 h-3.5 text-blue-500 opacity-60" />
                    <span>{fileName}</span>
                  </div>
                </td>

                {/* Date Uploaded Column */}
                <td className="py-3.5 px-3 text-gray-400 tabular-nums">
                  {formatDate(reel.createdAt)}
                </td>

                {/* Last Edited Column */}
                <td className="py-3.5 px-3 text-gray-400 tabular-nums">
                  {formatDate(lastEditedDate)}
                </td>

                {/* Total Reaction Column */}
                <td className="py-3.5 px-3 font-bold text-gray-700 tabular-nums">
                  {totalReaction}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
