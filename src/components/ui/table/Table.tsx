import {
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type ElementType,
  type ReactNode,
} from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type Column as TanstackColumn,
  type Table as TanstackTable,
  type SortingState,
  type ColumnFiltersState,
  type PaginationState,
  type FilterFn,
  type TableOptions,
} from "@tanstack/react-table";
import {
  Search,
  X,
  Filter,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Check,
} from "lucide-react";
import Card from "../Card";
import { useLanguage } from "../../../stores/languageStore";

/* ────────────────────────────────────────────────────────────────────────
 * Type augmentation — lets us stash our own per-column config (icon,
 * fixed value list, filter visibility, width...) on the TanStack column
 * definition and read it back out via `column.columnDef.meta`.
 * ──────────────────────────────────────────────────────────────────────── */
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    icon?: ReactNode;
    values?: FilterOption[];
    showFilter?: boolean;
    headerClassName?: string;
    cellClassName?: string;
    width?: number | string;
  }

  interface FilterFns {
    multiSelect: FilterFn<unknown>;
    approximateText: FilterFn<unknown>;
  }
}

/* ────────────────────────────────────────────────────────────────────────
 * Public types
 * ──────────────────────────────────────────────────────────────────────── */

export interface FilterOption {
  label: string;
  value: string | number | boolean;
}

/**
 * A component (or intrinsic tag like "strong", "em", "span"...) used to
 * wrap a cell's raw value. The raw value is passed in as `children`.
 */
export type renderComponent =
  | ElementType
  | ComponentType<{ children?: ReactNode }>;

/**
 * Factory that receives the full row and returns either:
 *
 * - A component/tag to wrap the cell's raw value in — e.g.
 *   `render: (row) => (row.urgent ? "strong" : "span")` renders
 *   `<strong>{value}</strong>` or `<span>{value}</span>`.
 * - A fully-built element that's rendered as-is (the raw value is
 *   ignored since the callback already has the whole row to work with)
 *   — e.g. `render: (row) => <span className="underline">{row.email}</span>`.
 */
export type render<T> = (row: T) => renderComponent | ReactNode;

export interface TableHeader<T> {
  /** Column label shown in the header */
  name: string;
  /** Optional icon rendered next to the label */
  icon?: ReactNode;
  /** Row property this column reads from (preferred over accessorFn) */
  accessorKey?: keyof T & string;
  /** Use when the cell value needs to be derived rather than read directly */
  accessorFn?: (row: T) => unknown;
  /** Custom cell renderer. Defaults to printing the raw value (or "—"). */
  cell?: (value: unknown, row: T, index: number) => ReactNode;
  /**
   * Used to render the cell when no custom `cell` renderer is supplied.
   * Receives the full row and returns either a component/tag to wrap
   * the raw value in as `children` (e.g. `() => "strong"` produces
   * `<strong>{value}</strong>`), or an already-built element to render
   * as-is (e.g. `(row) => <span>{row.email}</span>`). Defaults to a
   * plain fragment (raw text).
   */
  render?: render<T>;
  /**
   * Name of the attribute on the row object to actually display in the
   * cell, when it differs from the attribute used for sorting/filtering
   * (`accessorKey`/`accessorFn`/`values`). When set, this attribute's
   * value is read directly off the row and passed to `cell`/
   * `render` instead of the column's own accessed value.
   */
  mapTo?: keyof T & string;
  /**
   * Fixed set of selectable values for this column. When present, the
   * filter control renders as a multi-select checkbox dropdown instead
   * of a free-text input. Accepts raw values or {label, value} pairs.
   */
  values?: (FilterOption | string | number)[];
  /**
   * Optional display labels for `values`, matched by index (`valueLabels[i]`
   * corresponds to `values[i]`). When a label exists at a given index, it is
   * rendered in the filter control instead of the underlying value (or the
   * value's own `label`, if `values[i]` is a `FilterOption`); indices
   * without a corresponding label fall back to that default rendering.
   */
  valueLabels?: string[];
  /** Enable/disable sorting for this column (default: true) */
  allowSort?: boolean;
  /** Enable/disable the filter control for this column (default: true) */
  showFilter?: boolean;
  /** Optional column width (px number or any CSS width string) */
  width?: number | string;
  headerClassName?: string;
  cellClassName?: string;
}

