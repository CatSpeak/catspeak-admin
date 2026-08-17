import type { FilterFn } from "@tanstack/react-table";
import { approximateIncludes } from "./fuzzyMatch";
import {
  formatDateToUtcStartOfDay,
  formatDateToUtcEndOfDay,
} from "../../../../lib/utils";

/**
 * Choice filter (supports both single select and multi-select options).
 * Both sides are stringified before comparing so filter options work
 * regardless of whether the underlying value is a string, number, or boolean
 * (e.g. a `value: 1` option correctly matches a row whose accessed value is `1`).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const multiSelectFilter: FilterFn<any> = (
  row,
  columnId,
  filterValue: unknown,
) => {
  if (filterValue === undefined || filterValue === null || filterValue === "") return true;
  const value = row.getValue(columnId);
  if (Array.isArray(filterValue)) {
    if (filterValue.length === 0) return true;
    return filterValue.some((fv) => String(fv) === String(value));
  }
  return String(filterValue) === String(value);
};

/** Per-column free-text filter with approximate/fuzzy matching. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const approximateTextFilter: FilterFn<any> = (
  row,
  columnId,
  filterValue,
) => {
  const search = String(filterValue ?? "").trim();
  if (!search) return true;
  return approximateIncludes(row.getValue(columnId), search);
};

/** Global search across all visible cells, with approximate matching. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const globalContainsFilter: FilterFn<any> = (
  row,
  _columnId,
  filterValue,
) => {
  const search = String(filterValue ?? "").trim();
  if (!search) return true;
  return row
    .getAllCells()
    .some((cell) => approximateIncludes(cell.getValue(), search));
};

/** Date range filter for columns with isDuration: true */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const dateRangeFilter: FilterFn<any> = (
  row,
  columnId,
  filterValue: [string, string] | { fromDate?: string; toDate?: string } | undefined,
) => {
  if (!filterValue) return true;
  const fromDate = Array.isArray(filterValue)
    ? filterValue[0]
    : filterValue.fromDate;
  const toDate = Array.isArray(filterValue)
    ? filterValue[1]
    : filterValue.toDate;
  if (!fromDate && !toDate) return true;

  const raw = row.getValue(columnId);
  if (!raw) return false;
  const rowDate = new Date(raw as string | number | Date).getTime();
  if (isNaN(rowDate)) return true;

  if (fromDate) {
    const isoStart = formatDateToUtcStartOfDay(fromDate);
    if (isoStart) {
      const from = new Date(isoStart).getTime();
      if (!isNaN(from) && rowDate < from) return false;
    }
  }
  if (toDate) {
    const isoEnd = formatDateToUtcEndOfDay(toDate);
    if (isoEnd) {
      const toTime = new Date(isoEnd).getTime();
      if (!isNaN(toTime) && rowDate > toTime) return false;
    }
  }
  return true;
};

