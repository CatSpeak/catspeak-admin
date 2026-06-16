import type { ReactNode } from "react";
import Card from "./Card";

/* ── Column definition ── */
export interface Column<T> {
  /** Header label */
  header: string;
  /** How to render the cell for this column */
  render: (item: T, index: number) => ReactNode;
  /** Optional className overrides for the <th> */
  headerClassName?: string;
  /** Optional className overrides for the <td> */
  cellClassName?: string;
}

/* ── Component props ── */
interface DataTableProps<T> {
  /** Column definitions */
  columns: Column<T>[];
  /** Data array */
  data: T[];
  /** Unique key extractor */
  keyExtractor: (item: T) => string | number;
  /** Show loading spinner */
  loading?: boolean;
  /** Loading message text */
  loadingMessage?: string;
  /** Show when data is empty */
  emptyMessage?: string;
  /** Error message to display above the table */
  error?: string | null;
  /** Called when a row is clicked */
  onRowClick?: (item: T) => void;
  /** Optional extra actions column rendered at the end of each row */
  renderActions?: (item: T) => ReactNode;
}

export default function DataTable<T>({
  columns,
  data,
  keyExtractor,
  loading = false,
  emptyMessage = "No data found",
  error,
  onRowClick,
  renderActions,
}: DataTableProps<T>) {
  const totalColumns = columns.length + (renderActions ? 1 : 0);

  return (
    <>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-600 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <Card noPadding className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            {/* Header */}
            <thead className="bg-primary text-white">
              <tr>
                {columns.map((col, index) => (
                  <th
                    key={`${col.header}-${index}`}
                    className={
                      col.headerClassName ??
                      "px-4 py-3 text-left text-sm font-bold tracking-wider whitespace-nowrap"
                    }
                  >
                    {col.header}
                  </th>
                ))}
                {renderActions && (
                  <th className="px-4 py-3 text-center text-xs font-bold w-12">
                    <span className="sr-only">Actions</span>
                  </th>
                )}
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                Array.from({ length: 5 }).map((_, rowIndex) => (
                  <tr
                    key={`skeleton-row-${rowIndex}`}
                    className={rowIndex % 2 === 0 ? "bg-gray-50/50" : "bg-white"}
                  >
                    {columns.map((col, colIndex) => (
                      <td
                        key={`skeleton-cell-${colIndex}`}
                        className={col.cellClassName ?? "px-4 py-3 text-sm text-gray-700"}
                      >
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                      </td>
                    ))}
                    {renderActions && (
                      <td className="px-4 py-3 text-center">
                        <div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse mx-auto" />
                      </td>
                    )}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={totalColumns}
                    className="px-4 py-8 text-center text-sm text-gray-500"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((item, idx) => (
                  <tr
                    key={keyExtractor(item)}
                    onClick={() => onRowClick?.(item)}
                    onKeyDown={(event) => {
                      if (!onRowClick) return;
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onRowClick(item);
                      }
                    }}
                    tabIndex={onRowClick ? 0 : undefined}
                    role={onRowClick ? "button" : undefined}
                    className={`hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${onRowClick ? "cursor-pointer" : ""
                      } ${idx % 2 === 0 ? "bg-gray-50/50" : "bg-white"}`}
                  >
                    {columns.map((col, index) => (
                      <td
                        key={`${col.header}-${index}`}
                        className={col.cellClassName ?? "px-4 py-3 text-sm text-gray-700"}
                      >
                        {col.render(item, idx)}
                      </td>
                    ))}
                    {renderActions && (
                      <td
                        className="px-4 py-3 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {renderActions(item)}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