export interface TableAction<T> {
  label: string;
  icon?: ReactNode;
  handler?: (row: T) => void;
  /** Hide this action for a given row */
  hidden?: (row: T) => boolean;
  danger?: boolean;
}

/** Result shape a `fetcher` must resolve to. */
export interface TableFetcherResult<T> {
  /** Rows for the requested page (or the full dataset — see below) */
  data: T[];
  /**
   * Total row count across all pages. Only consulted when the fetcher
   * accepts both `page` and `pageSize` (server-side pagination mode);
   * ignored otherwise.
   */
  total: number;
}

/**
 * Data source for the table. `page` (1-indexed) and `pageSize` are
 * optional and drive which pagination mode is used:
 *
 * - Declare **both** params (e.g. `(page, pageSize) => ...`) to opt into
 *   server-side pagination — the table calls `fetcher(page, pageSize)`
 *   on every page/page-size change and expects only that page's rows
 *   back, alongside the grand `total`.
 * - Declare **fewer than two** params (e.g. `() => ...` or `(page) =>
 *   ...`) to have the table call `fetcher()` once, treat the result as
 *   the complete dataset, and paginate/sort/filter it entirely
 *   client-side.
 *
 * Should be a stable reference (e.g. wrapped in `useCallback`) to avoid
 * refetching on every render.
 */
export type TableFetcher<T> = (
  page?: number,
  pageSize?: number,
) => Promise<TableFetcherResult<T>> | TableFetcherResult<T>;

export type SortOrder = "asc" | "desc" | undefined;

export type TableCustomResult<T> =
  | T[]
  | TableFetcherResult<T>
  | { data: T[]; total?: number; additionalData?: { totalCount?: number } };

interface TableProps<T> {
  headers: TableHeader<T>[];
  /**
   * Data source. See `TableFetcher` for how its arity (number of
   * declared params) selects server-side vs. client-side pagination.
   */
  fetcher: TableFetcher<T>;
  sorter?: (
    attribute: keyof T | string,
    sortOrder: SortOrder,
  ) => TableCustomResult<T> | Promise<TableCustomResult<T>>;
  filter?: (
    attribute: keyof T | string,
    value: any,
  ) => TableCustomResult<T> | Promise<TableCustomResult<T>>;
  onClickRow?: (row: T) => void;
  actions?: TableAction<T>[];
  loading?: boolean;
  loadingMessage?: string;
  emptyMessage?: string;
  /** Shown if `fetcher` is missing at runtime (e.g. non-TS callers) */
  configErrorMessage?: string;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  stickyHeader?: boolean;
  className?: string;
  showGlobalSearch?: boolean;
  showPagination?: boolean;
  /** Stable row id extractor, wired to TanStack's getRowId */
  keyExtractor?: (row: T, index: number) => string | number;
  /** Used in "Total N {entityName}" and aria-labels */
  entityName?: string;
  /** Escape hatch: shallow-merged into / overrides any useReactTable option */
  tableOptions?: Partial<TableOptions<T>>;
}

/* ────────────────────────────────────────────────────────────────────────
 * Filter fns
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * Multi-select ("checkbox list") filter. Both sides are stringified
 * before comparing so filter options work regardless of whether the
 * underlying value is a string, number, or boolean (e.g. a `value: 1`
 * checkbox correctly matches a row whose accessed value is `1`).
 */
const multiSelectFilter: FilterFn<any> = (
  row,
  columnId,
  filterValue: unknown[],
) => {
  if (!filterValue || filterValue.length === 0) return true;
  const value = row.getValue(columnId);
  return filterValue.some((fv) => String(fv) === String(value));
};

