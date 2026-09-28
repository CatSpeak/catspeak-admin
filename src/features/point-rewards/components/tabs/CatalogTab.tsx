import React, { useState, useMemo } from "react"
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
import StockProgressBar from "../common/StockProgressBar"
import { ItemStatusBadge, SponsorBadge } from "../common/StatusBadge"
import type { ExchangeItem, CatalogStats } from "../../types"
import { useToastStore } from "../../../../stores/toastStore"

interface CatalogTabProps {
  items: ExchangeItem[]
  stats: CatalogStats
  onToggleStatus: (id: string) => void
  onEditItem?: (item: ExchangeItem) => void
}

export const CatalogTab: React.FC<CatalogTabProps> = ({
  items,
  stats,
  onToggleStatus,
  onEditItem,
}) => {
  const { addToast } = useToastStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sponsor.toLowerCase().includes(searchQuery.toLowerCase())

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && item.status === "active") ||
        (statusFilter === "paused" && item.status === "paused") ||
        (statusFilter === "expired" && item.status === "expired")

      const matchType =
        typeFilter === "all" ||
        (typeFilter === "catspeak" && item.sponsor === "CatSpeak") ||
        (typeFilter === "instructor" && item.sponsor === "Chủ lớp")

      return matchSearch && matchStatus && matchType
    })
  }, [items, searchQuery, statusFilter, typeFilter])

  return (
    <div className="space-y-6">
      {/* ── 4 KPI Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          icon={<Layers size={20} />}
          color="#2563EB"
          label="Tổng mục đổi"
          value={`${stats.totalItems} mục`}
        />
        <SummaryCard
          icon={<CheckCircle2 size={20} />}
          color="#059669"
          label="Đang hoạt động"
          value={`${stats.activeItems} mục`}
        />
        <SummaryCard
          icon={<PauseCircle size={20} />}
          color="#4B5563"
          label="Tạm dừng"
          value={`${stats.pausedItems} mục`}
        />
        <SummaryCard
          icon={<Coins size={20} />}
          color="#D97706"
          label="Tổng điểm đã đổi"
          value={`${stats.totalPointsExchanged.toLocaleString()} pts`}
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
            placeholder="Tìm kiếm voucher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-gray-400"
          />
        </div>

        {/* Filters Group */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer hover:border-gray-300 transition-colors"
          >
            <option value="all">Trạng thái ▾</option>
            <option value="active">Đang hoạt động</option>
            <option value="paused">Tạm dừng</option>
            <option value="expired">Hết hạn</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer hover:border-gray-300 transition-colors"
          >
            <option value="all">Loại điểm ▾</option>
            <option value="catspeak">CatSpeak</option>
            <option value="instructor">Chủ lớp</option>
          </select>

          <button
            type="button"
            title="Lọc nâng cao"
            onClick={() => {
              setSearchQuery("")
              setStatusFilter("all")
              setTypeFilter("all")
              addToast("info", "Đã đặt lại bộ lọc")
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
                <th className="px-5 py-3.5">TÊN VOUCHER</th>
                <th className="px-5 py-3.5">ĐIỂM CẦN</th>
                <th className="px-5 py-3.5">TỒN KHO</th>
                <th className="px-5 py-3.5">HIỆU LỰC</th>
                <th className="px-5 py-3.5">TRẠNG THÁI</th>
                <th className="px-5 py-3.5 text-center">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-500 text-sm">
                    Không tìm thấy mục đổi điểm phù hợp
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/70 transition-colors"
                  >
                    {/* Tên voucher + Sponsor Badge */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <span className="font-semibold text-gray-900">
                          {item.title}
                        </span>
                        <SponsorBadge sponsor={item.sponsor} />
                      </div>
                    </td>

                    {/* Điểm cần */}
                    <td className="px-5 py-4">
                      <span className="font-bold text-gray-900">
                        {item.pointsCost.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">pts</span>
                    </td>

                    {/* Tồn kho */}
                    <td className="px-5 py-4">
                      <StockProgressBar
                        current={item.stockCurrent}
                        total={item.stockTotal}
                      />
                    </td>

                    {/* Hiệu lực */}
                    <td className="px-5 py-4 text-gray-600 text-xs">
                      {item.validity}
                    </td>

                    {/* Trạng thái */}
                    <td className="px-5 py-4">
                      <ItemStatusBadge status={item.status} />
                    </td>

                    {/* Thao tác */}
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-2 text-gray-500">
                        <button
                          type="button"
                          onClick={() => onEditItem?.(item)}
                          title="Chỉnh sửa"
                          className="p-1.5 hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onToggleStatus(item.id)}
                          title={
                            item.status === "active" ? "Tạm dừng" : "Kích hoạt"
                          }
                          className="p-1.5 hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                        >
                          {item.status === "active" ? (
                            <Pause size={16} />
                          ) : (
                            <Play size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Table Footer & Pagination ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-3.5 border-t border-gray-100 gap-3 text-xs text-gray-500 bg-white">
          <div>
            Hiển thị 1-{filteredItems.length} trong số {stats.totalItems} mục
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              className={`w-7 h-7 rounded-md font-semibold text-xs flex items-center justify-center transition-colors ${
                currentPage === 1
                  ? "bg-[#910B09] text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              1
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(2)}
              className={`w-7 h-7 rounded-md font-semibold text-xs flex items-center justify-center transition-colors ${
                currentPage === 2
                  ? "bg-[#910B09] text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              2
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(3)}
              className={`w-7 h-7 rounded-md font-semibold text-xs flex items-center justify-center transition-colors ${
                currentPage === 3
                  ? "bg-[#910B09] text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              3
            </button>
            <span className="px-1 text-gray-400">...</span>
            <button
              type="button"
              disabled={currentPage === 3}
              onClick={() => setCurrentPage((p) => Math.min(3, p + 1))}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 disabled:opacity-40 transition-colors"
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
