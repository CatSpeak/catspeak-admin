import { TrendingUp, TrendingDown, Users } from "lucide-react";
import type {
  NewUserResponse,
  RetentionResponse,
  ChurnResponse,
  ExistingUsersResponse,
} from "../types";

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: { value: string; up: boolean };
  color?: string;
}

function MetricCard({ icon, label, value, trend, color = "#3B82F6" }: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${color}15` }}>
          {icon}
        </div>
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {trend && (
        <div className={`flex items-center gap-1 mt-1 text-xs ${trend.up ? "text-green-600" : "text-red-600"}`}>
          {trend.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>{trend.value}</span>
        </div>
      )}
    </div>
  );
}

interface AnalyticsMetricsCardsProps {
  newUsers: NewUserResponse;
  existingUsers: ExistingUsersResponse;
  retention: RetentionResponse;
  churn: ChurnResponse;
}

export default function AnalyticsMetricsCards({
  newUsers,
  existingUsers,
  retention,
  churn,
}: AnalyticsMetricsCardsProps) {
  const avgRetention = (
    (retention.d1Retention + retention.d7Retention + retention.d30Retention) / 3
  ).toFixed(1);

  const formatChange = (
    change: { changePercent: number; changeAbsolute: number } | null
  ) => {
    if (!change) return undefined;
    const isPositive = change.changeAbsolute >= 0;
    return {
      value: `${isPositive ? "+" : ""}${change.changeAbsolute} (${isPositive ? "+" : ""}${change.changePercent.toFixed(1)}%)`,
      up: isPositive,
    };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        icon={<Users size={18} />}
        label="New Users"
        value={newUsers.totalNewUsers.toLocaleString()}
        trend={formatChange(newUsers.prevPeriod)}
        color="#10B981"
      />
      <MetricCard
        icon={<Users size={18} />}
        label="Existing Users"
        value={existingUsers.totalExistingUsers.toLocaleString()}
        trend={{ value: "Established", up: true }}
        color="#3B82F6"
      />
      <MetricCard
        icon={<TrendingUp size={18} />}
        label="Avg Retention"
        value={`${avgRetention}%`}
        trend={{ value: `D1: ${retention.d1Retention}% - D7: ${retention.d7Retention}%`, up: true }}
        color="#F59E0B"
      />
      <MetricCard
        icon={<TrendingDown size={18} />}
        label="Churn Rate"
        value={`${churn.currentChurnRate.toFixed(1)}%`}
        trend={formatChange(churn.prevPeriod)}
        color="#EF4444"
      />
    </div>
  );
}
