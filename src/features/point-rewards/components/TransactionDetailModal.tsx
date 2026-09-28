import React from "react"
import { X, User } from "lucide-react"
import type { ExchangeTransaction } from "../types"
import { TransactionStatusBadge } from "./common/StatusBadge"

interface TransactionDetailModalProps {
  isOpen: boolean
  onClose: () => void
  transaction: ExchangeTransaction | null
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  isOpen,
  onClose,
  transaction,
}) => {
  if (!isOpen || !transaction) return null

  const isSuccess = transaction.status === "success"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 sm:p-7 z-10 animate-in zoom-in-95 duration-200 border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Chi tiết giao dịch</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Card */}
        <div className="mt-5 p-3.5 bg-gray-50 border border-gray-100 rounded-xl flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold overflow-hidden border border-primary/20">
            {transaction.studentAvatar ? (
              <img
                src={transaction.studentAvatar}
                alt={transaction.studentName}
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={24} />
            )}
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm">{transaction.studentName}</h4>
            <p className="text-xs text-gray-500 mt-0.5">{transaction.studentEmail}</p>
          </div>
        </div>

        {/* Details List */}
        <div className="mt-5 space-y-3.5 text-sm">
          <div className="flex items-center justify-between py-1">
            <span className="text-gray-500">Mã giao dịch</span>
            <span className="font-semibold text-gray-800 font-mono text-xs">{transaction.id}</span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-gray-500">Phần thưởng</span>
            <span className="font-medium text-gray-800 text-right max-w-[260px] truncate">
              {transaction.rewardTitle}
            </span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-gray-500">
              {isSuccess ? "Điểm giao dịch" : "Điểm dự kiến"}
            </span>
            <span className="font-bold text-rose-600">
              {Math.abs(transaction.pointsDeducted)} pts
            </span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-gray-500">Mã/Kết quả</span>
            {isSuccess ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded bg-blue-50 text-blue-700 text-xs font-mono font-medium border border-blue-200">
                {transaction.codeResult}
              </span>
            ) : (
              <span className="text-rose-600 font-medium text-sm">
                {transaction.codeResult}
              </span>
            )}
          </div>

          {isSuccess ? (
            <>
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-500">Thời gian tạo</span>
                <span className="text-gray-700 text-xs">{transaction.time}:22</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-500">Thời gian hoàn thành</span>
                <span className="text-gray-700 text-xs">
                  {transaction.completedTime || `${transaction.time}:25`}
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between py-1">
              <span className="text-gray-500">Thời gian thực hiện</span>
              <span className="text-gray-700 text-xs">{transaction.time}:22</span>
            </div>
          )}

          <div className="flex items-center justify-between py-1">
            <span className="text-gray-500">Trạng thái</span>
            <TransactionStatusBadge status={transaction.status} />
          </div>

          {/* Failure Alert Box */}
          {!isSuccess && (
            <div className="pt-2">
              <div className="text-xs font-semibold text-gray-500 mb-1.5">Lý do thất bại</div>
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-600 font-medium leading-relaxed">
                {transaction.failReason || "Hệ thống đối tác không phản hồi"}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}

export default TransactionDetailModal
