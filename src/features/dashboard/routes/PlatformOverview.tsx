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
// import VietNamDetailCard from "../components/VietNamDetailCard";
import MonthlyTarget from "../components/MonthlyTarget";
import { useOverviewStats } from "../hooks/useOverviewStats";
import { mockupColors } from "../api/getOverviewStats";

// Lazy-loaded charts
// const WorldMapCard = lazy(() => import("../components/WorldMapCard"));
const DonutChartJS = lazy(() => import("../components/DonutChartJS"));
const BarChartJS = lazy(() => import("../components/BarChartJS"));
const LineChartJS = lazy(() => import("../components/LineChartJS"));
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

// Default mockup data fallbacks if the API returns empty/no data
// const defaultTrafficSegments = [
//   { label: "Youtube", value: 35, color: "#C8102E" },
//   { label: "Facebook", value: 23, color: "#1877F2" },
//   { label: "Instagram", value: 42, color: "#E1306C" },
//   { label: "Twitter", value: 1.5, color: "#FF6B6B" },
// ];

// const defaultBarData = [
//   { label: "Jul", values: [1200, 800] as [number, number], annotation: "" },
//   {
//     label: "5",
//     values: [1800, 1400] as [number, number],
//     annotation: "1189 user",
//   },
//   { label: "10", values: [2200, 1600] as [number, number], annotation: "" },
//   { label: "15", values: [1600, 900] as [number, number], annotation: "" },
//   {
//     label: "20",
//     values: [1400, 1100] as [number, number],
//     annotation: "5/8/2025",
//   },
//   {
//     label: "25",
//     values: [800, 600] as [number, number],
//     annotation: "(0/7/8025)",
//   },
//   {
//     label: "31",
//     values: [1000, 700] as [number, number],
//     annotation: "Users #981",
//   },
//   { label: "5-Aug", values: [600, 400] as [number, number], annotation: "" },
//   { label: "now", values: [700, 500] as [number, number], annotation: "" },
// ];

// const defaultLineData = [
//   { label: "01 Jun", value: 210 },
//   { label: "02 Jun", value: 230 },
//   { label: "03 Jun", value: 195 },
//   { label: "04 Jun", value: 260 },
//   { label: "05 Jun", value: 240 },
//   { label: "06 Jun", value: 280 },
//   { label: "07 Jun", value: 310 },
//   { label: "08 Jun", value: 290 },
//   { label: "09 Jun", value: 340 },
//   { label: "10 Jun", value: 380 },
//   { label: "11 Jun", value: 420 },
//   { label: "12 Jun", value: 580 },
// ];

// const defaultAreaChartData = [
//   { label: "Jul", accountUsers: 3400, activeUsers: 2200 },
//   { label: "5", accountUsers: 3450, activeUsers: 2450 },
//   { label: "10", accountUsers: 3500, activeUsers: 2500 },
//   { label: "15", accountUsers: 3550, activeUsers: 2400 },
//   { label: "20", accountUsers: 3600, activeUsers: 2350 },
//   { label: "25", accountUsers: 3650, activeUsers: 2300 },
//   { label: "31", accountUsers: 4100, activeUsers: 2400 },
//   { label: "5-Aug", accountUsers: 4102, activeUsers: 2418 },
// ];

// const defaultAgeGenderData = [
//   { label: "<35", value: 1500, color: "#3B82F6", male: 1000, female: 500 },
//   { label: "0-20", value: 1500, color: "#FFA500", male: 1000, female: 500 },
//   { label: "20-35", value: 500, color: "#C8102E", male: 100, female: 400 },
// ];

import { useLanguage } from "../../../stores/languageStore";
import WorldMapCard from "../components/WorldMapCard";
import VietNamDetailCard from "../components/VietNamDetailCard";

