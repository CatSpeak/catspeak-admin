import React, { useEffect, useState } from "react"
import { X } from "lucide-react"
import { useLanguage } from "../../../stores/languageStore"
import { formatDateTime } from "../../../lib/utils"
import Avatar from "../../../components/ui/Avatar"
import Badge from "../../../components/ui/Badge"
import { getPointRedemptionHistoryDetail } from "../api"
import type {
  PointRedemptionHistoryDto,
  PointRedemptionHistoryDetailDto,
} from "../types"

interface TransactionDetailModalProps {
  isOpen: boolean
  onClose: () => void
  transaction: PointRedemptionHistoryDto | null
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  isOpen,
  onClose,
  transaction,
}) => {
  const { t } = useLanguage()
  const [detail, setDetail] = useState<PointRedemptionHistoryDetailDto | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isOpen || !transaction?.id) {
      setDetail(null)
      return
    }

    const fetchDetail = async () => {
      setIsLoading(true)
      try {
        const data = await getPointRedemptionHistoryDetail(transaction.id)
        setDetail(data)
      } catch (err) {
        console.error("Failed to load transaction detail:", err)
        // Fallback to transaction prop
        setDetail({
          id: transaction.id,
          transactionCode: transaction.transactionCode,
          studentName: transaction.studentName,
          studentEmail: transaction.studentEmail,
          studentAvatar: transaction.studentAvatar,
          voucherName: transaction.voucherName,
          pointsLabel:
            transaction.status === "Success"
              ? t.pointRewards.detailModal.pointsLabelSuccess
              : t.pointRewards.detailModal.pointsLabelFailed,
          pointsDeducted: transaction.pointsDeducted,
          resultCode: transaction.resultCode,
          status: transaction.status,
          createdAt: transaction.createdAt,
          completedAt: transaction.completedAt,
          failedReason: transaction.failedReason,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDetail()
  }, [isOpen, transaction, t])

  if (!isOpen || !transaction) return null

  const currentData = detail || transaction
  const isSuccess = currentData.status === "Success"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 sm:p-7 z-10 animate-in zoom-in-95 duration-200 border border-gray-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            {t.pointRewards.detailModal.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {isLoading && !detail ? (
          <div className="py-12 text-center text-sm text-gray-500">
            Đang tải thông tin chi tiết...
          </div>
        ) : (
          <>
            {/* User Card */}
            <div className="mt-5 p-3.5 bg-gray-50 border border-gray-100 rounded-xl flex items-center gap-3.5">
              <Avatar
                url={currentData.studentAvatar}
                name={currentData.studentName}
                size="lg"
                className="border border-primary/20"
              />
              <div>
                <h4 className="font-bold text-gray-900 text-sm">
                  {currentData.studentName || "—"}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  {currentData.studentEmail || "—"}
                </p>
              </div>
            </div>

            {/* Details List */}
            <div className="mt-5 space-y-3.5 text-sm">
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-500">
                  {t.pointRewards.detailModal.txnCode}
                </span>
                <span className="font-semibold text-gray-800 font-mono text-xs">
                  {currentData.transactionCode || `#${currentData.id}`}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-gray-500">
                  {t.pointRewards.detailModal.reward}
                </span>
                <span className="font-medium text-gray-800 text-right max-w-[260px] truncate">
                  {currentData.voucherName}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-gray-500">
                  {detail?.pointsLabel ||
                    (isSuccess
                      ? t.pointRewards.detailModal.pointsLabelSuccess
                      : t.pointRewards.detailModal.pointsLabelFailed)}
                </span>
                <span className="font-bold text-rose-600">
                  {currentData.pointsDeducted > 0
                    ? `-${currentData.pointsDeducted.toLocaleString()}`
                    : `${currentData.pointsDeducted.toLocaleString()}`}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-gray-500">
                  {t.pointRewards.detailModal.resultCode}
                </span>
                {isSuccess ? (
                  <Badge type="Blue" title={currentData.resultCode} />
                ) : (
                  <Badge
                    type="Red"
                    title={currentData.resultCode || "N/A"}
                  />
                )}
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-gray-500">
                  {t.pointRewards.detailModal.createdAt}
                </span>
                <span className="text-gray-700 text-xs font-medium">
                  {formatDateTime(currentData.createdAt)}
                </span>
              </div>

              {isSuccess && currentData.completedAt && (
                <div className="flex items-center justify-between py-1">
                  <span className="text-gray-500">
                    {t.pointRewards.detailModal.completedAt}
                  </span>
                  <span className="text-gray-700 text-xs font-medium">
                    {formatDateTime(currentData.completedAt)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between py-1">
                <span className="text-gray-500">
                  {t.pointRewards.detailModal.status}
                </span>
                <Badge
                  type={isSuccess ? "Green" : "Red"}
                  showDot
                  title={
                    isSuccess
                      ? t.pointRewards.history.statusSuccess
                      : t.pointRewards.history.statusFailed
                  }
                />
              </div>

              {/* Failure Alert Box (BR-DD-14: Hide if success, show if failed) */}
              {!isSuccess && (
                <div className="pt-2">
                  <div className="text-xs font-semibold text-gray-500 mb-1.5">
                    {t.pointRewards.detailModal.failureReason}
                  </div>
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-600 font-medium leading-relaxed">
                    {currentData.failedReason ||
                      "Lỗi xử lý giao dịch hoặc hệ thống không phản hồi"}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                {t.pointRewards.detailModal.btnClose}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default TransactionDetailModal
