import {
  isValidElement,
  type ComponentType,
  type ReactNode,
} from "react";
import type { FilterOption, render } from "../types";

export function normalizeOptions(
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
export function renderCellValue<T>(
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
