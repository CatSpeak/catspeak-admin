import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getApiErrorMessage } from "../../../lib/axios";
import { getRooms, deleteRoom as deleteRoomApi, getRoomStats } from "../api/roomApi";
import type { Room, RoomFilters, AdditionalData, RoomStatisticsDto } from "../types";

const EMPTY_FILTERS: RoomFilters = {
  roomName: "",
  hostName: "",
  roomTypes: [],
  statuses: [],
  createdFrom: "",
  createdTo: "",
  sortBy: "",
  sortOrder: "Desc",
};

const EMPTY_PAGINATION: AdditionalData = {
  currentPage: 1,
  pageSize: 10,
  totalPages: 1,
  totalCount: 0,
  hasPreviousPage: false,
  hasNextPage: false,
};

const EMPTY_STATS: RoomStatisticsDto = {
  totalRooms: 0,
  activeRooms: 0,
  oneToOneRooms: 0,
  groupRooms: 0,
};

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [paginationData, setPaginationData] = useState<AdditionalData>(EMPTY_PAGINATION);
  const [roomStats, setRoomStats] = useState<RoomStatisticsDto>(EMPTY_STATS);
  const [filters, setFilters] = useState<RoomFilters>(EMPTY_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  // ── Fetch rooms and stats from API ──

  const fetchRooms = useCallback(async () => {
    const currentRequestId = requestId.current + 1;
    requestId.current = currentRequestId;
    setIsLoading(true);
    setError(null);
    try {
      const [roomsResponse, statsResponse] = await Promise.all([
        getRooms(currentPage, pageSize, filters),
        getRoomStats(),
      ]);
      if (currentRequestId !== requestId.current) return;
      setRooms(roomsResponse.data);
      setPaginationData(roomsResponse.additionalData);
      setRoomStats(statsResponse);
    } catch (err: unknown) {
      if (currentRequestId !== requestId.current) return;
      setError(getApiErrorMessage(err, "Failed to fetch rooms."));
    } finally {
      if (currentRequestId === requestId.current) {
        setIsLoading(false);
      }
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
    if (filters.roomName) count++;
    if (filters.hostName) count++;
    if (filters.roomTypes.length) count++;
    if (filters.statuses.length) count++;
    if (filters.createdFrom) count++;
    if (filters.createdTo) count++;
    if (filters.sortBy) count++;
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

  // ── Stats (fetched from Room statistics API) ──

  const stats = useMemo(() => ({
    total: roomStats.totalRooms,
    active: roomStats.activeRooms,
    oneToOne: roomStats.oneToOneRooms,
    group: roomStats.groupRooms,
  }), [roomStats]);

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
