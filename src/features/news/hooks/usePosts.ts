import { useCallback, useEffect, useState } from "react";
import { getApiErrorMessage } from "../../../lib/axios";
import { getPosts } from "../api/getPosts";
import type { NewsPost, PaginationData } from "../types";

/**
 * Hook for fetching and paginating the news posts list.
 * Currently wired to the `getPosts` API stub.
 * Uncomment the fetch call once the backend is ready.
 */
export function usePosts(initialPageSize: number = 10) {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(initialPageSize);
  const [pagination] = useState<PaginationData | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Uncomment when backend is ready
      // const response = await getPosts(currentPage, pageSize);
      // setPosts(response.data);
      // setPagination(response.additionalData);
      void getPosts; // keep import live for TS
      setPosts([]); // placeholder: replace with response.data
    } catch (fetchError: unknown) {
      setError(getApiErrorMessage(fetchError, "Failed to fetch posts."));
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const goToPage = useCallback(
    (page: number) => {
      const total = pagination?.totalPages ?? 1;
      if (page >= 1 && page <= total) {
        setCurrentPage(page);
      }
    },
    [pagination],
  );

  return {
    posts,
    loading,
    error,
    currentPage,
    pageSize,
    pagination,
    goToPage,
    refetch: fetchPosts,
  };
}
