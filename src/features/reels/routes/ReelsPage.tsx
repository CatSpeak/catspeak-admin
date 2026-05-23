import { useState } from "react";
import { Plus, Film, Trophy, Search } from "lucide-react";
import ErrorBoundary from "../components/ErrorBoundary";
import ReelFilterPanel from "../components/ReelFilterPanel";
import ReelGrid from "../components/ReelGrid";
import ReelPreviewModal from "../components/ReelPreviewModal";
import ReelUploadZone from "../components/ReelUploadZone";
import ReelEditDrawer from "../components/ReelEditDrawer";
import ReelBulkActionBar from "../components/ReelBulkActionBar";
import ChallengeGrid from "../components/ChallengeGrid";
import ChallengeFormModal from "../components/ChallengeFormModal";
import { useReels } from "../hooks/useReels";
import { useManageReels } from "../hooks/useManageReels";
import { useChallenges } from "../hooks/useChallenges";
import type { ReelDto, ChallengeDto } from "../types";
import Button from "../../../components/ui/Button";

function ReelsPageContent() {
  // Reels hooks
  const reelsHook = useReels();
  const manageHook = useManageReels(reelsHook);

  const {
    reels,
    loading: reelsLoading,

    // Filters
    searchState,
    setSearchState,
    statusFilter,
    setStatusFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    resetFilters,

    // Sorting
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,

    // Selection
    selectedIds,
    handleSelectReel,
    handleSelectAll,
    clearSelection,
    getMappedStatus,
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

    // Metadata/Status updates
    isUpdating,
    togglePublishStatus,
    updateReelMetadata,

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
  const [activePreview, setActivePreview] = useState<ReelDto | null>(null);
  const [activeEdit, setActiveEdit] = useState<ReelDto | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Local route visual states (Challenges)
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<ChallengeDto | null>(null);
  const [challengeToDelete, setChallengeToDelete] = useState<ChallengeDto | null>(null);
  const [isChallengeSaving, setIsChallengeSaving] = useState(false);

  // Bulk operation triggers
  const handleBulkActionExecute = async (action: "publish" | "unpublish" | "delete") => {
    await performBulkAction(action, selectedIds);
  };

  // Challenge Save mutation wrapper
  const handleSaveChallenge = async (payload: any) => {
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            {activeTab === "reels" ? (
              <Film className="w-5.5 h-5.5" />
            ) : (
              <Trophy className="w-5.5 h-5.5" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              {activeTab === "reels" ? "Reels Management" : "Challenges"}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {activeTab === "reels"
                ? "Review, publish, unpublish, or delete short-form video reels across the platform."
                : "Manage time-bound creative trends and upload challenges for cat lovers."}
            </p>
          </div>
        </div>

        {activeTab === "reels" ? (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowUploadModal(true)}
            className="shadow-md hover:shadow-lg transition-shadow self-start sm:self-auto"
          >
            <Plus className="w-4.5 h-4.5 mr-1.5" />
            Upload Reel
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingChallenge(null);
              setShowChallengeModal(true);
            }}
            className="shadow-md hover:shadow-lg transition-shadow self-start sm:self-auto font-semibold flex items-center gap-1.5"
          >
            <Plus className="w-4.5 h-4.5" />
            Create Challenge
          </Button>
        )}
      </div>

      {/* Modern Workspace Navigation Tabs */}
      <div className="flex gap-6 mt-2">
        <button
          onClick={() => setActiveTab("reels")}
          className={`pb-2 font-bold text-sm border-b-2 transition-all flex items-center gap-2 -mb-[2px] ${activeTab === "reels"
            ? "border-primary text-primary"
            : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
        >
          <Film className="w-4.5 h-4.5" />
          Reels
        </button>
        <button
          onClick={() => setActiveTab("challenges")}
          className={`pb-2 font-bold text-sm border-b-2 transition-all flex items-center gap-2 -mb-[2px] ${activeTab === "challenges"
            ? "border-primary text-primary"
            : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
        >
          <Trophy className="w-4.5 h-4.5" />
          Challenges
        </button>
      </div>

      {/* Active Tab Panel Views */}
      {activeTab === "reels" ? (
        /* Reels Tab Workspace Grid */
        <div className="flex flex-col md:flex-row gap-6 items-start animate-fadeIn">
          {/* Responsive Filter Panel Column */}
          <div className="w-full md:w-64 xl:w-72 shrink-0">
            <ReelFilterPanel
              search={searchState}
              onSearchChange={setSearchState}
              status={statusFilter}
              onStatusChange={setStatusFilter}
              startDate={startDate}
              onStartDateChange={setStartDate}
              endDate={endDate}
              onEndDateChange={setEndDate}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              sortOrder={sortOrder}
              onSortOrderChange={setSortOrder}
              onReset={resetFilters}
            />
          </div>

          {/* Video List Virtual Grid Column */}
          <div className="flex-1 w-full min-w-0 bg-white border border-gray-100/80 shadow-sm p-4 sm:p-6 rounded-3xl min-h-[50vh]">
            <div className="flex items-center justify-between mb-5">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Total {reels.length} {reels.length === 1 ? "Reel" : "Reels"}
              </div>

              {reels.length > 0 && (
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-500 select-none">
                  <input
                    type="checkbox"
                    checked={
                      reels.length > 0 &&
                      reels.every(r => selectedIds.includes(r.reelId))
                    }
                    onChange={() => handleSelectAll(reels.map(r => r.reelId))}
                    className="w-4.5 h-4.5 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                  />
                  Select All
                </label>
              )}
            </div>

            <ReelGrid
              reels={reels}
              loading={reelsLoading}
              selectedIds={selectedIds}
              onSelect={handleSelectReel}
              onPreview={setActivePreview}
              onEdit={setActiveEdit}
              onDelete={openDeleteModal}
              onTogglePublish={togglePublishStatus}
              getMappedStatus={getMappedStatus}
              onUploadClick={() => setShowUploadModal(true)}
            />
          </div>
        </div>
      ) : (
        /* Challenges Tab Workspace Grid */
        <div className="space-y-6 animate-fadeIn">

          {/* Challenge Filters & Search Header */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white border border-gray-100/80 p-4 rounded-3xl shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-stretch sm:items-center">
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search hashtag, name or description..."
                  value={challengeSearch}
                  onChange={(e) => setChallengeSearch(e.target.value)}
                  className="pl-10 pr-4 py-2.5 text-sm w-full sm:w-80 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-gray-300"
                />
              </div>

              {/* Status dropdown filter */}
              <select
                value={challengeStatusFilter}
                onChange={(e) => setChallengeStatusFilter(e.target.value as any)}
                className="px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer font-semibold text-gray-600"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Error warning panel */}
          {challengesError && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-800 text-xs font-semibold leading-relaxed flex items-start gap-2.5">
              <svg className="w-5 h-5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-bold mb-0.5">Failed to retrieve challenges from API</p>
                <p className="opacity-90">{challengesError}</p>
              </div>
            </div>
          )}

          {/* Grid Container */}
          <div className="bg-white border border-gray-100/80 shadow-sm p-4 sm:p-6 rounded-3xl min-h-[50vh] flex flex-col justify-start">
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
          </div>

        </div>
      )}

      {/* ── Inline Modals & Overlays for Reels ── */}

      {/* Inline Preview HTML5 player modal */}
      {activePreview && (
        <ReelPreviewModal
          reel={activePreview}
          onClose={() => setActivePreview(null)}
        />
      )}

      {/* Edit Metadata slide-in Drawer */}
      {activeEdit && (
        <ReelEditDrawer
          reel={activeEdit}
          isOpen={!!activeEdit}
          onClose={() => setActiveEdit(null)}
          onSave={updateReelMetadata}
          isUpdating={isUpdating}
        />
      )}

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
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-gray-900">Delete Reel</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Are you sure you want to permanently delete this video reel? This action cannot be undone and will erase all comments and insights.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2 w-full">
              <Button variant="outline" size="sm" onClick={closeDeleteModal} disabled={isDeleting} className="flex-1">
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={confirmDelete} isLoading={isDeleting} disabled={isDeleting} className="flex-1">
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
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-gray-900">Delete Challenge</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Are you sure you want to permanently delete challenge <span className="font-bold text-gray-800">"{challengeToDelete.name}"</span>? This will remove the metadata and unlink all connected reels.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2 w-full">
              <Button variant="outline" size="sm" onClick={() => setChallengeToDelete(null)} className="flex-1">
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={async () => {
                await handleDeleteChallenge(challengeToDelete.challengeId);
                setChallengeToDelete(null);
              }} className="flex-1">
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
