import type { ReelDto, ReelPrivacy } from "../types";
import { formatDate } from "../../../lib/utils";
import { Film, Link2 } from "lucide-react";
import Badge from "../../../components/ui/Badge";

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
      return (
        videoUrl.substring(lastSlash + 1) || `video_${reelId || "temp"}.mp4`
      );
    }
    return `video_${reelId || "temp"}.mp4`;
  }
}

export default function ReelTable({
  reels,
  loading,
  selectedIds,
  onSelect,
  onSelectAll,
  onRowClick,
}: ReelTableProps) {
  const allSelected =
    reels.length > 0 && reels.every((r) => selectedIds.includes(r.reelId));

  const handleSelectAllChange = () => {
    onSelectAll(reels.map((r) => r.reelId));
  };

  // Skeleton Loader elements matching layout
  const renderSkeletons = () => {
    return (
      <div className="w-full space-y-4 animate-pulse">
        <div className="h-10 w-full bg-gray-150 rounded-xl" />
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="flex items-center space-x-4 py-3 border-b border-gray-100"
          >
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
        <h3 className="text-base font-bold text-gray-900 mb-1">
          No reels found
        </h3>
        <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
          There are no video reels matching your search criteria or status
          filters.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-primary text-white sticky top-0 z-10">
          <tr>
            {/* Multi-selection header checkbox */}
            <th className="px-4 py-3 text-center w-12">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={handleSelectAllChange}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20 cursor-pointer transition-all"
                aria-label="Select all reels"
              />
            </th>
            <th className="px-4 py-3 text-left text-sm font-bold tracking-wider whitespace-nowrap">
              ID
            </th>
            <th className="px-4 py-3 text-left text-sm font-bold tracking-wider whitespace-nowrap">
              Author
            </th>
            <th className="px-4 py-3 text-left text-sm font-bold tracking-wider whitespace-nowrap max-w-xs">
              Description
            </th>
            <th className="px-4 py-3 text-left text-sm font-bold tracking-wider whitespace-nowrap">
              Privacy
            </th>
            <th className="px-4 py-3 text-left text-sm font-bold tracking-wider whitespace-nowrap">
              File Upload
            </th>
            <th className="px-4 py-3 text-left text-sm font-bold tracking-wider whitespace-nowrap">
              Date Uploaded
            </th>
            <th className="px-4 py-3 text-left text-sm font-bold tracking-wider whitespace-nowrap">
              Last Edited
            </th>
            <th className="px-4 py-3 text-left text-sm font-bold tracking-wider whitespace-nowrap">
              Total Reaction
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {reels.map((reel, idx) => {
            const isSelected = selectedIds.includes(reel.reelId);
            const fileName = extractFilename(reel.videoUrl, reel.reelId);
            const lastEditedDate = reel.createdAt;
            const totalReaction = reel.likesCount || 0;

            return (
              <tr
                key={reel.reelId}
                onClick={() => onRowClick(reel)}
                className={`hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer ${
                  idx % 2 === 0 ? "bg-gray-50/50" : "bg-white"
                } ${isSelected ? "bg-primary/5 hover:bg-primary/10" : ""}`}
              >
                {/* Row Checkbox Selector */}
                <td
                  className="px-4 py-3 text-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onSelect(reel.reelId)}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20 cursor-pointer transition-all"
                    aria-label={`Select reel ${reel.title || "Untitled"}`}
                  />
                </td>

                {/* ID Column */}
                <td className="px-4 py-3 text-sm font-bold text-gray-800 tabular-nums">
                  {String(reel.reelId).padStart(2, "0")}
                </td>

                {/* Author Column */}
                <td className="px-4 py-3 text-sm font-semibold text-gray-700">
                  {reel.username || "admin"}
                </td>

                {/* Description Column */}
                <td className="px-4 py-3 text-sm text-gray-700 max-w-xs">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-gray-900 font-medium truncate">
                      {reel.title || "Untitled Reel"}
                    </p>
                    {reel.description ? (
                      <p className="text-gray-400 text-xs truncate leading-relaxed">
                        {reel.description}
                      </p>
                    ) : (
                      <p className="text-gray-300 italic text-xs">
                        No description.
                      </p>
                    )}
                  </div>
                </td>

                {/* Privacy Badge Column */}
                <td className="px-4 py-3 text-sm text-gray-700">
                  {(() => {
                    switch (reel.privacy) {
                      case "Public":
                        return <Badge title="Public" type="Green" />;
                      case "FriendsOnly":
                        return <Badge title="Friends Only" type="Blue" />;
                      case "Private":
                        return <Badge title="Private" type="Gray" />;
                      default:
                        return (
                          <Badge
                            title={reel.privacy || "Unknown"}
                            type="Gray"
                          />
                        );
                    }
                  })()}
                </td>

                {/* File Upload link Column */}
                <td className="px-4 py-3 text-sm font-medium text-blue-600 hover:underline">
                  <div className="flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5 text-blue-500 opacity-70" />
                    <span>{fileName}</span>
                  </div>
                </td>

                {/* Date Uploaded Column */}
                <td className="px-4 py-3 text-sm text-gray-500 tabular-nums">
                  {formatDate(reel.createdAt)}
                </td>

                {/* Last Edited Column */}
                <td className="px-4 py-3 text-sm text-gray-500 tabular-nums">
                  {formatDate(lastEditedDate)}
                </td>

                {/* Total Reaction Column */}
                <td className="px-4 py-3 text-sm font-bold text-gray-700 tabular-nums">
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
