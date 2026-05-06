import { useCallback, useEffect, useMemo, useState } from "react";
import { getApiErrorMessage } from "../../../lib/axios";
import { getAccounts, type AccountFilters } from "../api/getUsers";
import type { Account } from "../types";

const MAX_VISIBLE_PAGES = 5;
const SEARCH_DEBOUNCE_MS = 400;

export function usePaginatedUsers(initialItemsPerPage: number = 10) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Raw filter inputs (UI-driven)
  const [searchInput, setSearchInput] = useState("");
  const [roleId, setRoleId] = useState<number | undefined>(undefined);
  const [level, setLevel] = useState<string>("");
  const [status, setStatus] = useState<number | undefined>(undefined);

  // Debounced search value (used for API calls)
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setCurrentPage(1); // reset to page 1 on new search
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const filters: AccountFilters = {};
    if (debouncedSearch) filters.search = debouncedSearch;
    if (roleId !== undefined) filters.roleId = roleId;
    if (level) filters.level = level;
    if (status !== undefined) filters.status = status;

    const fetchAccounts = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getAccounts(currentPage, itemsPerPage, filters);
        setAccounts(response.data);
        setTotalPages(response.additionalData.totalPages);
        setTotalCount(response.additionalData.totalCount);
      } catch (fetchError: unknown) {
        setError(getApiErrorMessage(fetchError, "Failed to fetch users."));
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, [currentPage, itemsPerPage, debouncedSearch, roleId, level, status]);

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

  const changeSearch = useCallback((value: string) => {
    setSearchInput(value);
  }, []);

  const changeRoleId = useCallback((value: number | undefined) => {
    setRoleId(value);
    setCurrentPage(1);
  }, []);

  const changeLevel = useCallback((value: string) => {
    setLevel(value);
    setCurrentPage(1);
  }, []);

  const changeStatus = useCallback((value: number | undefined) => {
    setStatus(value);
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
    searchInput,
    roleId,
    level,
    status,
    goToPage,
    changeItemsPerPage,
    changeSearch,
    changeRoleId,
    changeLevel,
    changeStatus,
  };
}
