import {
  Video,
  Eye,
  MessageSquare,
  Heart,
  Clock, // Thay Share2 bằng Clock (Thời gian xem) để đặc trưng hơn cho Reels
  Calendar,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import type { AnalyticsPeriod } from "../../analytics/types"; // Import từ types của bạn

// Định nghĩa types nội bộ cho Reels Analytics
export interface ReelsResponse {
  totalReels: number;
  totalViews: number;
  totalComments: number;
  totalReactions: number;
  totalWatchTime: number;
}

interface ReelsAnalyticsCardsProps {
  analytics?: ReelsResponse | null;
  loading?: boolean;
  error?: string | null;
  selectedPeriod?: AnalyticsPeriod;
  fromDate?: string;
  toDate?: string;
  onPeriodChange?: (period: AnalyticsPeriod) => void;
  onDateRangeChange?: (fromDate: string, toDate: string) => void;
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

// Mock data tương ứng với từng khoảng thời gian để test nhanh
const mockAnalyticsData: Record<AnalyticsPeriod, ReelsResponse> = {
  today: {
    totalReels: 2,
    totalViews: 12500,
    totalComments: 180,
    totalReactions: 1200,
    totalWatchTime: 85, // 85 giờ
  },
  last7days: {
    totalReels: 8,
    totalViews: 95400,
    totalComments: 1240,
    totalReactions: 8900,
    totalWatchTime: 620,
  },
  last30days: {
    totalReels: 32,
    totalViews: 450000,
    totalComments: 6700,
    totalReactions: 41200,
    totalWatchTime: 3100,
  },
  thismonth: {
    totalReels: 28,
    totalViews: 380000,
    totalComments: 5100,
    totalReactions: 35000,
    totalWatchTime: 2500,
  },
  all: {
    totalReels: 145,
    totalViews: 2300000,
    totalComments: 34500,
    totalReactions: 198000,
    totalWatchTime: 15400,
  },
  custom: {
    totalReels: 5,
    totalViews: 48000,
    totalComments: 520,
    totalReactions: 4100,
    totalWatchTime: 320,
  },
};

export default function ReelsAnalyticsCards({
  analytics,
  loading = false,
  error = null,
  selectedPeriod = "last7days",
  fromDate = "",
  toDate = "",
  onPeriodChange,
  onDateRangeChange,
}: ReelsAnalyticsCardsProps) {
  const [localFromDate, setLocalFromDate] = useState(fromDate);
  const [localToDate, setLocalToDate] = useState(toDate);

  // Đồng bộ local date state khi parent thay đổi
  useEffect(() => {
    setLocalFromDate(fromDate);
  }, [fromDate]);

  useEffect(() => {
    setLocalToDate(toDate);
  }, [toDate]);

  const handleApplyCustomRange = (e: React.FormEvent) => {
    e.preventDefault();
    if (localFromDate && localToDate && onDateRangeChange) {
      onDateRangeChange(localFromDate, localToDate);
    }
  };

  // Sử dụng dữ liệu truyền vào qua props, nếu không có (null/undefined) thì fallback về mock data
  const currentAnalytics =
    analytics ||
    mockAnalyticsData[selectedPeriod] ||
    mockAnalyticsData.last7days;

  // Màu sắc thiết kế đồng bộ với tone Reels năng động (sử dụng sắc tím/hồng làm chủ đạo)
  const cardColors = {
    reels: {
      text: "text-purple-600",
      border: "border-purple-100",
      iconBg: "bg-purple-50",
    },
    views: {
      text: "text-blue-600",
      border: "border-blue-100",
      iconBg: "bg-blue-50",
    },
    comments: {
      text: "text-amber-600",
      border: "border-amber-100",
      iconBg: "bg-amber-50",
    },
    reactions: {
      text: "text-rose-600",
      border: "border-rose-100",
      iconBg: "bg-rose-50",
    },
    watchTime: {
      text: "text-indigo-600",
      border: "border-indigo-100",
      iconBg: "bg-indigo-50",
    },
  };

  return (
    <div className="space-y-4">
      {/* Header với Bộ lọc */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-end gap-4 pb-2">
        <div className="flex flex-wrap items-center gap-3">
          {/* Nhóm nút chọn khoảng thời gian */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 overflow-x-auto">
            {periods.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => onPeriodChange?.(p.value)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 whitespace-nowrap ${
                  selectedPeriod === p.value
                    ? "bg-white text-gray-950 shadow-sm"
                    : "text-gray-500 hover:text-gray-900 hover:bg-black/5"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Form lọc ngày Custom */}
          {selectedPeriod === "custom" && (
            <form
              onSubmit={handleApplyCustomRange}
              className="flex flex-wrap items-center gap-2"
            >
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

      {/* Trạng thái lỗi */}
      {error && (
        <div className="flex items-center gap-2 p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid danh sách các thẻ thông số */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <SummaryCard
          icon={<Video size={20} />}
          label="Total Reels"
          value={currentAnalytics.totalReels.toLocaleString()}
          loading={loading}
          iconClassName={cardColors.reels.text}
          iconContainerClassName={cardColors.reels.iconBg}
          className={cardColors.reels.border}
        />
        <SummaryCard
          icon={<Eye size={20} />}
          label="Total Views"
          value={currentAnalytics.totalViews.toLocaleString()}
          loading={loading}
          iconClassName={cardColors.views.text}
          iconContainerClassName={cardColors.views.iconBg}
          className={cardColors.views.border}
        />
        <SummaryCard
          icon={<MessageSquare size={20} />}
          label="Total Comments"
          value={currentAnalytics.totalComments.toLocaleString()}
          loading={loading}
          iconClassName={cardColors.comments.text}
          iconContainerClassName={cardColors.comments.iconBg}
          className={cardColors.comments.border}
        />
        <SummaryCard
          icon={<Heart size={20} />}
          label="Total Reactions"
          value={currentAnalytics.totalReactions.toLocaleString()}
          loading={loading}
          iconClassName={cardColors.reactions.text}
          iconContainerClassName={cardColors.reactions.iconBg}
          className={cardColors.reactions.border}
        />
        <SummaryCard
          icon={<Clock size={20} />}
          label="Watch Time"
          value={`${currentAnalytics.totalWatchTime.toLocaleString()} hrs`}
          loading={loading}
          iconClassName={cardColors.watchTime.text}
          iconContainerClassName={cardColors.watchTime.iconBg}
          className={cardColors.watchTime.border}
        />
      </div>
    </div>
  );
}
