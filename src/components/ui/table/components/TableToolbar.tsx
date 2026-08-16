import { useState } from "react";
import { Search, X, Filter, ChevronDown, ChevronUp } from "lucide-react";
import type { Column as TanstackColumn } from "@tanstack/react-table";
import { useLanguage } from "../../../../stores/languageStore";
import ColumnFilterControl from "./ColumnFilterControl";

export interface TableToolbarProps<T> {
  filterableColumns: TanstackColumn<T, unknown>[];
  hasFilterableColumns: boolean;
  activeFilterCount: number;
  showGlobalSearch: boolean;
  searchInputValue: string;
  setSearchInputValue: (val: string) => void;
  onSearchSubmit: (val: string) => void;
  onClearAll: () => void;
  onColumnFilterSubmit: (attribute: string, value: unknown) => void;
  entityName: string;
}

export default function TableToolbar<T>({
  filterableColumns,
  hasFilterableColumns,
  activeFilterCount,
  showGlobalSearch,
  searchInputValue,
  setSearchInputValue,
  onSearchSubmit,
  onClearAll,
  onColumnFilterSubmit,
  entityName,
}: TableToolbarProps<T>) {
  const { t } = useLanguage();
  const [filtersOpen, setFiltersOpen] = useState(false);

  if (!showGlobalSearch && !hasFilterableColumns) {
    return null;
  }

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* 1. Header: Search & Filter toggle */}
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between w-full">
        {showGlobalSearch ? (
          <div className="relative flex-1 max-w-md w-full">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder={`${t.common.search} ${entityName}…`}
              value={searchInputValue}
              onChange={(e) => setSearchInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onSearchSubmit(searchInputValue);
                }
              }}
              className="w-full pl-9 pr-9 py-2 text-sm bg-white border border-gray-200 rounded-lg placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 shadow-sm"
            />
            {searchInputValue && (
              <button
                type="button"
                onClick={() => {
                  setSearchInputValue("");
                  onSearchSubmit("");
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                title={t.table.clearSearch}
              >
                <X size={14} />
              </button>
            )}
          </div>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-3 sm:w-auto w-full justify-between sm:justify-end">
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs font-semibold text-gray-500 hover:text-red-600 px-2 py-1.5 rounded-md hover:bg-red-50/50 transition-all duration-250 active:scale-95"
            >
              {t.table.clearAll}
            </button>
          )}

          {hasFilterableColumns && (
            <button
              type="button"
              onClick={() => setFiltersOpen((o) => !o)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg border shadow-sm transition-all duration-200 focus:outline-none focus:ring-4 ${
                activeFilterCount > 0 || filtersOpen
                  ? "bg-primary/5 border-primary/30 text-primary focus:ring-primary/10"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 focus:ring-gray-100"
              }`}
            >
              <Filter
                size={15}
                className={
                  activeFilterCount > 0 || filtersOpen
                    ? "text-primary"
                    : "text-gray-500"
                }
              />
              <span>{t.table.filters}</span>
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-white text-[11px] font-semibold leading-none">
                  {activeFilterCount}
                </span>
              )}
              {filtersOpen ? (
                <ChevronUp size={14} className="text-gray-400 ml-0.5" />
              ) : (
                <ChevronDown size={14} className="text-gray-400 ml-0.5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* 2. Detail: Filters expandable grid */}
      {hasFilterableColumns && (
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            filtersOpen
              ? "max-h-[500px] opacity-100 visible border-t border-gray-100"
              : "max-h-0 opacity-0 invisible"
          }`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-white">
            {filterableColumns.map((column) => (
              <ColumnFilterControl
                key={column.id}
                column={column}
                onFilterSubmit={(attr, val) => onColumnFilterSubmit(attr, val)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
