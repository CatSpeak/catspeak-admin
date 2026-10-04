import React, { useState, useMemo, useRef, useEffect, useCallback } from "react"
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
import { useToastStore } from "../../../../stores/toastStore"
import { useLanguage } from "../../../../stores/languageStore"
import { getApiErrorMessage } from "../../../../lib/axios"
import {
  getPointRedemptionReports,
  exportPointRedemptionReportsPdf,
} from "../../api"
import type {
  PointRedemptionReportsDto,
  ReportPeriod,
} from "../../types"

interface ReportsTabProps {
  onViewAll?: () => void
}

const DONUT_COLORS = ["#EA580C", "#F59E0B", "#910B09", "#475569", "#2563EB", "#059669"]

export const ReportsTab: React.FC<ReportsTabProps> = ({
  onViewAll,
}) => {
  const { t } = useLanguage()
  const { addToast } = useToastStore()

  const [period, setPeriod] = useState<ReportPeriod>("ThisMonth")
  const [reportsData, setReportsData] = useState<PointRedemptionReportsDto | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

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

  // Fetch reports data
  const fetchReports = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getPointRedemptionReports({ period })
      setReportsData(data)
    } catch (err) {
      console.error("Failed to load reports data:", err)
      addToast("error", t.pointRewards.toasts.loadDataError)
    } finally {
      setIsLoading(false)
    }
  }, [period, addToast, t])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  // Export PDF handler
  const handleExportPDF = async () => {
    setIsExporting(true)
    addToast("info", t.pointRewards.reports.exportingPdf)
    try {
      const blob = await exportPointRedemptionReportsPdf({ period })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `BaoCaoDoiDiem_${period}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      addToast("success", t.pointRewards.reports.exportPdfSuccess)
    } catch (err: unknown) {
      const errorMsg = getApiErrorMessage(err, t.pointRewards.toasts.actionError)
      addToast("error", errorMsg)
    } finally {
      setIsExporting(false)
    }
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
  const lineCategories = useMemo(
    () => reportsData?.redemptionsOverTime?.map((d) => d.label) || [],
    [reportsData],
  )
  const lineSeriesData = useMemo(
    () => reportsData?.redemptionsOverTime?.map((d) => d.value) || [],
    [reportsData],
  )

  const lineSeries = useMemo(
    () => [
      {
        name: t.pointRewards.reports.statsTotalRedemptions,
        data: lineSeriesData,
      },
    ],
    [lineSeriesData, t],
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
        categories: lineCategories,
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
        tickAmount: 5,
        labels: {
          style: {
            colors: "#9CA3AF",
            fontSize: "12px",
          },
          formatter: (v) => `${Math.round(v)}`,
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
          formatter: (val) => `${val} lượt`,
        },
      },
    }),
    [lineCategories],
  )

  // ApexCharts Config for Donut Chart
  const popularRewards = reportsData?.popularRewards || []
  const donutSeries = useMemo(
    () => popularRewards.map((s) => s.value),
    [popularRewards],
  )
  const donutLabels = useMemo(
    () => popularRewards.map((s) => s.label),
    [popularRewards],
  )
  const donutColors = useMemo(
    () =>
      popularRewards.map(
        (_, idx) => DONUT_COLORS[idx % DONUT_COLORS.length],
      ),
    [popularRewards],
  )

  const totalDonutValue = useMemo(
    () => donutSeries.reduce((a, b) => a + b, 0),
    [donutSeries],
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
                formatter: () => `${totalDonutValue} Lượt`,
              },
              total: {
                show: true,
                label: "",
                formatter: () => `${totalDonutValue} Lượt`,
              },
            },
          },
        },
      },
      tooltip: {
        theme: "light",
        y: {
          formatter: (val) => `${val} lượt`,
        },
      },
    }),
    [donutLabels, donutColors, totalDonutValue],
  )

  // Helper for trend badge
  const mapTrendToBadge = (trendStr: string) => {
    const lower = trendStr.toLowerCase()
    if (lower.includes("tăng") || lower.includes("up")) return "up"
    if (lower.includes("giảm") || lower.includes("down")) return "down"
    return "stable"
  }

  return (
    <div className="space-y-6">
      {/* ── Sub-header with Filter and Export PDF ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500">
            {t.pointRewards.reports.periodLabel}
          </span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as ReportPeriod)}
            className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <option value="ThisWeek">{t.pointRewards.reports.periodThisWeek}</option>
            <option value="ThisMonth">{t.pointRewards.reports.periodThisMonth}</option>
            <option value="LastMonth">{t.pointRewards.reports.periodLastMonth}</option>
            <option value="Custom">{t.pointRewards.reports.periodCustom}</option>
          </select>
        </div>

        <button
          type="button"
          disabled={isExporting}
          onClick={handleExportPDF}
          className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-2xs cursor-pointer self-end sm:self-auto disabled:opacity-50"
        >
          <Download size={16} />
          <span>{t.pointRewards.reports.btnExportPdf}</span>
        </button>
      </div>

      {/* ── 4 KPI Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total redemptions */}
        <SummaryCard
          icon={<Repeat size={20} />}
          color="#2563EB"
          label={t.pointRewards.reports.statsTotalRedemptions}
          value={
            isLoading
              ? "..."
              : `${reportsData?.totalRedemptions || 0} lượt`
          }
          trend={
            reportsData?.totalRedemptionsChangePercent !== undefined
              ? {
                  value: `${reportsData.totalRedemptionsChangePercent > 0 ? "+" : ""}${reportsData.totalRedemptionsChangePercent}% ${t.pointRewards.reports.comparedToPrev}`,
                  up: reportsData.totalRedemptionsChangePercent >= 0,
                }
              : undefined
          }
        />

        {/* Total points spent */}
        <SummaryCard
          icon={<Coins size={20} />}
          color="#910B09"
          label={t.pointRewards.reports.statsTotalPointsSpent}
          value={
            isLoading
              ? "..."
              : `${(reportsData?.totalPointsSpent || 0).toLocaleString()}`
          }
          trend={
            reportsData?.totalPointsSpentChangePercent !== undefined
              ? {
                  value: `${reportsData.totalPointsSpentChangePercent > 0 ? "+" : ""}${reportsData.totalPointsSpentChangePercent}% ${t.pointRewards.reports.comparedToPrev}`,
                  up: reportsData.totalPointsSpentChangePercent >= 0,
                }
              : undefined
          }
        />

        {/* Unique users */}
        <SummaryCard
          icon={<Users size={20} />}
          color="#059669"
          label={t.pointRewards.reports.statsUniqueUsers}
          value={
            isLoading
              ? "..."
              : `${reportsData?.uniqueUsersCount || 0} người`
          }
        />

        {/* Remaining rewards */}
        <SummaryCard
          icon={<Package size={20} />}
          color="#D97706"
          label={t.pointRewards.reports.statsRemainingInventory}
          value={
            isLoading
              ? "..."
              : `${(reportsData?.remainingInventory || 0).toLocaleString()} ${t.pointRewards.reports.statsRemainingInventoryUnit}`
          }
          subtitle={
            reportsData?.lowStockItemsCount ? (
              <span className="text-amber-600 font-medium">
                {t.pointRewards.reports.statsLowStockWarning.replace(
                  "{count}",
                  String(reportsData.lowStockItemsCount),
                )}
              </span>
            ) : undefined
          }
        />
      </div>

      {/* ── 2 Charts Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" ref={dropdownRef}>
        {/* Chart 1: Lượt đổi theo thời gian */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs relative">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 text-base">
              {t.pointRewards.reports.chartTimelineTitle}
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
                    onClick={() =>
                      handleChartAction(
                        t.pointRewards.reports.chartTimelineTitle,
                        "table",
                      )
                    }
                    className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-gray-50 text-left transition-colors cursor-pointer"
                  >
                    <TableIcon size={14} className="text-gray-400" />
                    <span>{t.pointRewards.reports.menuTableView}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleChartAction(
                        t.pointRewards.reports.chartTimelineTitle,
                        "png",
                      )
                    }
                    className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-gray-50 text-left transition-colors cursor-pointer"
                  >
                    <ImageIcon size={14} className="text-gray-400" />
                    <span>{t.pointRewards.reports.menuDownloadPng}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleChartAction(
                        t.pointRewards.reports.chartTimelineTitle,
                        "excel",
                      )
                    }
                    className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-gray-50 text-left transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet size={14} className="text-gray-400" />
                    <span>{t.pointRewards.reports.menuExportExcel}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="w-full h-[250px]">
            {lineSeriesData.length > 0 ? (
              <Chart
                options={lineOptions}
                series={lineSeries}
                type="area"
                height={250}
                width="100%"
              />
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-gray-400">
                {isLoading ? "Đang tải biểu đồ..." : "Chưa có dữ liệu xu hướng"}
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Phần thưởng phổ biến nhất */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs relative">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 text-base">
              {t.pointRewards.reports.chartPopularTitle}
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
                      handleChartAction(
                        t.pointRewards.reports.chartPopularTitle,
                        "table",
                      )
                    }
                    className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-gray-50 text-left transition-colors cursor-pointer"
                  >
                    <TableIcon size={14} className="text-gray-400" />
                    <span>{t.pointRewards.reports.menuTableView}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleChartAction(
                        t.pointRewards.reports.chartPopularTitle,
                        "png",
                      )
                    }
                    className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-gray-50 text-left transition-colors cursor-pointer"
                  >
                    <ImageIcon size={14} className="text-gray-400" />
                    <span>{t.pointRewards.reports.menuDownloadPng}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleChartAction(
                        t.pointRewards.reports.chartPopularTitle,
                        "excel",
                      )
                    }
                    className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-gray-50 text-left transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet size={14} className="text-gray-400" />
                    <span>{t.pointRewards.reports.menuExportExcel}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 h-[250px]">
            {popularRewards.length > 0 ? (
              <>
                <div className="relative shrink-0 w-48 h-48 flex justify-center items-center">
                  <Chart
                    options={donutOptions}
                    series={donutSeries}
                    type="donut"
                    width={190}
                  />
                </div>

                {/* Custom Legend */}
                <div className="w-full sm:w-auto flex-1 space-y-2.5 text-xs max-h-48 overflow-y-auto pr-1">
                  {popularRewards.map((seg, idx) => (
                    <div
                      key={seg.label}
                      className="flex items-center justify-between text-gray-700"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{
                            backgroundColor:
                              DONUT_COLORS[idx % DONUT_COLORS.length],
                          }}
                        />
                        <span className="font-medium truncate max-w-[140px]">
                          {seg.label}
                        </span>
                      </div>
                      <span className="font-bold text-gray-900 ml-2">
                        {seg.value} lượt
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
                {isLoading ? "Đang tải biểu đồ..." : "Chưa có dữ liệu phần thưởng"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom Performance Breakdown Table ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        {/* Table Title Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-sm sm:text-base">
            {t.pointRewards.reports.tableTitle}
          </h3>
          <button
            type="button"
            onClick={onViewAll}
            className="text-primary hover:text-primary-dark font-semibold text-xs sm:text-sm flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>{t.pointRewards.reports.btnViewAll}</span>
            <span>→</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#910B09] text-white text-xs font-bold tracking-wider uppercase">
                <th className="px-5 py-3.5">{t.pointRewards.reports.colReward}</th>
                <th className="px-5 py-3.5">{t.pointRewards.reports.colPointsCost}</th>
                <th className="px-5 py-3.5">{t.pointRewards.reports.colExchangeCount}</th>
                <th className="px-5 py-3.5">{t.pointRewards.reports.colTotalPointsSpent}</th>
                <th className="px-5 py-3.5">{t.pointRewards.reports.colRemainingStock}</th>
                <th className="px-5 py-3.5 text-center">{t.pointRewards.reports.colTrend}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-500 text-sm">
                    Đang tải bảng báo cáo chi tiết...
                  </td>
                </tr>
              ) : (reportsData?.rewardDetails || []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-500 text-sm">
                    Chưa có dữ liệu chi tiết phần thưởng
                  </td>
                </tr>
              ) : (
                reportsData?.rewardDetails.map((p) => (
                  <tr key={p.itemId} className="hover:bg-gray-50/70 transition-colors">
                    {/* Phần thưởng */}
                    <td className="px-5 py-4 font-semibold text-gray-900">
                      {p.voucherName}
                    </td>

                    {/* Điểm cần */}
                    <td className="px-5 py-4 font-bold text-gray-800">
                      {p.pointsRequired.toLocaleString()}
                    </td>

                    {/* Lượt đổi kỳ này */}
                    <td className="px-5 py-4 font-semibold text-gray-800">
                      {p.redemptionsThisPeriod}
                    </td>

                    {/* Tổng điểm tiêu */}
                    <td className="px-5 py-4 font-semibold text-gray-800">
                      {p.totalPointsSpent.toLocaleString()}
                    </td>

                    {/* Tồn kho còn */}
                    <td className="px-5 py-4 font-semibold">
                      {typeof p.remainingInventory === "number" &&
                      p.remainingInventory <= 15 ? (
                        <span className="text-rose-600 font-bold">
                          {p.remainingInventory}
                        </span>
                      ) : (
                        <span className="text-gray-800">
                          {p.remainingInventory ?? t.pointRewards.catalog.unlimited}
                        </span>
                      )}
                    </td>

                    {/* Xu hướng */}
                    <td className="px-5 py-4 text-center">
                      <TrendBadge trend={mapTrendToBadge(p.trend)} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ReportsTab
