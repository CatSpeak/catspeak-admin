import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import {
  Wallet,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Ban,
  ArrowRight,
  RefreshCw,
  FileText,
  AlertTriangle
} from "lucide-react";
import Card from "../../../components/ui/Card";
import type { DashboardStats } from "../api/getDashboardStats";

interface PaymentsDashboardProps {
  data: DashboardStats;
  loading: boolean;
  refetch: () => void;
}

export default function PaymentsDashboard({
  data,
  loading,
  refetch,
}: PaymentsDashboardProps) {
  const navigate = useNavigate();
  const [chartMode, setChartMode] = useState<"revenue" | "transactions">("revenue");

  // Format currency helpers
  const formatVND = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  // Format date helper for the chart x-axis
  const chartData = useMemo(() => {
    const dates = data.dailyRevenue.map((item) => {
      const d = new Date(item.date);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    });

    const revenue = data.dailyRevenue.map((item) => item.revenueVnd);
    const transactions = data.dailyRevenue.map((item) => item.transactionCount);

    return { dates, revenue, transactions };
  }, [data.dailyRevenue]);

  // Chart options setup
  const chartOptions: ApexOptions = useMemo(() => {
    const isRevenue = chartMode === "revenue";
    return {
      chart: {
        type: isRevenue ? "area" : "bar",
        height: 350,
        toolbar: { show: false },
        zoom: { enabled: false },
        parentHeightOffset: 0,
      },
      colors: isRevenue ? ["#10B981"] : ["#3B82F6"], // Success Emerald vs Info Blue
      dataLabels: { enabled: false },
      stroke: {
        curve: "smooth",
        width: 2,
      },
      fill: {
        type: "solid",
        opacity: isRevenue ? 0.2 : 0.8,
      },
      markers: {
        size: isRevenue ? 4 : 0,
        hover: { size: 6 },
        strokeWidth: 2,
        strokeColors: "#fff",
      },
      xaxis: {
        categories: chartData.dates,
        tooltip: { enabled: false },
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          style: {
            colors: "#9CA3AF",
            fontSize: "11px",
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: "#9CA3AF",
            fontSize: "11px",
          },
          formatter: (value: number) => {
            if (isRevenue) {
              if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
              if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
              return value.toString();
            }
            return value.toString();
          },
        },
      },
      grid: {
        borderColor: "#F3F4F6",
        strokeDashArray: 0,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
      },
      legend: { show: false },
      tooltip: {
        theme: "light",
        x: { show: true },
        y: {
          formatter: (val: number) => {
            return isRevenue ? formatVND(val) : `${val} transactions`;
          },
        },
      },
    };
  }, [chartMode, chartData]);

  const chartSeries = useMemo(() => {
    if (chartMode === "revenue") {
      return [
        {
          name: "Daily Revenue",
          data: chartData.revenue,
        },
      ];
    } else {
      return [
        {
          name: "Daily Transactions",
          data: chartData.transactions,
        },
      ];
    }
  }, [chartMode, chartData]);

  return (
    <div className="space-y-6">
      {/* ── Action Bar ── */}
      <div className="flex justify-end items-center gap-4">
        <button
          onClick={refetch}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh Stats
        </button>
      </div>

      {/* ── Payments Summary Metrics ── */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4 tracking-tight">Payments & Revenue</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Revenue Card (Double width in desktop) */}
          <div className="lg:col-span-2 bg-gradient-to-br from-[#910b09] to-[#c8102e] p-6 rounded-2xl shadow-md text-white flex flex-col justify-between min-h-[140px] hover:shadow-lg transition-all">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-white/85 uppercase tracking-wider block">
                  Total Revenue
                </span>
                <span className="text-3xl font-extrabold block mt-2">
                  {formatVND(data.totalRevenueVnd)}
                </span>
              </div>
              <div className="p-3 bg-white/10 rounded-xl">
                <Wallet className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-white/90">
              <TrendingUp size={14} />
              <span>Accrued platform profit</span>
            </div>
          </div>

          {/* Success Card */}
          <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                  Successful Trans
                </span>
                <span className="text-2xl font-bold text-success-600 block mt-2">
                  {data.successfulTransactions}
                </span>
              </div>
              <div className="p-2 bg-success-50 text-success-600 rounded-xl">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {data.totalTransactions > 0 
                ? `${((data.successfulTransactions / data.totalTransactions) * 100).toFixed(1)}% success rate` 
                : "No transactions"}
            </div>
          </div>

          {/* Pending Card */}
          <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                  Pending Trans
                </span>
                <span className="text-2xl font-bold text-warning-500 block mt-2">
                  {data.pendingTransactions}
                </span>
              </div>
              <div className="p-2 bg-warning-50 text-warning-600 rounded-xl">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Awaiting confirmation
            </div>
          </div>

          {/* Failed / Cancelled Card */}
          <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                  Failed & Cancelled
                </span>
                <span className="text-2xl font-bold text-error-600 block mt-2">
                  {data.failedTransactions + data.cancelledTransactions}
                </span>
              </div>
              <div className="p-2 bg-error-50 text-error-600 rounded-xl">
                <Ban className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Failed: {data.failedTransactions} | Cancelled: {data.cancelledTransactions}
            </div>
          </div>

        </div>
      </div>

      {/* ── Reports & Claims Summary Metrics ── */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4 tracking-tight">Payment Claims & Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Total Reports */}
          <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                Total Claims
              </span>
              <span className="text-2xl font-bold text-gray-900 block mt-0.5">
                {data.totalReports}
              </span>
            </div>
          </div>

          {/* Pending Reports */}
          <div className={`border p-5 rounded-2xl shadow-sm flex items-center gap-4 hover:shadow-md transition-all ${data.pendingReports > 0 ? "bg-warning-25 border-warning-200 text-warning-800" : "bg-white border-gray-200"}`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${data.pendingReports > 0 ? "bg-warning-100 text-warning-700 animate-pulse" : "bg-gray-100 text-gray-500"}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                Pending Claims
              </span>
              <span className={`text-2xl font-bold block mt-0.5 ${data.pendingReports > 0 ? "text-warning-800" : "text-gray-900"}`}>
                {data.pendingReports}
              </span>
            </div>
          </div>

          {/* Accepted Reports */}
          <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-success-50 text-success-600 flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                Approved Claims
              </span>
              <span className="text-2xl font-bold text-success-700 block mt-0.5">
                {data.acceptedReports}
              </span>
            </div>
          </div>

          {/* Denied Reports */}
          <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-error-50 text-error-600 flex items-center justify-center shrink-0">
              <Ban className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                Denied Claims
              </span>
              <span className="text-2xl font-bold text-error-700 block mt-0.5">
                {data.deniedReports}
              </span>
            </div>
          </div>

        </div>

        {/* ── Pending Claims Call To Action ── */}
        {data.pendingReports > 0 && (
          <div className="mt-4 bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-pulse">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 mt-0.5 text-amber-700 shrink-0" />
              <div>
                <p className="text-sm font-semibold">Pending Payment Reports Require Verification</p>
                <p className="text-xs text-amber-700 mt-0.5">There are currently {data.pendingReports} payment report claims awaiting staff or admin approval.</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/payments")}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl transition-all whitespace-nowrap self-start sm:self-auto cursor-pointer"
            >
              Go to Claim Queue
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* ── Daily Revenue & Transactions Trend Chart ── */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4 border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-800">
              {chartMode === "revenue" ? "Daily Revenue Trend" : "Daily Transactions Trend"}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Track daily activity and platform gains over time</p>
          </div>
          
          <div className="flex bg-gray-100 p-1 rounded-xl gap-1 self-start sm:self-auto">
            <button
              onClick={() => setChartMode("revenue")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                chartMode === "revenue"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Revenue (VND)
            </button>
            <button
              onClick={() => setChartMode("transactions")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                chartMode === "transactions"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Transactions Count
            </button>
          </div>
        </div>

        {data.dailyRevenue.length === 0 ? (
          <div className="flex min-h-[300px] items-center justify-center text-gray-400 text-sm">
            No daily data available
          </div>
        ) : (
          <div className="w-full min-h-[350px]">
            <Chart
              options={chartOptions}
              series={chartSeries}
              type={chartMode === "revenue" ? "area" : "bar"}
              height={350}
              width="100%"
            />
          </div>
        )}
      </Card>
    </div>
  );
}
