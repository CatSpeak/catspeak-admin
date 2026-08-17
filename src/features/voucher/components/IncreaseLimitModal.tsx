import { useState } from "react"
import { TrendingUp, Loader2 } from "lucide-react"
import type { VoucherListItem, VoucherDetail } from "../types"
import { useLanguage } from "../../../stores/languageStore"

export interface IncreaseLimitModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (additionalLimit: number) => Promise<void> | void
  voucher: VoucherListItem | VoucherDetail | null
  isLoading?: boolean
}

export default function IncreaseLimitModal({
  isOpen,
  onClose,
  onConfirm,
  voucher,
  isLoading: externalLoading = false,
}: IncreaseLimitModalProps) {
  const { t } = useLanguage()
  const [additionalLimit, setAdditionalLimit] = useState<number>(50)
  const [error, setError] = useState<string | null>(null)
  const [internalLoading, setInternalLoading] = useState(false)
  const isLoading = externalLoading || internalLoading

  if (!isOpen || !voucher) return null

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!additionalLimit || additionalLimit <= 0) {
      setError(
        t.vouchers.dialogs?.increaseLimitMinError ||
          "Số lượt tăng thêm phải lớn hơn 0.",
      )
      return
    }

    try {
      setError(null)
      setInternalLoading(true)
      await onConfirm(Number(additionalLimit))
      onClose()
    } catch (err) {
      console.error("Failed to increase voucher limit:", err)
      setError(
        t.vouchers.dialogs?.increaseLimitGenericError ||
          "Không thể tăng số lượt voucher. Vui lòng thử lại.",
      )
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
        <form onSubmit={handleConfirm} className="flex flex-col">
          <div className="flex flex-col items-center text-center mb-5">
            <div className="w-14 h-14 rounded-full bg-violet-50 flex items-center justify-center mb-3 text-violet-600">
              <TrendingUp size={28} />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {t.vouchers.dialogs?.increaseLimitTitle || "Tăng tổng lượt sử dụng"}
            </h3>

            <p className="text-xs text-gray-500">
              {t.vouchers.dialogs?.increaseLimitSubtitle ||
                "Mở rộng giới hạn sử dụng cho voucher CatSpeak khi đã hết lượt"}
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2.5 mb-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-medium">
                {t.vouchers.dialogs?.increaseLimitCode || "Mã voucher:"}
              </span>
              <span className="font-bold text-red-600 font-mono text-sm">
                {voucher.code}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-medium">
                {t.vouchers.dialogs?.increaseLimitCurrentUsage || "Lượt dùng hiện tại:"}
              </span>
              <span className="font-semibold text-gray-900">
                {voucher.usedCount} / {voucher.totalUsageLimit ?? "—"}
              </span>
            </div>
          </div>

          <div className="space-y-1.5 mb-5 text-left">
            <label className="block text-xs font-semibold text-gray-700">
              {t.vouchers.dialogs?.increaseLimitAmount || "Số lượt muốn tăng thêm"}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              step={1}
              required
              value={additionalLimit}
              onChange={(e) => {
                setAdditionalLimit(Number(e.target.value))
                setError(null)
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors"
            />
            {error && <p className="text-xs text-red-600 font-medium mt-1">{error}</p>}
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
              type="submit"
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {t.vouchers.dialogs?.increaseLimitConfirm || "Xác nhận tăng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
