import React, { useState, useMemo } from "react"
import {
  Search,
  Calendar,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react"
import type { ExchangeTransaction } from "../../types"
import { TransactionStatusBadge } from "../common/StatusBadge"
import { useToastStore } from "../../../../stores/toastStore"

interface HistoryTabProps {
  transactions: ExchangeTransaction[]
  onViewTransaction: (tx: ExchangeTransaction) => void
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  transactions,
  onViewTransaction,
}) => {
  const { addToast } = useToastStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [rewardFilter, setRewardFilter] = useState("all")
  const [dateRange, setDateRange] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchSearch =
        tx.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.codeResult.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.rewardTitle.toLowerCase().includes(searchQuery.toLowerCase())

      const matchReward =
        rewardFilter === "all" || tx.rewardTitle.includes(rewardFilter)

      return matchSearch && matchReward
    })
  }, [transactions, searchQuery, rewardFilter])

  const handleExportExcel = () => {
    addToast("info", "Đang xuất dữ liệu lịch sử đổi điểm ra file Excel...")
    setTimeout(() => {
      addToast("success", "Xuất file Excel thành công!")
    }, 800)
  }

  return (
    <div className="space-y-6">
      {/* ── Search, Filter & Export Bar ── */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
        {/* Search */}
        <div className="relative w-full lg:w-80">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Tìm tên học viên, mã voucher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-gray-400"
          />
        </div>

        {/* Filters and Date / Export Actions */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
          <select
            value={rewardFilter}
            onChange={(e) => setRewardFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer hover:border-gray-300 transition-colors"
          >
            <option value="all">Tất cả Phần thưởng ▾</option>
            <option value="IELTS">Voucher IELTS</option>
            <option value="Speaking">Voucher Speaking</option>
            <option value="Writing">Voucher Writing</option>
            <option value="TOEIC">Voucher TOEIC</option>
            <option value="Giao tiếp">Khóa Kỹ năng giao tiếp</option>
          </select>

          {/* Date range picker simulator */}
          <div className="relative flex items-center">
            <Calendar
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Từ ngày — Đến ngày"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-44 hover:border-gray-300 transition-colors"
            />
          </div>

          {/* Export Excel Button */}
          <button
            type="button"
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-2xs cursor-pointer"
          >
            <Download size={16} />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#910B09] text-white text-xs font-bold tracking-wider uppercase">
                <th className="px-5 py-3.5">STT</th>
                <th className="px-5 py-3.5">HỌC VIÊN</th>
                <th className="px-5 py-3.5">PHẦN THƯỞNG</th>
                <th className="px-5 py-3.5">ĐIỂM ĐÃ TRỪ</th>
                <th className="px-5 py-3.5">MÃ/KẾT QUẢ</th>
                <th className="px-5 py-3.5">THỜI GIAN</th>
                <th className="px-5 py-3.5">TRẠNG THÁI</th>
                <th className="px-5 py-3.5 text-center">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-gray-500 text-sm">
                    Không tìm thấy lịch sử giao dịch phù hợp
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-gray-50/70 transition-colors"
                  >
                    {/* STT */}
                    <td className="px-5 py-4 font-medium text-gray-500">
                      {tx.stt}
                    </td>

                    {/* Học viên */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                          {tx.studentAvatar ? (
                            <img
                              src={tx.studentAvatar}
                              alt={tx.studentName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User size={16} />
                          )}
                        </div>
                        <span className="font-semibold text-gray-900">
                          {tx.studentName}
                        </span>
                      </div>
                    </td>

                    {/* Phần thưởng */}
                    <td className="px-5 py-4 font-medium text-gray-800">
                      {tx.rewardTitle}
                    </td>

                    {/* Điểm đã trừ */}
                    <td className="px-5 py-4">
                      <span className="font-bold text-rose-600">
                        -{tx.pointsDeducted.toLocaleString()} pts
                      </span>
                    </td>

                    {/* Mã/Kết quả */}
                    <td className="px-5 py-4">
                      {tx.status === "success" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-mono font-medium border border-blue-200">
                          {tx.codeResult}
                        </span>
                      ) : (
                        <span className="text-rose-500 font-medium text-xs">
                          {tx.codeResult}
                        </span>
                      )}
                    </td>

                    {/* Thời gian */}
                    <td className="px-5 py-4 text-gray-600 text-xs whitespace-nowrap">
                      {tx.time}
                    </td>

                    {/* Trạng thái */}
                    <td className="px-5 py-4">
                      <TransactionStatusBadge status={tx.status} />
                    </td>

                    {/* Thao tác */}
                    <td className="px-5 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => onViewTransaction(tx)}
                        title="Xem chi tiết giao dịch"
                        className="p-1.5 hover:text-primary hover:bg-primary/10 rounded-md transition-colors text-gray-500"
                      >
                        <Eye size={18} />
                      </button>
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
            Hiển thị 1-{filteredTransactions.length} trong số 24 mục
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

export default HistoryTab
