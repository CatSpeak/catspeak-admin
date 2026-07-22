import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "../../stores/languageStore";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageNumbers: number[];
  totalCount: number;
  itemsPerPage: number;
  entityName?: string;
  pageSizeOptions?: number[];
  disabled?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  pageNumbers,
  totalCount,
  itemsPerPage,
  entityName,
  pageSizeOptions = [10, 50, 100, 200],
  disabled = false,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const { t } = useLanguage();
  const displayEntityName = entityName || t.table.row;

  return (
    <nav
      aria-label={`${displayEntityName} ${t.pagination.pagination}`}
      className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 rounded-lg bg-orange-50 border border-orange-100 gap-4"
    >
      <div className="flex items-center gap-2">
        <label htmlFor={`${displayEntityName}-page-size`} className="text-sm text-gray-700">
          {t.pagination.rowsPerPage}
        </label>
        <select
          id={`${displayEntityName}-page-size`}
          className="px-2 py-1 text-sm rounded border border-gray-300 bg-white focus:outline-none"
          value={itemsPerPage}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
        >
          {pageSizeOptions.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <span className="text-sm ml-2 text-gray-600">
          {t.common.total}: {totalCount} {entityName ? entityName : ""}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={disabled || currentPage === 1}
          aria-label={t.pagination.previousPage}
          className="p-1.5 rounded transition-colors disabled:opacity-40 text-primary hover:bg-primary/10 disabled:hover:bg-transparent"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1">
          {pageNumbers.map((page) => (
            <button
              type="button"
              key={page}
              onClick={() => onPageChange(page)}
              aria-current={currentPage === page ? "page" : undefined}
              aria-label={`${t.pagination.goToPage} ${page}`}
              className={`px-3 py-1 text-sm font-medium rounded transition-colors ${currentPage === page
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:bg-gray-200"
                }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={disabled || currentPage === totalPages}
          aria-label={t.pagination.nextPage}
          className="p-1.5 rounded transition-colors disabled:opacity-40 text-primary hover:bg-primary/10 disabled:hover:bg-transparent"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
}
