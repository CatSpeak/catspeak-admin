import {
  FileText,
  FileWarning,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Ban,
} from "lucide-react";
import { useLanguage } from "../../../stores/languageStore";

export interface PaymentIssuesMetrics {
  total: number;
  reports: number;
  refunds: number;
  pending: number;
  approved: number;
  rejected: number;
}

interface PaymentIssuesSummaryCardsProps {
  metrics: PaymentIssuesMetrics;
  loading?: boolean;
}

export default function PaymentIssuesSummaryCards({
  metrics,
}: PaymentIssuesSummaryCardsProps) {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
      {/* Tổng số yêu cầu */}
      <div className="bg-white border border-gray-200 p-3.5 sm:p-5 rounded-2xl shadow-xs flex items-center gap-3 sm:gap-4 transition-all hover:shadow-md">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="min-w-0">
          <span className="text-[11px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider block truncate">
            {t.reports?.totalClaims || "Tổng yêu cầu"}
          </span>
          <span className="text-xl sm:text-2xl font-bold text-gray-900 block mt-0.5">
            {metrics.total}
          </span>
        </div>
      </div>

      {/* Báo cáo sự cố */}
      <div className="bg-white border border-gray-200 p-3.5 sm:p-5 rounded-2xl shadow-xs flex items-center gap-3 sm:gap-4 transition-all hover:shadow-md">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
          <FileWarning className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="min-w-0">
          <span className="text-[11px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider block truncate">
            {t.reports?.issueReport || "Báo cáo sự cố"}
          </span>
          <span className="text-xl sm:text-2xl font-bold text-purple-700 block mt-0.5">
            {metrics.reports}
          </span>
        </div>
      </div>

      {/* Yêu cầu hoàn tiền */}
      <div className="bg-white border border-gray-200 p-3.5 sm:p-5 rounded-2xl shadow-xs flex items-center gap-3 sm:gap-4 transition-all hover:shadow-md">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
          <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="min-w-0">
          <span className="text-[11px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider block truncate">
            {t.reports?.refundRequest || "Yêu cầu hoàn tiền"}
          </span>
          <span className="text-xl sm:text-2xl font-bold text-orange-600 block mt-0.5">
            {metrics.refunds}
          </span>
        </div>
      </div>

      {/* Chờ xử lý */}
      <div className="bg-white border border-gray-200 p-3.5 sm:p-5 rounded-2xl shadow-xs flex items-center gap-3 sm:gap-4 transition-all hover:shadow-md">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="min-w-0">
          <span className="text-[11px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider block truncate">
            {t.reports?.pendingAction || "Chờ xử lý"}
          </span>
          <span className="text-xl sm:text-2xl font-bold text-amber-600 block mt-0.5 animate-pulse">
            {metrics.pending}
          </span>
        </div>
      </div>

      {/* Đã duyệt / Chấp nhận */}
      <div className="bg-white border border-gray-200 p-3.5 sm:p-5 rounded-2xl shadow-xs flex items-center gap-3 sm:gap-4 transition-all hover:shadow-md">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="min-w-0">
          <span className="text-[11px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider block truncate">
            {t.reports?.approvedOrAccepted || "Đã duyệt / Chấp nhận"}
          </span>
          <span className="text-xl sm:text-2xl font-bold text-emerald-700 block mt-0.5">
            {metrics.approved}
          </span>
        </div>
      </div>

      {/* Từ chối / Thất bại */}
      <div className="bg-white border border-gray-200 p-3.5 sm:p-5 rounded-2xl shadow-xs flex items-center gap-3 sm:gap-4 transition-all hover:shadow-md">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
          <Ban className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="min-w-0">
          <span className="text-[11px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider block truncate">
            {t.reports?.deniedOrFailed || "Từ chối / Thất bại"}
          </span>
          <span className="text-xl sm:text-2xl font-bold text-rose-700 block mt-0.5">
            {metrics.rejected}
          </span>
        </div>
      </div>
    </div>
  );
}
