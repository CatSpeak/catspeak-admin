import type { Table as TanstackTable } from "@tanstack/react-table";
import type { TableHeader, TableAction } from "../types";
import TableSkeletonRows from "./TableSkeletonRows";
import TableRow from "./TableRow";

export interface TableBodyProps<T> {
  table: TanstackTable<T>;
  headers: TableHeader<T>[];
  hasActions?: boolean;
  actions?: TableAction<T>[];
  onClickRow?: (row: T) => void;
  openRowId: string | null;
  setOpenRowId: React.Dispatch<React.SetStateAction<string | null>>;
  totalColumns: number;
  effectiveLoading: boolean;
  effectiveLoadingMessage: string;
  fetchError: string | null;
  effectiveEmptyMessage: string;
}

export default function TableBody<T>({
  table,
  headers,
  hasActions = false,
  actions,
  onClickRow,
  openRowId,
  setOpenRowId,
  totalColumns,
  effectiveLoading,
  effectiveLoadingMessage,
  fetchError,
  effectiveEmptyMessage,
}: TableBodyProps<T>) {
  const rows = table.getRowModel().rows;

  return (
    <tbody className="divide-y divide-gray-200">
      <tr className="sr-only">
        <td role="status">{effectiveLoading ? effectiveLoadingMessage : ""}</td>
      </tr>

      {fetchError ? (
        <tr>
          <td
            colSpan={totalColumns}
            className="px-4 py-8 text-center text-sm text-red-600"
          >
            {fetchError}
          </td>
        </tr>
      ) : effectiveLoading ? (
        <TableSkeletonRows headers={headers} hasActions={hasActions} />
      ) : rows.length === 0 ? (
        <tr>
          <td
            colSpan={totalColumns}
            className="px-4 py-8 text-center text-sm text-gray-500"
          >
            {effectiveEmptyMessage}
          </td>
        </tr>
      ) : (
        rows.map((row, idx) => (
          <TableRow
            key={row.id}
            row={row}
            idx={idx}
            onClickRow={onClickRow}
            hasActions={hasActions}
            actions={actions}
            isMenuOpen={openRowId === row.id}
            onToggleMenu={() =>
              setOpenRowId((o) => (o === row.id ? null : row.id))
            }
            onCloseMenu={() => setOpenRowId(null)}
          />
        ))
      )}
    </tbody>
  );
}
