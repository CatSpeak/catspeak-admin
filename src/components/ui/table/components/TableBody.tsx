import type { Table as TanstackTable } from "@tanstack/react-table";
import { AlertCircle, Inbox } from "lucide-react";
import { useLanguage } from "../../../../stores/languageStore";
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
  fetchError: string | null;
  emptyMessage?: string;
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
  fetchError,
  emptyMessage,
}: TableBodyProps<T>) {
  const { t } = useLanguage();
  const rows = table.getRowModel().rows;
  const resolvedEmptyMessage = emptyMessage ?? t.common.noData;

  return (
    <tbody className="divide-y divide-gray-200">
      <tr className="sr-only">
        <td role="status">{effectiveLoading ? t.common.loading : ""}</td>
      </tr>

      {fetchError ? (
        <tr>
          <td
            colSpan={totalColumns}
            className="px-4 py-12 text-center"
          >
            <div className="flex flex-col items-center justify-center gap-2.5 max-w-sm mx-auto">
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                <AlertCircle size={22} />
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {t.table.error}
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">
                {fetchError &&
                fetchError !== "Error" &&
                fetchError !== "Failed to load data." &&
                fetchError !== "Failed to filter data."
                  ? fetchError
                  : t.table.errorDesc}
              </p>
            </div>
          </td>
        </tr>
      ) : effectiveLoading ? (
        <TableSkeletonRows headers={headers} hasActions={hasActions} />
      ) : rows.length === 0 ? (
        <tr>
          <td
            colSpan={totalColumns}
            className="px-4 py-12 text-center"
          >
            <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
              <div className="w-10 h-10 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center">
                <Inbox size={22} />
              </div>
              <p className="text-sm font-semibold text-gray-700">
                {resolvedEmptyMessage}
              </p>
            </div>
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
