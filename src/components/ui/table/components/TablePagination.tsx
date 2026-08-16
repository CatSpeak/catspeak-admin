import { useMemo } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import type { Table as TanstackTable } from "@tanstack/react-table";
import { useLanguage } from "../../../../stores/languageStore";

export interface TablePaginationProps<T> {
  table: TanstackTable<T>;
  pageSizeOptions: number[];
  entityName: string;
  totalCount: number;
}

export default function TablePagination<T>({
  table,
  pageSizeOptions,
  entityName,
  totalCount,
}: TablePaginationProps<T>) {
  const { t } = useLanguage();
  const { pageIndex, pageSize } = table.getState().pagination;
  const pageCount = Math.max(1, table.getPageCount());
  const currentPage = pageIndex + 1;

  const pageNumbers = useMemo(() => {
    const windowSize = 5;
    let start = Math.max(1, currentPage - Math.floor(windowSize / 2));
    const end = Math.min(pageCount, start + windowSize - 1);
    start = Math.max(1, end - windowSize + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [currentPage, pageCount]);

  return (
    <nav
      aria-label={`${entityName} ${t.pagination.pagination}`}
      className="flex flex-col sm:flex-row items-center justify-between px-2 py-4 gap-4"
    >
      {/* Left: page size + total */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <label
            htmlFor={`${entityName}-page-size`}
            className="text-sm font-medium text-main/80"
          >
            {t.pagination.rowsPerPage}
          </label>
          <div className="relative">
            <select
              id={`${entityName}-page-size`}
              className="appearance-none pl-3 pr-8 py-1.5 text-sm font-medium rounded-lg border border-gray-200 bg-white text-main hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
              value={pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-gray-400">
              <ChevronDown size={16} />
            </div>
          </div>
        </div>

        <div className="h-4 w-[1px] bg-gray-200 hidden sm:block"></div>

        <span className="text-sm text-main/60 font-normal">
          {t.common.total}{" "}
          <span className="font-semibold text-main">{totalCount}</span>{" "}
          {entityName}
        </span>
      </div>

      {/* Right: nav buttons */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          aria-label={t.pagination.previousPage}
          className="p-2 rounded-lg transition-all text-main hover:bg-gray-50 border border-transparent hover:border-gray-100 disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1">
          {pageNumbers.map((page) => {
            const isActive = currentPage === page;
            return (
              <button
                type="button"
                key={page}
                onClick={() => table.setPageIndex(page - 1)}
                aria-current={isActive ? "page" : undefined}
                aria-label={`${t.pagination.goToPage} ${page}`}
                className={`min-w-[36px] h-9 px-2 text-sm font-medium rounded-full transition-all flex items-center justify-center ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-main hover:bg-gray-50 border border-transparent hover:border-gray-100"
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          aria-label={t.pagination.nextPage}
          className="p-2 rounded-lg transition-all text-main hover:bg-gray-50 border border-transparent hover:border-gray-100 disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}
