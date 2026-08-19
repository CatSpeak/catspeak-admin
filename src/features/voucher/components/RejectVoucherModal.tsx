import { useState } from "react"
import { AlertOctagon, Info, Loader2 } from "lucide-react"
import type { VoucherListItem, VoucherDetail } from "../types"
import { useLanguage } from "../../../stores/languageStore"

export interface RejectVoucherModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string, note?: string) => Promise<void> | void
  voucher: VoucherListItem | VoucherDetail | null
  isLoading?: boolean
}

export default function RejectVoucherModal({
  isOpen,
  onClose,
  onConfirm,
  voucher,
  isLoading: externalLoading = false,
}: RejectVoucherModalProps) {
  const { t } = useLanguage()
  const [selectedReason, setSelectedReason] = useState<string>(
    "Chưa nhận được tiền cọc",
  )
  const [note, setNote] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [internalLoading, setInternalLoading] = useState(false)
  const isLoading = externalLoading || internalLoading

  if (!isOpen || !voucher) return null

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedReason) {
      setError(
        t.vouchers.dialogs?.rejectReasonRequiredError ||
          "Vui lòng chọn lý do từ chối.",
      )
      return
    }

    try {
      setError(null)
      setInternalLoading(true)
      await onConfirm(selectedReason, note.trim() || undefined)
      onClose()
    } catch (err) {
      console.error("Failed to reject voucher:", err)
      setError(
        t.vouchers.dialogs?.rejectGenericError ||
          "Không thể từ chối voucher. Vui lòng thử lại.",
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
          <div className="flex flex-col items-center text-center mb-4">
            <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center mb-3 text-rose-600">
              <AlertOctagon size={28} />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {t.vouchers.dialogs?.rejectTitle || "Từ chối & Hủy voucher Giáo viên"}
            </h3>

            <p className="text-xs text-gray-500">
              {t.vouchers.dialogs?.rejectCode || "Mã voucher:"}{" "}
              <span className="font-bold text-red-600 font-mono">{voucher.code}</span>
            </p>
          </div>

          <div className="space-y-3 mb-4 text-left">
            <label className="block text-xs font-semibold text-gray-700">
              {t.vouchers.dialogs?.rejectReasonLabel || "Lý do từ chối"}{" "}
              <span className="text-red-500">*</span>
            </label>

            <div className="space-y-2">
              <label
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedReason === "Chưa nhận được tiền cọc"
                    ? "border-rose-500 bg-rose-50/50 text-rose-900 font-medium"
                    : "border-gray-200 hover:bg-gray-50 text-gray-700"
                }`}
              >
                <input
                  type="radio"
                  name="rejectReason"
                  value="Chưa nhận được tiền cọc"
                  checked={selectedReason === "Chưa nhận được tiền cọc"}
                  onChange={(e) => {
                    setSelectedReason(e.target.value)
                    setError(null)
                  }}
                  className="w-4 h-4 text-rose-600 focus:ring-rose-500"
                />
                <span className="text-xs">
                  {t.vouchers.dialogs?.rejectReasonDepositNotReceived ||
                    "Chưa nhận được tiền cọc"}
                </span>
              </label>

              <label
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedReason === "Nội dung không phù hợp"
                    ? "border-rose-500 bg-rose-50/50 text-rose-900 font-medium"
                    : "border-gray-200 hover:bg-gray-50 text-gray-700"
                }`}
              >
                <input
                  type="radio"
                  name="rejectReason"
                  value="Nội dung không phù hợp"
                  checked={selectedReason === "Nội dung không phù hợp"}
                  onChange={(e) => {
                    setSelectedReason(e.target.value)
                    setError(null)
                  }}
                  className="w-4 h-4 text-rose-600 focus:ring-rose-500"
                />
                <span className="text-xs">
                  {t.vouchers.dialogs?.rejectReasonInappropriateContent ||
                    "Nội dung không phù hợp"}
                </span>
              </label>
            </div>
          </div>

          <div className="space-y-1.5 mb-4 text-left">
            <label className="block text-xs font-semibold text-gray-700">
              {t.vouchers.dialogs?.rejectNoteLabel ||
                "Mô tả chi tiết / Ghi chú cho giáo viên"}
            </label>
            <textarea
              rows={3}
              placeholder={
                t.vouchers.dialogs?.rejectNotePlaceholder ||
                "Nhập chi tiết lý do từ chối để giáo viên nắm rõ..."
              }
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
            />
            {error && <p className="text-xs text-red-600 font-medium mt-1">{error}</p>}
          </div>

          <div className="w-full bg-blue-50 border border-blue-200 rounded-xl p-3 text-left flex items-start gap-2.5 mb-5 text-blue-800 text-xs leading-relaxed">
            <Info className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
            <div>
              {t.vouchers.dialogs?.rejectInfoBanner ||
                "Giáo viên sẽ nhận thông báo kèm lý do này và có thể tạo lại sau khi điều chỉnh."}
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
              type="submit"
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {t.vouchers.dialogs?.rejectConfirm || "Xác nhận Từ chối & Báo GV"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
