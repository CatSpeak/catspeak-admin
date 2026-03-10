import { useCallback, useEffect, useMemo, useState } from "react";
import { getApiErrorMessage } from "../../../lib/axios";
import { getStaffs } from "../api/getStaffs";
import type { Account } from "../types";

const MAX_VISIBLE_PAGES = 5;

export function usePaginatedStaffs(initialItemsPerPage: number = 10) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchStaffs = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getStaffs(currentPage, itemsPerPage);
        setAccounts(response.data);
        setTotalPages(response.additionalData.totalPages);
        setTotalCount(response.additionalData.totalCount);
      } catch (fetchError: unknown) {
        setError(getApiErrorMessage(fetchError, "Failed to fetch staffs."));
      } finally {
        setLoading(false);
      }
    };

    fetchStaffs();
  }, [currentPage, itemsPerPage]);

  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages],
  );

  const changeItemsPerPage = useCallback((nextItemsPerPage: number) => {
    setItemsPerPage(nextItemsPerPage);
    setCurrentPage(1);
  }, []);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    let startPage = Math.max(
      1,
      currentPage - Math.floor(MAX_VISIBLE_PAGES / 2),
    );
    const endPage = Math.min(totalPages, startPage + MAX_VISIBLE_PAGES - 1);

    if (endPage - startPage + 1 < MAX_VISIBLE_PAGES) {
      startPage = Math.max(1, endPage - MAX_VISIBLE_PAGES + 1);
    }

    for (let page = startPage; page <= endPage; page += 1) {
      pages.push(page);
    }

    return pages;
  }, [currentPage, totalPages]);

  return {
    accounts,
    loading,
    error,
    currentPage,
    itemsPerPage,
    totalPages,
    totalCount,
    pageNumbers,
    goToPage,
    changeItemsPerPage,
  };
}
