import { useState } from "react"
import { Calendar, Loader2, Clock } from "lucide-react"
import type { VoucherListItem, VoucherDetail } from "../types"
import { useLanguage } from "../../../stores/languageStore"
import { formatDateToDisplay } from "../../../lib/utils"

export interface ExtendVoucherModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (validTo: string) => Promise<void> | void
  voucher: VoucherListItem | VoucherDetail | null
  isLoading?: boolean
}

export default function ExtendVoucherModal({
  isOpen,
  onClose,
  onConfirm,
  voucher,
  isLoading: externalLoading = false,
}: ExtendVoucherModalProps) {
  const { t } = useLanguage()
  const [validTo, setValidTo] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [internalLoading, setInternalLoading] = useState(false)
  const isLoading = externalLoading || internalLoading

  if (!isOpen || !voucher) return null

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validTo) {
      setError(t.vouchers.dialogs?.extendRequiredError || "Vui lòng chọn ngày gia hạn mới.")
      return
    }

    const selectedDate = new Date(validTo)
    const currentDate = voucher.validTo ? new Date(voucher.validTo) : new Date()

    if (selectedDate <= currentDate) {
      setError(
        t.vouchers.dialogs?.extendDateInvalidError ||
          "Ngày gia hạn mới phải lớn hơn ngày hết hạn hiện tại.",
      )
      return
    }

    try {
      setError(null)
      setInternalLoading(true)
      const isoValidTo = new Date(`${validTo}T23:59:59Z`).toISOString()
      await onConfirm(isoValidTo)
      onClose()
    } catch (err) {
      console.error("Failed to extend voucher:", err)
      setError(t.vouchers.dialogs?.extendGenericError || "Không thể gia hạn voucher. Vui lòng thử lại.")
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
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-3 text-blue-600">
              <Calendar size={28} />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {t.vouchers.dialogs?.extendTitle || "Gia hạn voucher"}
            </h3>

            <p className="text-xs text-gray-500">
              {t.vouchers.dialogs?.extendSubtitle ||
                "Thiết lập ngày hết hạn mới cho voucher CatSpeak"}
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2.5 mb-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-medium">
                {t.vouchers.dialogs?.extendCode || "Mã voucher:"}
              </span>
              <span className="font-bold text-red-600 font-mono text-sm">
                {voucher.code}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-medium">
                {t.vouchers.dialogs?.extendCurrentExpiry || "Ngày hết hạn hiện tại:"}
              </span>
              <span className="font-semibold text-gray-900 flex items-center gap-1">
                <Clock size={13} className="text-gray-400" />
                {voucher.isNeverExpired
                  ? t.vouchers.neverExpired || "Không thời hạn"
                  : formatDateToDisplay(voucher.validTo) || "—"}
              </span>
            </div>
          </div>

          <div className="space-y-1.5 mb-5 text-left">
            <label className="block text-xs font-semibold text-gray-700">
              {t.vouchers.dialogs?.extendNewExpiry || "Ngày gia hạn mới (validTo)"}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              min={new Date().toISOString().split("T")[0]}
              value={validTo}
              onChange={(e) => {
                setValidTo(e.target.value)
                setError(null)
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {t.vouchers.dialogs?.extendConfirm || "Xác nhận gia hạn"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
