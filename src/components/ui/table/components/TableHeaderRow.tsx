import { flexRender, type Table as TanstackTable } from "@tanstack/react-table"
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react"
import { useLanguage } from "../../../../stores/languageStore"
import "../types" // ensure TanStack ColumnMeta module augmentation is loaded

export interface TableHeaderRowProps<T> {
  table: TanstackTable<T>
  stickyHeader?: boolean
  hasActions?: boolean
}

export default function TableHeaderRow<T>({
  table,
  stickyHeader = true,
  hasActions = false,
}: TableHeaderRowProps<T>) {
  const { t } = useLanguage()

  return (
    <thead
      className={`bg-primary text-white ${
        stickyHeader ? "sticky top-0 z-10" : ""
      }`}
    >
      {table.getHeaderGroups().map((headerGroup) => (
        <tr key={headerGroup.id}>
          {headerGroup.headers.map((header) => {
            const meta = header.column.columnDef.meta
            const canSort = header.column.getCanSort()
            const sortDir = header.column.getIsSorted()
            return (
              <th
                key={header.id}
                style={meta?.width ? { width: meta.width } : undefined}
                className={
                  meta?.headerClassName ??
                  "px-4 py-3 text-left text-sm font-bold tracking-wider whitespace-nowrap"
                }
              >
                <button
                  type="button"
                  disabled={!canSort}
                  onClick={header.column.getToggleSortingHandler()}
                  className={"inline-flex items-center gap-1.5 text-white!"}
                >
                  {meta?.icon}
                  <span>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </span>
                  {canSort &&
                    (sortDir === "asc" ? (
                      <ChevronUp size={14} />
                    ) : sortDir === "desc" ? (
                      <ChevronDown size={14} />
                    ) : (
                      <ChevronsUpDown size={14} className="opacity-50" />
                    ))}
                </button>
              </th>
            )
          })}
          {hasActions && (
            <th
              key="actions-header"
              className="px-4 py-3 text-center text-xs font-bold w-12"
            >
              <span className="sr-only">{t.common.actions}</span>
            </th>
          )}
        </tr>
      ))}
    </thead>
  )
}
