import React, { useState, useEffect, useCallback } from "react"
import {
  Layers,
  CheckCircle2,
  PauseCircle,
  Coins,
  Search,
  Filter,
  Pencil,
  Pause,
  Play,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import SummaryCard from "../../../../components/ui/SummaryCard"
import Badge from "../../../../components/ui/Badge"
import StockProgressBar from "../common/StockProgressBar"
import { useToastStore } from "../../../../stores/toastStore"
import { useLanguage } from "../../../../stores/languageStore"
import { formatDateToDisplay } from "../../../../lib/utils"
import { getApiErrorMessage } from "../../../../lib/axios"
import {
  getPointRedemptionSummary,
  getPointRedemptionItems,
  pausePointRedemptionItem,
  activatePointRedemptionItem,
} from "../../api"
import type {
  PointRedemptionItemDto,
  PointRedemptionSummaryDto,
  PointRedemptionItemStatusFilter,
  PointRedemptionSponsorType,
} from "../../types"

interface CatalogTabProps {
  onEditItem?: (item: PointRedemptionItemDto) => void
  refreshSignal?: number
}

export const CatalogTab: React.FC<CatalogTabProps> = ({
  onEditItem,
  refreshSignal = 0,
}) => {
  const { t } = useLanguage()
  const { addToast } = useToastStore()

  // Stats state
  const [stats, setStats] = useState<PointRedemptionSummaryDto>({
    totalItems: 0,
    activeItems: 0,
    pausedItems: 0,
    totalPointsRedeemed: 0,
  })
  const [isLoadingStats, setIsLoadingStats] = useState(false)

  // Items & Pagination state
  const [items, setItems] = useState<PointRedemptionItemDto[]>([])
  const [isLoadingItems, setIsLoadingItems] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<PointRedemptionItemStatusFilter>("All")
  const [sponsorFilter, setSponsorFilter] = useState<"All" | PointRedemptionSponsorType>("All")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalRecords, setTotalRecords] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [actionInProgressId, setActionInProgressId] = useState<number | null>(null)

  // Fetch summary stats
  const fetchSummary = useCallback(async () => {
    setIsLoadingStats(true)
    try {
      const data = await getPointRedemptionSummary()
      setStats(data)
    } catch (err) {
      console.error("Failed to fetch point redemption summary:", err)
    } finally {
      setIsLoadingStats(false)
    }
  }, [])

  // Fetch items list
  const fetchItems = useCallback(async () => {
    setIsLoadingItems(true)
    try {
      const res = await getPointRedemptionItems({
        keyword: searchQuery.trim() || undefined,
        status: statusFilter === "All" ? undefined : statusFilter,
        sponsorType: sponsorFilter === "All" ? undefined : sponsorFilter,
        page: currentPage,
        pageSize,
      })

      setItems(res.data || [])
      setTotalRecords(res.total_records || res.additionalData?.totalCount || 0)
      setTotalPages(res.additionalData?.totalPages || Math.ceil((res.total_records || 1) / pageSize) || 1)
    } catch (err) {
      console.error("Failed to fetch point redemption items:", err)
      addToast("error", t.pointRewards.toasts.loadDataError)
    } finally {
      setIsLoadingItems(false)
    }
  }, [searchQuery, statusFilter, sponsorFilter, currentPage, pageSize, addToast, t])

  useEffect(() => {
    fetchSummary()
  }, [fetchSummary, refreshSignal])

  useEffect(() => {
    fetchItems()
  }, [fetchItems, refreshSignal])

  // Handle Pause / Activate Action
  const handleToggleStatus = async (item: PointRedemptionItemDto) => {
    setActionInProgressId(item.id)
    try {
      if (item.isPaused || item.status === "Paused") {
        await activatePointRedemptionItem(item.id)
        addToast("success", t.pointRewards.toasts.activateSuccess)
      } else {
        await pausePointRedemptionItem(item.id)
        addToast("success", t.pointRewards.toasts.pauseSuccess)
      }
      // Refresh data
      fetchItems()
      fetchSummary()
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err, t.pointRewards.toasts.actionError)
      addToast("error", msg)
    } finally {
      setActionInProgressId(null)
    }
  }

  // Map item status to Badge
  const renderStatusBadge = (status: string, isPaused: boolean) => {
    if (isPaused || status === "Paused") {
      return (
        <Badge
          type="Yellow"
          showDot
          title={t.pointRewards.catalog.statusPaused}
        />
      )
    }
    switch (status) {
      case "Active":
        return (
          <Badge
            type="Green"
            showDot
            title={t.pointRewards.catalog.statusActive}
          />
        )
      case "Expired":
        return (
          <Badge
            type="Red"
            showDot
            title={t.pointRewards.catalog.statusExpired}
          />
        )
      case "Exhausted":
        return (
          <Badge
            type="Red"
            showDot
            title={t.pointRewards.catalog.statusExhausted}
          />
        )
      case "Pending":
        return (
          <Badge
            type="Blue"
            showDot
            title={t.pointRewards.catalog.statusPending}
          />
        )
      default:
        return <Badge type="Gray" title={status} />
    }
  }

  return (
    <div className="space-y-6">
      {/* ── 4 KPI Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          icon={<Layers size={20} />}
          color="#2563EB"
          label={t.pointRewards.catalog.statsTotalItems}
          value={isLoadingStats ? "..." : `${stats.totalItems}`}
        />
        <SummaryCard
          icon={<CheckCircle2 size={20} />}
          color="#059669"
          label={t.pointRewards.catalog.statsActiveItems}
          value={isLoadingStats ? "..." : `${stats.activeItems}`}
        />
        <SummaryCard
          icon={<PauseCircle size={20} />}
          color="#4B5563"
          label={t.pointRewards.catalog.statsPausedItems}
          value={isLoadingStats ? "..." : `${stats.pausedItems}`}
        />
        <SummaryCard
          icon={<Coins size={20} />}
          color="#D97706"
          label={t.pointRewards.catalog.statsTotalPoints}
          value={
            isLoadingStats
              ? "..."
              : `${stats.totalPointsRedeemed.toLocaleString()}`
          }
        />
      </div>

      {/* ── Search and Filter Bar ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder={t.pointRewards.catalog.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-gray-400"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as PointRedemptionItemStatusFilter)
              setCurrentPage(1)
            }}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer hover:border-gray-300 transition-colors"
          >
            <option value="All">{t.pointRewards.catalog.filterAllStatus}</option>
            <option value="Active">{t.pointRewards.catalog.statusActive}</option>
            <option value="Paused">{t.pointRewards.catalog.statusPaused}</option>
            <option value="Expired">{t.pointRewards.catalog.statusExpired}</option>
            <option value="Exhausted">{t.pointRewards.catalog.statusExhausted}</option>
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
            <option value="All">{t.pointRewards.catalog.filterAllSponsors}</option>
            <option value="CatSpeak">{t.pointRewards.catalog.sponsorCatSpeak}</option>
            <option value="Instructor">{t.pointRewards.catalog.sponsorInstructor}</option>
          </select>

          {/* Reset Filters */}
          <button
            type="button"
            title={t.pointRewards.catalog.resetFilter}
            onClick={() => {
              setSearchQuery("")
              setStatusFilter("All")
              setSponsorFilter("All")
              setCurrentPage(1)
              addToast("info", t.pointRewards.toasts.filterReset)
            }}
            className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-colors cursor-pointer"
          >
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#910B09] text-white text-xs font-bold tracking-wider uppercase">
                <th className="px-5 py-3.5">{t.pointRewards.catalog.colVoucher}</th>
                <th className="px-5 py-3.5">{t.pointRewards.catalog.colPoints}</th>
                <th className="px-5 py-3.5">{t.pointRewards.catalog.colInventory}</th>
                <th className="px-5 py-3.5">{t.pointRewards.catalog.colValidity}</th>
                <th className="px-5 py-3.5">{t.pointRewards.catalog.colStatus}</th>
                <th className="px-5 py-3.5 text-center">{t.pointRewards.catalog.colActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {isLoadingItems ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-500 text-sm">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-500 text-sm">
                    {t.pointRewards.catalog.empty}
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const isItemPaused = item.isPaused || item.status === "Paused"
                  const isInstructor = item.sponsorType === "Instructor"
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50/70 transition-colors"
                    >
                      {/* Tên voucher + Sponsor Badge bên dưới */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1.5 items-start">
                          <span className="font-semibold text-gray-900">
                            {item.voucherName}
                          </span>
                          <Badge
                            type={isInstructor ? "Yellow" : "Blue"}
                            title={
                              isInstructor
                                ? t.pointRewards.catalog.sponsorInstructor
                                : t.pointRewards.catalog.sponsorCatSpeak
                            }
                            className="text-[10px] px-2 py-0"
                          />
                        </div>
                      </td>

                      {/* Điểm cần */}
                      <td className="px-5 py-4">
                        <span className="font-bold text-gray-900">
                          {item.pointsRequired.toLocaleString()}
                        </span>
                      </td>

                      {/* Tồn kho (redeemedCount / totalQuantity) */}
                      <td className="px-5 py-4">
                        {item.totalQuantity !== null && item.totalQuantity !== undefined ? (
                          <StockProgressBar
                            current={item.redeemedCount}
                            total={item.totalQuantity}
                          />
                        ) : (
                          <span className="text-xs font-semibold text-gray-700">
                            {item.redeemedCount} / {t.pointRewards.catalog.unlimited}
                          </span>
                        )}
                      </td>

                      {/* Hiệu lực (validTo) */}
                      <td className="px-5 py-4 text-gray-600 text-xs">
                        {item.validTo
                          ? formatDateToDisplay(item.validTo)
                          : t.pointRewards.catalog.neverExpired}
                      </td>

                      {/* Trạng thái */}
                      <td className="px-5 py-4">
                        {renderStatusBadge(item.status, item.isPaused)}
                      </td>

                      {/* Thao tác */}
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-gray-500">
                          <button
                            type="button"
                            onClick={() => onEditItem?.(item)}
                            title={t.pointRewards.catalog.actionEdit}
                            className="p-1.5 hover:text-primary hover:bg-primary/10 rounded-md transition-colors cursor-pointer"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            disabled={actionInProgressId === item.id}
                            onClick={() => handleToggleStatus(item)}
                            title={
                              isItemPaused
                                ? t.pointRewards.catalog.actionActivate
                                : t.pointRewards.catalog.actionPause
                            }
                            className="p-1.5 hover:text-primary hover:bg-primary/10 rounded-md transition-colors cursor-pointer disabled:opacity-40"
                          >
                            {isItemPaused ? (
                              <Play size={16} />
                            ) : (
                              <Pause size={16} />
                            )}
                          </button>
                        </div>
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
            {t.pointRewards.catalog.paginationInfo
              .replace("{from}", String(items.length > 0 ? (currentPage - 1) * pageSize + 1 : 0))
              .replace("{to}", String(Math.min(currentPage * pageSize, totalRecords)))
              .replace("{total}", String(totalRecords))}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1 || isLoadingItems}
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
              disabled={currentPage >= totalPages || isLoadingItems}
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

export default CatalogTab
