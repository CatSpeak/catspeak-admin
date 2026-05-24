import { useState, useCallback } from "react";
import { uploadReel, type UploadReelApiPayload } from "../api/uploadReel";
import { deleteReel } from "../api/deleteReel";
import { updateReelStatus } from "../api/updateReelStatus";
import type { ReelDto, ReelPrivacy, UploadReelPayload, UpdateReelMetadataPayload } from "../types";
import { useToastStore } from "../../../stores/toastStore";
import { getApiErrorMessage } from "../../../lib/axios";
import { useReels } from "./useReels";

export function useManageReels(reelsHook: ReturnType<typeof useReels>) {
  const addToast = useToastStore((s) => s.addToast);
  const { rawReels, setReels, clearSelection, refetch } = reelsHook;

  // Upload States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Deletion States
  const [deleteTarget, setDeleteTarget] = useState<ReelDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Status/Edit state variables
  const [isUpdating, setIsUpdating] = useState(false);

  // ── Single Publish / Unpublish Toggle (Optimistic) ──
  const togglePublishStatus = useCallback(async (reel: ReelDto) => {
    const isCurrentlyPublished = reel.privacy === "Public" || reel.status === "Public";
    const nextPrivacy: ReelPrivacy = isCurrentlyPublished ? "Private" : "Public";
    const nextBackendStatus = nextPrivacy; // Matches backend WarnOrBlockReelDto status

    // Backup current state for rollback
    const previousReelsState = [...rawReels];

    // Optimistically update frontend state
    setReels((prev: ReelDto[]) =>
      prev.map((r: ReelDto) =>
        r.reelId === reel.reelId
          ? {
            ...r,
            privacy: nextPrivacy,
            status: nextBackendStatus,
          }
          : r
      )
    );

    addToast(
      "info",
      `Optimistically ${isCurrentlyPublished ? "unpublishing" : "publishing"} "${reel.title || "Reel"}"...`
    );

    try {
      await updateReelStatus(reel.reelId, {
        status: nextBackendStatus as "Public" | "Private" | "Blocked",
        blockReason: null,
      });
      addToast(
        "success",
        `Successfully ${isCurrentlyPublished ? "unpublished" : "published"} "${reel.title || "Reel"}".`
      );
    } catch (err) {
      // Rollback on error
      setReels(previousReelsState);
      addToast(
        "error",
        getApiErrorMessage(err, `Failed to update status for "${reel.title || "Reel"}". Rolled back changes.`)
      );
    }
  }, [rawReels, setReels, addToast]);

  // ── Metadata Edit (Drawer Simulator - Optimistic) ──
  const updateReelMetadata = useCallback(async (reelId: number, payload: UpdateReelMetadataPayload) => {
    setIsUpdating(true);
    const previousReelsState = [...rawReels];

    // Optimistically update details locally
    setReels((prev: ReelDto[]) =>
      prev.map((r: ReelDto) =>
        r.reelId === reelId
          ? {
            ...r,
            title: payload.title !== undefined ? payload.title : r.title,
            description: payload.description !== undefined ? payload.description : r.description,
            privacy: payload.privacy !== undefined ? payload.privacy : r.privacy,
            status: payload.privacy !== undefined ? payload.privacy : r.status,
            hashtags: payload.tags !== undefined ? payload.tags : r.hashtags,
            coverUrl: payload.coverUrl !== undefined ? payload.coverUrl : r.coverUrl,
            scheduledAt: payload.scheduledAt !== undefined ? payload.scheduledAt : r.scheduledAt,
          }
          : r
      )
    );

    try {
      // If privacy is changing, sync with server status endpoint
      if (payload.privacy) {
        await updateReelStatus(reelId, {
          status: (payload.privacy === "FriendsOnly" ? "Private" : payload.privacy) as "Public" | "Private" | "Blocked",
          blockReason: null,
        });
      }

      addToast("success", "Reel metadata updated successfully.");
    } catch (err) {
      setReels(previousReelsState);
      addToast(
        "error",
        getApiErrorMessage(err, "Failed to update metadata. Changes rolled back.")
      );
    } finally {
      setIsUpdating(false);
    }
  }, [rawReels, setReels, addToast]);

  // ── Single Delete ──
  const openDeleteModal = useCallback((reel: ReelDto) => {
    setDeleteTarget(reel);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    const backupReels = [...rawReels];

    // Optimistic UI delete
    setReels((prev: ReelDto[]) => prev.filter((r: ReelDto) => r.reelId !== deleteTarget.reelId));
    addToast("info", `Deleting "${deleteTarget.title || "Reel"}"...`);

    try {
      await deleteReel(deleteTarget.reelId);
      addToast("success", `Deleted "${deleteTarget.title || "Reel"}" successfully.`);
      setDeleteTarget(null);
    } catch (err) {
      setReels(backupReels);
      addToast(
        "error",
        getApiErrorMessage(err, `Failed to delete "${deleteTarget.title || "Reel"}". Rolled back deletion.`)
      );
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, rawReels, setReels, addToast]);

  // ── Upload Administrative Reel ──
  const handleUploadReel = useCallback(async (payload: UploadReelPayload) => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    const isLargeFile = payload.VideoFile.size > 50 * 1024 * 1024; // 50MB

    // Chunk simulation parameters
    let simulatedInterval: ReturnType<typeof setInterval> | undefined;

    const apiPayload: UploadReelApiPayload = {
      Title: payload.Title,
      Description: payload.Description,
      Privacy: payload.Privacy,
      VideoFile: payload.VideoFile,
      CoverFile: payload.CoverFile,
    };

    try {
      if (isLargeFile) {
        // Chunk progress simulator for > 50 MB files to show incremental chunk progress
        let chunkPercent = 0;
        simulatedInterval = setInterval(() => {
          chunkPercent = Math.min(chunkPercent + 10, 90);
          setUploadProgress(chunkPercent);
        }, 400);
      }

      const response = await uploadReel(apiPayload, (event) => {
        if (!isLargeFile && event.total) {
          const percent = Math.round((event.loaded * 100) / event.total);
          setUploadProgress(percent);
        }
      });

      if (simulatedInterval) clearInterval(simulatedInterval);
      setUploadProgress(100);

      const newReel = response.data;
      if (newReel) {
        setReels((prev: ReelDto[]) => [newReel, ...prev]);
      }
      addToast("success", `Reel "${payload.Title}" uploaded successfully.`);
      refetch(); // Trigger background sync
    } catch (err) {
      if (simulatedInterval) clearInterval(simulatedInterval);
      const errMsg = getApiErrorMessage(err, "Failed to upload reel.");
      setUploadError(errMsg);
      addToast("error", errMsg);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, [setReels, addToast, refetch]);

  // ── Bulk Actions (Publish, Unpublish, Delete) ──
  const performBulkAction = useCallback(async (action: "publish" | "unpublish" | "delete", selectedIds: number[]) => {
    if (selectedIds.length === 0) return;

    const previousReelsState = [...rawReels];
    const targetTitles = rawReels
      .filter((r) => selectedIds.includes(r.reelId))
      .map((r) => r.title || `ID ${r.reelId}`)
      .join(", ");

    addToast("info", `Executing bulk ${action} on ${selectedIds.length} reels...`);

    if (action === "publish" || action === "unpublish") {
      const nextPrivacy: ReelPrivacy = action === "publish" ? "Public" : "Private";

      // Optimistically update list
      setReels((prev: ReelDto[]) =>
        prev.map((r: ReelDto) =>
          selectedIds.includes(r.reelId)
            ? { ...r, privacy: nextPrivacy, status: nextPrivacy }
            : r
        )
      );

      try {
        await Promise.all(
          selectedIds.map((id) =>
            updateReelStatus(id, {
              status: nextPrivacy as "Public" | "Private" | "Blocked",
              blockReason: null,
            })
          )
        );
        addToast("success", `Bulk ${action} completed successfully for: ${targetTitles}.`);
        clearSelection();
      } catch (err) {
        setReels(previousReelsState);
        addToast("error", getApiErrorMessage(err, `Bulk ${action} failed. Changes rolled back.`));
      }
    } else if (action === "delete") {
      // Optimistically delete selected
      setReels((prev: ReelDto[]) => prev.filter((r: ReelDto) => !selectedIds.includes(r.reelId)));

      try {
        await Promise.all(selectedIds.map((id) => deleteReel(id)));
        addToast("success", `Bulk delete of ${selectedIds.length} reels completed successfully.`);
        clearSelection();
      } catch (err) {
        setReels(previousReelsState);
        addToast("error", getApiErrorMessage(err, "Bulk delete failed. Changes rolled back."));
      }
    }
  }, [rawReels, setReels, addToast, clearSelection]);

  return {
    isUploading,
    uploadProgress,
    uploadError,
    handleUploadReel,

    // Single delete
    deleteTarget,
    isDeleting,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,

    // Status/Metadata
    isUpdating,
    togglePublishStatus,
    updateReelMetadata,

    // Bulk actions
    performBulkAction,
  };
}
