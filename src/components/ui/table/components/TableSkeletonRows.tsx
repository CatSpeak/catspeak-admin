import type { TableHeader } from "../types";

export interface TableSkeletonRowsProps<T> {
  headers: TableHeader<T>[];
  hasActions?: boolean;
}

export default function TableSkeletonRows<T>({
  headers,
  hasActions = false,
}: TableSkeletonRowsProps<T>) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, rowIndex) => (
        <tr
          key={`skeleton-row-${rowIndex}`}
          className={rowIndex % 2 === 0 ? "bg-gray-50/50" : "bg-white"}
        >
          {headers.map((h, colIndex) => (
            <td
              key={`skeleton-cell-${colIndex}`}
              className={h.cellClassName ?? "px-4 py-3 text-sm text-gray-700"}
            >
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
            </td>
          ))}
          {hasActions && (
            <td key="skeleton-actions" className="px-4 py-3 text-center">
              <div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse mx-auto" />
            </td>
          )}
        </tr>
      ))}
    </>
  );
}
