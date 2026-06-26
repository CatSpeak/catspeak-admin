import { lazy, Suspense, useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import UserStatsSummary from "../components/UserStatsSummary";
import SummaryCard from "../../../components/ui/SummaryCard";
import VietNamDetailCard from "../components/VietNamDetailCard";
import MonthlyTarget from "../components/MonthlyTarget";
import Card from "../../../components/ui/Card";
import { useDashboardStats } from "../hooks/useDashboardStats";
import PaymentsDashboard from "../components/PaymentsDashboard";

const WorldMapCard = lazy(() => import("../components/WorldMapCard"));
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

const trafficSegments = [
  { label: "Youtube", value: 35, color: "#C8102E" },
  { label: "Facebook", value: 23, color: "#1877F2" },
  { label: "Instagram", value: 42, color: "#E1306C" },
  { label: "Twitter", value: 1.5, color: "#FF6B6B" },
];

const barData = [
  { label: "Jul", values: [1200, 800] as [number, number], annotation: "" },
  {
    label: "5",
    values: [1800, 1400] as [number, number],
    annotation: "1189 user",
  },
  { label: "10", values: [2200, 1600] as [number, number], annotation: "" },
  { label: "15", values: [1600, 900] as [number, number], annotation: "" },
  {
    label: "20",
    values: [1400, 1100] as [number, number],
    annotation: "5/8/2025",
  },
  {
    label: "25",
    values: [800, 600] as [number, number],
    annotation: "(0/7/8025)",
  },
  {
    label: "31",
    values: [1000, 700] as [number, number],
    annotation: "Users #981",
  },
  { label: "5-Aug", values: [600, 400] as [number, number], annotation: "" },
  { label: "now", values: [700, 500] as [number, number], annotation: "" },
];

const lineData = [
  { label: "01 Jun", value: 210 },
  { label: "02 Jun", value: 230 },
  { label: "03 Jun", value: 195 },
  { label: "04 Jun", value: 260 },
  { label: "05 Jun", value: 240 },
  { label: "06 Jun", value: 280 },
  { label: "07 Jun", value: 310 },
  { label: "08 Jun", value: 290 },
  { label: "09 Jun", value: 340 },
  { label: "10 Jun", value: 380 },
  { label: "11 Jun", value: 420 },
  { label: "12 Jun", value: 580 },
];

// Enhanced data for area chart (detailed user active chart)
const areaChartData = [
  { label: "Jul", accountUsers: 3400, activeUsers: 2200 },
  { label: "5", accountUsers: 3450, activeUsers: 2450 },
  { label: "10", accountUsers: 3500, activeUsers: 2500 },
  { label: "15", accountUsers: 3550, activeUsers: 2400 },
  { label: "20", accountUsers: 3600, activeUsers: 2350 },
  { label: "25", accountUsers: 3650, activeUsers: 2300 },
  { label: "31", accountUsers: 4100, activeUsers: 2400 },
  { label: "5-Aug", accountUsers: 4102, activeUsers: 2418 },
];

// Age/Gender pie chart data
const ageGenderData = [
  { label: "<35", value: 1500, color: "#3B82F6", male: 1000, female: 500 },
  { label: "0-20", value: 1500, color: "#FFA500", male: 1000, female: 500 },
  { label: "20-35", value: 500, color: "#C8102E", male: 100, female: 400 },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"platform" | "payments">("platform");
  const [activePeriod, setActivePeriod] =
    useState<(typeof periods)[number]>("Monthly");

  const {
    data: paymentStats,
    loading: paymentLoading,
    error: paymentError,
    refetch: refetchPayments,
  } = useDashboardStats();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Page Title + Tab Switcher ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-primary tracking-tight">Overview</h1>
          <p className="text-xs text-gray-500 mt-1">Platform-wide system metrics and insights</p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
          <button
            onClick={() => setActiveTab("platform")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "platform"
                ? "bg-white text-gray-900 shadow-xs font-bold"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Platform Overview
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "payments"
                ? "bg-white text-gray-900 shadow-xs font-bold"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Payments & Claims
          </button>
        </div>
      </div>

      {activeTab === "platform" ? (
        <>
          {/* ── Period Selector row ── */}
          <div className="flex justify-end">
            <div className="flex items-center gap-1 p-1 rounded-lg bg-gray-100 overflow-x-auto max-w-full no-scrollbar">
              {periods.map((p) => (
                <button
                  key={p}
                  onClick={() => setActivePeriod(p)}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 whitespace-nowrap cursor-pointer ${activePeriod === p
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700 hover:bg-black/5"
                    }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* ── Row 1: Traffic + Detail (Asymmetric) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
            {/* Traffic Channel - 2 cols */}
            <Card className="lg:col-span-2 animate-fade-in delay-1">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                Traffic Channel
              </h3>
              <Suspense fallback={<ChartFallback />}>
                <DonutChartJS
                  segments={trafficSegments}
                  trendUp
                  trendValue="21% last month"
                  centerSubtext="Total 10k connect"
                />
              </Suspense>
            </Card>

            {/* Detail Bar Chart - 3 cols */}
            <Card className="lg:col-span-3 animate-fade-in delay-2">
              <Suspense fallback={<ChartFallback />}>
                <BarChartJS
                  data={barData}
                  title="Detail"
                  periodLabel="July, 2025"
                  height={240}
                />
              </Suspense>
            </Card>
          </div>

          {/* ── Row 3: Stats Cards (Varied widths) ── */}
          <div className="grid grid-cols-2 lg:grid-cols-8 gap-4 sm:gap-6">
            <div className="lg:col-span-2">
              <SummaryCard
                variant="gradient"
                label="Total profit"
                value="$82,373.21"
                trend={{ value: "2.4% last month", up: true }}
              />
            </div>
            <div className="lg:col-span-2">
              <SummaryCard
                label="Impression"
                value="10,000"
                trend={{ value: "2.4% last month", up: true }}
              />
            </div>
            <div className="lg:col-span-2">
              <SummaryCard
                label="Total User"
                value="4,000"
                trend={{ value: "-2% last month", up: false }}
              />
            </div>
            <div className="lg:col-span-2">
              <SummaryCard
                label="Impression"
                value="10,000"
                trend={{ value: "2.4% last month", up: false }}
              />
            </div>
          </div>

          {/* ── Row 2: World Map + Vietnam Detail Card (Asymmetric) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 sm:gap-6">
            {/* World Map - 4 cols */}
            <Card className="lg:col-span-4 animate-fade-in delay-2">
              <Suspense
                fallback={
                  <div className="flex min-h-[260px] items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
                  </div>
                }
              >
                <WorldMapCard />
              </Suspense>
            </Card>

            {/* Vietnam Detail Card - 1 col */}
            <div className="lg:col-span-2 animate-fade-in delay-2">
              <VietNamDetailCard />
            </div>
          </div>

          {/* ── Row 3: Detailed Chart + Sidebar (Asymmetric) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
            {/* Area Chart - 3 cols */}
            <Card className="lg:col-span-4 animate-fade-in delay-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                <h3 className="text-xl font-semibold text-gray-800">
                  Detailed user active chart
                </h3>
                <span className="text-xs text-gray-500">July, 2025</span>
              </div>
              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-red-600"></span>
                  <span className="text-xs text-gray-600">Account users</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-orange-400"></span>
                  <span className="text-xs text-gray-600">Active users</span>
                </div>
              </div>
              <Suspense fallback={<ChartFallback height={400} />}>
                <AreaChartJS data={areaChartData} height={400} />
              </Suspense>
            </Card>

            {/* User Stats Summary - 2 cols */}
            <Card className="lg:col-span-1 animate-fade-in delay-4">
              <UserStatsSummary
                period="In July, 2025"
                totalUsers={4102}
                newUsers={100}
                lostUsers={4}
                oldUserDeleted={1}
                newUserDeleted={1}
                adRemovedFromNew={1}
                adRemovedFromOld={1}
              />
            </Card>
          </div>

          {/* ── Row 4: Age/Gender + Languages + Monthly Target (Asymmetric) ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4 sm:gap-6">
            {/* Age/Gender Pie Chart - 2 cols */}
            <Card className="md:col-span-3 lg:col-span-2 animate-fade-in delay-5">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                Age/Gender
              </h3>
              <Suspense fallback={<ChartFallback />}>
                <PieChartJS segments={ageGenderData} showLegend={true} />
              </Suspense>
            </Card>

            <Card
              noPadding
              className="md:col-span-3 lg:col-span-2 animate-fade-in delay-7"
            >
              <MonthlyTarget />
            </Card>

            {/* Line Chart - 2 cols */}
            <Card className="md:col-span-3 lg:col-span-3 animate-fade-in delay-8">
              <Suspense fallback={<ChartFallback height={400} />}>
                <LineChartJS data={lineData} height={400} />
              </Suspense>
            </Card>
          </div>
        </>
      ) : (
        /* Payments & Claims View */
        <div className="animate-fade-in">
          {paymentLoading && !paymentStats ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 bg-white rounded-3xl border border-gray-200 shadow-sm">
              <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
              <p className="text-sm font-medium text-gray-500">Retrieving payments statistics...</p>
            </div>
          ) : paymentError ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 bg-white rounded-3xl border border-gray-200 shadow-sm p-6 text-center">
              <div className="p-3 bg-error-50 text-error-600 rounded-full">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <p className="text-base font-semibold text-gray-800">Failed to Load Dashboard Stats</p>
                <p className="text-sm text-gray-500 mt-1">{paymentError}</p>
              </div>
              <button
                onClick={refetchPayments}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-primary hover:bg-primary-dark text-white shadow-sm transition-all cursor-pointer"
              >
                <RefreshCw size={14} />
                Try Again
              </button>
            </div>
          ) : paymentStats ? (
            <PaymentsDashboard data={paymentStats} loading={paymentLoading} refetch={refetchPayments} />
          ) : null}
        </div>
      )}
    </div>
  );
}
