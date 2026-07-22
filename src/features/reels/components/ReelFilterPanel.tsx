import { useState } from "react";
import { Search, Filter, RotateCcw, Calendar, ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
import type { ReelStatus } from "../types";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import { useLanguage } from "../../../stores/languageStore";

type ReelStatusFilter = ReelStatus | "All";
type ReelSortBy = "createdAt" | "viewCount" | "duration" | "title";
type SortOrder = "asc" | "desc";

const REEL_STATUS_FILTERS: ReelStatusFilter[] = [
  "All",
  "Published",
  "Draft",
  "Processing",
  "Failed",
];

const REEL_SORT_FIELDS: ReelSortBy[] = [
  "createdAt",
  "viewCount",
  "duration",
  "title",
];

const SORT_ORDERS: SortOrder[] = ["desc", "asc"];

const toReelStatusFilter = (value: string): ReelStatusFilter =>
  REEL_STATUS_FILTERS.includes(value as ReelStatusFilter)
    ? (value as ReelStatusFilter)
    : "All";

const toReelSortBy = (value: string): ReelSortBy =>
  REEL_SORT_FIELDS.includes(value as ReelSortBy)
    ? (value as ReelSortBy)
    : "createdAt";

const toSortOrder = (value: string): SortOrder =>
  SORT_ORDERS.includes(value as SortOrder) ? (value as SortOrder) : "desc";

interface ReelFilterPanelProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: ReelStatusFilter;
  onStatusChange: (value: ReelStatusFilter) => void;
  startDate: string | null;
  onStartDateChange: (value: string | null) => void;
  endDate: string | null;
  onEndDateChange: (value: string | null) => void;
  sortBy: ReelSortBy;
  onSortByChange: (value: ReelSortBy) => void;
  sortOrder: SortOrder;
  onSortOrderChange: (value: SortOrder) => void;
  onReset: () => void;
}

export default function ReelFilterPanel({
  search,
  onSearchChange,
  status,
  onStatusChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  onReset,
}: ReelFilterPanelProps) {
  const { t } = useLanguage();
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  return (
    <div className="w-full space-y-4">
      {/* Mobile Toggle Bar */}
      <div className="flex md:hidden items-center justify-between gap-3 p-3 bg-white border border-gray-150 rounded-2xl shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={t.reels.searchReels}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <button
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-primary/25 shrink-0"
          aria-label="Toggle Filters Drawer"
        >
          <Filter className="w-4.5 h-4.5" />
          <span className="text-xs font-bold uppercase tracking-wider">{t.table.filters}</span>
          {isOpenMobile ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Main Filter Section */}
      <div
        className={`md:block transition-all duration-300 overflow-hidden
          ${isOpenMobile ? "max-h-[800px] opacity-100" : "max-h-0 md:max-h-none opacity-0 md:opacity-100"}`}
      >
        <Card className="p-5 space-y-5 bg-white border border-gray-100 rounded-3xl shadow-sm">
          {/* Header */}
          <div className="hidden md:flex items-center justify-between border-b border-gray-100 pb-3">
            <span className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-primary" />
              {t.common.filter}
            </span>
            <button
              onClick={onReset}
              className="text-xs font-semibold text-gray-400 hover:text-primary transition-colors flex items-center gap-1"
              title={t.reels.resetFilters}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {t.common.reset}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-5">
            {/* Desktop Search */}
            <div className="hidden md:block space-y-1.5">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                {t.reels.fullTextSearch}
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t.reels.searchPlaceholder}
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                {t.reels.statusBadge}
              </label>
              <select
                value={status}
                onChange={(e) => onStatusChange(toReelStatusFilter(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              >
                <option value="All">{t.reels.allStatuses}</option>
                <option value="Published">{t.reels.publishedPublic}</option>
                <option value="Draft">{t.reels.draftPrivate}</option>
                <option value="Processing">{t.reels.processing}</option>
                <option value="Failed">{t.reels.failedBlocked}</option>
              </select>
            </div>

            {/* Date Range Selection */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                {t.reels.dateRange}
              </label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={startDate || ""}
                  onChange={(e) => onStartDateChange(e.target.value || null)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary"
                  aria-label="Start date filter"
                />
                <input
                  type="date"
                  value={endDate || ""}
                  onChange={(e) => onEndDateChange(e.target.value || null)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary"
                  aria-label="End date filter"
                />
              </div>
            </div>

            {/* Sorting Criteria */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                {t.reels.sortCriteria}
              </label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => onSortByChange(toReelSortBy(e.target.value))}
                  className="flex-1 px-3 py-2.5 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="createdAt">{t.reels.dateUploaded}</option>
                  <option value="viewCount">{t.reels.views}</option>
                  <option value="duration">{t.room.duration}</option>
                  <option value="title">{t.reels.titleInput}</option>
                </select>
                <select
                  value={sortOrder}
                  onChange={(e) => onSortOrderChange(toSortOrder(e.target.value))}
                  className="px-2 py-2.5 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer shrink-0"
                >
                  <option value="desc">{t.common.descending}</option>
                  <option value="asc">{t.common.ascending}</option>
                </select>
              </div>
            </div>

            {/* Mobile Reset button */}
            <div className="block md:hidden pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                className="w-full flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                {t.reels.resetFilters}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