/** Lowercases and strips diacritics so "café" ~ "cafe", "É" ~ "e", etc. */
function normalizeText(value: unknown): string {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/** Classic edit-distance, short-circuited once it exceeds `threshold`. */
function levenshteinWithin(a: string, b: string, threshold: number): boolean {
  if (Math.abs(a.length - b.length) > threshold) return false;
  if (a === b) return true;

  let prevRow = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const currRow = [i];
    let rowMin = currRow[0];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const val = Math.min(
        prevRow[j] + 1, // deletion
        currRow[j - 1] + 1, // insertion
        prevRow[j - 1] + cost, // substitution
      );
      currRow.push(val);
      if (val < rowMin) rowMin = val;
    }
    if (rowMin > threshold) return false; // whole row exceeded threshold
    prevRow = currRow;
  }
  return prevRow[b.length] <= threshold;
}

/**
 * Approximate ("fuzzy") match: exact substring matches always pass; on a
 * miss, falls back to a small edit-distance check per word so minor typos
 * ("jhon" → "john", "adres" → "address") still match.
 *
 * Numbers are excluded from the fuzzy fallback: edit-distance tolerance
 * doesn't make sense for identifiers/counts (searching "123" should not
 * also surface id 124), so numeric values only ever match by substring.
 */
function approximateIncludes(haystack: unknown, needle: string): boolean {
  const h = normalizeText(haystack);
  const n = normalizeText(needle);
  if (!n) return true;
  if (!h) return false;
  if (h.includes(n)) return true;

  const isNumeric =
    typeof haystack === "number" ||
    (haystack !== "" && !isNaN(Number(haystack)));
  if (isNumeric) return false;

  const threshold = n.length <= 4 ? 1 : n.length <= 8 ? 2 : 3;
  return h
    .split(/\s+/)
    .filter(Boolean)
    .some((word) => levenshteinWithin(word, n, threshold));
}

/** Per-column free-text filter with approximate/fuzzy matching. */
const approximateTextFilter: FilterFn<any> = (row, columnId, filterValue) => {
  const search = String(filterValue ?? "").trim();
  if (!search) return true;
  return approximateIncludes(row.getValue(columnId), search);
};

/** Global search across all visible cells, with approximate matching. */
const globalContainsFilter: FilterFn<any> = (row, _columnId, filterValue) => {
  const search = String(filterValue ?? "").trim();
  if (!search) return true;
  return row
    .getAllCells()
    .some((cell) => approximateIncludes(cell.getValue(), search));
};

function normalizeOptions(
  values?: (FilterOption | string | number)[],
  valueLabels?: string[],
): FilterOption[] | undefined {
  if (!values || values.length === 0) return undefined;
  return values.map((v, i) => {
    const base: FilterOption =
      typeof v === "object" && v !== null && "value" in (v as object)
        ? (v as FilterOption)
        : { label: String(v), value: v as string | number };
    const overrideLabel = valueLabels?.[i];
    return overrideLabel !== undefined
      ? { ...base, label: overrideLabel }
      : base;
  });
}

/**
 * Renders a raw cell value using the column's `render`, falling
 * back to plain text (wrapped in a fragment) when none was provided.
 * `render` is a factory — `(row) => Component | ReactNode` — so
 * the result can vary per row. Two shapes are supported:
 *
 * - A component/tag (function or string like `"strong"`): the raw value
 *   is wrapped in it as `children`.
 * - An already-built element (e.g. `<span>{row.email}</span>`): used
 *   as-is, raw value ignored (the callback already had the full row).
 */
