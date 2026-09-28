import React, { useState, useMemo, useRef, useEffect } from "react"
import {
  Repeat,
  Coins,
  Users,
  Package,
  Download,
  MoreVertical,
  Table as TableIcon,
  Image as ImageIcon,
  FileSpreadsheet,
} from "lucide-react"
import Chart from "react-apexcharts"
import type { ApexOptions } from "apexcharts"
import SummaryCard from "../../../../components/ui/SummaryCard"
import { TrendBadge } from "../common/StatusBadge"
import type { ReportStats, RewardPerformance } from "../../types"
import {
  TIMELINE_EXCHANGE_DATA,
  POPULAR_REWARDS_SEGMENTS,
} from "../../api/mockData"
import { useToastStore } from "../../../../stores/toastStore"

interface ReportsTabProps {
  stats: ReportStats
  performances: RewardPerformance[]
  onViewAll?: () => void
}

export const ReportsTab: React.FC<ReportsTabProps> = ({
  stats,
  performances,
  onViewAll,
}) => {
  const { addToast } = useToastStore()
  const [reportPeriod, setReportPeriod] = useState("this-month")

  // Dropdown states for charts
  const [openChartDropdown, setOpenChartDropdown] = useState<"line" | "donut" | null>(null)
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenChartDropdown(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleExportPDF = () => {
    addToast("info", "Đang khởi tạo bản in báo cáo PDF...")
    setTimeout(() => {
      addToast("success", "Xuất báo cáo PDF thành công!")
    }, 800)
  }

  const handleChartAction = (chartName: string, action: string) => {
    setOpenChartDropdown(null)
    if (action === "table") {
      addToast("info", `Đang chuyển ${chartName} sang dạng bảng dữ liệu`)
    } else if (action === "png") {
      addToast("success", `Đã lưu ảnh biểu đồ ${chartName} (PNG)`)
    } else if (action === "excel") {
      addToast("success", `Đã xuất dữ liệu ${chartName} sang Excel`)
    }
  }

  // ApexCharts Config for Line/Area Chart
  const lineSeries = useMemo(
    () => [
      {
        name: "Lượt đổi",
        data: TIMELINE_EXCHANGE_DATA.map((d) => d.value),
      },
    ],
    [],
  )

  const lineOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        type: "area",
        height: 250,
        toolbar: { show: false },
        zoom: { enabled: false },
        fontFamily: "inherit",
      },
      colors: ["#910B09"],
      dataLabels: { enabled: false },
      stroke: {
        curve: "smooth",
        width: 3,
        colors: ["#910B09"],
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.25,
          opacityTo: 0.02,
          stops: [0, 95, 100],
          colorStops: [
            { offset: 0, color: "#910B09", opacity: 0.35 },
            { offset: 100, color: "#910B09", opacity: 0.0 },
          ],
        },
      },
      markers: {
        size: 3.5,
        colors: ["#910B09"],
        strokeColors: "#fff",
        strokeWidth: 2,
        hover: { size: 6 },
      },
      xaxis: {
        categories: TIMELINE_EXCHANGE_DATA.map((d) => d.label),
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          style: {
            colors: "#9CA3AF",
            fontSize: "12px",
          },
        },
      },
      yaxis: {
        min: 0,
        max: 50,
        tickAmount: 5,
        labels: {
          style: {
            colors: "#9CA3AF",
            fontSize: "12px",
          },
          formatter: (v) => `${v}`,
        },
      },
      grid: {
        borderColor: "#F3F4F6",
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
      },
      tooltip: {
        theme: "light",
        y: {
          formatter: (val) => `${val} lượt đổi`,
        },
      },
    }),
    [],
  )

  // ApexCharts Config for Donut Chart
  const donutSeries = useMemo(
    () => POPULAR_REWARDS_SEGMENTS.map((s) => s.value),
    [],
  )
  const donutLabels = useMemo(
    () => POPULAR_REWARDS_SEGMENTS.map((s) => s.label),
    [],
  )
  const donutColors = useMemo(
    () => POPULAR_REWARDS_SEGMENTS.map((s) => s.color),
    [],
  )

  const donutOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        type: "donut",
        fontFamily: "inherit",
      },
      labels: donutLabels,
      colors: donutColors,
      dataLabels: { enabled: false },
      stroke: { width: 2, colors: ["#ffffff"] },
      legend: { show: false },
      plotOptions: {
        pie: {
          expandOnClick: false,
          donut: {
            size: "72%",
            labels: {
              show: true,
              name: { show: false },
              value: {
                show: true,
                fontSize: "18px",
                fontWeight: 700,
                color: "#111827",
                formatter: () => "342 Lượt",
              },
              total: {
                show: true,
                label: "",
                formatter: () => "342 Lượt",
              },
            },
          },
        },
      },
      tooltip: {
        theme: "light",
        y: {
          formatter: (val) => `${val}%`,
        },
      },
    }),
    [donutLabels, donutColors],
  )

  return (
    <div className="space-y-6">
      {/* ── Sub-header with Filter and Export PDF ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500">Kỳ báo cáo:</span>
          <select
            value={reportPeriod}
            onChange={(e) => setReportPeriod(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <option value="today">Hôm nay</option>
            <option value="last-7-days">7 ngày qua</option>
            <option value="this-month">Tháng này</option>
            <option value="this-quarter">Quý này</option>
            <option value="this-year">Năm nay</option>
          </select>
        </div>

        <button
          type="button"
          onClick={handleExportPDF}
          className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-2xs cursor-pointer self-end sm:self-auto"
        >
          <Download size={16} />
          <span>Xuất báo cáo PDF</span>
        </button>
      </div>

      {/* ── 4 KPI Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          icon={<Repeat size={20} />}
          color="#2563EB"
          label="Tổng lượt đổi"
          value={`${stats.totalExchanges} lượt`}
          trend={{ value: `+${stats.exchangesGrowth}% so với tháng trước`, up: true }}
        />
        <SummaryCard
          icon={<Coins size={20} />}
          color="#910B09"
          label="Tổng điểm đã tiêu"
          value={`${stats.totalPointsSpent.toLocaleString()} pts`}
          trend={{ value: `+${stats.pointsGrowth}% so với tháng trước`, up: true }}
        />
        <SummaryCard
          icon={<Users size={20} />}
          color="#059669"
          label="Học viên tham gia"
          value={`${stats.participatingStudents} người`}
          subtitle={`Trung bình ${stats.avgPerStudent} lượt/người`}
        />
        <SummaryCard
          icon={<Package size={20} />}
          color="#D97706"
          label="Phần thưởng còn lại"
          value={`${stats.remainingRewards.toLocaleString()} mục`}
          subtitle={
            <span className="text-amber-600 font-medium">
              {stats.lowStockCount} mục sắp hết hàng
            </span>
          }
        />
      </div>

      {/* ── 2 Charts Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" ref={dropdownRef}>
        {/* Chart 1: Lượt đổi theo thời gian */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs relative">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 text-base">
              Lượt đổi theo thời gian
            </h3>

            {/* Dropdown 3 dots */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenChartDropdown((prev) => (prev === "line" ? null : "line"))
                }
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <MoreVertical size={18} />
              </button>

              {openChartDropdown === "line" && (
                <div className="absolute right-0 top-8 z-30 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 text-xs text-gray-700 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    type="button"
                    onClick={() => handleChartAction("Lượt đổi theo thời gian", "table")}
                    className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-gray-50 text-left transition-colors"
                  >
                    <TableIcon size={14} className="text-gray-400" />
                    <span>Xem dạng bảng</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChartAction("Lượt đổi theo thời gian", "png")}
                    className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-gray-50 text-left transition-colors"
                  >
                    <ImageIcon size={14} className="text-gray-400" />
                    <span>Tải ảnh biểu đồ (PNG)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChartAction("Lượt đổi theo thời gian", "excel")}
                    className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-gray-50 text-left transition-colors"
                  >
                    <FileSpreadsheet size={14} className="text-gray-400" />
                    <span>Xuất dữ liệu Excel</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="w-full h-[250px]">
            <Chart
              options={lineOptions}
              series={lineSeries}
              type="area"
              height={250}
              width="100%"
            />
          </div>
        </div>

        {/* Chart 2: Phần thưởng phổ biến nhất */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs relative">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 text-base">
              Phần thưởng phổ biến nhất
            </h3>

            {/* Dropdown 3 dots */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenChartDropdown((prev) => (prev === "donut" ? null : "donut"))
                }
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <MoreVertical size={18} />
              </button>

              {openChartDropdown === "donut" && (
                <div className="absolute right-0 top-8 z-30 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 text-xs text-gray-700 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    type="button"
                    onClick={() =>
                      handleChartAction("Phần thưởng phổ biến", "table")
                    }
                    className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-gray-50 text-left transition-colors"
                  >
                    <TableIcon size={14} className="text-gray-400" />
                    <span>Xem dạng bảng</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleChartAction("Phần thưởng phổ biến", "png")
                    }
                    className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-gray-50 text-left transition-colors"
                  >
                    <ImageIcon size={14} className="text-gray-400" />
                    <span>Tải ảnh biểu đồ (PNG)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleChartAction("Phần thưởng phổ biến", "excel")
                    }
                    className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-gray-50 text-left transition-colors"
                  >
                    <FileSpreadsheet size={14} className="text-gray-400" />
                    <span>Xuất dữ liệu Excel</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 h-[250px]">
            <div className="relative shrink-0 w-48 h-48 flex justify-center items-center">
              <Chart
                options={donutOptions}
                series={donutSeries}
                type="donut"
                width={190}
              />
            </div>

            {/* Custom Legend */}
            <div className="w-full sm:w-auto flex-1 space-y-2.5 text-xs">
              {POPULAR_REWARDS_SEGMENTS.map((seg) => (
                <div
                  key={seg.label}
                  className="flex items-center justify-between text-gray-700"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: seg.color }}
                    />
                    <span className="font-medium truncate max-w-[150px]">
                      {seg.label}
                    </span>
                  </div>
                  <span className="font-bold text-gray-900 ml-2">
                    ({seg.value}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Performance Breakdown Table ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        {/* Table Title Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-sm sm:text-base">
            Chi tiết theo từng phần thưởng
          </h3>
          <button
            type="button"
            onClick={onViewAll}
            className="text-primary hover:text-primary-dark font-semibold text-xs sm:text-sm flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Xem tất cả</span>
            <span>→</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#910B09] text-white text-xs font-bold tracking-wider uppercase">
                <th className="px-5 py-3.5">PHẦN THƯỞNG</th>
                <th className="px-5 py-3.5">ĐIỂM CẦN</th>
                <th className="px-5 py-3.5">LƯỢT ĐỔI (KỲ NÀY)</th>
                <th className="px-5 py-3.5">TỔNG ĐIỂM TIÊU</th>
                <th className="px-5 py-3.5">TỒN KHO CÒN</th>
                <th className="px-5 py-3.5 text-center">XU HƯỚNG</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {performances.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                  {/* Phần thưởng */}
                  <td className="px-5 py-4 font-semibold text-gray-900">
                    {p.title}
                  </td>

                  {/* Điểm cần */}
                  <td className="px-5 py-4 font-bold text-gray-800">
                    {p.pointsCost.toLocaleString()}
                  </td>

                  {/* Lượt đổi kỳ này */}
                  <td className="px-5 py-4 font-semibold text-gray-800">
                    {p.exchangeCount}
                  </td>

                  {/* Tổng điểm tiêu */}
                  <td className="px-5 py-4 font-semibold text-gray-800">
                    {p.totalPointsSpent.toLocaleString()}
                  </td>

                  {/* Tồn kho còn */}
                  <td className="px-5 py-4 font-semibold">
                    {typeof p.remainingStock === "number" &&
                    p.remainingStock <= 15 ? (
                      <span className="text-rose-600 font-bold">
                        {p.remainingStock}
                      </span>
                    ) : (
                      <span className="text-gray-800">{p.remainingStock}</span>
                    )}
                  </td>

                  {/* Xu hướng */}
                  <td className="px-5 py-4 text-center">
                    <TrendBadge trend={p.trend} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ReportsTab
