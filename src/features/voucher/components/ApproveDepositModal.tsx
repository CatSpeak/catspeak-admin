import { useState } from "react"
import { ShieldCheck, AlertTriangle, Loader2, DollarSign } from "lucide-react"
import type { VoucherListItem, VoucherDetail } from "../types"
import { useLanguage } from "../../../stores/languageStore"

export interface ApproveDepositModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void> | void
  voucher: VoucherListItem | VoucherDetail | null
  isLoading?: boolean
}

export default function ApproveDepositModal({
  isOpen,
  onClose,
  onConfirm,
  voucher,
  isLoading: externalLoading = false,
}: ApproveDepositModalProps) {
  const { t } = useLanguage()
  const [internalLoading, setInternalLoading] = useState(false)
  const isLoading = externalLoading || internalLoading

  if (!isOpen || !voucher) return null

  const depositAmount = voucher.depositAmount || voucher.depositRequired || 0
  const instructorName =
    "instructors" in voucher && voucher.instructors && voucher.instructors.length > 0
      ? voucher.instructors[0].name
      : t.vouchers.sponsorTypes.instructor || "Giảng viên"

  const transactionContent =
    "depositTransactionContent" in voucher && voucher.depositTransactionContent
      ? voucher.depositTransactionContent
      : voucher.code

  const handleConfirm = async () => {
    try {
      setInternalLoading(true)
      await onConfirm()
      onClose()
    } catch (err) {
      console.error("Failed to approve deposit:", err)
    } finally {
      setInternalLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => !isLoading && onClose()}
      />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 overflow-hidden z-10 border border-gray-100">
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-4 text-emerald-600">
            <ShieldCheck size={28} />
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {t.vouchers.dialogs?.approveDepositTitle || "Xác nhận đã nhận cọc"}
          </h3>

          <p className="text-xs text-gray-500 mb-4">
            {t.vouchers.dialogs?.approveDepositSubtitle ||
              "Duyệt thanh toán cọc và chuyển voucher Giáo viên sang trạng thái Active"}
          </p>

          <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-left space-y-2.5 mb-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-medium">
                {t.vouchers.dialogs?.approveDepositCode || "Mã voucher:"}
              </span>
              <span className="font-bold text-red-600 font-mono text-sm">
                {voucher.code}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-medium">
                {t.vouchers.dialogs?.approveDepositInstructor || "Giảng viên phát hành:"}
              </span>
              <span className="font-semibold text-gray-900">{instructorName}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-medium">
                {t.vouchers.dialogs?.approveDepositAmount || "Số tiền cọc:"}
              </span>
              <span className="font-bold text-emerald-600 text-sm flex items-center gap-0.5">
                <DollarSign size={14} className="text-emerald-500" />
                {depositAmount.toLocaleString("vi-VN")} đ
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-medium">
                {t.vouchers.dialogs?.approveDepositContent || "Nội dung chuyển khoản:"}
              </span>
              <span className="font-mono font-semibold text-gray-800 bg-white px-2 py-0.5 rounded border border-gray-200">
                {transactionContent}
              </span>
            </div>
          </div>

          <div className="w-full bg-amber-50 border border-amber-200 rounded-xl p-3 text-left flex items-start gap-2.5 mb-5 text-amber-800 text-xs leading-relaxed">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-semibold">
                {t.vouchers.dialogs?.approveDepositWarningTitle || "Cảnh báo kiểm tra:"}
              </p>
              <p>
                {t.vouchers.dialogs?.approveDepositWarningDesc ||
                  "Hãy chắc chắn đã kiểm tra giao dịch chuyển khoản thực tế trong tài khoản ngân hàng trước khi xác nhận."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full">
            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {t.common?.cancel || "Hủy"}
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={handleConfirm}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {t.vouchers.dialogs?.approveDepositConfirm || "Xác nhận & Kích hoạt"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