function renderCellValue<T>(
  raw: unknown,
  row: T,
  render?: render<T>,
): ReactNode {
  if (render) {
    const result = render(row);

    if (isValidElement(result)) {
      return result;
    }

    if (typeof result === "function" || typeof result === "string") {
      if (raw === null || raw === undefined || raw === "") {
        return <span className="text-gray-400">—</span>;
      }
      const Comp = result as ComponentType<{ children?: ReactNode }>;
      return <Comp>{raw as ReactNode}</Comp>;
    }

    // Any other ReactNode returned directly (number, fragment, null...)
    return result as ReactNode;
  }

  if (raw === null || raw === undefined || raw === "") {
    return <span className="text-gray-400">—</span>;
  }

  return <>{raw as ReactNode}</>;
}

/* ────────────────────────────────────────────────────────────────────────
 * Table<T>
 * ──────────────────────────────────────────────────────────────────────── */

export default function Table<T>({
  headers,
  fetcher,
  sorter,
  filter,
  onClickRow,
  actions,
  loading = false,
  loadingMessage,
  emptyMessage,
  configErrorMessage,
  pageSizeOptions = [10, 20, 50, 100, 200],
  defaultPageSize = 10,
  stickyHeader = true,
  className = "",
  showGlobalSearch = true,
  showPagination = true,
  keyExtractor,
  entityName,
  tableOptions,
}: TableProps<T>) {
  const { t } = useLanguage();
  const effectiveLoadingMessage = loadingMessage ?? t.common.loading;
  const effectiveEmptyMessage = emptyMessage ?? t.common.noData;
  const effectiveConfigErrorMessage =
    configErrorMessage ?? t.table.configErrorMessage;
  const effectiveEntityName = entityName ?? t.table.row;
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [searchInputValue, setSearchInputValue] = useState("");
  const [customData, setCustomData] = useState<T[] | null>(null);
  const [customTotal, setCustomTotal] = useState<number | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [openRowId, setOpenRowId] = useState<string | null>(null);

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

    setFetchLoading(true);
    setFetchError(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher, usesServerPagination, depPageIndex, depPageSize]);

  const data = customData ?? fetchedData;
  const effectiveLoading = loading || fetchLoading;

  const effectiveTotal =
    customTotal !== null
      ? customTotal
      : customData !== null
        ? customData.length
        : fetchedTotal;

  const applyCustomResult = (res: any) => {
    if (res && typeof res === "object" && !Array.isArray(res) && Array.isArray(res.data)) {
      setCustomData(res.data);
      const total =
        typeof res.total === "number"
          ? res.total
          : typeof res.additionalData?.totalCount === "number"
            ? res.additionalData.totalCount
            : res.data.length;
      setCustomTotal(total);
    } else if (Array.isArray(res)) {
      setCustomData(res);
      setCustomTotal(res.length);
    } else {
      setCustomData(null);
      setCustomTotal(null);
    }
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const runCustomFilter = (attribute: keyof T | string, value: any) => {
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

  useEffect(() => {
    if (usesServerPagination) {
      const maxPageIndex = Math.max(
        0,
        Math.ceil(effectiveTotal / pagination.pageSize) - 1,
      );
      if (pagination.pageIndex > maxPageIndex) {
        setPagination((prev) => ({ ...prev, pageIndex: maxPageIndex }));
      }
    }
  }, [
    effectiveTotal,
    pagination.pageSize,
    pagination.pageIndex,
    usesServerPagination,
  ]);

  const hasActions = !!actions && actions.length > 0;

  const columns = useMemo<ColumnDef<T, any>[]>(
    () =>
      headers.map((h, i) => {
        const id = h.accessorKey ?? h.mapTo ?? `col_${i}`;
        const options = normalizeOptions(h.values, h.valueLabels);
        // Sort/filter off of accessorKey when present, otherwise fall
        // back to mapTo (the field actually shown in the cell) so a
        // column defined with only `mapTo` still sorts/filters correctly.
        const dataKey = h.accessorKey ?? h.mapTo;

        return {
          id,
          header: h.name,
          accessorFn:
            h.accessorFn ??
            ((row: T) =>
              dataKey
                ? (row as Record<string, unknown>)[dataKey]
                : (row as Record<string, unknown>)[h.name]),
          enableSorting: h.allowSort ?? true,
          enableColumnFilter: h.showFilter ?? true,
          filterFn: options ? "multiSelect" : "approximateText",
          cell: (info) => {
            const raw = h.mapTo
              ? (info.row.original as Record<string, unknown>)[h.mapTo]
              : info.getValue();
            if (h.cell) return h.cell(raw, info.row.original, info.row.index);
            return renderCellValue(raw, info.row.original, h.render);
          },
          meta: {
            icon: h.icon,
            values: options,
            showFilter: h.showFilter ?? true,
            headerClassName: h.headerClassName,
            cellClassName: h.cellClassName,
            width: h.width,
          },
        } satisfies ColumnDef<T, any>;
      }),
    [headers],
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, globalFilter, pagination },
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    filterFns: {
      multiSelect: multiSelectFilter,
      approximateText: approximateTextFilter,
    },
    globalFilterFn: globalContainsFilter,
    getRowId: keyExtractor
      ? (row, index) => String(keyExtractor(row, index))
      : undefined,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    // Server pagination mode: rows already arrive pre-paginated from the
    // fetcher, so TanStack shouldn't slice them again — just trust
    // `fetchedTotal` for page-count math. Sorting/filtering still run
    // client-side, but only over the currently loaded page. In client
    // pagination mode `fetchedData` holds the whole dataset, so regular
    // automatic pagination/sorting/filtering apply.
    manualPagination: usesServerPagination,
    pageCount: usesServerPagination
      ? Math.max(1, Math.ceil(effectiveTotal / pagination.pageSize))
      : undefined,
    ...tableOptions,
  });

  const filterableColumns = table
    .getAllColumns()
    .filter((c) => c.getCanFilter() && (c.columnDef.meta?.showFilter ?? true));
  const hasFilterableColumns = filterableColumns.length > 0;
  const activeFilterCount = columnFilters.length + (globalFilter ? 1 : 0);
  const totalColumns = headers.length + (hasActions ? 1 : 0);
  const rows = table.getRowModel().rows;

  const resolvedPageSizeOptions = pageSizeOptions.includes(defaultPageSize)
    ? pageSizeOptions
    : [...pageSizeOptions, defaultPageSize].sort((a, b) => a - b);

  const clearAll = () => {
    setColumnFilters([]);
    setGlobalFilter("");
    setSearchInputValue("");
    setCustomData(null);
    setCustomTotal(null);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const executeGlobalFilter = (val: string) => {
    setGlobalFilter(val);
    runCustomFilter("global", val);
  };

  if (!configValid) {
    return (
      <Card className="p-6 text-center text-sm text-red-600 border border-red-200 bg-red-50/60 rounded-lg">
        <strong className="font-semibold">{t.table.configError}</strong>{" "}
        {effectiveConfigErrorMessage}
      </Card>
    );
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* ── Toolbar: global search + filters toggle ─────────────────── */}
      {(showGlobalSearch || hasFilterableColumns) && (
        <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {/* 1. Phần Header: Tìm kiếm & Nút Filters */}
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between w-full">
            {showGlobalSearch ? (
              <div className="relative flex-1 max-w-md w-full">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  type="text"
                  placeholder={`${t.common.search} ${effectiveEntityName}…`}
                  value={searchInputValue}
                  onChange={(e) => setSearchInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      executeGlobalFilter(searchInputValue);
                    }
                  }}
                  className="w-full pl-9 pr-9 py-2 text-sm bg-white border border-gray-200 rounded-lg placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 shadow-sm"
                />
                {searchInputValue && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInputValue("");
                      executeGlobalFilter("");
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                    title={t.table.clearSearch}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3 sm:w-auto w-full justify-between sm:justify-end">
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-xs font-semibold text-gray-500 hover:text-red-600 px-2 py-1.5 rounded-md hover:bg-red-50/50 transition-all duration-250 active:scale-95"
                >
                  {t.table.clearAll}
                </button>
              )}

              {hasFilterableColumns && (
                <button
                  type="button"
                  onClick={() => setFiltersOpen((o) => !o)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg border shadow-sm transition-all duration-200 focus:outline-none focus:ring-4 ${
                    activeFilterCount > 0 || filtersOpen
                      ? "bg-primary/5 border-primary/30 text-primary focus:ring-primary/10"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 focus:ring-gray-100"
                  }`}
                >
                  <Filter
                    size={15}
                    className={
                      activeFilterCount > 0 || filtersOpen
                        ? "text-primary"
                        : "text-gray-500"
                    }
                  />
                  <span>{t.table.filters}</span>
                  {activeFilterCount > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-white text-[11px] font-semibold leading-none">
                      {activeFilterCount}
                    </span>
                  )}
                  {filtersOpen ? (
                    <ChevronUp size={14} className="text-gray-400 ml-0.5" />
                  ) : (
                    <ChevronDown size={14} className="text-gray-400 ml-0.5" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* 2. Phần Detail: Panel mở rộng các bộ lọc */}
          {hasFilterableColumns && (
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                filtersOpen
                  ? "max-h-[500px] opacity-100 visible border-t border-gray-100"
                  : "max-h-0 opacity-0 invisible"
              }`}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-white">
                {filterableColumns.map((column) => (
                  <ColumnFilterControl
                    key={column.id}
                    column={column}
                    onFilterSubmit={(attr, val) => runCustomFilter(attr, val)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Table ────────────────────────────────────────────────────── */}
      <Card noPadding className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead
              className={`bg-primary text-white ${
                stickyHeader ? "sticky top-0 z-10" : ""
              }`}
            >
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const meta = header.column.columnDef.meta;
                    const canSort = header.column.getCanSort();
                    const sortDir = header.column.getIsSorted();
                    return (
                      <th
                        key={header.id}
                        style={meta?.width ? { width: meta.width } : undefined}
                        className={
                          meta?.headerClassName ??
                          "px-4 py-3 text-left text-sm font-bold tracking-wider whitespace-nowrap"
                        }
                      >
                        <button
                          type="button"
                          disabled={!canSort}
                          onClick={header.column.getToggleSortingHandler()}
                          className={`inline-flex items-center gap-1.5 ${
                            canSort
                              ? "cursor-pointer select-none"
                              : "cursor-default"
                          }`}
                        >
                          {meta?.icon}
                          <span>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                          </span>
                          {canSort &&
                            (sortDir === "asc" ? (
                              <ChevronUp size={14} />
                            ) : sortDir === "desc" ? (
                              <ChevronDown size={14} />
                            ) : (
                              <ChevronsUpDown
                                size={14}
                                className="opacity-50"
                              />
                            ))}
                        </button>
                      </th>
                    );
                  })}
                  {hasActions && (
                    <th
                      key="actions-header"
                      className="px-4 py-3 text-center text-xs font-bold w-12"
                    >
                      <span className="sr-only">{t.common.actions}</span>
                    </th>
                  )}
                </tr>
              ))}
            </thead>

            <tbody className="divide-y divide-gray-200">
              <tr className="sr-only">
                <td role="status">{effectiveLoading ? effectiveLoadingMessage : ""}</td>
              </tr>

              {fetchError ? (
                <tr>
                  <td
                    colSpan={totalColumns}
                    className="px-4 py-8 text-center text-sm text-red-600"
                  >
                    {fetchError}
                  </td>
                </tr>
              ) : effectiveLoading ? (
                Array.from({ length: 5 }).map((_, rowIndex) => (
                  <tr
                    key={`skeleton-row-${rowIndex}`}
                    className={
                      rowIndex % 2 === 0 ? "bg-gray-50/50" : "bg-white"
                    }
                  >
                    {headers.map((h, colIndex) => (
                      <td
                        key={`skeleton-cell-${colIndex}`}
                        className={
                          h.cellClassName ?? "px-4 py-3 text-sm text-gray-700"
                        }
                      >
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                      </td>
                    ))}
                    {hasActions && (
                      <td
                        key="skeleton-actions"
                        className="px-4 py-3 text-center"
                      >
                        <div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse mx-auto" />
                      </td>
                    )}
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={totalColumns}
                    className="px-4 py-8 text-center text-sm text-gray-500"
                  >
                    {effectiveEmptyMessage}
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => (
                  <tr
                    key={row.id}
                    onClick={() => onClickRow?.(row.original)}
                    onKeyDown={(event) => {
                      if (!onClickRow) return;
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onClickRow(row.original);
                      }
                    }}
                    tabIndex={onClickRow ? 0 : undefined}
                    role={onClickRow ? "button" : undefined}
                    className={`hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                      onClickRow ? "cursor-pointer" : ""
                    } ${idx % 2 === 0 ? "bg-gray-50/50" : "bg-white"}`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={
                          cell.column.columnDef.meta?.cellClassName ??
                          "px-4 py-3 text-sm text-gray-700"
                        }
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                    {hasActions && (
                      <td
                        key="actions"
                        className="px-4 py-3 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ActionsMenu
                          row={row.original}
                          actions={actions!}
                          isOpen={openRowId === row.id}
                          onToggle={() =>
                            setOpenRowId((o) => (o === row.id ? null : row.id))
                          }
                          onClose={() => setOpenRowId(null)}
                        />
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Pagination ───────────────────────────────────────────────── */}
      {showPagination &&
        !effectiveLoading &&
        !fetchError &&
        rows.length > 0 && (
          <TablePagination
            table={table}
            pageSizeOptions={resolvedPageSizeOptions}
            entityName={effectiveEntityName}
            totalCount={
              usesServerPagination
                ? effectiveTotal
                : table.getFilteredRowModel().rows.length
            }
          />
        )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * Column filter control — checkbox dropdown when `values` is provided,
 * otherwise a free-text input.
 * ──────────────────────────────────────────────────────────────────────── */

function ColumnFilterControl<T>({
  column,
  onFilterSubmit,
}: {
  column: TanstackColumn<T, any>;
  onFilterSubmit?: (attribute: string, value: any) => void;
}) {
  const meta = column.columnDef.meta;
  const label =
    typeof column.columnDef.header === "string"
      ? column.columnDef.header
      : column.id;
  const options = meta?.values;
  const filterValue = column.getFilterValue();

  if (options && options.length > 0) {
    const selected: (string | number | boolean)[] = Array.isArray(filterValue)
      ? filterValue
      : [];

    const toggle = (value: string | number | boolean) => {
      const next = selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value];
      const val = next.length ? next : undefined;
      column.setFilterValue(val);
      onFilterSubmit?.(column.id, val);
    };

    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-500">{label}</label>
        <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto rounded-lg border border-gray-200 bg-white p-2">
          {options.map((opt) => {
            const active = selected.includes(opt.value);
            return (
              <button
                type="button"
                key={String(opt.value)}
                onClick={() => toggle(opt.value)}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border transition-colors ${
                  active
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {active && <Check size={12} />}
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <ColumnTextFilterInput
      column={column}
      label={label}
      onFilterSubmit={onFilterSubmit}
    />
  );
}

function ColumnTextFilterInput<T>({
  column,
  label,
  onFilterSubmit,
}: {
  column: TanstackColumn<T, any>;
  label: string;
  onFilterSubmit?: (attribute: string, value: any) => void;
}) {
  const { t } = useLanguage();
  const filterValue = column.getFilterValue();
  const [localText, setLocalText] = useState((filterValue as string) ?? "");

  useEffect(() => {
    setLocalText((filterValue as string) ?? "");
  }, [filterValue]);

  const submitFilter = () => {
    const val = localText || undefined;
    column.setFilterValue(val);
    onFilterSubmit?.(column.id, val);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-500">{label}</label>
      <input
        type="text"
        value={localText}
        onChange={(e) => setLocalText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submitFilter();
          }
        }}
        placeholder={`${t.common.filter} ${label.toLowerCase()}…`}
        className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
      />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * Row actions kebab menu
 * ──────────────────────────────────────────────────────────────────────── */

function ActionsMenu<T>({
  row,
  actions,
  isOpen,
  onToggle,
  onClose,
}: {
  row: T;
  actions: TableAction<T>[];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  const visibleActions = actions.filter((a) => !a.hidden?.(row));
  if (visibleActions.length === 0) return null;

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button
        type="button"
        onClick={onToggle}
        aria-label={t.table.rowActions}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <MoreVertical size={16} />
      </button>
      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-1 w-44 origin-top-right rounded-lg border border-gray-100 bg-white shadow-lg py-1"
        >
          {visibleActions.map((action, i) => (
            <button
              key={`${action.label}-${i}`}
              type="button"
              role="menuitem"
              onClick={() => {
                action.handler?.(row);
                onClose();
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
                action.danger
                  ? "text-red-600 hover:bg-red-50"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * Pagination bar — same visual as the original Pagination component,
 * wired directly to the TanStack table instance.
 * ──────────────────────────────────────────────────────────────────────── */

function TablePagination<T>({
  table,
  pageSizeOptions,
  entityName,
  totalCount,
}: {
  table: TanstackTable<T>;
  pageSizeOptions: number[];
  entityName: string;
  totalCount: number;
}) {
  const { t } = useLanguage();
  const { pageIndex, pageSize } = table.getState().pagination;
  const pageCount = Math.max(1, table.getPageCount());
  const currentPage = pageIndex + 1;

  const pageNumbers = useMemo(() => {
    const windowSize = 5;
    let start = Math.max(1, currentPage - Math.floor(windowSize / 2));
    const end = Math.min(pageCount, start + windowSize - 1);
    start = Math.max(1, end - windowSize + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [currentPage, pageCount]);

  return (
    <nav
      aria-label={`${entityName} ${t.pagination.pagination}`}
      className="flex flex-col sm:flex-row items-center justify-between px-2 py-4 gap-4"
    >
      {/* Left: page size + total */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <label
            htmlFor={`${entityName}-page-size`}
            className="text-sm font-medium text-main/80"
          >
            {t.pagination.rowsPerPage}
          </label>
          <div className="relative">
            <select
              id={`${entityName}-page-size`}
              className="appearance-none pl-3 pr-8 py-1.5 text-sm font-medium rounded-lg border border-gray-200 bg-white text-main hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
              value={pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-gray-400">
              <ChevronDown size={16} />
            </div>
          </div>
        </div>

        <div className="h-4 w-[1px] bg-gray-200 hidden sm:block"></div>

        <span className="text-sm text-main/60 font-normal">
          {t.common.total}{" "}
          <span className="font-semibold text-main">{totalCount}</span>{" "}
          {entityName}
        </span>
      </div>

      {/* Right: nav buttons */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          aria-label={t.pagination.previousPage}
          className="p-2 rounded-lg transition-all text-main hover:bg-gray-50 border border-transparent hover:border-gray-100 disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1">
          {pageNumbers.map((page) => {
            const isActive = currentPage === page;
            return (
              <button
                type="button"
                key={page}
                onClick={() => table.setPageIndex(page - 1)}
                aria-current={isActive ? "page" : undefined}
                aria-label={`${t.pagination.goToPage} ${page}`}
                className={`min-w-[36px] h-9 px-2 text-sm font-medium rounded-full transition-all flex items-center justify-center ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-main hover:bg-gray-50 border border-transparent hover:border-gray-100"
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          aria-label={t.pagination.nextPage}
          className="p-2 rounded-lg transition-all text-main hover:bg-gray-50 border border-transparent hover:border-gray-100 disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}
