import { useState } from "react";
import DonutChartJS from "./components/DonutChartJS";
import BarChartJS from "./components/BarChartJS";
import LineChartJS from "./components/LineChartJS";
import AreaChartJS from "./components/AreaChartJS";
import PieChartJS from "./components/PieChartJS";
import UserStatsSummary from "./components/UserStatsSummary";
import LanguageStats from "./components/LanguageStats";
import StatsCard from "./components/StatsCard";
import Card from "../../components/ui/Card";

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

// Language statistics
const languageData = [
  { name: "China", count: 102, color: "#C8102E" },
  { name: "English", count: 102, color: "#C8102E" },
];

export default function Dashboard() {
  const [activePeriod, setActivePeriod] =
    useState<(typeof periods)[number]>("Monthly");

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Page Title + Tabs ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-primary">Overview</h1>

        <div className="flex items-center gap-1 p-1 rounded-lg bg-gray-100 overflow-x-auto max-w-full no-scrollbar">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setActivePeriod(p)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 whitespace-nowrap ${
                activePeriod === p
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
          <DonutChartJS
            segments={trafficSegments}
            trendUp
            trendValue="21% from last month"
            centerSubtext="Total 10k connect"
          />
        </Card>

        {/* Detail Bar Chart - 3 cols */}
        <Card className="lg:col-span-3 animate-fade-in delay-2">
          <BarChartJS
            data={barData}
            title="Detail"
            periodLabel="July, 2025"
            height={240}
          />
        </Card>
      </div>

      {/* ── Row 2: Stats Cards (Varied widths) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-8 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <StatsCard
            variant="gradient"
            title="Total profit"
            value="$82,373.21"
            trend={{ value: "2.4% from last month", up: true }}
          />
        </div>
        <div className="lg:col-span-2">
          <StatsCard
            title="Impression"
            value="10,000 Rooms"
            subtitle="In this month (July, 2025)"
          />
        </div>
        <div className="lg:col-span-2">
          <StatsCard
            // variant="gradient"
            title="Total User"
            value="4,000 Users"
            trend={{ value: "-2% from last month", up: false }}
          />
        </div>
        <div className="lg:col-span-2">
          <StatsCard
            title="Impression"
            value="10,000 Rooms"
            subtitle="In this month (July, 2025)"
          />
        </div>
      </div>

      {/* ── Row 3: Detailed Chart + Sidebar (Asymmetric) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
        {/* Area Chart - 3 cols */}
        <Card className="lg:col-span-3 animate-fade-in delay-3">
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
          <AreaChartJS data={areaChartData} height={280} />
        </Card>

        {/* User Stats Summary - 2 cols */}
        <Card className="lg:col-span-2 animate-fade-in delay-4">
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

      {/* ── Row 4: Age/Gender + Languages (Asymmetric) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4 sm:gap-6">
        {/* Age/Gender Pie Chart - 3 cols */}
        <Card className="md:col-span-2 lg:col-span-2 animate-fade-in delay-5">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Age/Gender
          </h3>
          <PieChartJS segments={ageGenderData} showLegend={true} />
        </Card>

        {/* Languages - 2 cols */}
        <Card className="md:col-span-1 lg:col-span-1 animate-fade-in delay-6">
          <LanguageStats languages={languageData} />
        </Card>

        {/* Line Chart - 2 cols */}
        <Card className="md:col-span-3 lg:col-span-4 animate-fade-in delay-7">
          <LineChartJS data={lineData} height={300} />
        </Card>
      </div>
    </div>
  );
}
