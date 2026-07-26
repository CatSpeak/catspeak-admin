import {
  Users,
  TrendingUp,
  TrendingDown,
  UserMinus,
  UserX,
  AlertCircle,
} from "lucide-react";
import { useLanguage } from "../../../stores/languageStore";

interface StatItem {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: string;
}

interface UserStatsSummaryProps {
  period: string;
  totalUsers: number;
  newUsers: number;
  lostUsers: number;
  oldUserDeleted: number;
  newUserDeleted: number;
  adRemovedFromNew: number;
  adRemovedFromOld: number;
}

export default function UserStatsSummary({
  period,
  totalUsers,
  newUsers,
  lostUsers,
  oldUserDeleted,
  newUserDeleted,
  adRemovedFromNew,
  adRemovedFromOld,
}: UserStatsSummaryProps) {
  const { t } = useLanguage();

  const stats: StatItem[] = [
    {
      icon: <Users size={14} className="text-gray-600" />,
      label: t.common.total,
      value: `${totalUsers.toLocaleString()} ${t.users.title.toLowerCase()}`,
      color: "#C8102E",
    },
    {
      icon: <TrendingUp size={14} className="text-green-600" />,
      label: t.dashboard.reach,
      value: `${newUsers} ${t.analytics.newUsers.toLowerCase()}`,
      color: "#10B981",
    },
    {
      icon: <TrendingDown size={14} className="text-red-600" />,
      label: t.dashboard.loss,
      value: `${lostUsers} ${t.users.title.toLowerCase()}`,
      color: "#EF4444",
    },
    {
      icon: <UserMinus size={14} className="text-gray-600" />,
      label: t.dashboard.oldUserDeleted,
      value: oldUserDeleted,
    },
    {
      icon: <UserX size={14} className="text-gray-600" />,
      label: t.dashboard.newUserDeleted,
      value: newUserDeleted,
    },
    {
      icon: <AlertCircle size={14} className="text-gray-600" />,
      label: t.dashboard.adRemovedFromNew,
      value: adRemovedFromNew,
    },
    {
      icon: <AlertCircle size={14} className="text-gray-600" />,
      label: t.dashboard.adRemovedFromOld,
      value: adRemovedFromOld,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="pb-3 border-b border-gray-200 min-w-0">
        <h3
          className="text-base sm:text-lg font-bold text-gray-800 truncate"
          title={period}
        >
          {period}
        </h3>
        <div className="flex items-center gap-2 mt-1 min-w-0">
          <span
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: "#C8102E" }}
          />
          <span
            className="text-xs sm:text-sm font-medium text-gray-700 truncate"
            title={t.dashboard.accountUsers}
          >
            {t.dashboard.accountUsers}
          </span>
        </div>
      </div>

      {/* Stats List */}
      <div className="space-y-3">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center gap-2 min-w-0">
            <div className="shrink-0">{stat.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 whitespace-nowrap min-w-0 overflow-hidden">
                <span
                  className="text-[11px] sm:text-xs text-gray-600 truncate shrink-0 max-w-[65%]"
                  title={stat.label}
                >
                  {stat.label}:
                </span>
                <span
                  className="text-xs sm:text-sm font-semibold truncate min-w-0"
                  style={{ color: stat.color || "#374151" }}
                  title={String(stat.value)}
                >
                  {stat.value}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