export default function PlatformOverview() {
  const { t, language } = useLanguage();
  const [activePeriod, setActivePeriod] =
    useState<(typeof periods)[number]>("Monthly");

  // Map the period selector to active-users API params
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

  // Load backend stats
  const {
    trafficSegments,
    ageGenderData,
    activeUsersData,
    activeUsersLineData,
    monthlyTargetProgress,
    usersByRegionData,
    loading,
    error,
    refetch,
  } = useOverviewStats(apiParams, language);

  // Mapped data with fallback handling
  const currentTrafficSegments = useMemo(() => {
    if (!trafficSegments || trafficSegments.length === 0) {
      return [];
    }
    // Cycle through mockupColors if "color" is missing or check if mapping was already done by API module
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

  const lineData = useMemo(() => {
    if (activeUsersLineData && activeUsersLineData.length > 0) {
      return activeUsersLineData;
    }
    if (!activeUsersData || activeUsersData.length === 0) {
      return [];
    }
    return activeUsersData.map((item) => ({
      label: item.label,
      value: item.activeUsers ?? item.value ?? 0,
    }));
  }, [activeUsersLineData, activeUsersData]);

  // Format header period label dynamically
  const activePeriodLabel = useMemo(() => {
    const year = new Date().getFullYear();
    if (activePeriod === "Weekly") return `${t.dashboard.weeklyView}, ${year}`;
    if (activePeriod === "Monthly")
      return `${t.dashboard.monthlyView}, ${year}`;
    if (activePeriod === "Yearly") return t.dashboard.yearlyView;
    return t.dashboard.allRecords;
  }, [activePeriod, t]);

  // Calculate totals for Donut subtext
  const totalTrafficConnect = useMemo(() => {
    const total = currentTrafficSegments.reduce((sum, s) => sum + s.value, 0);
    const countStr =
      total >= 1000 ? `${(total / 1000).toFixed(1)}k` : `${total}`;
    return t.dashboard.totalConnect.replace("{count}", countStr);
  }, [currentTrafficSegments, t]);

  // Period label translation helper
  const getPeriodText = (p: (typeof periods)[number]) => {
    switch (p) {
      case "Weekly":
        return t.common.weekly;
      case "Monthly":
        return t.common.monthly;
      case "Yearly":
        return t.common.yearly;
      case "All":
        return t.common.all;
    }
  };

  // Calculate totals for active users summary
  const totalActiveUsersCount = useMemo(() => {
    if (!activeUsersData || activeUsersData.length === 0) return 4102;
    // Return last element's accountUsers or compute total
    const lastItem = activeUsersData[activeUsersData.length - 1];
    return lastItem.accountUsers || 4102;
  }, [activeUsersData]);

  if (loading && !activeUsersData) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center gap-4 bg-white rounded-3xl border border-gray-200 shadow-xs">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
        <p className="text-sm font-medium text-gray-500">
          {t.dashboard.loadingOverview}
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
            {t.dashboard.failedOverview}
          </p>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
        </div>
        <button
          onClick={refetch}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-primary hover:bg-primary-dark text-white shadow-xs transition-all cursor-pointer"
        >
          <RefreshCw size={14} />
          {t.common.retry}
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
              {getPeriodText(p)}
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

      {/* ── Row 3: World Map + Vietnam Detail Card ── */}
      <Card className="transition-all duration-300 hover:shadow-md border border-gray-100 hover:border-gray-200/80">
        <Suspense
          fallback={
            <div className="flex min-h-65 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
            </div>
          }
        >
          <WorldMapCard data={usersByRegionData || undefined} />
        </Suspense>
      </Card>

      {/* <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 sm:gap-6">
        <Card className="lg:col-span-4 transition-all duration-300 hover:shadow-md border border-gray-100 hover:border-gray-200/80">
          <Suspense
            fallback={
              <div className="flex min-h-65 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
              </div>
            }
          >
            <WorldMapCard data={usersByRegionData || undefined} />
          </Suspense>
        </Card>

        <div className="lg:col-span-2 transition-all duration-300 hover:shadow-md">
          <VietNamDetailCard />
        </div>
      </div> */}

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
            period={t.dashboard.inPeriod.replace(
              "{period}",
              getPeriodText(activePeriod),
            )}
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

      {/* ── Active Users Line Trend ── */}
      <Card className="transition-all duration-300 hover:shadow-md border border-gray-100 hover:border-gray-200/80">
        <Suspense fallback={<ChartFallback height={240} />}>
          <LineChartJS
            data={lineData}
            height={240}
            title={t.dashboard.activeUsersTrend}
          />
        </Suspense>
      </Card>

      {/* ── Row 5: Age/Gender + Monthly Target ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
        <Card className="lg:col-span-3 transition-all duration-300 hover:shadow-md border border-gray-100 hover:border-gray-200/80">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            {t.dashboard.ageGender}
          </h3>
          <Suspense fallback={<ChartFallback />}>
            <PieChartJS segments={currentAgeGenderData} showLegend={true} />
          </Suspense>
        </Card>

        <Card
          noPadding
          className="lg:col-span-2 transition-all duration-300 hover:shadow-md border border-gray-100 hover:border-gray-200/80"
        >
          <MonthlyTarget percentage={monthlyTargetProgress?.percentage} />
        </Card>
      </div>
    </div>
  );
}
