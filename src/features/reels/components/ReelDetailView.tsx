import React, { useMemo, useState, useRef } from "react";
import {
  ArrowLeft,
  Trash2,
  ShieldAlert,
  FileVideo,
  Globe,
  Calendar,
  Trophy,
  Eye,
  Heart,
  MessageSquare,
  Video,
  X,
} from "lucide-react";
import type { ReelDto, ReelPrivacy, ChallengeDto } from "../types";
import { formatDate, formatDateLong } from "../../../lib/utils";
import Button from "../../../components/ui/Button";
import { useLanguage } from "../../../stores/languageStore";

interface ReelDetailViewProps {
  reel: ReelDto;
  challenges: ChallengeDto[]; // Pass list of all challenges to do dynamic matching
  onBack: () => void;
  onDelete: (reel: ReelDto) => void;
  onStatusUpdate: (
    reelId: number,
    status: "Warned" | "Blocked" | "Public" | "Private",
    blockReason: string,
  ) => Promise<void>;
  isUpdating: boolean;
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

// Highlights hashtags and mentions in text
function highlightText(text: string) {
  if (!text) return "";
  const parts = text.split(/(\s+)/);
  return parts.map((part, index) => {
    if (part.startsWith("#")) {
      return (
        <span
          key={index}
          className="text-primary font-semibold hover:underline cursor-pointer"
        >
          {part}
        </span>
      );
    }
    if (part.startsWith("@")) {
      return (
        <span
          key={index}
          className="text-blue-500 font-semibold hover:underline cursor-pointer"
        >
          {part}
        </span>
      );
    }
    return part;
  });
}

const PRIVACY_COLORS: Record<ReelPrivacy, string> = {
  Public: "text-emerald-700 bg-emerald-50 border-emerald-100",
  Private: "text-red-700 bg-red-50 border-red-100",
};

export default function ReelDetailView({
  reel,
  challenges,
  onBack,
  onDelete,
  onStatusUpdate,
  isUpdating,
}: ReelDetailViewProps) {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [showModerationModal, setShowModerationModal] = useState(false);
  const [modStatus, setModStatus] = useState<
    "Warned" | "Blocked" | "Public" | "Private"
  >(
    reel.status === "Warned"
      ? "Warned"
      : reel.status === "Blocked"
        ? "Blocked"
        : "Warned",
  );
  const [blockReason, setBlockReason] = useState(reel.blockReason || "");
  const [validationError, setValidationError] = useState<string | null>(null);

  const matchedChallenges = useMemo(() => {
    if (!challenges || challenges.length === 0) return [];
    const lowerTitle = (reel.title || "").toLowerCase();
    const lowerDesc = (reel.description || "").toLowerCase();

    return challenges.filter((ch) => {
      const tag = (ch.hashtag || "").replace(/^#/, "").toLowerCase();
      return (
        tag && (lowerTitle.includes(`#${tag}`) || lowerDesc.includes(`#${tag}`))
      );
    });
  }, [reel, challenges]);

  const fileName = extractFilename(reel.videoUrl, reel.reelId);
  const simulatedSize = useMemo(
    () => (((reel.reelId * 17) % 35) + 3.5).toFixed(1),
    [reel.reelId],
  );

  const handleModerationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmedReason = blockReason.trim();
    if ((modStatus === "Warned" || modStatus === "Blocked") && !trimmedReason) {
      setValidationError("Please enter a moderation reason or note.");
      return;
    }

    try {
      await onStatusUpdate(reel.reelId, modStatus, trimmedReason);
      setShowModerationModal(false);
    } catch {
      setValidationError("Failed to update status. Please try again.");
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 hover:bg-gray-50 text-gray-500 hover:text-gray-900 rounded-lg transition-colors border border-gray-200 cursor-pointer"
            title="Back to list"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>
          <div className="text-xs font-semibold text-gray-400 flex items-center gap-1.5 select-none">
            <span>{t.reels.title}</span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-800 font-bold">{t.common.details}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-1 cursor-pointer"
          >
            {t.common.back}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(reel)}
            className="text-red-500 hover:bg-red-50 hover:text-red-600 border-red-200 flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            {t.common.delete}
          </Button>

          {/* Warn / Block button */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setModStatus(
                reel.status === "Warned"
                  ? "Warned"
                  : reel.status === "Blocked"
                    ? "Blocked"
                    : "Warned",
              );
              setBlockReason(reel.blockReason || "");
              setValidationError(null);
              setShowModerationModal(true);
            }}
            className="bg-amber-500 border-transparent hover:bg-amber-600 text-white flex items-center gap-1.5 font-semibold"
          >
            <ShieldAlert className="w-4 h-4" />
            {t.reels.blockReel}
          </Button>
        </div>
      </div>

      {/* ── Dynamic Moderation Callout Box ── */}
      {(reel.status === "Warned" ||
        reel.status === "Blocked" ||
        reel.status === "Failed") && (
        <div
          className={`p-4 rounded-3xl border shadow-sm flex items-start gap-3 animate-fadeIn ${
            reel.status === "Warned"
              ? "bg-amber-50/70 border-amber-100 text-amber-800"
              : "bg-red-50/70 border-red-100 text-red-800"
          }`}
        >
          <ShieldAlert
            className={`w-5.5 h-5.5 shrink-0 mt-0.5 ${
              reel.status === "Warned" ? "text-amber-500" : "text-red-500"
            }`}
          />
          <div className="space-y-1">
            <h4
              className={`text-xs font-bold leading-tight uppercase ${
                reel.status === "Warned" ? "text-amber-900" : "text-red-900"
              }`}
            >
              {reel.status === "Warned"
                ? t.reels.reelFlaggedWarning
                : t.reels.reelBlockedPublicView}
            </h4>
            <p className="text-xs leading-relaxed opacity-95">
              <span className="font-bold text-gray-700">{t.reels.reason}:</span>{" "}
              {reel.blockReason || t.reels.noExplanation}
            </p>
          </div>
        </div>
      )}

      {/* ── Main content grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Modular Detail Cards (2 Columns width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Media file info */}
          <div className="bg-white border border-gray-100/90 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 border border-blue-100">
              <FileVideo className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-gray-900 leading-snug truncate">
                {reel.title || t.reels.untitledReel}
              </h3>
              <p className="text-xs text-gray-500 font-semibold mt-1">
                {fileName}
              </p>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">
                {t.reels.uploaded.replace("{size}", simulatedSize)}
              </p>
            </div>
          </div>

          {/* Card 2: Description Box (Read-Only) */}
          <div className="bg-white border border-gray-100/90 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 select-none">
              {t.common.description}
            </h4>
            <div className="text-sm text-gray-700 leading-relaxed bg-gray-50 border border-gray-100/80 rounded-2xl p-4 whitespace-pre-line font-medium">
              {reel.description ? (
                highlightText(reel.description)
              ) : (
                <span className="text-gray-400 italic">
                  {t.reels.noDescriptionAdded}
                </span>
              )}
              {reel.description && (
                <span className="block text-[9px] text-gray-400 text-right mt-3 select-none">
                  {reel.description.length} {t.reels.characters}
                </span>
              )}
            </div>
          </div>

          {/* Card 3: Privacy Setting (Read-Only) */}
          <div className="bg-white border border-gray-100/90 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 select-none">
              {t.reels.privacySettings}
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-semibold">
                {t.reels.visibility}:
              </span>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                  PRIVACY_COLORS[reel.privacy] || PRIVACY_COLORS.Public
                }`}
              >
                <Globe className="w-3.5 h-3.5 mr-1" />
                {reel.privacy === "Public"
                  ? t.reels.privacyPublic
                  : reel.privacy === "Private"
                    ? t.reels.privacyPrivate
                    : "?"}
              </span>
            </div>
          </div>

          {/* Card 4: Cover Image Thumbnail (Read-Only) */}
          <div className="bg-white border border-gray-100/90 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 select-none">
              {t.reels.coverFrame}
            </h4>
            <div className="w-32 h-48 rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:scale-[1.02] transition-transform duration-350 bg-gray-900">
              {reel.coverUrl ? (
                <img
                  src={reel.coverUrl}
                  alt={reel.title || "Video Cover"}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500 text-[10px] font-bold p-2 text-center">
                  {t.reels.noCoverImage}
                </div>
              )}
            </div>
          </div>

          {/* Card 5: Connected Challenges */}
          <div className="bg-white border border-gray-100/90 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 select-none">
              <Trophy className="w-4 h-4 text-orange-500" />
              {t.reels.connectedChallenges}
            </h4>

            {matchedChallenges.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {matchedChallenges.map((challenge: ChallengeDto) => {
                  const isActive =
                    new Date(challenge.startDate) <= new Date() &&
                    new Date() <= new Date(challenge.endDate);
                  const isCompleted = new Date() > new Date(challenge.endDate);
                  const challengeStatus = isActive
                    ? t.common.active
                    : isCompleted
                      ? t.common.completed
                      : "Upcoming";

                  return (
                    <div
                      key={challenge.challengeId}
                      className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors flex flex-col justify-between"
                    >
                      <div className="space-y-1">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider mb-2 ${
                            challengeStatus === t.common.active ||
                            challengeStatus === "Active"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : isCompleted
                                ? "bg-gray-100 text-gray-600 border-gray-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          {challengeStatus}
                        </span>
                        <h5 className="text-xs font-bold text-gray-900 leading-snug truncate">
                          {challenge.name || "Untitled Challenge"}
                        </h5>
                        <p className="text-[10px] font-bold text-primary">
                          #{challenge.hashtag?.replace("#", "")}
                        </p>
                      </div>
                      <div className="mt-4 pt-2 border-t border-gray-100/80 flex items-center gap-1 text-[9px] text-gray-400 font-semibold">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          {formatDateLong(challenge.startDate)} -{" "}
                          {formatDateLong(challenge.endDate)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center bg-gray-50 border border-gray-100/80 rounded-2xl">
                <p className="text-xs text-gray-400 italic">
                  {t.reels.noConnectedChallenges}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Metadata and Video Preview Cards (1 Column width) */}
        <div className="space-y-6">
          {/* Card 6: Info metadata */}
          <div className="bg-white border border-gray-100/90 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 select-none border-b border-gray-50 pb-2">
              {t.reels.metadata}
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-0.5">
                <span className="text-gray-400 font-semibold">Reel ID</span>
                <span className="font-bold text-gray-800 tabular-nums">
                  {String(reel.reelId).padStart(2, "0")}
                </span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-gray-400 font-semibold">
                  {t.reels.uploadedBy}
                </span>
                <span className="font-semibold text-gray-800">
                  @{reel.username || "admin"}
                </span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-gray-400 font-semibold">
                  {t.news.languageCommunity}
                </span>
                <span className="font-semibold text-gray-800">
                  {reel.languageCommunity || "All"}
                </span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-gray-400 font-semibold">
                  {t.reels.dateUploaded}
                </span>
                <span className="font-semibold text-gray-700 tabular-nums">
                  {formatDate(reel.createdAt)}
                </span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-gray-400 font-semibold">
                  {t.reels.lastEdited}
                </span>
                <span className="font-semibold text-gray-700 tabular-nums">
                  {formatDate(reel.createdAt)}
                </span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-t border-gray-50 pt-3">
                <span className="text-gray-400 font-semibold">
                  {t.news.totalViews}
                </span>
                <span className="font-bold text-gray-800 flex items-center gap-1 tabular-nums">
                  <Eye className="w-3.5 h-3.5 text-gray-400" />
                  {reel.viewCount || 0}
                </span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-gray-400 font-semibold">
                  {t.reels.totalReaction}
                </span>
                <span className="font-bold text-gray-800 flex items-center gap-1 tabular-nums">
                  <Heart className="w-3.5 h-3.5 text-red-500 fill-current" />
                  {reel.likesCount || 0}
                </span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-gray-400 font-semibold">
                  {t.reels.commentsCount}
                </span>
                <span className="font-bold text-gray-800 flex items-center gap-1 tabular-nums">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                  {reel.commentsCount || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Card 7: Video Preview Card */}
          <div className="bg-white border border-gray-100/90 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 select-none">
              {t.reels.preview}
            </h4>
            <div className="relative aspect-[9/16] w-full bg-black rounded-2xl overflow-hidden border border-gray-250/50 shadow-inner flex items-center justify-center">
              {reel.videoUrl ? (
                <video
                  ref={videoRef}
                  src={reel.videoUrl}
                  controls
                  preload="metadata"
                  className="w-full h-full object-contain"
                  poster={reel.coverUrl || undefined}
                >
                  <track kind="captions" src="" label="English captions" />
                </video>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-6 text-gray-500">
                  <Video className="w-8 h-8 text-gray-600 mb-2 animate-pulse" />
                  <span className="text-xs font-semibold">
                    Video currently processing. No player source.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Elegant Moderation Modal Overlay ── */}
      {showModerationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop blur */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn"
            onClick={() => !isUpdating && setShowModerationModal(false)}
          />

          {/* Dialog Container */}
          <form
            onSubmit={handleModerationSubmit}
            className="relative bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-[scaleIn_200ms_ease-out] z-10"
          >
            <div className="flex justify-between items-center pb-2">
              <div className="flex items-center gap-2 text-amber-600">
                <ShieldAlert className="w-5.5 h-5.5" />
                <h3 className="text-base font-bold text-gray-900">
                  {t.reels.moderateVideoReel}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModerationModal(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isUpdating}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {validationError && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-2xl text-[11px] text-red-700 font-semibold animate-fadeIn">
                {validationError}
              </div>
            )}

            {/* Moderation Type select input */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {t.reels.selectActionStatus}
              </label>
              <select
                value={modStatus}
                onChange={(e) => {
                  const nextStatus = e.target.value;
                  if (
                    nextStatus === "Warned" ||
                    nextStatus === "Blocked" ||
                    nextStatus === "Public" ||
                    nextStatus === "Private"
                  ) {
                    setModStatus(nextStatus);
                  }
                  setValidationError(null);
                }}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer font-semibold text-gray-600"
              >
                <option value="Warned">{t.reels.reelFlaggedWarning}</option>
                <option value="Blocked">{t.reels.reelBlockedPublicView}</option>
                <option value="Public">{t.reels.privacyPublic}</option>
                <option value="Private">{t.reels.privacyPrivate}</option>
              </select>
            </div>

            {/* Block Reason Text Area */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {t.reels.reason}{" "}
                {(modStatus === "Warned" || modStatus === "Blocked") && (
                  <span className="text-red-500">*</span>
                )}
              </label>
              <textarea
                rows={4}
                value={blockReason}
                onChange={(e) => {
                  setBlockReason(e.target.value);
                  if (e.target.value.trim()) setValidationError(null);
                }}
                placeholder={
                  modStatus === "Warned" || modStatus === "Blocked"
                    ? "Describe standard violation or reason..."
                    : "Optional unblock or clearance explanation..."
                }
                required={modStatus === "Warned" || modStatus === "Blocked"}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none leading-relaxed"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowModerationModal(false)}
                disabled={isUpdating}
              >
                {t.common.cancel}
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                isLoading={isUpdating}
                disabled={
                  isUpdating ||
                  ((modStatus === "Warned" || modStatus === "Blocked") &&
                    !blockReason.trim())
                }
                className="bg-amber-500 border-transparent hover:bg-amber-600 text-white flex items-center gap-1.5 font-semibold"
              >
                {t.common.submit}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
