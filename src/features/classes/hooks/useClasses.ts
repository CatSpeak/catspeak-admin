import { useCallback, useEffect, useRef, useState } from "react";
import { getApiErrorMessage } from "../../../lib/axios";
import { useToastStore } from "../../../stores/toastStore";
import {
  getClasses,
  getClassStats,
  setClassStatus as setClassStatusApi,
  removeStudent as removeStudentApi,
} from "../api/classApi";
import type { AdminClass, ClassFilters, ClassStats } from "../types";

const EMPTY_PAGINATION = {
  currentPage: 1,
  pageSize: 10,
  totalPages: 0,
  totalCount: 0,
  hasPreviousPage: false,
  hasNextPage: false,
};

const EMPTY_FILTERS: ClassFilters = {
  search: "",
  language: "",
  status: "",
};

export function useClasses() {
  const [classes, setClasses] = useState<AdminClass[]>([]);
  const [stats, setStats] = useState<ClassStats | null>(null);
  const [paginationData, setPaginationData] = useState(EMPTY_PAGINATION);
  const [filters, setFilters] = useState<ClassFilters>(EMPTY_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);
  const addToast = useToastStore((s) => s.addToast);

  const fetchClasses = useCallback(async () => {
    const id = ++requestId.current;
    setIsLoading(true);
    try {
      const [res, statsRes] = await Promise.all([
        getClasses(currentPage, pageSize, filters),
        getClassStats(),
      ]);
      if (id !== requestId.current) return;
      setClasses(res.data);
      setPaginationData(res.additionalData);
      setStats(statsRes);
      setError(null);
    } catch (err) {
      if (id !== requestId.current) return;
      setError(getApiErrorMessage(err, "Failed to load classes."));
    } finally {
      if (id === requestId.current) setIsLoading(false);
    }
  }, [currentPage, pageSize, filters]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const setPage = useCallback((page: number) => setCurrentPage(page), []);

  const updateFilter = useCallback(
    <K extends keyof ClassFilters>(key: K, value: ClassFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setCurrentPage(1);
    },
    [],
  );

  const clearFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS);
    setCurrentPage(1);
  }, []);

  const activeFilterCount = useCallback(
    () =>
      Object.values(filters).filter(
        (v) => typeof v === "string" && v.trim().length > 0,
      ).length,
    [filters],
  );

  const changeStatus = useCallback(
    async (classId: number, status: string) => {
      try {
        await setClassStatusApi(classId, status);
        addToast("success", "Class status updated.");
        await fetchClasses();
        return true;
      } catch (err) {
        addToast("error", getApiErrorMessage(err, "Failed to update status."));
        return false;
      }
    },
    [addToast, fetchClasses],
  );

  const removeStudent = useCallback(
    async (classId: number, accountId: number) => {
      try {
        await removeStudentApi(classId, accountId);
        addToast("success", "Student removed.");
        return true;
      } catch (err) {
        addToast("error", getApiErrorMessage(err, "Failed to remove student."));
        return false;
      }
    },
    [addToast],
  );

  return {
    classes,
    stats,
    pagination: paginationData,
    filters,
    isLoading,
    error,
    activeFilterCount: activeFilterCount(),
    setPage,
    updateFilter,
    clearFilters,
    changeStatus,
    removeStudent,
    refetch: fetchClasses,
  };
}
