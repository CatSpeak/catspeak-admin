import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageNumbers: number[];
  totalCount: number;
  itemsPerPage: number;
  entityName: string;
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
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 rounded-lg bg-orange-50 border border-orange-100 gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700">Rows per page:</span>
        <select
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
          Total: {totalCount} {entityName}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={disabled || currentPage === 1}
          className="p-1.5 rounded transition-colors disabled:opacity-40 text-primary hover:bg-primary/10 disabled:hover:bg-transparent"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1">
          {pageNumbers.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                currentPage === page
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={disabled || currentPage === totalPages}
          className="p-1.5 rounded transition-colors disabled:opacity-40 text-primary hover:bg-primary/10 disabled:hover:bg-transparent"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
