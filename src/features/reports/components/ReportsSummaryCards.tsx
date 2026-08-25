import { useState, useEffect, useCallback, useMemo } from "react";
import {
  FileText,
  Users,
  AlertTriangle,
  ShieldAlert,
  AlertCircle,
} from "lucide-react";
import SummaryCard from "../../../components/ui/SummaryCard";
import {
  getStats,
  type ReportStatisticsResponse,
} from "../api/letterReports";
import { getApiErrorMessage } from "../../../lib/axios";
import { useLanguage } from "../../../stores/languageStore";

export default function ReportsSummaryCards() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<ReportStatisticsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStats();
      setStats(data);
    } catch (err) {
      console.error("Error fetching report statistics:", err);
      setError(
        getApiErrorMessage(
          err,
          t.reports?.failedToLoadStats || "Failed to load report statistics",
        ),
      );
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const cardsData = useMemo(() => {
    return [
      {
        id: "letter-reports",
        icon: <FileText size={20} />,
        label: t.reports?.letterReportsTitle || "Letter Reports",
        value: stats?.letterReports?.totalReports?.toLocaleString() ?? 0,
        subtitle: stats?.letterReports
          ? (
            t.reports?.reportedCount ||
            "{count} reported"
          ).replace("{count}", String(stats.letterReports.reportedUsers))
          : undefined,
        iconClassName: "text-rose-600",
        iconContainerClassName: "bg-rose-50",
        borderClassName: "border-rose-100",
      },
      {
        id: "reported-users",
        icon: <Users size={20} />,
        label: t.reports?.reportedUserTitle || "Reported Users",
        value: stats?.reportedUser?.totalReportedUsers?.toLocaleString() ?? 0,
        subtitle: stats?.reportedUser
          ? (
            t.reports?.reportingUsersCount || "{count} reporting users"
          ).replace("{count}", String(stats.reportedUser.reportingUsers))
          : undefined,
        iconClassName: "text-amber-600",
        iconContainerClassName: "bg-amber-50",
        borderClassName: "border-amber-100",
      },
      {
        id: "meeting-incident-reports",
        icon: <AlertTriangle size={20} />,
        label:
          t.reports?.meetingIncidentReportsTitle ||
          "Meeting Incident Reports",
        value:
          stats?.meetingIncidentReports?.totalReports?.toLocaleString() ?? 0,
        subtitle: stats?.meetingIncidentReports
          ? (t.reports?.totalReportsCount || "{count} total reports").replace(
            "{count}",
            String(stats.meetingIncidentReports.totalReports),
          )
          : undefined,
        iconClassName: "text-blue-600",
        iconContainerClassName: "bg-blue-50",
        borderClassName: "border-blue-100",
      },
      {
        id: "total-user-warning",
        icon: <ShieldAlert size={20} />,
        label: t.reports?.totalUserWarningTitle || "Total User Warnings",
        value: stats?.totalUserWarning?.toLocaleString() ?? 0,
        subtitle:
          stats !== null
            ? (t.reports?.totalWarningsCount || "{count} total warnings").replace(
              "{count}",
              String(stats.totalUserWarning),
            )
            : undefined,
        iconClassName: "text-purple-600",
        iconContainerClassName: "bg-purple-50",
        borderClassName: "border-purple-100",
      },
    ];
  }, [stats, t]);

  return (
    <div className="space-y-4">
      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
  );
}

