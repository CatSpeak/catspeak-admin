import { useCallback, useEffect, useRef, useState } from "react";
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
  const simulatedIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Upload States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Deletion States
  const [deleteTarget, setDeleteTarget] = useState<ReelDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Status/Edit state variables
  const [isUpdating, setIsUpdating] = useState(false);

  const clearSimulatedInterval = useCallback(() => {
    if (simulatedIntervalRef.current) {
      clearInterval(simulatedIntervalRef.current);
      simulatedIntervalRef.current = null;
    }
  }, []);

  useEffect(() => clearSimulatedInterval, [clearSimulatedInterval]);

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

    const apiPayload: UploadReelApiPayload = {
      Title: payload.Title,
      Description: payload.Description,
      Privacy: payload.Privacy,
      VideoFile: payload.VideoFile,
      CoverFile: payload.CoverFile,
      Tags: payload.Tags,
    };

    try {
      clearSimulatedInterval();

      if (isLargeFile) {
        // Chunk progress simulator for > 50 MB files to show incremental chunk progress
        let chunkPercent = 0;
        simulatedIntervalRef.current = setInterval(() => {
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

      clearSimulatedInterval();
      setUploadProgress(100);

      const newReel = response.data;
      if (newReel) {
        setReels((prev: ReelDto[]) => [newReel, ...prev]);
      }
      addToast("success", `Reel "${payload.Title}" uploaded successfully.`);
      refetch(); // Trigger background sync
    } catch (err) {
      clearSimulatedInterval();
      const errMsg = getApiErrorMessage(err, "Failed to upload reel.");
      setUploadError(errMsg);
      addToast("error", errMsg);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, [setReels, addToast, refetch, clearSimulatedInterval]);

  // ── Bulk Actions (Publish, Unpublish, Delete) ──
  const performBulkAction = useCallback(async (action: "publish" | "unpublish" | "delete", selectedIds: number[]) => {
    if (selectedIds.length === 0) return;

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
        const results = await Promise.allSettled(
          selectedIds.map((id) =>
            updateReelStatus(id, {
              status: nextPrivacy as "Public" | "Private" | "Blocked",
              blockReason: null,
            })
          )
        );
        const failedCount = results.filter((result) => result.status === "rejected").length;
        if (failedCount > 0) {
          await refetch();
          addToast("error", `Bulk ${action} completed with ${failedCount} failed ${failedCount === 1 ? "item" : "items"}. Synced the list with the server.`);
        } else {
          addToast("success", `Bulk ${action} completed successfully for: ${targetTitles}.`);
        }
        clearSelection();
      } catch (err) {
        await refetch();
        addToast("error", getApiErrorMessage(err, `Bulk ${action} failed. Synced the list with the server.`));
      }
    } else if (action === "delete") {
      // Optimistically delete selected
      setReels((prev: ReelDto[]) => prev.filter((r: ReelDto) => !selectedIds.includes(r.reelId)));

      try {
        const results = await Promise.allSettled(selectedIds.map((id) => deleteReel(id)));
        const failedCount = results.filter((result) => result.status === "rejected").length;
        if (failedCount > 0) {
          await refetch();
          addToast("error", `Bulk delete completed with ${failedCount} failed ${failedCount === 1 ? "item" : "items"}. Synced the list with the server.`);
        } else {
          addToast("success", `Bulk delete of ${selectedIds.length} reels completed successfully.`);
        }
        clearSelection();
      } catch (err) {
        await refetch();
        addToast("error", getApiErrorMessage(err, "Bulk delete failed. Synced the list with the server."));
      }
    }
  }, [rawReels, setReels, addToast, clearSelection, refetch]);

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
