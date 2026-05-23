import { useState, useEffect, useCallback, useMemo } from "react";
import { getReels } from "../api/getReels";
import type { ReelDto, ReelStatus } from "../types";
import { DEBOUNCE_DELAY_MS } from "../constants";

export function useReels() {
  const [reels, setReels] = useState<ReelDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter and Sorting states
  const [searchState, setSearchState] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReelStatus | "All">("All");
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"createdAt" | "viewCount" | "duration" | "title">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Selection states for bulk actions
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Local Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchState);
      setCurrentPage(1); // Reset page on search
    }, DEBOUNCE_DELAY_MS);

    return () => clearTimeout(handler);
  }, [searchState]);

  // Fetch reels
  const fetchReels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getReels();
      if (data && data.length > 0) {
        setReels(data.map((reel, index) => ({
          ...reel,
          // Guarantee some default fallbacks for simulated values
          duration: reel.duration || (12 + (index % 5) * 6),
          createdAt: reel.createdAt || new Date().toISOString()
        })));
      } else {
        setReels([]);
      }
    } catch (err) {
      console.error("API Reels fetch failed:", err);
      setError("Failed to retrieve reels from the server. Please check your network connection or try again.");
      setReels([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReels();
  }, [fetchReels]);

  // Map Backend status to Frontend Status
  const getMappedStatus = useCallback((reel: ReelDto): ReelStatus => {
    if (reel.status === "Blocked" || reel.status === "Failed") return "Failed";
    if (reel.status === "Processing") return "Processing";
    if (reel.privacy === "Private" || reel.status === "Private" || reel.status === "Draft") return "Draft";
    return "Published"; // Default is Published (Public)
  }, []);

  // Filter and Sort reels
  const filteredAndSortedReels = useMemo(() => {
    let result = [...reels];

    // 1. Filter by Search Query (Title, Description, Username, Hashtags)
    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase().replace("#", "");
      result = result.filter((reel) => {
        const titleMatch = reel.title?.toLowerCase().includes(query) ?? false;
        const descMatch = reel.description?.toLowerCase().includes(query) ?? false;
        const userMatch = reel.username?.toLowerCase().includes(query) ?? false;
        const tagsMatch = reel.hashtags?.some(tag => tag.toLowerCase().includes(query)) ?? false;
        return titleMatch || descMatch || userMatch || tagsMatch;
      });
    }

    // 2. Filter by status badge
    if (statusFilter !== "All") {
      result = result.filter((reel) => getMappedStatus(reel) === statusFilter);
    }

    // 3. Filter by Date Range
    if (startDate) {
      const start = new Date(startDate).getTime();
      result = result.filter((reel) => new Date(reel.createdAt).getTime() >= start);
    }
    if (endDate) {
      // Set to end of the day for date picker ranges
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      const endTime = end.getTime();
      result = result.filter((reel) => new Date(reel.createdAt).getTime() <= endTime);
    }

    // 4. Sorting
    result.sort((a, b) => {
      let valA: any = a[sortBy] ?? "";
      let valB: any = b[sortBy] ?? "";

      if (sortBy === "createdAt") {
        valA = new Date(a.createdAt).getTime();
        valB = new Date(b.createdAt).getTime();
      }

      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [reels, debouncedSearch, statusFilter, startDate, endDate, sortBy, sortOrder, getMappedStatus]);

  // Selected State logic
  const handleSelectReel = useCallback((reelId: number) => {
    setSelectedIds((prev) =>
      prev.includes(reelId) ? prev.filter((id) => id !== reelId) : [...prev, reelId]
    );
  }, []);

  const handleSelectAll = useCallback((currentIds: number[]) => {
    setSelectedIds((prev) => {
      const allSelected = currentIds.every((id) => prev.includes(id));
      if (allSelected) {
        // Deselect current IDs
        return prev.filter((id) => !currentIds.includes(id));
      } else {
        // Add only unique IDs
        const newSelection = [...prev];
        currentIds.forEach((id) => {
          if (!newSelection.includes(id)) newSelection.push(id);
        });
        return newSelection;
      }
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  // Paginated reels slice
  const paginatedReels = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedReels.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedReels, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedReels.length / itemsPerPage);

  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const resetFilters = useCallback(() => {
    setSearchState("");
    setStatusFilter("All");
    setStartDate(null);
    setEndDate(null);
    setSortBy("createdAt");
    setSortOrder("desc");
    setCurrentPage(1);
  }, []);

  return {
    reels: filteredAndSortedReels,
    paginatedReels,
    loading,
    error,

    // Pagination
    currentPage,
    totalPages,
    handlePageChange,

    // Filter controls
    searchState,
    setSearchState,
    statusFilter,
    setStatusFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    resetFilters,

    // Sorting controls
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,

    // Checkbox selections
    selectedIds,
    handleSelectReel,
    handleSelectAll,
    clearSelection,

    getMappedStatus,
    refetch: fetchReels,
    setReels, // Needed for optimistic updates in useManageReels
  };
}
