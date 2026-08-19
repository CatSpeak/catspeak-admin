import { useState } from "react"
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  DollarSign,
  Calendar,
  CreditCard,
  FileText,
  User,
} from "lucide-react"
import type { VoucherDetail } from "../../types"
import { useLanguage } from "../../../../stores/languageStore"
import { formatDateTime } from "../../../../lib/utils"
import Badge, { type BadgeType } from "../../../../components/ui/Badge"
import Avatar from "../../../../components/ui/Avatar"
import { approveVoucherDeposit } from "../../api/approveVoucherDeposit"
import { rejectVoucher } from "../../api/rejectVoucher"
import ApproveDepositModal from "../ApproveDepositModal"
import RejectVoucherModal from "../RejectVoucherModal"

export interface VoucherDepositApprovalIslandProps {
  voucher: VoucherDetail
  onRefresh?: () => void
}

export default function VoucherDepositApprovalIsland({
  voucher,
  onRefresh,
}: VoucherDepositApprovalIslandProps) {
  const { t } = useLanguage()

  const [showApproveModal, setShowApproveModal] = useState<boolean>(false)
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false)
  const [successNotice, setSuccessNotice] = useState<string | null>(null)

  // Compute status badge
  const getStatusBadge = (status: string): { type: BadgeType; label: string } => {
    switch (status) {
      case "PendingApproval":
        return {
          type: "Yellow",
          label: t.vouchers.statuses?.pendingApproval || "Chờ duyệt",
        }
      case "PendingDeposit":
        return {
          type: "Orange",
          label: t.vouchers.statuses?.pendingDeposit || "Chờ nạp cọc",
        }
      default:
        return { type: "Gray", label: status }
    }
  }

  const statusBadge = getStatusBadge(voucher.status)
  const instructor =
    voucher.instructors && voucher.instructors.length > 0
      ? voucher.instructors[0]
      : null

  const depositTime =
    voucher.depositConfirmedAt || voucher.createdAt
      ? formatDateTime(voucher.depositConfirmedAt || voucher.createdAt)
      : "—"

  const transactionContent =
    voucher.depositTransactionContent || voucher.code

  const handleApproveConfirm = async () => {
    await approveVoucherDeposit(voucher.id)
    setSuccessNotice(
      t.vouchers.depositApprovalIsland?.approveSuccess ||
        "Đã xác nhận cọc và kích hoạt voucher thành công!",
    )
    if (onRefresh) {
      onRefresh()
    }
  }

  const handleRejectConfirm = async (reason: string, note?: string) => {
    await rejectVoucher(voucher.id, { reason, note })
    setSuccessNotice(
      t.vouchers.depositApprovalIsland?.rejectSuccess ||
        "Đã từ chối và hủy voucher!",
    )
    if (onRefresh) {
      onRefresh()
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-amber-200/80 p-6 sm:p-7 shadow-xs space-y-6 relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100/70 text-amber-700 flex items-center justify-center shrink-0">
            <ShieldCheck size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-bold text-gray-900 text-lg">
                {t.vouchers.depositApprovalIsland?.title ||
                  "Phê duyệt cọc & Kích hoạt voucher"}
              </h2>
              <Badge type={statusBadge.type} showDot={true}>
                {statusBadge.label}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {t.vouchers.depositApprovalIsland?.desc ||
                "Voucher này đang chờ xác nhận đặt cọc từ giảng viên. Vui lòng đối soát kỹ giao dịch trước khi phê duyệt."}
            </p>
          </div>
        </div>
      </div>

      {/* Success Notification if any */}
      {successNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Cọc bắt buộc */}
        <div className="bg-amber-50/40 border border-amber-200/60 rounded-2xl p-4 space-y-1">
          <div className="flex items-center gap-2 text-amber-700">
            <DollarSign size={16} />
            <span className="text-xs font-medium">
              {t.vouchers.depositApprovalIsland?.depositRequired || "Cọc bắt buộc"}
            </span>
          </div>
          <div className="text-lg font-bold text-amber-900">
            {(voucher.depositRequired || voucher.depositAmount || 0).toLocaleString(
              "vi-VN",
            )}{" "}
            đ
          </div>
        </div>

        {/* 2. Trạng thái */}
        <div className="bg-gray-50/70 border border-gray-200 rounded-2xl p-4 space-y-1">
          <div className="flex items-center gap-2 text-gray-500">
            <FileText size={16} />
            <span className="text-xs font-medium">
              {t.vouchers.depositApprovalIsland?.status || "Trạng thái"}
            </span>
          </div>
          <div className="pt-0.5">
            <Badge type={statusBadge.type} showDot={true}>
              {statusBadge.label}
            </Badge>
          </div>
        </div>

        {/* 3. Nội dung cọc */}
        <div className="bg-gray-50/70 border border-gray-200 rounded-2xl p-4 space-y-1">
          <div className="flex items-center gap-2 text-gray-500">
            <CreditCard size={16} />
            <span className="text-xs font-medium">
              {t.vouchers.depositApprovalIsland?.depositContent || "Nội dung cọc"}
            </span>
          </div>
          <div className="font-mono font-bold text-gray-900 text-xs truncate bg-white px-2.5 py-1 rounded-lg border border-gray-200/80 inline-block max-w-full">
            {transactionContent}
          </div>
        </div>

        {/* 4. Thời gian cọc */}
        <div className="bg-gray-50/70 border border-gray-200 rounded-2xl p-4 space-y-1">
          <div className="flex items-center gap-2 text-gray-500">
            <Calendar size={16} />
            <span className="text-xs font-medium">
              {t.vouchers.depositApprovalIsland?.depositTime || "Thời gian cọc"}
            </span>
          </div>
          <div className="text-xs font-semibold text-gray-800">
            {depositTime}
          </div>
        </div>
      </div>

      {/* Instructor Information (If available) */}
      {instructor && (
        <div className="p-3.5 bg-gray-50/70 border border-gray-200 rounded-2xl flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <Avatar name={instructor.name} url={instructor.image} size="sm" />
            <div>
              <p className="font-semibold text-gray-900">{instructor.name}</p>
              <p className="text-[11px] text-gray-500">
                {instructor.subtitle || "Giảng viên phát hành voucher"}
              </p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
              <User size={12} /> ID: #{instructor.id}
            </span>
          </div>
        </div>
      )}

      {/* Warning Notice Banner */}
      <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3 text-amber-800 text-xs leading-relaxed">
        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
        <div>
          <p className="font-bold text-amber-900">
            {t.vouchers.depositApprovalIsland?.warningTitle ||
              "Lưu ý kiểm tra ngân hàng:"}
          </p>
          <p>
            {t.vouchers.depositApprovalIsland?.warningDesc ||
              "Vui lòng kiểm tra sao kê tài khoản ngân hàng chính xác trước khi bấm phê duyệt để tránh thất thoát."}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => setShowRejectModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-rose-300 text-rose-700 bg-rose-50/50 hover:bg-rose-100/70 text-xs sm:text-sm font-semibold transition-colors shadow-xs"
        >
          <XCircle size={16} />
          {t.vouchers.depositApprovalIsland?.rejectBtn || "Từ chối & Hủy voucher"}
        </button>

        <button
          type="button"
          onClick={() => setShowApproveModal(true)}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-sm"
        >
          <ShieldCheck size={16} />
          {t.vouchers.depositApprovalIsland?.approveBtn ||
            "Xác nhận đã nhận cọc"}
        </button>
      </div>

      {/* Action Modals */}
      <ApproveDepositModal
        isOpen={showApproveModal}
        voucher={voucher}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleApproveConfirm}
      />

      <RejectVoucherModal
        isOpen={showRejectModal}
        voucher={voucher}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleRejectConfirm}
      />
    </div>
  )
}
