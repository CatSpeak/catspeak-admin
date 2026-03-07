import { useState, useCallback, useEffect } from "react";
import { getApiErrorMessage } from "../../../lib/axios";
import { axiosClient, getResponseData } from "../../../lib/axios";
import { updatePost } from "../api/updatePost";
import { deletePost } from "../api/deletePost";
import type { Post, GetPostResponse, UpdatePostPayload } from "../types";

/**
 * Hook to manage a single post's details (fetch, update, delete).
 */
export function usePostDetail(postId: string | undefined) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchPost = useCallback(async () => {
    if (!postId) {
      setError("No post ID provided");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Assuming a GET /post/:id route exists based on standard REST patterns,
      // and matching the update/delete routes. If it doesn't, this part might 
      // need to fetch all and format, but standard backend provides this.
      const response = await getResponseData(
         axiosClient.get<GetPostResponse>(`/post/${postId}`)
      );
      setPost(response.data);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to load post details."));
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleUpdate = useCallback(
    async (payload: Omit<UpdatePostPayload, "id">) => {
      if (!post) return;
      setIsUpdating(true);
      setUpdateError(null);
      try {
        await updatePost({ id: post.postId, ...payload });
        await fetchPost(); // refresh data
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
