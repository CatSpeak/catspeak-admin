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
          {headers.map((h, colIndex) => {
            const isPinnedRight = h.pinned === "right"
            const isPinnedLeft = h.pinned === "left"
            const rowBg = rowIndex % 2 === 0 ? "bg-gray-50" : "bg-white"
            const base = h.cellClassName ?? "px-4 py-3 text-sm text-gray-700"
            const pinnedExtra = isPinnedRight
              ? ` sticky right-0 z-10 ${rowBg} shadow-[-2px_0_6px_rgba(0,0,0,0.06)] border-l border-gray-200`
              : isPinnedLeft
                ? ` sticky left-0 z-10 ${rowBg} shadow-[2px_0_6px_rgba(0,0,0,0.06)] border-r border-gray-200`
                : ""
            return (
              <td
                key={`skeleton-cell-${colIndex}`}
                className={`${base}${pinnedExtra}`}
              >
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
              </td>
            )
          })}
          {hasActions && (
            <td
              key="skeleton-actions"
              className={`px-4 py-3 text-center sticky right-0 z-10 ${rowIndex % 2 === 0 ? "bg-gray-50" : "bg-white"} shadow-[-2px_0_6px_rgba(0,0,0,0.06)] border-l border-gray-200`}
            >
              <div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse mx-auto" />
            </td>
          )}
        </tr>
      ))}
    </>
  );
}
