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
      {row.getVisibleCells().map((cell) => (
        <td
          key={cell.id}
          className={
            cell.column.columnDef.meta?.cellClassName ??
            "px-4 py-3 text-sm text-gray-700"
          }
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
            isOpen={isMenuOpen}
            onToggle={onToggleMenu}
            onClose={onCloseMenu}
          />
        </td>
      )}
    </tr>
  );
}
