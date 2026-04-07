import { useCallback, useEffect, useMemo, useState } from "react";
import { getApiErrorMessage } from "../../../lib/axios";
import { getRooms, deleteRoom as deleteRoomApi } from "../api/roomApi";
import type { Room, RoomFilters, AdditionalData } from "../types";

const EMPTY_FILTERS: RoomFilters = {
  roomTypes: [],
  languageTypes: [],
  requiredLevels: [],
  categories: [],
  topics: [],
  roomName: "",
};

const EMPTY_PAGINATION: AdditionalData = {
  currentPage: 1,
  pageSize: 10,
  totalPages: 1,
  totalCount: 0,
  hasPreviousPage: false,
  hasNextPage: false,
};

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [paginationData, setPaginationData] = useState<AdditionalData>(EMPTY_PAGINATION);
  const [filters, setFilters] = useState<RoomFilters>(EMPTY_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch rooms from API ──

  const fetchRooms = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getRooms(currentPage, pageSize, filters);
      setRooms(response.data);
      setPaginationData(response.additionalData);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to fetch rooms."));
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, filters]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // ── Pagination ──

  const setPage = useCallback((page: number) => {
    if (page >= 1 && page <= paginationData.totalPages) {
      setCurrentPage(page);
    }
  }, [paginationData.totalPages]);

  // ── Filter actions ──

  const updateFilter = useCallback(<K extends keyof RoomFilters>(key: K, value: RoomFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const toggleFilterValue = useCallback(<K extends keyof RoomFilters>(
    key: K,
    value: RoomFilters[K] extends (infer U)[] ? U : never,
  ) => {
    setFilters((prev) => {
      const arr = prev[key] as unknown[];
      const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
      return { ...prev, [key]: next };
    });
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS);
    setCurrentPage(1);
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.roomTypes.length) count++;
    if (filters.languageTypes.length) count++;
    if (filters.requiredLevels.length) count++;
    if (filters.categories.length) count++;
    if (filters.topics.length) count++;
    return count;
  }, [filters]);

  // ── Delete room ──

  const deleteRoom = useCallback(async (id: number) => {
    try {
      await deleteRoomApi(id);
      // Refetch after deletion
      await fetchRooms();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to delete room."));
    }
  }, [fetchRooms]);

  // ── Stats (computed from current page data + totals) ──

  const stats = useMemo(() => ({
    total: paginationData.totalCount,
    active: rooms.filter((r) => r.status === 1).length,
    oneToOne: rooms.filter((r) => r.roomType === "OneToOne").length,
    group: rooms.filter((r) => r.roomType === "Group").length,
  }), [rooms, paginationData.totalCount]);

  return {
    rooms,
    pagination: {
      page: paginationData.currentPage,
      pageSize: paginationData.pageSize,
      totalItems: paginationData.totalCount,
      totalPages: paginationData.totalPages,
    },
    filters,
    isLoading,
    error,
    stats,
    activeFilterCount,
    setPage,
    updateFilter,
    toggleFilterValue,
    clearFilters,
    deleteRoom,
    refetch: fetchRooms,
  };
}
