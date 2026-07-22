import { useState, lazy, Suspense, useMemo } from "react";
import {
  AlertCircle,
  RefreshCw,
  DollarSign,
  Eye,
  Users,
  Activity,
} from "lucide-react";
import Card from "../../../components/ui/Card";
import SummaryCard from "../../../components/ui/SummaryCard";
import UserStatsSummary from "../components/UserStatsSummary";
import { useOverviewStats } from "../hooks/useOverviewStats";
import { mockupColors } from "../api/getOverviewStats";
import { useLanguage } from "../../../stores/languageStore";

const DonutChartJS = lazy(() => import("../components/DonutChartJS"));
const BarChartJS = lazy(() => import("../components/BarChartJS"));
const AreaChartJS = lazy(() => import("../components/AreaChartJS"));
const PieChartJS = lazy(() => import("../components/PieChartJS"));

function ChartFallback({ height = 240 }: { height?: number }) {
  return (
    <div
      className="flex items-center justify-center"
      style={{ minHeight: `${height}px` }}
    >
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
    </div>
  );
}

const periods = ["Weekly", "Monthly", "Yearly", "All"] as const;

export default function PlatformOverview() {
  const { t } = useLanguage();
  const [activePeriod, setActivePeriod] =
    useState<(typeof periods)[number]>("Monthly");

  const periodLabels: Record<string, string> = useMemo(() => ({
    Weekly: t.dashboard.weekly,
    Monthly: t.dashboard.monthly,
    Yearly: t.dashboard.yearly,
    All: t.dashboard.all,
  }), [t]);

  const apiParams = useMemo(() => {
    switch (activePeriod) {
      case "Weekly":
        return { period: "ThisMonth" as const, interval: "Weekly" as const };
      case "Monthly":
        return { period: "ThisYear" as const, interval: "Monthly" as const };
      case "Yearly":
        return { period: "All" as const, interval: "Yearly" as const };
      case "All":
        return { period: "All" as const, interval: "Yearly" as const };
      default:
        return { period: "ThisMonth" as const, interval: "Monthly" as const };
    }
  }, [activePeriod]);

  const {
    trafficSegments,
    ageGenderData,
    activeUsersData,
    loading,
    error,
    refetch,
  } = useOverviewStats(apiParams);

  const currentTrafficSegments = useMemo(() => {
    if (!trafficSegments || trafficSegments.length === 0) {
      return [];
    }
    return trafficSegments.map((item, index) => ({
      label: item.label,
      value: item.value,
      color: item.color || mockupColors[index % mockupColors.length],
    }));
  }, [trafficSegments]);

  const currentAgeGenderData = useMemo(() => {
    if (!ageGenderData || ageGenderData.length === 0) {
      return [];
    }
    return ageGenderData;
  }, [ageGenderData]);

  const barData = useMemo(() => {
    if (!activeUsersData || activeUsersData.length === 0) {
      return [];
    }
    return activeUsersData.map((item) => ({
      label: item.label,
      values: item.values,
      annotation: item.annotation,
    }));
  }, [activeUsersData]);

  const areaChartData = useMemo(() => {
    if (!activeUsersData || activeUsersData.length === 0) {
      return [];
    }
    return activeUsersData.map((item) => ({
      label: item.label,
      accountUsers: item.accountUsers,
      activeUsers: item.activeUsers,
    }));
  }, [activeUsersData]);

  const activePeriodLabel = useMemo(() => {
    const year = new Date().getFullYear();
    if (activePeriod === "Weekly") return `${t.dashboard.weekly}, ${year}`;
    if (activePeriod === "Monthly") return `${t.dashboard.monthly}, ${year}`;
    if (activePeriod === "Yearly") return `${t.dashboard.yearly}`;
    return t.dashboard.all;
  }, [activePeriod, t]);

  const totalTrafficConnect = useMemo(() => {
    const total = currentTrafficSegments.reduce((sum, s) => sum + s.value, 0);
    if (total >= 1000) return `${t.dashboard.totalConnect} ${(total / 1000).toFixed(1)}k`;
    return `${t.dashboard.totalConnect} ${total}`;
  }, [currentTrafficSegments, t]);

  const totalActiveUsersCount = useMemo(() => {
    if (!activeUsersData || activeUsersData.length === 0) return 4102;
    const lastItem = activeUsersData[activeUsersData.length - 1];
    return lastItem.accountUsers || 4102;
  }, [activeUsersData]);

  if (loading && !activeUsersData) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center gap-4 bg-white rounded-3xl border border-gray-200 shadow-xs">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
        <p className="text-sm font-medium text-gray-500">
          {t.dashboard.retrievingOverview}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center gap-4 bg-white rounded-3xl border border-gray-200 shadow-xs p-6 text-center">
        <div className="p-3 bg-error-50 text-error-600 rounded-full">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div>
          <p className="text-base font-semibold text-gray-800">
            {t.dashboard.failedToLoadOverview}
          </p>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
        </div>
        <button
          onClick={refetch}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-primary hover:bg-primary-dark text-white shadow-xs transition-all cursor-pointer"
        >
          <RefreshCw size={14} />
          {t.dashboard.tryAgain}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Period Selector row ── */}
      <div className="flex justify-end">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-gray-100 overflow-x-auto max-w-full no-scrollbar shadow-inner border border-gray-200/50">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setActivePeriod(p)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 whitespace-nowrap cursor-pointer ${
                activePeriod === p
                  ? "bg-white text-gray-900 shadow-xs font-bold"
                  : "text-gray-500 hover:text-gray-700 hover:bg-black/5"
              }`}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      {/* ── Row 1: Traffic + Detail ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
        <Card className="lg:col-span-2 transition-all duration-300 hover:shadow-md border border-gray-100 hover:border-gray-200/80">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            {t.dashboard.trafficChannel}
          </h3>
          <Suspense fallback={<ChartFallback />}>
            <DonutChartJS
              segments={currentTrafficSegments}
              trendUp
              trendValue={`21% ${t.dashboard.lastMonth}`}
              centerSubtext={totalTrafficConnect}
            />
          </Suspense>
        </Card>

        <Card className="lg:col-span-3 transition-all duration-300 hover:shadow-md border border-gray-100 hover:border-gray-200/80">
          <Suspense fallback={<ChartFallback />}>
            <BarChartJS
              data={barData}
              title={t.dashboard.channelActivityBreakdown}
              periodLabel={activePeriodLabel}
              height={240}
            />
          </Suspense>
        </Card>
      </div>

      {/* ── Row 2: Stats Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-8 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <SummaryCard
            variant="gradient"
            label={t.dashboard.totalProfit}
            value="$82,373.21"
            icon={<DollarSign size={20} />}
            trend={{ value: `2.4% ${t.dashboard.lastMonth}`, up: true }}
            className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          />
        </div>
        <div className="lg:col-span-2">
          <SummaryCard
            label={t.dashboard.impression}
            value="10,000"
            icon={<Eye size={20} />}
            color="#3B82F6"
            trend={{ value: `2.4% ${t.dashboard.lastMonth}`, up: true }}
            className="transition-all duration-300 hover:-translate-y-1 hover:shadow-md border border-gray-100 hover:border-gray-200/80"
          />
        </div>
        <div className="lg:col-span-2">
          <SummaryCard
            label={t.dashboard.totalUser}
            value="4,000"
            icon={<Users size={20} />}
            color="#F59E0B"
            trend={{ value: `-2% ${t.dashboard.lastMonth}`, up: false }}
            className="transition-all duration-300 hover:-translate-y-1 hover:shadow-md border border-gray-100 hover:border-gray-200/80"
          />
        </div>
        <div className="lg:col-span-2">
          <SummaryCard
            label={t.dashboard.activeSessions}
            value="10,000"
            icon={<Activity size={20} />}
            color="#8B5CF6"
            trend={{ value: `-2.4% ${t.dashboard.lastMonth}`, up: false }}
            className="transition-all duration-300 hover:-translate-y-1 hover:shadow-md border border-gray-100 hover:border-gray-200/80"
          />
        </div>
      </div>

      {/* ── Row 4: Detailed Chart + Sidebar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
        <Card className="lg:col-span-4 transition-all duration-300 hover:shadow-md border border-gray-100 hover:border-gray-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <h3 className="text-xl font-semibold text-gray-800">
              {t.dashboard.detailedUserActiveChart}
            </h3>
            <span className="text-xs text-gray-500 font-semibold">
              {activePeriodLabel}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-red-600"></span>
              <span className="text-xs text-gray-600 font-medium">
                {t.dashboard.accountUsers}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-orange-400"></span>
              <span className="text-xs text-gray-600 font-medium">
                {t.dashboard.activeUsers}
              </span>
            </div>
          </div>
          <Suspense fallback={<ChartFallback height={400} />}>
            <AreaChartJS data={areaChartData} height={400} />
          </Suspense>
        </Card>

        <Card className="lg:col-span-1 transition-all duration-300 hover:shadow-md border border-gray-100 hover:border-gray-200/80">
          <UserStatsSummary
            period={`${activePeriod}`}
            totalUsers={totalActiveUsersCount}
            newUsers={100}
            lostUsers={4}
            oldUserDeleted={1}
            newUserDeleted={1}
            adRemovedFromNew={1}
            adRemovedFromOld={1}
          />
        </Card>
      </div>

      {/* ── Row 5: Age/Gender ── */}
      <div className="flex items-start justify-between">
        <Card className="md:col-span-3 lg:col-span-2 transition-all duration-300 hover:shadow-md border border-gray-100 hover:border-gray-200/80">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Age/Gender
          </h3>
          <Suspense fallback={<ChartFallback />}>
            <PieChartJS segments={currentAgeGenderData} showLegend={true} />
          </Suspense>
        </Card>
      </div>
    </div>
  );
}
