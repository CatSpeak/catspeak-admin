import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { ChoiceMode, TableHeader } from "../types";
import { normalizeOptions, renderCellValue } from "../utils/renderCellValue";

export function useTableColumns<T>(
  headers: TableHeader<T>[],
  defaultChoiceMode: ChoiceMode = "multi",
): ColumnDef<T, unknown>[] {
  return useMemo<ColumnDef<T, unknown>[]>(
    () =>
      headers.map((h, i) => {
        const id = h.id ?? h.accessorKey ?? h.mapTo ?? `col_${i}`;
        const options = normalizeOptions(h.values, h.valueLabels);
        // Sort/filter off of accessorKey when present, otherwise fall
        // back to mapTo (the field actually shown in the cell) so a
        // column defined with only `mapTo` still sorts/filters correctly.
        const dataKey = h.accessorKey ?? h.mapTo;
        const choiceMode = h.choiceMode ?? defaultChoiceMode;

        return {
          id,
          header: h.name,
          accessorFn:
            h.accessorFn ??
            ((row: T) =>
              dataKey
                ? (row as Record<string, unknown>)[dataKey]
                : (row as Record<string, unknown>)[h.name]),
          enableSorting: h.allowSort ?? false,
          enableColumnFilter: h.showFilter ?? false,
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
            showFilter: h.showFilter ?? false,
            choiceMode,
            isDuration: h.isDuration,
            headerClassName: h.headerClassName,
            cellClassName: h.cellClassName,
            width: h.width,
          },
        } satisfies ColumnDef<T, unknown>;
      }),
    [headers, defaultChoiceMode],
  );
}
