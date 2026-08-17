import { useState } from "react"
import { Ban, Loader2, Calendar, CheckCircle2 } from "lucide-react"
import type { VoucherListItem, VoucherDetail } from "../types"
import { useLanguage } from "../../../stores/languageStore"
import { formatDateToDisplay } from "../../../lib/utils"

export interface DisableVoucherModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void> | void
  voucher: VoucherListItem | VoucherDetail | null
  isLoading?: boolean
}

export default function DisableVoucherModal({
  isOpen,
  onClose,
  onConfirm,
  voucher,
  isLoading: externalLoading = false,
}: DisableVoucherModalProps) {
  const { t } = useLanguage()
  const [internalLoading, setInternalLoading] = useState(false)
  const isLoading = externalLoading || internalLoading

  if (!isOpen || !voucher) return null

  const handleConfirm = async () => {
    try {
      setInternalLoading(true)
      await onConfirm()
      onClose()
    } catch (err) {
      console.error("Failed to disable voucher:", err)
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
          <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center mb-4 text-rose-600">
            <Ban size={28} />
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {t.vouchers.dialogs?.disableTitle || "Vô hiệu hóa voucher"}
          </h3>

          <p className="text-sm text-gray-600 mb-4">
            {t.vouchers.dialogs?.disablePrompt || "Bạn có chắc chắn muốn tạm dừng mã voucher"}{" "}
            <span className="font-bold text-red-600 font-mono">{voucher.code}</span>?
          </p>

          <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-left space-y-2.5 mb-5 text-xs text-gray-700">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-gray-500 font-medium">
                <Calendar size={14} className="text-gray-400" />
                {t.vouchers.dialogs?.disableValidity || "Thời hạn hiệu lực:"}
              </span>
              <span className="font-semibold text-gray-900">
                {formatDateToDisplay(voucher.validFrom)} –{" "}
                {voucher.isNeverExpired
                  ? t.vouchers.neverExpired || "Không thời hạn"
                  : formatDateToDisplay(voucher.validTo) || "—"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-gray-500 font-medium">
                <CheckCircle2 size={14} className="text-gray-400" />
                {t.vouchers.dialogs?.disableUsedCount || "Số lượt đã dùng:"}
              </span>
              <span className="font-semibold text-gray-900">
                {voucher.usedCount}{" "}
                {voucher.totalUsageLimit
                  ? `/ ${voucher.totalUsageLimit}`
                  : "(Không giới hạn)"}
              </span>
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
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {t.vouchers.dialogs?.disableConfirm || "Tạm dừng"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
