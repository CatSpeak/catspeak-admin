import { useState, useCallback, useEffect, useRef } from "react";
import { getApiErrorMessage } from "../../../lib/axios";
import { updatePost } from "../api/updatePost";
import { deletePost } from "../api/deletePost";
import { getPostBySlug } from "../api/getPostBySlug";
import type { Post, UpdatePostPayload } from "../types";

/**
 * Hook to manage a single post's details (fetch by slug, update, delete).
 */
export function usePostDetail(slug: string | undefined) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const requestId = useRef(0);

  const fetchPost = useCallback(async () => {
    if (!slug) {
      requestId.current += 1;
      setError("No post slug provided");
      setLoading(false);
      return;
    }

    const currentRequestId = requestId.current + 1;
    requestId.current = currentRequestId;
    setLoading(true);
    setError(null);

    try {
      const response = await getPostBySlug(slug);
      if (currentRequestId !== requestId.current) return;
      setPost(response.data);
    } catch (err: unknown) {
      if (currentRequestId !== requestId.current) return;
      setError(getApiErrorMessage(err, "Failed to load post details."));
    } finally {
      if (currentRequestId === requestId.current) {
        setLoading(false);
      }
    }
  }, [slug]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleUpdate = useCallback(
    async (payload: Omit<UpdatePostPayload, "id">) => {
      if (!post) return;
      setIsUpdating(true);
      setUpdateError(null);
      try {
        const response = await updatePost({ id: post.postId, ...payload });
        // Only fetch post if the slug didn't change, otherwise route navigation handles it
        if (response.data && response.data.slug === post.slug) {
          await fetchPost();
        }
        return response;
      } catch (err: unknown) {
        setUpdateError(getApiErrorMessage(err, "Failed to update post."));
        throw err; // re-throw so the UI can detect failure
      } finally {
        setIsUpdating(false);
      }
    },
    [post, fetchPost],
  );

  const handleDelete = useCallback(async () => {
    if (!post) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deletePost(post.postId);
      return true; // indicator of success
    } catch (err: unknown) {
      setDeleteError(getApiErrorMessage(err, "Failed to delete post."));
      return false; // indicator of failure
    } finally {
      setIsDeleting(false);
    }
  }, [post]);

  return {
    post,
    loading,
    error,
    isUpdating,
    updateError,
    handleUpdate,
    isDeleting,
    deleteError,
    handleDelete,
  };
}
