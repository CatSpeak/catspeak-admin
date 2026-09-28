import React, { useState } from "react"
import { X } from "lucide-react"
import { useToastStore } from "../../../stores/toastStore"
import type { ExchangeItem } from "../types"

interface CreateExchangeItemModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: (item: ExchangeItem) => void
}

export const CreateExchangeItemModal: React.FC<CreateExchangeItemModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { addToast } = useToastStore()

  const [voucherId, setVoucherId] = useState("")
  const [pointsCost, setPointsCost] = useState("")
  const [applicableCourse, setApplicableCourse] = useState("")
  const [stockTotal, setStockTotal] = useState("")
  const [limitPerStudent, setLimitPerStudent] = useState("1")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!voucherId) {
      addToast("warning", "Vui lòng chọn voucher gốc")
      return
    }
    if (!pointsCost || Number(pointsCost) <= 0) {
      addToast("warning", "Vui lòng nhập số điểm cần đổi hợp lệ")
      return
    }

    setIsSubmitting(true)
    setTimeout(() => {
      // Create new exchange item
      const newItem: ExchangeItem = {
        id: `item-${Date.now()}`,
        title: voucherId,
        sponsor: voucherId.includes("CatSpeak") ? "CatSpeak" : "Chủ lớp",
        pointsCost: Number(pointsCost),
        stockCurrent: stockTotal ? Number(stockTotal) : 100,
        stockTotal: stockTotal ? Number(stockTotal) : 100,
        validity: endDate ? endDate : "Vô thời hạn",
        status: "active",
        applicableCourse: applicableCourse || "Tất cả khóa học",
        limitPerStudent: Number(limitPerStudent) || 1,
        startDate,
        endDate,
      }

      onCreated(newItem)
      addToast("success", "Tạo mục đổi điểm mới thành công!")
      setIsSubmitting(false)
      onClose()
    }, 400)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 sm:p-7 z-10 animate-in zoom-in-95 duration-200 border border-gray-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Tạo mục đổi điểm mới</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-sm">
          {/* Voucher gốc */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1.5">
              Voucher gốc <span className="text-red-500">*</span>
            </label>
            <select
              value={voucherId}
              onChange={(e) => setVoucherId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm cursor-pointer"
            >
              <option value="">Chọn voucher CatSpeak tài trợ...</option>
              <option value="Giảm 15% khóa Speaking">Giảm 15% khóa Speaking (CatSpeak)</option>
              <option value="Voucher giảm 100.000đ khóa IELTS">Voucher giảm 100.000đ khóa IELTS (CatSpeak)</option>
              <option value="Voucher giảm 200.000đ học phí">Voucher giảm 200.000đ học phí (Chủ lớp)</option>
              <option value="Giảm 25% khóa Luyện thi TOEIC">Giảm 25% khóa Luyện thi TOEIC (Chủ lớp)</option>
              <option value="Voucher giảm 50% Khóa Giao Tiếp">Voucher giảm 50% Khóa Giao Tiếp (CatSpeak)</option>
            </select>
          </div>

          {/* Số điểm cần đổi */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1.5">
              Số điểm cần đổi <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={pointsCost}
              onChange={(e) => setPointsCost(e.target.value)}
              placeholder="Nhập số điểm (VD: 500)"
              required
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm placeholder:text-gray-400"
            />
          </div>

          {/* Khóa học áp dụng */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1.5">Khóa học áp dụng</label>
            <select
              value={applicableCourse}
              onChange={(e) => setApplicableCourse(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm cursor-pointer"
            >
              <option value="">Chọn khóa học</option>
              <option value="Tất cả khóa học">Tất cả khóa học</option>
              <option value="Khóa học Speaking Pro">Khóa học Speaking Pro</option>
              <option value="Khóa Luyện thi IELTS Intensive">Khóa Luyện thi IELTS Intensive</option>
              <option value="Khóa Luyện thi TOEIC Target 800+">Khóa Luyện thi TOEIC Target 800+</option>
              <option value="Khóa Kỹ năng giao tiếp">Khóa Kỹ năng giao tiếp</option>
            </select>
          </div>

          {/* 2 Cols: Tổng số lượng & Giới hạn đổi/học viên */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1.5">Tổng số lượng</label>
              <input
                type="number"
                min="1"
                value={stockTotal}
                onChange={(e) => setStockTotal(e.target.value)}
                placeholder="Không giới hạn nếu để trống"
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1.5">Giới hạn đổi/học viên</label>
              <input
                type="number"
                min="1"
                value={limitPerStudent}
                onChange={(e) => setLimitPerStudent(e.target.value)}
                placeholder="1"
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              />
            </div>
          </div>

          {/* 2 Cols: Ngày bắt đầu & Ngày kết thúc */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1.5">Ngày bắt đầu</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm cursor-pointer"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1.5">Ngày kết thúc</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm cursor-pointer"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-5 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#910B09] hover:bg-[#7a0907] transition-all shadow-sm active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateExchangeItemModal
