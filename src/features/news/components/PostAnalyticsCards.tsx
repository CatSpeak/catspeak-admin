import { FileText, Eye, MessageSquare, Heart, Share2, Calendar, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import type { PostResponse, AnalyticsPeriod } from "../../analytics/types";

interface PostAnalyticsCardsProps {
  analytics: PostResponse | null;
  loading: boolean;
  error: string | null;
  selectedPeriod: AnalyticsPeriod;
  fromDate: string;
  toDate: string;
  onPeriodChange: (period: AnalyticsPeriod) => void;
  onDateRangeChange: (fromDate: string, toDate: string) => void;
}

import SummaryCard from "../../../components/ui/SummaryCard";

const periods: { value: AnalyticsPeriod; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "last7days", label: "Last 7 Days" },
  { value: "last30days", label: "Last 30 Days" },
  { value: "thismonth", label: "This Month" },
  { value: "all", label: "All" },
  { value: "custom", label: "Custom" },
];

export default function PostAnalyticsCards({
  analytics,
  loading,
  error,
  selectedPeriod,
  fromDate,
  toDate,
  onPeriodChange,
  onDateRangeChange,
}: PostAnalyticsCardsProps) {
  const [localFromDate, setLocalFromDate] = useState(fromDate);
  const [localToDate, setLocalToDate] = useState(toDate);

  // Keep local date state in sync with parent when parent changes
  useEffect(() => {
    setLocalFromDate(fromDate);
  }, [fromDate]);

  useEffect(() => {
    setLocalToDate(toDate);
  }, [toDate]);

  const handleApplyCustomRange = (e: React.FormEvent) => {
    e.preventDefault();
    if (localFromDate && localToDate) {
      onDateRangeChange(localFromDate, localToDate);
    }
  };

  const cardColors = {
    posts: {
      bg: "bg-gray-500",
      text: "text-gray-600",
      border: "border-gray-200",
      iconBg: "bg-gray-50",
    },
    views: {
      bg: "bg-blue-500",
      text: "text-blue-600",
      border: "border-blue-100",
      iconBg: "bg-blue-50",
    },
    comments: {
      bg: "bg-amber-500",
      text: "text-amber-600",
      border: "border-amber-100",
      iconBg: "bg-amber-50",
    },
    reactions: {
      bg: "bg-rose-500",
      text: "text-rose-600",
      border: "border-rose-100",
      iconBg: "bg-rose-50",
    },
    shares: {
      bg: "bg-emerald-500",
      text: "text-emerald-600",
      border: "border-emerald-100",
      iconBg: "bg-emerald-50",
    },
  };

  return (
    <div className="space-y-4">
      {/* Header with Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-base font-bold text-gray-900">Post Performance</h2>
          <p className="text-xs text-gray-500">Analytics metrics and engagement overview</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Period button group */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 overflow-x-auto">
            {periods.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => onPeriodChange(p.value)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 whitespace-nowrap ${selectedPeriod === p.value
                  ? "bg-white text-gray-950 shadow-sm"
                  : "text-gray-500 hover:text-gray-900 hover:bg-black/5"
                  }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom Date Form */}
          {selectedPeriod === "custom" && (
            <form onSubmit={handleApplyCustomRange} className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 border border-gray-200 rounded-xl shadow-sm">
                <Calendar size={14} className="text-gray-400" />
                <input
                  type="date"
                  value={localFromDate}
                  onChange={(e) => setLocalFromDate(e.target.value)}
                  className="text-xs text-gray-700 bg-transparent border-none focus:outline-none focus:ring-0"
                  required
                />
                <span className="text-gray-400 text-xs px-1">to</span>
                <input
                  type="date"
                  value={localToDate}
                  onChange={(e) => setLocalToDate(e.target.value)}
                  className="text-xs text-gray-700 bg-transparent border-none focus:outline-none focus:ring-0"
                  required
                />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-semibold bg-primary text-white rounded-xl hover:bg-primary/95 shadow-sm transition-colors"
              >
                Apply
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-2 p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <SummaryCard
          icon={<FileText size={20} />}
          label="Total Posts"
          value={analytics?.totalPosts?.toLocaleString() ?? 0}
          loading={loading}
          iconClassName={cardColors.posts.text}
          iconContainerClassName={cardColors.posts.iconBg}
          className={cardColors.posts.border}
        />
        <SummaryCard
          icon={<Eye size={20} />}
          label="Total Views"
          value={analytics?.totalViews?.toLocaleString() ?? 0}
          loading={loading}
          iconClassName={cardColors.views.text}
          iconContainerClassName={cardColors.views.iconBg}
          className={cardColors.views.border}
        />
        <SummaryCard
          icon={<MessageSquare size={20} />}
          label="Total Comments"
          value={analytics?.totalComments?.toLocaleString() ?? 0}
          loading={loading}
          iconClassName={cardColors.comments.text}
          iconContainerClassName={cardColors.comments.iconBg}
          className={cardColors.comments.border}
        />
        <SummaryCard
          icon={<Heart size={20} />}
          label="Total Reactions"
          value={analytics?.totalReactions?.toLocaleString() ?? 0}
          loading={loading}
          iconClassName={cardColors.reactions.text}
          iconContainerClassName={cardColors.reactions.iconBg}
          className={cardColors.reactions.border}
        />
        <SummaryCard
          icon={<Share2 size={20} />}
          label="Total Shares"
          value={analytics?.totalShares?.toLocaleString() ?? 0}
          loading={loading}
          iconClassName={cardColors.shares.text}
          iconContainerClassName={cardColors.shares.iconBg}
          className={cardColors.shares.border}
        />
      </div>
    </div>
  );
}
