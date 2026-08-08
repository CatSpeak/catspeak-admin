import React, { useCallback, useState } from "react";
import { BookOpen, Loader2, Search, AlertCircle } from "lucide-react";
import Button from "../../../components/ui/Button";
import { PageHeader } from "../../../components/ui/PageHeader";
import { useLanguage } from "../../../stores/languageStore";
import { useClasses } from "../hooks/useClasses";
import type { AdminClass } from "../types";
import { ClassesTable, ClassDetailModal } from "../components";

const STATUS_OPTIONS = [
  "UPCOMING",
  "OPEN_FOR_ENROLLMENT",
  "NOT_STARTED",
  "TEACHING",
  "ARCHIVED",
  "FINISHED",
] as const;

const ClassesPage: React.FC = () => {
  const { t } = useLanguage();
  const {
    classes,
    pagination,
    filters,
    isLoading,
    error,
    activeFilterCount,
    setPage,
    updateFilter,
    clearFilters,
    refetch,
  } = useClasses();

  const [selectedClass, setSelectedClass] = useState<AdminClass | null>(null);

  const handleChanged = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <div className="min-h-full">
      <div className="mx-auto space-y-6">
        <PageHeader
          icon={<BookOpen />}
          title={t.classes.title}
          desc={t.classes.desc}
        />

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                placeholder={t.classes.searchPlaceholder}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <select
              value={filters.status}
              onChange={(e) => updateFilter("status", e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">{t.common.status} — {t.common.filter}</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {t.classes.statuses[status] ?? status}
                </option>
              ))}
            </select>
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                {t.common.cancel}
              </Button>
            )}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              <span className="font-medium text-gray-700">
                {pagination.totalCount}
              </span>{" "}
              {t.classes.classesFound}
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <AlertCircle size={18} />
            <p className="text-sm">{error}</p>
            <button
              onClick={refetch}
              className="ml-auto text-sm font-medium underline hover:no-underline cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading / Empty / Table */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={32} className="text-primary animate-spin mb-3" />
            <p className="text-sm text-gray-500">{t.classes.loading}</p>
          </div>
        ) : classes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <BookOpen size={28} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">
              {t.classes.noClassesFound}
            </h3>
          </div>
        ) : (
          <ClassesTable classes={classes} onView={setSelectedClass} />
        )}

        {/* Pagination */}
        {!isLoading && classes.length > 0 && pagination.totalPages > 1 && (
          <div className="flex items-center justify-end gap-1">
            {Array.from(
              { length: pagination.totalPages },
              (_, i) => i + 1,
            ).map((page) => (
              <button
                key={page}
                onClick={() => setPage(page)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors cursor-pointer ${
                  pagination.currentPage === page
                    ? "bg-primary text-white"
                    : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}

        <ClassDetailModal
          cl={selectedClass}
          onClose={() => setSelectedClass(null)}
          onChanged={handleChanged}
        />
      </div>
    </div>
  );
};

export default ClassesPage;
