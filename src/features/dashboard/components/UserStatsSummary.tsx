import {
  Users,
  TrendingUp,
  TrendingDown,
  UserMinus,
  UserX,
  AlertCircle,
} from "lucide-react";

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
  const stats: StatItem[] = [
    {
      icon: <Users size={14} className="text-gray-600" />,
      label: "Total",
      value: `${totalUsers.toLocaleString()} users`,
      color: "#C8102E",
    },
    {
      icon: <TrendingUp size={14} className="text-green-600" />,
      label: "Reach",
      value: `${newUsers} new users`,
      color: "#10B981",
    },
    {
      icon: <TrendingDown size={14} className="text-red-600" />,
      label: "Loss",
      value: `${lostUsers} users`,
      color: "#EF4444",
    },
    {
      icon: <UserMinus size={14} className="text-gray-600" />,
      label: "Old user deleted",
      value: oldUserDeleted,
    },
    {
      icon: <UserX size={14} className="text-gray-600" />,
      label: "New user deleted",
      value: newUserDeleted,
    },
    {
      icon: <AlertCircle size={14} className="text-gray-600" />,
      label: "AD removed from new",
      value: adRemovedFromNew,
    },
    {
      icon: <AlertCircle size={14} className="text-gray-600" />,
      label: "AD removed from old",
      value: adRemovedFromOld,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="pb-3 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-800">{period}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: "#C8102E" }}
          />
          <span className="text-sm font-medium text-gray-700">
            Account users
          </span>
        </div>
      </div>

      {/* Stats List */}
      <div className="space-y-3">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className="mt-0.5">{stat.icon}</div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-gray-600">{stat.label}:</span>
                <span
                  className="text-sm font-semibold"
                  style={{ color: stat.color || "#374151" }}
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
