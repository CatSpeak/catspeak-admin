import { flexRender, type Row } from "@tanstack/react-table";
import ActionsMenu from "./ActionsMenu";
import type { TableAction } from "../types";
import "../types"; // ensure TanStack ColumnMeta module augmentation is loaded

export interface TableRowProps<T> {
  row: Row<T>;
  idx: number;
  onClickRow?: (row: T) => void;
  hasActions?: boolean;
  actions?: TableAction<T>[];
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
}

export default function TableRow<T>({
  row,
  idx,
  onClickRow,
  hasActions = false,
  actions,
  isMenuOpen,
  onToggleMenu,
  onCloseMenu,
}: TableRowProps<T>) {
  return (
    <tr
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
      {row.getVisibleCells().map((cell) => {
        const meta = cell.column.columnDef.meta
        const isPinnedRight = meta?.pinned === "right"
        const isPinnedLeft = meta?.pinned === "left"
        const baseCellClass =
          meta?.cellClassName ?? "px-4 py-3 text-sm text-gray-700"
        // Sticky cells need explicit bg to cover scrolled content
        const rowBg = idx % 2 === 0 ? "bg-gray-50" : "bg-white"
        // For custom cellClassName that already sets bg, preserve it but ensure sticky covers
        const pinnedExtra = isPinnedRight
          ? ` sticky right-0 z-10 ${rowBg} shadow-[-2px_0_6px_rgba(0,0,0,0.06)] border-l border-gray-200`
          : isPinnedLeft
            ? ` sticky left-0 z-10 ${rowBg} shadow-[2px_0_6px_rgba(0,0,0,0.06)] border-r border-gray-200`
            : ""
        return (
          <td
            key={cell.id}
            className={`${baseCellClass}${pinnedExtra}`}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        )
      })}
      {hasActions && (
        <td
          key="actions"
          className={`px-4 py-3 text-center sticky right-0 z-10 ${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} shadow-[-2px_0_6px_rgba(0,0,0,0.06)] border-l border-gray-200`}
          onClick={(e) => e.stopPropagation()}
        >
          <ActionsMenu
            row={row.original}
            actions={actions!}
            isOpen={isMenuOpen}
            onToggle={onToggleMenu}
            onClose={onCloseMenu}
          />
        </td>
      )}
    </tr>
  );
}
