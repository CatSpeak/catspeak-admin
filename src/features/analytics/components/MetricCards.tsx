import { TrendingUp, TrendingDown, Users } from "lucide-react";
import type {
  NewUserResponse,
  RetentionResponse,
  ChurnResponse,
  ExistingUsersResponse,
} from "../types";

import SummaryCard from "../../../components/ui/SummaryCard";

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
      <SummaryCard
        icon={<Users size={18} />}
        label="New Users"
        value={newUsers.totalNewUsers.toLocaleString()}
        trend={formatChange(newUsers.prevPeriod)}
        color="#10B981"
      />
      <SummaryCard
        icon={<Users size={18} />}
        label="Existing Users"
        value={existingUsers.totalExistingUsers.toLocaleString()}
        trend={{ value: "Established", up: true }}
        color="#3B82F6"
      />
      <SummaryCard
        icon={<TrendingUp size={18} />}
        label="Avg Retention"
        value={`${avgRetention}%`}
        trend={{ value: `D1: ${retention.d1Retention}% - D7: ${retention.d7Retention}%`, up: true }}
        color="#F59E0B"
      />
      <SummaryCard
        icon={<TrendingDown size={18} />}
        label="Churn Rate"
        value={`${churn.currentChurnRate.toFixed(1)}%`}
        trend={formatChange(churn.prevPeriod)}
        color="#EF4444"
      />
    </div>
  );
}
