import { useState, useEffect } from "react";
import {
  getNewUsers,
  getRetention,
  getChurn,
  getUserClassification,
  getExistingUsers,
  getActivityBreakdown,
} from "../api/getAnalytics";
import type { DateRange, AnalyticsPeriod } from "../types";
import type {
  NewUserResponse,
  RetentionResponse,
  ChurnResponse,
  ExistingUsersResponse,
  UserClassificationResponse,
  ActivityBreakdownResponse,
} from "../types";
import AnalyticsMetricsCards from "../components/MetricCards";
import AnalyticsPeriodSelector from "../components/AnalyticsPeriodSelector";
import Card from "../../../components/ui/Card";
import LineChartJS from "../../dashboard/components/LineChartJS";
import DonutChartJS from "../../dashboard/components/DonutChartJS";
import AreaChartJS from "../../dashboard/components/AreaChartJS";

interface AnalyticsData {
  newUsers: NewUserResponse;
  existingUsers: ExistingUsersResponse;
  retention: RetentionResponse;
  churn: ChurnResponse;
  classification: UserClassificationResponse;
  activity: ActivityBreakdownResponse;
}

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("last7days");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);

  async function getAnalyticsAll(range: DateRange) {
    const [newUsers, existingUsers, retention, churn, classification, activity] =
      await Promise.all([
        getNewUsers(range),
        getExistingUsers(range),
        getRetention(range),
        getChurn(range),
        getUserClassification(range),
        getActivityBreakdown(range),
      ]);
    return { newUsers, existingUsers, retention, churn, classification, activity };
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    getAnalyticsAll({ period: selectedPeriod as AnalyticsPeriod })
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedPeriod]);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data) return null;

  // Area chart: daily new users (using dailyBreakdown dates)
  const areaChartData: Array<{ label: string; accountUsers: number; activeUsers: number }> =
    data.newUsers.dailyBreakdown.length > 0
      ? data.newUsers.dailyBreakdown.map((d) => ({
          label: d,
          accountUsers: 0,
          activeUsers: 0,
        }))
      : [];

  // Donut: new vs existing ratio (zero duplicate counts)
  const donutSegments = [
    { label: "New Users", value: data.classification.newUsers, color: "#10B981" },
    { label: "Existing Users", value: data.classification.existingUsers, color: "#3B82F6" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-primary">Analytics Dashboard</h1>
        <AnalyticsPeriodSelector
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
        />
      </div>

      {/* 4 Metric Cards — zero duplicates */}
      <AnalyticsMetricsCards
        newUsers={data.newUsers}
        existingUsers={data.existingUsers}
        retention={data.retention}
        churn={data.churn}
      />

      {/* Row 1: 2 cols — Growth + Retention */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="animate-fade-in delay-1">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">User Growth Trend</h3>
          <AreaChartJS data={areaChartData} height={300} />
        </Card>

        <Card className="animate-fade-in delay-2">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Retention Rates</h3>
          <LineChartJS
            data={[
              { label: "D1", value: data.retention.d1Retention },
              { label: "D7", value: data.retention.d7Retention },
              { label: "D30", value: data.retention.d30Retention },
            ]}
            height={300}
          />
        </Card>
      </div>

      {/* Row 2: 2 cols — Classification + Churn */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="animate-fade-in delay-3">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">User Classification</h3>
          <DonutChartJS
            segments={donutSegments}
            trendUp
            trendValue={`${data.classification.newUserRatio.toFixed(1)}% new users`}
            centerSubtext={`${data.classification.newUsers + data.classification.existingUsers} total`}
          />
        </Card>

        <Card className="animate-fade-in delay-4">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Churn Analysis</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <div className="text-sm text-gray-600">Churned</div>
              <div className="text-2xl font-bold text-red-600">{data.churn.churnedUsers}</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-sm text-gray-600">Active</div>
              <div className="text-2xl font-bold text-blue-600">{data.churn.activeUsersAtPeriodStart}</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <div className="text-sm text-gray-600">Churn Rate</div>
              <div className="text-2xl font-bold text-yellow-600">
                {data.churn.currentChurnRate.toFixed(1)}%
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Activity Breakdown */}
      <Card className="animate-fade-in">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Activity Breakdown</h3>
        <div className="space-y-2">
          {data.activity.eventTypes.map((item) => {
            const total = data.activity.eventTypes.reduce((sum, i) => sum + i.count, 0);
            const pct = total > 0 ? ((item.count / total) * 100).toFixed(1) : "0.0";
            return (
              <div key={item.type} className="flex items-center gap-3">
                <span className="w-32 text-sm text-gray-700 capitalize">
                  {item.type.replace(/_/g, " ")}
                </span>
                <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-16 text-sm text-gray-600 text-right">{item.count}</span>
                <span className="w-14 text-xs text-gray-400 text-right">{pct}%</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
