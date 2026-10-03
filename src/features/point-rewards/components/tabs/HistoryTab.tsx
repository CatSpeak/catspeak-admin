import React, { useState, useEffect, useCallback } from "react"
import {
  Search,
  Calendar,
  Download,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react"
import { useToastStore } from "../../../../stores/toastStore"
import { useLanguage } from "../../../../stores/languageStore"
import {
  formatDateTime,
  formatDateToUtcStartOfDay,
  formatDateToUtcEndOfDay,
} from "../../../../lib/utils"
import { getApiErrorMessage } from "../../../../lib/axios"
import Avatar from "../../../../components/ui/Avatar"
import Badge from "../../../../components/ui/Badge"
import {
  getPointRedemptionHistory,
  getPointRedemptionItems,
  exportPointRedemptionHistoryExcel,
} from "../../api"
import type {
  PointRedemptionHistoryDto,
  PointRedemptionItemDto,
  PointRedemptionSponsorType,
} from "../../types"

interface HistoryTabProps {
  onViewTransaction: (tx: PointRedemptionHistoryDto) => void
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  onViewTransaction,
}) => {
  const { t } = useLanguage()
  const { addToast } = useToastStore()

  // State for data
  const [transactions, setTransactions] = useState<PointRedemptionHistoryDto[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const [vouchers, setVouchers] = useState<{ id: number; name: string }[]>([])

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedVoucherId, setSelectedVoucherId] = useState<number | "">("")
  const [sponsorFilter, setSponsorFilter] = useState<"All" | PointRedemptionSponsorType>("All")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalRecords, setTotalRecords] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // Load items for filter dropdown
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await getPointRedemptionItems({ pageSize: 100 })
        const uniqueVouchers = res.data.map(item => ({
          id: item.id,
          name: item.voucherName
        }))
        setVouchers(uniqueVouchers)
      } catch (err) {
        console.error("Failed to load items for filter:", err)
      }
    }
    fetchItems()
  }, [])

  // Fetch history data
  const fetchHistory = useCallback(async () => {
    setIsLoading(true)
    try {
      const utcFrom = fromDate ? formatDateToUtcStartOfDay(fromDate) : undefined
      const utcTo = toDate ? formatDateToUtcEndOfDay(toDate) : undefined

      const res = await getPointRedemptionHistory({
        keyword: searchQuery.trim() || undefined,
        itemId: selectedVoucherId ? Number(selectedVoucherId) : undefined,
        sponsorType: sponsorFilter === "All" ? undefined : sponsorFilter,
        fromDate: utcFrom,
        toDate: utcTo,
        page: currentPage,
        pageSize,
      })

      setTransactions(res.data || [])
      setTotalRecords(res.total_records || res.additionalData?.totalCount || 0)
      setTotalPages(
        res.additionalData?.totalPages ||
          Math.ceil((res.total_records || 1) / pageSize) ||
          1,
      )
    } catch (err) {
      console.error("Failed to fetch redemption history:", err)
      addToast("error", t.pointRewards.toasts.loadDataError)
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery, selectedVoucherId, sponsorFilter, fromDate, toDate, currentPage, pageSize, addToast, t])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  // Handle Export Excel
  const handleExportExcel = async () => {
    setIsExporting(true)
    addToast("info", t.pointRewards.history.exportingExcel)
    try {
      const utcFrom = fromDate ? formatDateToUtcStartOfDay(fromDate) : undefined
      const utcTo = toDate ? formatDateToUtcEndOfDay(toDate) : undefined

      const blob = await exportPointRedemptionHistoryExcel({
        keyword: searchQuery.trim() || undefined,
        itemId: selectedVoucherId ? Number(selectedVoucherId) : undefined,
        sponsorType: sponsorFilter === "All" ? undefined : sponsorFilter,
        fromDate: utcFrom,
        toDate: utcTo,
      })

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "LichSuDoiDiem.xlsx"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      addToast("success", t.pointRewards.history.exportExcelSuccess)
    } catch (err: unknown) {
      const errorMsg = getApiErrorMessage(err, t.pointRewards.toasts.actionError)
      addToast("error", errorMsg)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Search, Filter & Export Bar ── */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
        {/* Search */}
        <div className="relative w-full lg:w-64">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder={t.pointRewards.history.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-gray-400"
          />
        </div>

        {/* Filters and Date / Export Actions */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
          {/* Voucher Dropdown */}
          <select
            value={selectedVoucherId}
            onChange={(e) => {
              setSelectedVoucherId(e.target.value ? Number(e.target.value) : "")
              setCurrentPage(1)
            }}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer hover:border-gray-300 transition-colors max-w-[180px] truncate"
          >
            <option value="">{t.pointRewards.history.filterAllRewards} ▾</option>
            {vouchers.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>

          {/* Sponsor Type Filter ("Loại điểm") */}
          <select
            value={sponsorFilter}
            onChange={(e) => {
              setSponsorFilter(e.target.value as "All" | PointRedemptionSponsorType)
              setCurrentPage(1)
            }}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer hover:border-gray-300 transition-colors"
          >
            <option value="All">{t.pointRewards.catalog.filterAllSponsors} ▾</option>
            <option value="CatSpeak">{t.pointRewards.catalog.sponsorCatSpeak}</option>
            <option value="Instructor">{t.pointRewards.catalog.sponsorInstructor}</option>
          </select>

          {/* Date range filter reused logic from payments (From Date & To Date) */}
          <div className="flex items-center gap-1.5">
            <div className="relative flex items-center">
              <Calendar
                size={15}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-8 pr-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-34 hover:border-gray-300 transition-colors cursor-pointer"
              />
            </div>
            <span className="text-gray-400 text-xs">—</span>
            <div className="relative flex items-center">
              <Calendar
                size={15}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-8 pr-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-34 hover:border-gray-300 transition-colors cursor-pointer"
              />
            </div>
          </div>

          {/* Reset Filter Button */}
          <button
            type="button"
            title={t.pointRewards.catalog.resetFilter}
            onClick={() => {
              setSearchQuery("")
              setSelectedVoucherId("")
              setSponsorFilter("All")
              setFromDate("")
              setToDate("")
              setCurrentPage(1)
              addToast("info", t.pointRewards.toasts.filterReset)
            }}
            className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-colors cursor-pointer"
          >
            <Filter size={16} />
          </button>

          {/* Export Excel Button */}
          <button
            type="button"
            disabled={isExporting}
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
          >
            <Download size={16} />
            <span>{t.pointRewards.history.btnExportExcel}</span>
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#910B09] text-white text-xs font-bold tracking-wider uppercase">
                <th className="px-5 py-3.5">{t.pointRewards.history.colId}</th>
                <th className="px-5 py-3.5">{t.pointRewards.history.colStudent}</th>
                <th className="px-5 py-3.5">{t.pointRewards.history.colReward}</th>
                <th className="px-5 py-3.5">{t.pointRewards.history.colPointsDeducted}</th>
                <th className="px-5 py-3.5">{t.pointRewards.history.colResultCode}</th>
                <th className="px-5 py-3.5">{t.pointRewards.history.colCreatedAt}</th>
                <th className="px-5 py-3.5">{t.pointRewards.history.colStatus}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-500 text-sm">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-500 text-sm">
                    {t.pointRewards.history.empty}
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const isSuccess = tx.status === "Success"
                  const isInstructor = tx.sponsorType === "Instructor"
                  return (
                    <tr
                      key={tx.id}
                      onClick={() => onViewTransaction(tx)}
                      className="hover:bg-gray-50/80 transition-colors cursor-pointer"
                    >
                      {/* ID / Mã giao dịch */}
                      <td className="px-5 py-4 font-mono font-medium text-xs text-gray-600">
                        {tx.transactionCode || `#${tx.id}`}
                      </td>

                      {/* Học viên: studentName + studentAvatar (Avatar.tsx) */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            url={tx.studentAvatar}
                            name={tx.studentName}
                            size="sm"
                          />
                          <span className="font-semibold text-gray-900">
                            {tx.studentName || "—"}
                          </span>
                        </div>
                      </td>

                      {/* Phần thưởng + Sponsor Type */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="font-medium text-gray-800">
                            {tx.voucherName}
                          </span>
                          {tx.sponsorType && (
                            <Badge
                              type={isInstructor ? "Yellow" : "Blue"}
                              title={
                                isInstructor
                                  ? t.pointRewards.catalog.sponsorInstructor
                                  : t.pointRewards.catalog.sponsorCatSpeak
                              }
                              className="text-[10px] px-2 py-0"
                            />
                          )}
                        </div>
                      </td>

                      {/* Điểm đã trừ (không cần đơn vị pts) */}
                      <td className="px-5 py-4">
                        <span className="font-bold text-rose-600">
                          {tx.pointsDeducted > 0
                            ? `-${tx.pointsDeducted.toLocaleString()}`
                            : `${tx.pointsDeducted.toLocaleString()}`}
                        </span>
                      </td>

                      {/* Mã/Kết quả (Badge.tsx) */}
                      <td className="px-5 py-4">
                        {isSuccess ? (
                          <Badge type="Blue" title={tx.resultCode} />
                        ) : (
                          <Badge type="Red" title={tx.resultCode || "N/A"} />
                        )}
                      </td>

                      {/* Ngày tạo (createdAt) */}
                      <td className="px-5 py-4 text-gray-600 text-xs whitespace-nowrap">
                        {formatDateTime(tx.createdAt)}
                      </td>

                      {/* Trạng thái (Badge.tsx) */}
                      <td className="px-5 py-4">
                        <Badge
                          type={isSuccess ? "Green" : "Red"}
                          showDot
                          title={
                            isSuccess
                              ? t.pointRewards.history.statusSuccess
                              : t.pointRewards.history.statusFailed
                          }
                        />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Table Footer & Pagination ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-3.5 border-t border-gray-100 gap-3 text-xs text-gray-500 bg-white">
          <div>
            {t.pointRewards.history.paginationInfo
              .replace(
                "{from}",
                String(transactions.length > 0 ? (currentPage - 1) * pageSize + 1 : 0),
              )
              .replace(
                "{to}",
                String(Math.min(currentPage * pageSize, totalRecords)),
              )
              .replace("{total}", String(totalRecords))}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1 || isLoading}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = i + 1
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded-md font-semibold text-xs flex items-center justify-center transition-colors cursor-pointer ${
                    currentPage === pageNum
                      ? "bg-[#910B09] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
            {totalPages > 5 && <span className="px-1 text-gray-400">...</span>}
            <button
              type="button"
              disabled={currentPage >= totalPages || isLoading}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HistoryTab
