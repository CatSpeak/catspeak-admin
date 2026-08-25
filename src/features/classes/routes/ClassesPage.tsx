import React, { useCallback, useState } from "react";
import {
  BookOpen,
  Loader2,
  Search,
  AlertCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Button from "../../../components/ui/Button";
import { PageHeader } from "../../../components/ui/PageHeader";
import { useLanguage } from "../../../stores/languageStore";
import { useClasses } from "../hooks/useClasses";
import type { AdminClass } from "../types";
import { ClassesTable, ClassDetailModal, ClassesStatsCards } from "../components";

const STATUS_OPTIONS = [
  "UPCOMING",
  "OPEN_FOR_ENROLLMENT",
  "NOT_STARTED",
  "TEACHING",
  "ARCHIVED",
  "FINISHED",
] as const;

const LANGUAGE_OPTIONS = ["ENGLISH", "CHINESE", "JAPANESE"] as const;

const LANGUAGE_LABEL_KEYS = {
  ENGLISH: "English",
  CHINESE: "Chinese",
  JAPANESE: "Japanese",
} as const;

const ClassesPage: React.FC = () => {
  const { t } = useLanguage();
  const {
    classes,
    stats,
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

        <ClassesStatsCards stats={stats} loading={isLoading} />

        {/* Filter Bar */}
        <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between w-full">
            {/* Search */}
            <div className="relative flex-1 max-w-md w-full">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder={t.classes.searchPlaceholder}
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 shadow-sm"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              {/* Language dropdown */}
              <div className="relative w-full sm:w-auto">
                <select
                  value={filters.language}
                  onChange={(e) => updateFilter("language", e.target.value)}
                  className="w-full sm:w-auto appearance-none pl-3 pr-8 py-1.5 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                >
                  <option value="">{t.classes.allLanguages}</option>
                  {LANGUAGE_OPTIONS.map((language) => (
                    <option key={language} value={language}>
                      {t.room.languages[LANGUAGE_LABEL_KEYS[language]]}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-gray-400">
                  <ChevronDown size={16} />
                </div>
              </div>

              {/* Status dropdown */}
              <div className="relative w-full sm:w-auto">
                <select
                  value={filters.status}
                  onChange={(e) => updateFilter("status", e.target.value)}
                  className="w-full sm:w-auto appearance-none pl-3 pr-8 py-1.5 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                >
                  <option value="">{t.classes.allStatuses}</option>
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {t.classes.statuses[status] ?? status}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-gray-400">
                  <ChevronDown size={16} />
                </div>
              </div>

              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  {t.common.cancel}
                </Button>
              )}
            </div>
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

        {/* Pagination Bar */}
        {!isLoading && classes.length > 0 && (
          <nav
            aria-label={`${t.classes.title} ${t.pagination.pagination}`}
            className="flex flex-col sm:flex-row items-center justify-between px-2 py-4 gap-4"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 font-normal">
                {t.common.total}{" "}
                <span className="font-semibold text-gray-900">
                  {pagination.totalCount}
                </span>{" "}
                {t.classes.classesFound}
              </span>
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPage(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  aria-label={t.pagination.previousPage}
                  className="p-2 rounded-lg transition-all text-gray-700 hover:bg-gray-50 border border-transparent hover:border-gray-100 disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="text-sm text-gray-600 font-medium px-2">
                  {t.pagination.page} {pagination.currentPage} {t.common.of}{" "}
                  {pagination.totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => setPage(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  aria-label={t.pagination.nextPage}
                  className="p-2 rounded-lg transition-all text-gray-700 hover:bg-gray-50 border border-transparent hover:border-gray-100 disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </nav>
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
