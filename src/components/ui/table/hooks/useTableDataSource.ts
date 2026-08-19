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
    toDate?: string,
  ) => TableCustomResult<T> | Promise<TableCustomResult<T>>;
  loading?: boolean;
  defaultPageSize?: number;
}

export function is404Error(err: unknown): boolean {
  if (!err) return false;
  if (typeof err === "object") {
    const errorObj = err as Record<string, unknown>;
    if (
      errorObj.response &&
      typeof errorObj.response === "object" &&
      (errorObj.response as Record<string, unknown>).status === 404
    ) {
      return true;
    }
    if (errorObj.status === 404 || errorObj.statusCode === 404) {
      return true;
    }
  }
  if (err instanceof Error) {
    if (
      err.message.includes("404") ||
      err.message.toLowerCase().includes("not found")
    ) {
      return true;
    }
  }
  if (
    typeof err === "string" &&
    (err.includes("404") || err.toLowerCase().includes("not found"))
  ) {
    return true;
  }
  return false;
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

  const configValid = typeof fetcher === "function";

  const [fetchedData, setFetchedData] = useState<T[]>([]);
  const [fetchedTotal, setFetchedTotal] = useState(0);
  const [fetchLoading, setFetchLoading] = useState(configValid);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof fetcher !== "function") return;
    let cancelled = false;

    queueMicrotask(() => {
      if (!cancelled) {
        setFetchLoading(true);
        setFetchError(null);
      }
    });

    const result = fetcher(pagination.pageIndex + 1, pagination.pageSize);

    Promise.resolve(result)
      .then((res) => {
        if (cancelled) return;
        setFetchedData(res.data);
        setFetchedTotal(res.total);
        setFetchError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setFetchedData([]);
        setFetchedTotal(0);
        if (is404Error(err)) {
          // 404 means no data found -> show Empty state, not Error state
          setFetchError(null);
        } else {
          setFetchError(
            err instanceof Error ? err.message : "Failed to load data.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setFetchLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fetcher, pagination.pageIndex, pagination.pageSize]);

  const data = customData ?? fetchedData;
  const effectiveLoading = loading || fetchLoading;

  const effectiveTotal =
    customTotal !== null
      ? customTotal
      : customData !== null
        ? customData.length
        : fetchedTotal;

  // Pagination clamping during render
  const maxPageIndex = Math.max(
    0,
    Math.ceil(effectiveTotal / pagination.pageSize) - 1,
  );
  if (pagination.pageIndex > maxPageIndex) {
    setPagination((prev) => ({ ...prev, pageIndex: maxPageIndex }));
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
        total_records?: number;
        totalCount?: number;
        additionalData?: { totalCount?: number };
      };
      setCustomData(obj.data);
      const total =
        typeof obj.total === "number"
          ? obj.total
          : typeof obj.total_records === "number"
            ? obj.total_records
            : typeof obj.totalCount === "number"
              ? obj.totalCount
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

  const runCustomFilter = (
    attribute: keyof T | string,
    value: unknown,
    toDate?: string,
  ) => {
    if (filter) {
      setFetchLoading(true);
      setFetchError(null);
      Promise.resolve(filter(attribute, value, toDate))
        .then((res) => {
          applyCustomResult(res);
          setFetchError(null);
        })
        .catch((err: unknown) => {
          if (is404Error(err)) {
            setCustomData([]);
            setCustomTotal(0);
            setFetchError(null);
            setPagination((prev) => ({ ...prev, pageIndex: 0 }));
          } else {
            setCustomData([]);
            setCustomTotal(0);
            setFetchError(
              err instanceof Error ? err.message : "Failed to filter data.",
            );
            setPagination((prev) => ({ ...prev, pageIndex: 0 }));
          }
        })
        .finally(() => {
          setFetchLoading(false);
        });
    }
  };

  const clearCustomResult = () => {
    setCustomData(null);
    setCustomTotal(null);
    setFetchError(null);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  return {
    data,
    effectiveTotal,
    effectiveLoading,
    fetchError,
    configValid,
    pagination,
    setPagination,
    applyCustomResult,
    runCustomFilter,
    clearCustomResult,
    setFetchLoading,
  };
}
