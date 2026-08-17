import { useCallback, useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import {
  ArrowLeft,
  ChevronRight,
  Ticket,
  Percent,
  Layers,
  Calendar,
  AlertCircle,
  RotateCcw,
} from "lucide-react"
import { getVoucherDetail } from "../api/getVoucherDetail"
import type { VoucherDetail } from "../types"
import { useLanguage } from "../../../stores/languageStore"
import { getApiErrorMessage } from "../../../lib/axios"
import Badge, { type BadgeType } from "../../../components/ui/Badge"
import VoucherGeneralInfoIsland from "../components/detail/VoucherGeneralInfoIsland"
import VoucherQuickStatsIsland from "../components/detail/VoucherQuickStatsIsland"
import VoucherUsageHistoryIsland from "../components/detail/VoucherUsageHistoryIsland"
import VoucherDepositApprovalIsland from "../components/detail/VoucherDepositApprovalIsland"

export default function VoucherDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useLanguage()

  const [voucher, setVoucher] = useState<VoucherDetail | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDetail = useCallback(async () => {
    const voucherId = Number(id)
    if (!id || Number.isNaN(voucherId) || voucherId <= 0) {
      setVoucher(null)
      setError("ID voucher không hợp lệ.")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await getVoucherDetail(voucherId)
      setVoucher(data)
    } catch (err: unknown) {
      setVoucher(null)
      setError(getApiErrorMessage(err, "Không thể tải chi tiết voucher."))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  // Helper mapping for Status Badge
  const getStatusBadgeConfig = (
    status: string,
  ): { type: BadgeType; label: string; showDot?: boolean } => {
    switch (status) {
      case "Active":
        return { type: "Green", label: t.vouchers.statuses.active, showDot: true }
      case "Draft":
        return { type: "Gray", label: t.vouchers.statuses.draft }
      case "PendingApproval":
        return {
          type: "Yellow",
          label: t.vouchers.statuses.pendingApproval,
          showDot: true,
        }
      case "PendingDeposit":
        return {
          type: "Orange",
          label: t.vouchers.statuses.pendingDeposit,
          showDot: true,
        }
      case "Disabled":
        return { type: "Gray", label: t.vouchers.statuses.disabled }
      case "Expired":
        return { type: "Red", label: t.vouchers.statuses.expired }
      case "Exhausted":
        return { type: "Purple", label: t.vouchers.statuses.exhausted }
      case "Rejected":
        return { type: "Red", label: t.vouchers.statuses.rejected }
      case "Stopped":
        return { type: "Gray", label: t.vouchers.statuses.stopped }
      default:
        return { type: "Gray", label: status }
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse pb-12">
        <div className="h-4 bg-gray-200 rounded w-48" />
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs h-32" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-3xl p-6 shadow-xs h-96" />
          <div className="lg:col-span-1 bg-white border border-gray-200 rounded-3xl p-6 shadow-xs h-96" />
        </div>
      </div>
    )
  }

  if (error || !voucher) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
          <AlertCircle size={32} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {error || "Không tìm thấy voucher"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Voucher có thể đã bị xóa hoặc bạn không có quyền truy cập.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/vouchers")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft size={16} /> Quay lại danh sách
          </button>
          <button
            type="button"
            onClick={fetchDetail}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark shadow-xs"
          >
            <RotateCcw size={16} /> Thử lại
          </button>
        </div>
      </div>
    )
  }

  const statusConfig = getStatusBadgeConfig(voucher.status)

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* ── Breadcrumbs ── */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 font-medium">
        <Link to="/" className="hover:text-primary transition-colors">
          Bảng điều khiển
        </Link>
        <ChevronRight size={14} className="text-gray-400" />
        <Link to="/vouchers" className="hover:text-primary transition-colors">
          Quản lý voucher
        </Link>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="text-gray-900 font-semibold font-mono">
          {voucher.code}
        </span>
      </nav>

      {/* ── Top Header Banner ── */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 shadow-inner">
            <Ticket size={28} />
          </div>

          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xl font-bold font-mono text-red-600">
                {voucher.code}
              </span>
              <Badge type={statusConfig.type} showDot={statusConfig.showDot}>
                {statusConfig.label}
              </Badge>
              <Badge type={voucher.sponsorType === "CatSpeak" ? "Red" : "Blue"}>
                {voucher.sponsorType === "CatSpeak"
                  ? t.vouchers.sponsorTypes.catspeak
                  : t.vouchers.sponsorTypes.instructor}
              </Badge>
            </div>

            <h1 className="text-lg font-bold text-gray-900 leading-snug">
              {voucher.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Percent size={13} className="text-gray-400" />
                {voucher.discountType === "Percentage"
                  ? `Giảm ${voucher.discountValue}%`
                  : `Giảm ${voucher.discountValue.toLocaleString("vi-VN")} đ`}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Layers size={13} className="text-gray-400" />
                {voucher.scopeType}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar size={13} className="text-gray-400" />
                {voucher.isNeverExpired
                  ? "Không thời hạn"
                  : `Hết hạn: ${voucher.validTo ? new Date(voucher.validTo).toLocaleDateString("vi-VN") : "—"}`}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/vouchers")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shrink-0 shadow-xs"
        >
          <ArrowLeft size={16} /> Quay lại
        </button>
      </div>

      {/* ── Main Body: 3 Islands ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Island (col-span-2): Thông tin chung */}
        <div className="lg:col-span-2 space-y-6">
          <VoucherGeneralInfoIsland voucher={voucher} />
        </div>

        {/* Right Island (col-span-1): Thống kê nhanh */}
        <div className="lg:col-span-1">
          <VoucherQuickStatsIsland voucher={voucher} />
        </div>
      </div>

      {/* Bottom Island (full-width): Phê duyệt cọc nếu đang chờ duyệt, ngược lại hiển thị Lịch sử sử dụng */}
      <div className="w-full">
        {voucher.status === "PendingApproval" ||
        voucher.status === "PendingDeposit" ? (
          <VoucherDepositApprovalIsland
            voucher={voucher}
            onRefresh={fetchDetail}
          />
        ) : (
          <VoucherUsageHistoryIsland voucherId={voucher.id} />
        )}
      </div>
    </div>
  )
}
