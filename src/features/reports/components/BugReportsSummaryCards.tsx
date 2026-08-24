import { useState, useEffect, useCallback, useMemo } from "react"
import { Bug, Clock, AlertCircle, CheckCircle2 } from "lucide-react"
import SummaryCard from "../../../components/ui/SummaryCard"
import { getBugReportStats, type BugReportStats } from "../api/bugReports"
import { getApiErrorMessage } from "../../../lib/axios"
import { useLanguage } from "../../../stores/languageStore"

interface BugReportsSummaryCardsProps {
  refreshKey?: number
}

export default function BugReportsSummaryCards({
  refreshKey = 0,
}: BugReportsSummaryCardsProps) {
  const { t } = useLanguage()
  const bugT = (t as any).bugReports || {}
  const [stats, setStats] = useState<BugReportStats | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getBugReportStats()
      setStats(data)
    } catch (err) {
      console.error("Error fetching bug report statistics:", err)
      setError(
        getApiErrorMessage(
          err,
          bugT.failedToLoadStats || "Không thể tải thống kê sự cố"
        )
      )
    } finally {
      setLoading(false)
    }
  }, [bugT])

  useEffect(() => {
    fetchStats()
  }, [fetchStats, refreshKey])

  const cardsData = useMemo(() => {
    return [
      {
        id: "total-reports",
        icon: <Bug size={20} />,
        label: bugT.statTotalReports || "Tổng số sự cố",
        value: stats?.totalReports?.toLocaleString() ?? 0,
        subtitle: bugT.statTotalSubtitle || "Tất cả sự cố đã ghi nhận",
        iconClassName: "text-indigo-600",
        iconContainerClassName: "bg-indigo-50",
        borderClassName: "border-indigo-100",
      },
      {
        id: "pending-reports",
        icon: <Clock size={20} />,
        label: bugT.statPending || "Chờ xử lý (Pending)",
        value: stats?.pendingCount?.toLocaleString() ?? 0,
        subtitle: bugT.statPendingSubtitle || "Cần phân loại & xử lý",
        iconClassName: "text-amber-600",
        iconContainerClassName: "bg-amber-50",
        borderClassName: "border-amber-100",
      },
      {
        id: "in-progress-reports",
        icon: <AlertCircle size={20} />,
        label: bugT.statInProgress || "Đang xử lý (In Progress)",
        value: stats?.inProgressCount?.toLocaleString() ?? 0,
        subtitle: bugT.statInProgressSubtitle || "Đang được đội ngũ fix",
        iconClassName: "text-blue-600",
        iconContainerClassName: "bg-blue-50",
        borderClassName: "border-blue-100",
      },
      {
        id: "resolved-reports",
        icon: <CheckCircle2 size={20} />,
        label: bugT.statResolved || "Đã giải quyết (Resolved)",
        value: stats?.resolvedCount?.toLocaleString() ?? 0,
        subtitle: bugT.statResolvedSubtitle || "Đã hoàn tất khắc phục",
        iconClassName: "text-emerald-600",
        iconContainerClassName: "bg-emerald-50",
        borderClassName: "border-emerald-100",
      },
    ]
  }, [stats, bugT])

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cardsData.map((card) => (
          <SummaryCard
            key={card.id}
            icon={card.icon}
            label={card.label}
            value={card.value}
            subtitle={card.subtitle}
            loading={loading}
            iconClassName={card.iconClassName}
            iconContainerClassName={card.iconContainerClassName}
            className={card.borderClassName}
          />
        ))}
      </div>
    </div>
  )
}
