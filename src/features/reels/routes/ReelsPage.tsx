import { useState } from "react";
import {
  Plus,
  Film,
  Trophy,
  Search,
  ArrowUpFromLine,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ErrorBoundary from "../components/ErrorBoundary";
import ReelTable from "../components/ReelTable";
import ReelDetailView from "../components/ReelDetailView";
import ReelUploadZone from "../components/ReelUploadZone";
import ReelBulkActionBar from "../components/ReelBulkActionBar";
import ChallengeGrid from "../components/ChallengeGrid";
import ChallengeFormModal from "../components/ChallengeFormModal";
import { useReels } from "../hooks/useReels";
import { useManageReels } from "../hooks/useManageReels";
import { useChallenges } from "../hooks/useChallenges";
import type {
  ReelDto,
  ReelStatus,
  ChallengeDto,
  ChallengeCreateDto,
  ChallengeStatusFilter,
} from "../types";
import Button from "../../../components/ui/Button";
import { updateReelStatus } from "../api/updateReelStatus";
import { useToastStore } from "../../../stores/toastStore";
import { PageHeader } from "../../../components/ui/PageHeader";
import Card from "../../../components/ui/Card";
import ReelsAnalyticsCards from "../components/ReelsAnalyticsCards";
import { useLanguage } from "../../../stores/languageStore";

const CHALLENGE_STATUS_FILTERS: ChallengeStatusFilter[] = [
  "All",
  "Active",
  "Upcoming",
  "Completed",
];

const REEL_STATUS_FILTERS: Array<ReelStatus | "All"> = [
  "All",
  "Published",
  "Draft",
  "Processing",
  "Failed",
];

const toChallengeStatusFilter = (value: string): ChallengeStatusFilter =>
  CHALLENGE_STATUS_FILTERS.includes(value as ChallengeStatusFilter)
    ? (value as ChallengeStatusFilter)
    : "All";

const toReelStatusFilter = (value: string): ReelStatus | "All" =>
  REEL_STATUS_FILTERS.includes(value as ReelStatus | "All")
    ? (value as ReelStatus | "All")
    : "All";

function ReelsPageContent() {
  const { t } = useLanguage();
  // Reels hooks
  const reelsHook = useReels();
  const manageHook = useManageReels(reelsHook);

  const {
    reels,
    paginatedReels,
    loading: reelsLoading,
    stats,

    // Filters
    searchState,
    setSearchState,
    statusFilter,
    setStatusFilter,

    // Selection
    selectedIds,
    handleSelectReel,
    handleSelectAll,
    clearSelection,
    getMappedStatus,
    currentPage,
    totalPages,
    handlePageChange,
  } = reelsHook;

  const {
    isUploading,
    uploadProgress,
    uploadError,
    handleUploadReel,

    // Deletion
    deleteTarget,
    isDeleting,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,

    // Bulk actions
    performBulkAction,
  } = manageHook;

  // Challenges hook
  const challengesHook = useChallenges();
  const {
    challenges,
    loading: challengesLoading,
    error: challengesError,
    searchQuery: challengeSearch,
    setSearchQuery: setChallengeSearch,
    statusFilter: challengeStatusFilter,
    setStatusFilter: setChallengeStatusFilter,
    getChallengeStatus,
    handleCreateChallenge,
    handleUpdateChallenge,
    handleDeleteChallenge,
  } = challengesHook;

  // Tabs layout state
  const [activeTab, setActiveTab] = useState<"reels" | "challenges">("reels");

  // Local route visual states (Reels)
  const [selectedReel, setSelectedReel] = useState<ReelDto | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Local route visual states (Challenges)
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<ChallengeDto | null>(
    null,
  );
  const [challengeToDelete, setChallengeToDelete] =
    useState<ChallengeDto | null>(null);
  const [isChallengeSaving, setIsChallengeSaving] = useState(false);

  // Moderation state & operations
  const [isModerating, setIsModerating] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  const handleStatusUpdate = async (
    reelId: number,
    status: "Warned" | "Blocked" | "Public" | "Private",
    blockReason: string,
  ) => {
    setIsModerating(true);
    try {
      await updateReelStatus(reelId, { status, blockReason });
      addToast("success", `Successfully updated reel status to "${status}".`);

      setSelectedReel((prev) => {
        if (!prev || prev.reelId !== reelId) return prev;
        return {
          ...prev,
          status,
          blockReason,
        };
      });

      reelsHook.setReels((prev) =>
        prev.map((r) =>
          r.reelId === reelId
            ? {
                ...r,
                status,
                blockReason,
              }
            : r,
        ),
      );
    } catch (err) {
      console.error("Status update error:", err);
      addToast("error", "Failed to update reel status.");
    } finally {
      setIsModerating(false);
    }
  };

  const handleBulkActionExecute = async (
    action: "publish" | "unpublish" | "delete",
  ) => {
    await performBulkAction(action, selectedIds);
  };

  const handleSaveChallenge = async (payload: ChallengeCreateDto) => {
    setIsChallengeSaving(true);
    try {
      if (editingChallenge) {
        await handleUpdateChallenge(editingChallenge.challengeId, payload);
      } else {
        await handleCreateChallenge(payload);
      }
      setShowChallengeModal(false);
      setEditingChallenge(null);
    } finally {
      setIsChallengeSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-24 md:pb-6">
      {/* Page Header */}
      {activeTab === "reels" ? (
        <PageHeader
          icon={<Film />}
          title={t.reels.title}
          desc={t.reels.desc}
          rightButtons={[
            <Button
              key="upload-reel"
              variant="primary"
              size="sm"
              onClick={() => setShowUploadModal(true)}
            >
              <ArrowUpFromLine className="size-4 mr-1" />
              {t.reels.uploadReel}
            </Button>,
          ]}
        />
      ) : (
        <PageHeader
          icon={<Trophy />}
          title={t.reels.challengesTitle}
          desc={t.reels.challengesDesc}
          rightButtons={[
            <Button
              key="create-challenge"
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingChallenge(null);
                setShowChallengeModal(true);
              }}
            >
              <Plus className="size-4 mr-1" />
              {t.reels.createChallenge}
            </Button>,
          ]}
        />
      )}

      {/* Modern Workspace Navigation Tabs */}
      <div className="flex gap-6 mt-2">
        <button
          onClick={() => setActiveTab("reels")}
          className={`pb-2 font-bold text-sm border-b-2 transition-all flex items-center gap-2 -mb-[2px] cursor-pointer ${
            activeTab === "reels"
              ? "border-primary text-primary"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          <Film className="w-4.5 h-4.5" />
          {t.reels.title}
        </button>
        <button
          onClick={() => setActiveTab("challenges")}
          className={`pb-2 font-bold text-sm border-b-2 transition-all flex items-center gap-2 -mb-[2px] cursor-pointer ${
            activeTab === "challenges"
              ? "border-primary text-primary"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          <Trophy className="w-4.5 h-4.5" />
          {t.reels.challengesTitle}
        </button>
      </div>

      <ReelsAnalyticsCards stats={stats} loading={reelsLoading} />

      {/* Active Tab Panel Views */}
      {activeTab === "reels" ? (
        selectedReel ? (
          <ReelDetailView
            reel={selectedReel}
            challenges={challenges}
            onBack={() => setSelectedReel(null)}
            onDelete={(r) => {
              setSelectedReel(null);
              openDeleteModal(r);
            }}
            onStatusUpdate={handleStatusUpdate}
            isUpdating={isModerating}
          />
        ) : (
          /* Reels Tab Workspace Table List */
          <div className="flex flex-col gap-3 animate-fadeIn">
            {/* Table Filters Header Bar */}
            <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between w-full">
                {/* Search reels input */}
                <div className="relative flex-1 max-w-md w-full">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                  <input
                    type="text"
                    placeholder="Search reels..."
                    value={searchState}
                    onChange={(e) => setSearchState(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 shadow-sm"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  {/* Author Category dropdown */}
                  <div className="relative w-full sm:w-auto">
                    <select
                      className="w-full sm:w-auto appearance-none pl-3 pr-8 py-1.5 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                      defaultValue="CAT SPEAK"
                    >
                      <option value="CAT SPEAK">CatSpeak</option>
                      <option value="ALL CHANNELS">All Channels</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-gray-400">
                      <ChevronDown size={16} />
                    </div>
                  </div>

                  {/* Status dropdown filter */}
                  <div className="relative w-full sm:w-auto">
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(toReelStatusFilter(e.target.value));
                      }}
                      className="w-full sm:w-auto appearance-none pl-3 pr-8 py-1.5 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Published">Published (Public)</option>
                      <option value="Draft">Draft (Private)</option>
                      <option value="Processing">Processing</option>
                      <option value="Failed">Failed / Blocked</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-gray-400">
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ReelTable Component Container */}
            <Card noPadding className="overflow-hidden">
              <ReelTable
                reels={paginatedReels}
                loading={reelsLoading}
                selectedIds={selectedIds}
                onSelect={handleSelectReel}
                onSelectAll={(currentIds) => handleSelectAll(currentIds)}
                onRowClick={setSelectedReel}
                getMappedStatus={getMappedStatus}
              />
            </Card>

            {/* Pagination Bar */}
            {reels.length > 0 && (
              <nav
                aria-label="Reels pagination"
                className="flex flex-col sm:flex-row items-center justify-between px-2 py-4 gap-4"
              >
                {/* Left Side: Status / Total */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 font-normal">
                    Total{" "}
                    <span className="font-semibold text-gray-900">
                      {reels.length}
                    </span>{" "}
                    {reels.length === 1 ? "reel" : "reels"}
                  </span>
                </div>

                {/* Right Side: Nav Control buttons */}
                {totalPages > 1 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      aria-label="Go to previous page"
                      className="p-2 rounded-lg transition-all text-gray-700 hover:bg-gray-50 border border-transparent hover:border-gray-100 disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <span className="text-sm text-gray-600 font-medium px-2">
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      type="button"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      aria-label="Go to next page"
                      className="p-2 rounded-lg transition-all text-gray-700 hover:bg-gray-50 border border-transparent hover:border-gray-100 disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </nav>
            )}
          </div>
        )
      ) : (
        /* Challenges Tab Workspace Grid */
        <div className="flex flex-col gap-3 animate-fadeIn">
          {/* Challenge Filters & Search Header */}
          <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between w-full">
              {/* Search input */}
              <div className="relative flex-1 max-w-md w-full">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  type="text"
                  placeholder="Search hashtag, name or description..."
                  value={challengeSearch}
                  onChange={(e) => setChallengeSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 shadow-sm"
                />
              </div>

              {/* Status dropdown filter */}
              <div className="relative w-full sm:w-auto">
                <select
                  value={challengeStatusFilter}
                  onChange={(e) =>
                    setChallengeStatusFilter(
                      toChallengeStatusFilter(e.target.value),
                    )
                  }
                  className="w-full sm:w-auto appearance-none pl-3 pr-8 py-1.5 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Completed">Completed</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-gray-400">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>
          </div>

          {/* Error warning panel */}
          {challengesError && (
            <Card className="p-4 border border-red-200 bg-red-50/60 rounded-lg text-sm text-red-600 flex items-start gap-2.5">
              <svg
                className="w-5 h-5 shrink-0 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <p className="font-semibold mb-0.5">
                  Failed to retrieve challenges from API
                </p>
                <p className="text-xs opacity-90">{challengesError}</p>
              </div>
            </Card>
          )}

          {/* Grid Container */}
          <Card className="p-4 sm:p-6 min-h-[50vh] flex flex-col justify-start">
            <ChallengeGrid
              challenges={challenges}
              loading={challengesLoading}
              onEdit={(c) => {
                setEditingChallenge(c);
                setShowChallengeModal(true);
              }}
              onDelete={setChallengeToDelete}
              getChallengeStatus={getChallengeStatus}
              onCreateClick={() => {
                setEditingChallenge(null);
                setShowChallengeModal(true);
              }}
            />
          </Card>
        </div>
      )}

      {/* ── Inline Modals & Overlays for Reels ── */}

      {/* Drag & Drop Upload modal overlay */}
      {showUploadModal && (
        <ReelUploadZone
          onClose={() => setShowUploadModal(false)}
          onUpload={handleUploadReel}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          uploadError={uploadError}
        />
      )}

      {/* Reel Delete Confirmation Modal Overlay */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn"
            onClick={closeDeleteModal}
          />
          <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-[scaleIn_200ms_ease-out] z-10 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-gray-900">Delete Reel</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Are you sure you want to permanently delete this video reel?
                This action cannot be undone and will erase all comments and
                insights.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2 w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={confirmDelete}
                isLoading={isDeleting}
                disabled={isDeleting}
                className="flex-1"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Selection Sticky Bulk Actions Bar */}
      {activeTab === "reels" && (
        <ReelBulkActionBar
          selectedCount={selectedIds.length}
          onClear={clearSelection}
          onBulkAction={handleBulkActionExecute}
        />
      )}

      {/* ── Inline Modals & Overlays for Challenges ── */}

      {/* Challenge Form Modal Creator/Editor */}
      {showChallengeModal && (
        <ChallengeFormModal
          key={editingChallenge?.challengeId ?? "new-challenge"}
          challenge={editingChallenge}
          isOpen={showChallengeModal}
          onClose={() => {
            setShowChallengeModal(false);
            setEditingChallenge(null);
          }}
          onSave={handleSaveChallenge}
          isSaving={isChallengeSaving}
        />
      )}

      {/* Challenge Delete Confirmation Modal Overlay */}
      {challengeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn"
            onClick={() => setChallengeToDelete(null)}
          />
          <div className="relative bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-[scaleIn_200ms_ease-out] z-10 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-gray-900">
                Delete Challenge
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Are you sure you want to permanently delete challenge{" "}
                <span className="font-bold text-gray-800">
                  "{challengeToDelete.name}"
                </span>
                ? This will remove the metadata and unlink all connected reels.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2 w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setChallengeToDelete(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={async () => {
                  await handleDeleteChallenge(challengeToDelete.challengeId);
                  setChallengeToDelete(null);
                }}
                className="flex-1"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReelsPage() {
  return (
    <ErrorBoundary>
      <ReelsPageContent />
    </ErrorBoundary>
  );
}
