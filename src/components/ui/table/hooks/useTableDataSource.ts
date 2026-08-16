import { useEffect, useState } from "react";
import type { PaginationState } from "@tanstack/react-table";
import type {
  TableFetcher,
  TableCustomResult,
} from "../types";

export interface UseTableDataSourceParams<T> {
  fetcher: TableFetcher<T>;
  filter?: (
    attribute: keyof T | string,
    value: unknown,
  ) => TableCustomResult<T> | Promise<TableCustomResult<T>>;
  loading?: boolean;
  defaultPageSize?: number;
}

export function useTableDataSource<T>({
  fetcher,
  filter,
  loading = false,
  defaultPageSize = 10,
}: UseTableDataSourceParams<T>) {
  const [customData, setCustomData] = useState<T[] | null>(null);
  const [customTotal, setCustomTotal] = useState<number | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });

  // `fetcher` is a required prop per the TS types, but guard at runtime
  // too (e.g. plain-JS callers that skip type checking).
  const configValid = typeof fetcher === "function";

  // Arity-based mode switch: a fetcher declared with both `page` and
  // `pageSize` params opts into server-side pagination (we call it with
  // both on every page/page-size change and trust the returned `total`).
  // A fetcher declared with fewer params is called once with no args,
  // treated as returning the full dataset, and paginated client-side.
  const usesServerPagination = configValid && fetcher.length >= 2;

  const [fetchedData, setFetchedData] = useState<T[]>([]);
  const [fetchedTotal, setFetchedTotal] = useState(0);
  const [fetchLoading, setFetchLoading] = useState(configValid);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Collapsed to constants in client-pagination mode so the effect below
  // doesn't refetch the whole dataset every time the user flips pages.
  const depPageIndex = usesServerPagination ? pagination.pageIndex : 0;
  const depPageSize = usesServerPagination ? pagination.pageSize : 0;

  useEffect(() => {
    if (typeof fetcher !== "function") return;
    let cancelled = false;

    queueMicrotask(() => {
      if (!cancelled) {
        setFetchLoading(true);
        setFetchError(null);
      }
    });

    const result = usesServerPagination
      ? fetcher(depPageIndex + 1, depPageSize)
      : fetcher();

    Promise.resolve(result)
      .then((res) => {
        if (cancelled) return;
        setFetchedData(res.data);
        setFetchedTotal(usesServerPagination ? res.total : res.data.length);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setFetchedData([]);
        setFetchedTotal(0);
        setFetchError(
          err instanceof Error ? err.message : "Failed to load data.",
        );
      })
      .finally(() => {
        if (!cancelled) setFetchLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fetcher, usesServerPagination, depPageIndex, depPageSize]);

  const data = customData ?? fetchedData;
  const effectiveLoading = loading || fetchLoading;

  const effectiveTotal =
    customTotal !== null
      ? customTotal
      : customData !== null
        ? customData.length
        : fetchedTotal;

  // Pagination clamping during render
  if (usesServerPagination) {
    const maxPageIndex = Math.max(
      0,
      Math.ceil(effectiveTotal / pagination.pageSize) - 1,
    );
    if (pagination.pageIndex > maxPageIndex) {
      setPagination((prev) => ({ ...prev, pageIndex: maxPageIndex }));
    }
  }

  const applyCustomResult = (res: unknown) => {
    if (
      res &&
      typeof res === "object" &&
      !Array.isArray(res) &&
      "data" in res &&
      Array.isArray((res as { data: unknown }).data)
    ) {
      const obj = res as {
        data: T[];
        total?: number;
        additionalData?: { totalCount?: number };
      };
      setCustomData(obj.data);
      const total =
        typeof obj.total === "number"
          ? obj.total
          : typeof obj.additionalData?.totalCount === "number"
            ? obj.additionalData.totalCount
            : obj.data.length;
      setCustomTotal(total);
    } else if (Array.isArray(res)) {
      setCustomData(res as T[]);
      setCustomTotal((res as T[]).length);
    } else {
      setCustomData(null);
      setCustomTotal(null);
    }
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const runCustomFilter = (attribute: keyof T | string, value: unknown) => {
    if (filter) {
      setFetchLoading(true);
      Promise.resolve(filter(attribute, value))
        .then((res) => {
          applyCustomResult(res);
        })
        .catch((err) => {
          console.error("Filter error:", err);
        })
        .finally(() => {
          setFetchLoading(false);
        });
    }
  };

  const clearCustomResult = () => {
    setCustomData(null);
    setCustomTotal(null);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  return {
    data,
    effectiveTotal,
    effectiveLoading,
    fetchError,
    configValid,
    usesServerPagination,
    pagination,
    setPagination,
    applyCustomResult,
    runCustomFilter,
    clearCustomResult,
    setFetchLoading,
  };
}
