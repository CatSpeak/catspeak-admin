import type { FilterFn } from "@tanstack/react-table";
import { approximateIncludes } from "./fuzzyMatch";

/**
 * Multi-select ("checkbox list") filter. Both sides are stringified
 * before comparing so filter options work regardless of whether the
 * underlying value is a string, number, or boolean (e.g. a `value: 1`
 * checkbox correctly matches a row whose accessed value is `1`).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const multiSelectFilter: FilterFn<any> = (
  row,
  columnId,
  filterValue: unknown[],
) => {
  if (!filterValue || filterValue.length === 0) return true;
  const value = row.getValue(columnId);
  return filterValue.some((fv) => String(fv) === String(value));
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
