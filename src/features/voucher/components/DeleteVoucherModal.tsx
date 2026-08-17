import { useState } from "react"
import { Trash2, AlertTriangle, Loader2 } from "lucide-react"
import type { VoucherListItem, VoucherDetail } from "../types"
import { useLanguage } from "../../../stores/languageStore"

export interface DeleteVoucherModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void> | void
  voucher: VoucherListItem | VoucherDetail | null
  isLoading?: boolean
}

export default function DeleteVoucherModal({
  isOpen,
  onClose,
  onConfirm,
  voucher,
  isLoading: externalLoading = false,
}: DeleteVoucherModalProps) {
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
      console.error("Failed to delete voucher:", err)
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
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-600">
            <Trash2 size={28} />
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {t.vouchers.dialogs?.deleteTitle || "Xóa voucher"}
          </h3>

          <p className="text-sm text-gray-600 mb-4">
            {t.vouchers.dialogs?.deletePrompt || "Bạn có chắc chắn muốn xóa mã voucher"}{" "}
            <span className="font-bold text-red-600 font-mono">{voucher.code}</span>?
          </p>

          <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-left space-y-2 mb-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-medium">
                {t.vouchers.dialogs?.deleteCurrentStatus || "Trạng thái hiện tại:"}
              </span>
              <span className="font-semibold text-gray-900">{voucher.status}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-medium">
                {t.vouchers.dialogs?.deleteUsedCount || "Số lượt đã dùng:"}
              </span>
              <span className="font-semibold text-gray-900">
                {voucher.usedCount} {t.vouchers.usage.toLowerCase() || "lượt"}
              </span>
            </div>
          </div>

          <div className="w-full bg-red-50 border border-red-200 rounded-xl p-3 text-left flex items-start gap-2.5 mb-5 text-red-800 text-xs leading-relaxed">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <div>
              <p className="font-semibold">
                {t.vouchers.dialogs?.deleteWarningTitle || "Cảnh báo:"}
              </p>
              <p>
                {t.vouchers.dialogs?.deleteWarningDesc ||
                  "Hành động này không thể hoàn tác. Toàn bộ cấu hình và thông tin của voucher này sẽ bị xóa khỏi hệ thống."}
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
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {t.vouchers.dialogs?.deleteConfirm || "Xóa voucher"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
