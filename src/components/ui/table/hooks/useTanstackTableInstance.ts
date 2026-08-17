import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type PaginationState,
  type TableOptions,
} from "@tanstack/react-table";
import type { SortOrder, TableCustomResult } from "../types";

export interface UseTanstackTableInstanceParams<T> {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  pagination: PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
  effectiveTotal: number;
  sorter?: (
    attribute: keyof T | string,
    sortOrder: SortOrder,
  ) => TableCustomResult<T> | Promise<TableCustomResult<T>>;
  applyCustomResult: (res: unknown) => void;
  setFetchLoading: React.Dispatch<React.SetStateAction<boolean>>;
  keyExtractor?: (row: T, index: number) => string | number;
  tableOptions?: Partial<TableOptions<T>>;
}

export function useTanstackTableInstance<T>({
  data,
  columns,
  pagination,
  setPagination,
  effectiveTotal,
  sorter,
  applyCustomResult,
  setFetchLoading,
  keyExtractor,
  tableOptions,
}: UseTanstackTableInstanceParams<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const handleSortingChange = (
    updaterOrValue: SortingState | ((old: SortingState) => SortingState),
  ) => {
    setSorting((prev) => {
      const next =
        typeof updaterOrValue === "function"
          ? updaterOrValue(prev)
          : updaterOrValue;
      if (sorter) {
        const item = next[0];
        const attr = item ? item.id : "";
        const order: SortOrder = item
          ? item.desc
            ? "desc"
            : "asc"
          : undefined;
        setFetchLoading(true);
        Promise.resolve(sorter(attr as keyof T | string, order))
          .then((res) => {
            applyCustomResult(res);
          })
          .catch((err) => {
            console.error("Sorter error:", err);
          })
          .finally(() => {
            setFetchLoading(false);
          });
      }
      return next;
    });
  };

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, globalFilter, pagination },
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getRowId: keyExtractor
      ? (row, index) => String(keyExtractor(row, index))
      : undefined,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: Math.max(1, Math.ceil(effectiveTotal / pagination.pageSize)),
    ...tableOptions,
  });

  return {
    table,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
  };
}
