import { useCallback, useState } from "react";
import { getApiErrorMessage } from "../../../lib/axios";
import { deletePost } from "../api/deletePost";
import { updatePost } from "../api/updatePost";
import { usePosts } from "./usePosts";
import type { Post, UpdatePostPayload } from "../types";

/**
 * Manages state and API calls for the Manage tab:
 * delete confirmation, inline editing, and list refresh.
 */
export function useManagePosts(pageSize: number = 10) {
  const postsHook = usePosts(pageSize);

  // ── Delete state ──
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // ── Edit state ──
  const [editTarget, setEditTarget] = useState<Post | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // ── Delete handlers ──
  const openDeleteModal = useCallback((post: Post) => {
    setDeleteTarget(post);
    setDeleteError(null);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteTarget(null);
    setDeleteError(null);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deletePost(deleteTarget.postId);
      setDeleteTarget(null);
      postsHook.refetch();
    } catch (err: unknown) {
      setDeleteError(getApiErrorMessage(err, "Failed to delete post."));
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, postsHook]);

  // ── Edit handlers ──
  const openEditModal = useCallback((post: Post) => {
    setEditTarget(post);
    setUpdateError(null);
  }, []);

  const closeEditModal = useCallback(() => {
    setEditTarget(null);
    setUpdateError(null);
  }, []);

  const saveEdit = useCallback(
    async (payload: Omit<UpdatePostPayload, "id">) => {
      if (!editTarget) return;
      setIsUpdating(true);
      setUpdateError(null);
      try {
        await updatePost({ id: editTarget.postId, ...payload });
        setEditTarget(null);
        postsHook.refetch();
      } catch (err: unknown) {
        setUpdateError(getApiErrorMessage(err, "Failed to update post."));
      } finally {
        setIsUpdating(false);
      }
    },
    [editTarget, postsHook],
  );

  return {
    // List data (from usePosts)
    ...postsHook,

    // Delete
    deleteTarget,
    isDeleting,
    deleteError,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,

    // Edit
    editTarget,
    isUpdating,
    updateError,
    openEditModal,
    closeEditModal,
    saveEdit,
  };
}
