import { useState } from "react";
import Card from "../Card";
import { useLanguage } from "../../../stores/languageStore";
import type { TableProps } from "./types";
import { useTableDataSource } from "./hooks/useTableDataSource";
import { useTableColumns } from "./hooks/useTableColumns";
import { useTanstackTableInstance } from "./hooks/useTanstackTableInstance";
import TableToolbar from "./components/TableToolbar";
import TableHeaderRow from "./components/TableHeaderRow";
import TableBody from "./components/TableBody";
import TablePagination from "./components/TablePagination";

export default function Table<T>({
  headers,
  fetcher,
  sorter,
  filter,
  onClickRow,
  actions,
  loading = false,
  loadingMessage,
  emptyMessage,
  configErrorMessage,
  pageSizeOptions = [10, 20, 50, 100, 200],
  defaultPageSize = 10,
  stickyHeader = true,
  className = "",
  showGlobalSearch = true,
  showPagination = true,
  keyExtractor,
  entityName,
  tableOptions,
}: TableProps<T>) {
  const { t } = useLanguage();
  const effectiveLoadingMessage = loadingMessage ?? t.common.loading;
  const effectiveEmptyMessage = emptyMessage ?? t.common.noData;
  const effectiveConfigErrorMessage =
    configErrorMessage ?? t.table.configErrorMessage;
  const effectiveEntityName = entityName ?? t.table.row;

  const [searchInputValue, setSearchInputValue] = useState("");
  const [openRowId, setOpenRowId] = useState<string | null>(null);

  const {
    data,
    effectiveTotal,
    effectiveLoading,
    fetchError,
    configValid,
    usesServerPagination,
    pagination,
    setPagination,
    applyCustomResult,
    runCustomFilter,
    clearCustomResult,
    setFetchLoading,
  } = useTableDataSource<T>({
    fetcher,
    filter,
    loading,
    defaultPageSize,
  });

  const columns = useTableColumns<T>(headers);

  const {
    table,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
  } = useTanstackTableInstance<T>({
    data,
    columns,
    pagination,
    setPagination,
    usesServerPagination,
    effectiveTotal,
    sorter,
    applyCustomResult,
    setFetchLoading,
    keyExtractor,
    tableOptions,
  });

  const filterableColumns = table
    .getAllColumns()
    .filter((c) => c.getCanFilter() && (c.columnDef.meta?.showFilter ?? true));
  const hasFilterableColumns = filterableColumns.length > 0;
  const activeFilterCount = columnFilters.length + (globalFilter ? 1 : 0);
  const hasActions = !!actions && actions.length > 0;
  const totalColumns = headers.length + (hasActions ? 1 : 0);
  const rows = table.getRowModel().rows;

  const resolvedPageSizeOptions = pageSizeOptions.includes(defaultPageSize)
    ? pageSizeOptions
    : [...pageSizeOptions, defaultPageSize].sort((a, b) => a - b);

  const clearAll = () => {
    setColumnFilters([]);
    setGlobalFilter("");
    setSearchInputValue("");
    clearCustomResult();
  };

  const executeGlobalFilter = (val: string) => {
    setGlobalFilter(val);
    runCustomFilter("global", val);
  };

  if (!configValid) {
    return (
      <Card className="p-6 text-center text-sm text-red-600 border border-red-200 bg-red-50/60 rounded-lg">
        <strong className="font-semibold">{t.table.configError}</strong>{" "}
        {effectiveConfigErrorMessage}
      </Card>
    );
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* ── Toolbar: global search + filters toggle ─────────────────── */}
      <TableToolbar
        filterableColumns={filterableColumns}
        hasFilterableColumns={hasFilterableColumns}
        activeFilterCount={activeFilterCount}
        showGlobalSearch={showGlobalSearch}
        searchInputValue={searchInputValue}
        setSearchInputValue={setSearchInputValue}
        onSearchSubmit={executeGlobalFilter}
        onClearAll={clearAll}
        onColumnFilterSubmit={runCustomFilter}
        entityName={effectiveEntityName}
      />

      {/* ── Table ────────────────────────────────────────────────────── */}
      <Card noPadding className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <TableHeaderRow
              table={table}
              stickyHeader={stickyHeader}
              hasActions={hasActions}
            />

            <TableBody
              table={table}
              headers={headers}
              hasActions={hasActions}
              actions={actions}
              onClickRow={onClickRow}
              openRowId={openRowId}
              setOpenRowId={setOpenRowId}
              totalColumns={totalColumns}
              effectiveLoading={effectiveLoading}
              effectiveLoadingMessage={effectiveLoadingMessage}
              fetchError={fetchError}
              effectiveEmptyMessage={effectiveEmptyMessage}
            />
          </table>
        </div>
      </Card>

      {/* ── Pagination ───────────────────────────────────────────────── */}
      {showPagination &&
        !effectiveLoading &&
        !fetchError &&
        rows.length > 0 && (
          <TablePagination
            table={table}
            pageSizeOptions={resolvedPageSizeOptions}
            entityName={effectiveEntityName}
            totalCount={
              usesServerPagination
                ? effectiveTotal
                : table.getFilteredRowModel().rows.length
            }
          />
        )}
    </div>
  );
}

// Re-export all types so existing files importing from "./Table" continue to work seamlessly
export type * from "./types";
