import { useState } from "react"
import { CheckCircle2, AlertTriangle, Loader2 } from "lucide-react"
import type { VoucherListItem, VoucherDetail } from "../types"
import { useLanguage } from "../../../stores/languageStore"

export interface ActivateVoucherModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void> | void
  voucher: VoucherListItem | VoucherDetail | null
  isLoading?: boolean
}

export default function ActivateVoucherModal({
  isOpen,
  onClose,
  onConfirm,
  voucher,
  isLoading: externalLoading = false,
}: ActivateVoucherModalProps) {
  const { t } = useLanguage()
  const [internalLoading, setInternalLoading] = useState(false)
  const isLoading = externalLoading || internalLoading

  if (!isOpen || !voucher) return null

  const isExpired = voucher.status === "Expired"

  const handleConfirm = async () => {
    try {
      setInternalLoading(true)
      await onConfirm()
      onClose()
    } catch (err) {
      console.error("Failed to activate voucher:", err)
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
            <CheckCircle2 size={28} />
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {t.vouchers.dialogs?.activateTitle || "Kích hoạt voucher"}
          </h3>

          <p className="text-sm text-gray-600 mb-4">
            {t.vouchers.dialogs?.activatePrompt || "Bạn có chắc chắn muốn kích hoạt mã voucher"}{" "}
            <span className="font-bold text-red-600 font-mono">{voucher.code}</span>?
          </p>

          {isExpired && (
            <div className="w-full bg-amber-50 border border-amber-200 rounded-xl p-3 text-left flex items-start gap-2.5 mb-4 text-amber-800 text-xs leading-relaxed">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="font-semibold">
                  {t.vouchers.dialogs?.activateExpiryWarningTitle || "Lưu ý về thời hạn:"}
                </p>
                <p>
                  {t.vouchers.dialogs?.activateExpiryWarningDesc ||
                    "Voucher này đã từng hết hạn. Vui lòng kiểm tra lại thời hạn mới để đảm bảo voucher hoạt động chính xác sau khi kích hoạt."}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 w-full mt-2">
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
              {t.vouchers.dialogs?.activateConfirm || "Kích hoạt"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
