import { Video, AlertCircle, CheckCircle2, EyeOff } from "lucide-react";
import type { ReelStatisticsDto } from "../types";
import SummaryCard from "../../../components/ui/SummaryCard";

interface ReelsAnalyticsCardsProps {
  stats?: ReelStatisticsDto | null;
  loading?: boolean;
  error?: string | null;
}

export default function ReelsAnalyticsCards({
  stats,
  loading = false,
  error = null,
}: ReelsAnalyticsCardsProps) {
  const cardColors = {
    reels: {
      text: "text-purple-600",
      border: "border-purple-100",
      iconBg: "bg-purple-50",
    },
    displaying: {
      text: "text-green-600",
      border: "border-green-100",
      iconBg: "bg-green-50",
    },
    hidden: {
      text: "text-yellow-600",
      border: "border-yellow-100",
      iconBg: "bg-yellow-50",
    },
  };

  return (
    <div className="space-y-4">
      {/* Trạng thái lỗi */}
      {error && (
        <div className="flex items-center gap-2 p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid danh sách các thẻ thông số */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          icon={<Video size={20} />}
          label="Total Reels"
          value={stats ? stats.totalReels.toLocaleString() : "?"}
          loading={loading}
          iconClassName={cardColors.reels.text}
          iconContainerClassName={cardColors.reels.iconBg}
          className={cardColors.reels.border}
        />
        <SummaryCard
          icon={<CheckCircle2 size={20} />}
          label="Displaying"
          value={stats ? stats.displaying.toLocaleString() : "?"}
          loading={loading}
          iconClassName={cardColors.displaying.text}
          iconContainerClassName={cardColors.displaying.iconBg}
          className={cardColors.displaying.border}
        />
        <SummaryCard
          icon={<EyeOff size={20} />}
          label="Hidden"
          value={stats ? stats.hidden.toLocaleString() : "?"}
          loading={loading}
          iconClassName={cardColors.hidden.text}
          iconContainerClassName={cardColors.hidden.iconBg}
          className={cardColors.hidden.border}
        />
      </div>
    </div>
  );
}
