import type { ComponentType, ElementType, ReactNode } from "react";
import type { FilterFn, TableOptions } from "@tanstack/react-table";

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
  /** Optional explicit column ID to prevent key duplication */
  id?: string;
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

export interface TableProps<T> {
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
    value: unknown,
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
