import { useCallback, useEffect, useRef, useState } from "react";
import { getApiErrorMessage } from "../../../lib/axios";
import { getPosts } from "../api/getPosts";
import type { Post } from "../types";

export function usePosts(initialPageSize: number = 10) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(initialPageSize);
  const [hasNextPage, setHasNextPage] = useState(false);
  const requestId = useRef(0);

  const fetchPosts = useCallback(async () => {
    const currentRequestId = requestId.current + 1;
    requestId.current = currentRequestId;
    setLoading(true);
    setError(null);

    try {
      const response = await getPosts(currentPage, pageSize);
      if (currentRequestId !== requestId.current) return;
      setPosts(response.data);
      setHasNextPage(response.data.length === pageSize);
    } catch (fetchError: unknown) {
      if (currentRequestId !== requestId.current) return;
      setError(getApiErrorMessage(fetchError, "Failed to fetch posts."));
    } finally {
      if (currentRequestId === requestId.current) {
        setLoading(false);
      }
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1) {
      setCurrentPage(page);
    }
  }, []);

  return {
    posts,
    loading,
    error,
    currentPage,
    pageSize,
    hasNextPage,
    goToPage,
    refetch: fetchPosts,
  };
}
