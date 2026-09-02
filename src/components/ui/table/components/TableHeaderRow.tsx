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
            const isPinnedRight = meta?.pinned === "right"
            const isPinnedLeft = meta?.pinned === "left"
            const pinnedHeaderExtra = isPinnedRight
              ? " sticky right-0 z-20 bg-primary shadow-[-2px_0_6px_rgba(0,0,0,0.08)] border-l border-white/15"
              : isPinnedLeft
                ? " sticky left-0 z-20 bg-primary shadow-[2px_0_6px_rgba(0,0,0,0.08)] border-r border-white/15"
                : ""
            const baseHeaderClass =
              meta?.headerClassName ??
              "px-4 py-3 text-left text-sm font-bold tracking-wider whitespace-nowrap"
            return (
              <th
                key={header.id}
                style={meta?.width ? { width: meta.width } : undefined}
                className={`${baseHeaderClass}${pinnedHeaderExtra}`}
              >
                {canSort ? (
                  <button
                    type="button"
                    onClick={header.column.getToggleSortingHandler()}
                    className="inline-flex items-center gap-1.5 text-white hover:opacity-85 transition-opacity cursor-pointer"
                  >
                    {meta?.icon}
                    <span>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </span>
                    {sortDir === "asc" ? (
                      <ChevronUp size={14} />
                    ) : sortDir === "desc" ? (
                      <ChevronDown size={14} />
                    ) : (
                      <ChevronsUpDown size={14} className="opacity-50" />
                    )}
                  </button>
                ) : (
                  <div className="inline-flex items-center gap-1.5 text-white">
                    {meta?.icon}
                    <span>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </span>
                  </div>
                )}
              </th>
            )
          })}
          {hasActions && (
            <th
              key="actions-header"
              className="px-4 py-3 text-center text-xs font-bold w-12 sticky right-0 z-20 bg-primary shadow-[-2px_0_6px_rgba(0,0,0,0.08)] border-l border-white/15"
            >
              <span className="sr-only">{t.common.actions}</span>
            </th>
          )}
        </tr>
      ))}
    </thead>
  )
}
