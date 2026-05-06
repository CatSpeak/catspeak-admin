import { useCallback, useEffect, useMemo, useState } from "react";
import { getApiErrorMessage } from "../../../lib/axios";
import { getInstructorApplications } from "../api/getInstructorApplications";
import type { ApplicationStatus, InstructorApplication } from "../types";

const MAX_VISIBLE_PAGES = 5;

export function useInstructorApplications(initialPageSize: number = 20) {
  const [applications, setApplications] = useState<InstructorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "">("");

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getInstructorApplications({
        page: currentPage,
        pageSize,
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setApplications(response.items);
      setTotalPages(response.totalPages);
      setTotalCount(response.totalCount);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to fetch applications."));
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, search, statusFilter]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) setCurrentPage(page);
    },
    [totalPages],
  );

  const changePageSize = useCallback((next: number) => {
    setPageSize(next);
    setCurrentPage(1);
  }, []);

  const changeStatus = useCallback((status: ApplicationStatus | "") => {
    setStatusFilter(status);
    setCurrentPage(1);
  }, []);

  const changeSearch = useCallback((value: string) => {
    setSearch(value);
    setCurrentPage(1);
  }, []);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    let start = Math.max(1, currentPage - Math.floor(MAX_VISIBLE_PAGES / 2));
    const end = Math.min(totalPages, start + MAX_VISIBLE_PAGES - 1);
    if (end - start + 1 < MAX_VISIBLE_PAGES) {
      start = Math.max(1, end - MAX_VISIBLE_PAGES + 1);
    }
    for (let p = start; p <= end; p++) pages.push(p);
    return pages;
  }, [currentPage, totalPages]);

  return {
    applications,
    loading,
    error,
    currentPage,
    pageSize,
    totalPages,
    totalCount,
    search,
    statusFilter,
    pageNumbers,
    goToPage,
    changePageSize,
    changeStatus,
    changeSearch,
    refetch: fetchApplications,
  };
}
