import React, { useState, useEffect } from "react"
import { X, AlertCircle } from "lucide-react"
import { useToastStore } from "../../../stores/toastStore"
import { useLanguage } from "../../../stores/languageStore"
import { getApiErrorMessage } from "../../../lib/axios"
import {
  formatDateToUtcStartOfDay,
  formatDateToUtcEndOfDay,
  parseDateToIsoDate,
} from "../../../lib/utils"
import {
  getEligibleVouchers,
  createPointRedemptionItem,
  updatePointRedemptionItem,
} from "../api"
import type {
  PointRedemptionItemDto,
  EligibleVoucherDto,
  CreatePointRedemptionItemRequest,
  UpdatePointRedemptionItemRequest,
} from "../types"

interface CreateExchangeItemModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (item: PointRedemptionItemDto) => void
  editingItem?: PointRedemptionItemDto | null
}

export const CreateExchangeItemModal: React.FC<CreateExchangeItemModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingItem,
}) => {
  const { t } = useLanguage()
  const { addToast } = useToastStore()

  const isEditMode = Boolean(editingItem)

  // Form states
  const [eligibleVouchers, setEligibleVouchers] = useState<EligibleVoucherDto[]>([])
  const [isLoadingVouchers, setIsLoadingVouchers] = useState(false)

  const [voucherId, setVoucherId] = useState<number | "">("")
  const [courseId, setCourseId] = useState<number | "">("")
  const [pointsRequired, setPointsRequired] = useState<string>("")
  const [totalQuantity, setTotalQuantity] = useState<string>("")
  const [limitPerUser, setLimitPerUser] = useState<string>("1")
  const [validFrom, setValidFrom] = useState<string>("")
  const [validTo, setValidTo] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Fetch eligible vouchers for dropdown
  useEffect(() => {
    if (!isOpen) return

    const loadVouchers = async () => {
      setIsLoadingVouchers(true)
      try {
        const vouchers = await getEligibleVouchers()
        setEligibleVouchers(vouchers)
      } catch (err) {
        console.error("Failed to load eligible vouchers:", err)
      } finally {
        setIsLoadingVouchers(false)
      }
    }

    loadVouchers()
  }, [isOpen])

  // Initialize form values when editingItem or mode changes
  useEffect(() => {
    if (editingItem) {
      setCourseId(editingItem.courseId ?? "")
      setPointsRequired(String(editingItem.pointsRequired))
      setTotalQuantity(
        editingItem.totalQuantity !== null && editingItem.totalQuantity !== undefined
          ? String(editingItem.totalQuantity)
          : "",
      )
      setLimitPerUser(String(editingItem.limitPerUser || 1))
      setValidFrom(parseDateToIsoDate(editingItem.validFrom) || "")
      setValidTo(parseDateToIsoDate(editingItem.validTo) || "")
      setErrorMessage(null)
    } else {
      setVoucherId("")
      setCourseId("")
      setPointsRequired("")
      setTotalQuantity("")
      setLimitPerUser("1")
      // Default validFrom to today
      const today = new Date().toISOString().substring(0, 10)
      setValidFrom(today)
      setValidTo("")
      setErrorMessage(null)
    }
  }, [editingItem, isOpen])

  // Currently selected voucher object
  const selectedVoucher = eligibleVouchers.find((v) => v.id === Number(voucherId))

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    // Validation
    if (!isEditMode && (!voucherId || Number(voucherId) <= 0)) {
      const msg = t.pointRewards.modal.validationVoucherRequired
      setErrorMessage(msg)
      addToast("warning", msg)
      return
    }

    const pointsNum = Number(pointsRequired)
    if (!pointsRequired || isNaN(pointsNum) || pointsNum <= 0) {
      const msg = t.pointRewards.modal.validationPointsRequired
      setErrorMessage(msg)
      addToast("warning", msg)
      return
    }

    const limitNum = Number(limitPerUser)
    if (!limitPerUser || isNaN(limitNum) || limitNum < 1) {
      const msg = t.pointRewards.modal.validationLimitRequired
      setErrorMessage(msg)
      addToast("warning", msg)
      return
    }

    if (!validFrom) {
      const msg = t.pointRewards.modal.labelValidFrom + " " + t.pointRewards.modal.validationVoucherRequired
      setErrorMessage(msg)
      addToast("warning", msg)
      return
    }

    const utcValidFrom = formatDateToUtcStartOfDay(validFrom)
    const utcValidTo = validTo ? formatDateToUtcEndOfDay(validTo) : null

    if (utcValidFrom && utcValidTo && new Date(utcValidTo) <= new Date(utcValidFrom)) {
      const msg = t.pointRewards.modal.validationDateOrder
      setErrorMessage(msg)
      addToast("warning", msg)
      return
    }

    const parsedTotalQuantity =
      totalQuantity && totalQuantity.trim().length > 0
        ? Number(totalQuantity)
        : null

    setIsSubmitting(true)

    try {
      if (isEditMode && editingItem) {
        const updatePayload: UpdatePointRedemptionItemRequest = {
          courseId: courseId ? Number(courseId) : null,
          pointsRequired: pointsNum,
          totalQuantity: parsedTotalQuantity,
          limitPerUser: limitNum,
          validFrom: utcValidFrom || new Date(validFrom).toISOString(),
          validTo: utcValidTo,
        }

        const result = await updatePointRedemptionItem(editingItem.id, updatePayload)
        addToast("success", t.pointRewards.modal.updateSuccess)
        onSuccess(result)
        onClose()
      } else {
        const createPayload: CreatePointRedemptionItemRequest = {
          voucherId: Number(voucherId),
          courseId: courseId ? Number(courseId) : null,
          pointsRequired: pointsNum,
          totalQuantity: parsedTotalQuantity,
          limitPerUser: limitNum,
          validFrom: utcValidFrom || new Date(validFrom).toISOString(),
          validTo: utcValidTo,
        }

        const result = await createPointRedemptionItem(createPayload)
        addToast("success", t.pointRewards.modal.createSuccess)
        onSuccess(result)
        onClose()
      }
    } catch (err: unknown) {
      const errorMsg = getApiErrorMessage(err, t.pointRewards.toasts.actionError)
      setErrorMessage(errorMsg)
      addToast("error", errorMsg)
    } finally {
      setIsSubmitting(false)
    }
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
          <h2 className="text-xl font-bold text-gray-900">
            {isEditMode
              ? t.pointRewards.modal.editTitle
              : t.pointRewards.modal.createTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-600">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span className="leading-relaxed whitespace-pre-line">{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-sm">
          {/* Voucher gốc */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1.5">
              {t.pointRewards.modal.labelVoucher} <span className="text-red-500">*</span>
            </label>
            {isEditMode ? (
              <input
                type="text"
                disabled
                value={editingItem?.voucherName || ""}
                className="w-full px-3.5 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 text-sm cursor-not-allowed font-medium"
              />
            ) : (
              <select
                value={voucherId}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : ""
                  setVoucherId(val)
                  setCourseId("") // reset selected course on voucher change
                }}
                required
                disabled={isLoadingVouchers}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm cursor-pointer disabled:bg-gray-50"
              >
                <option value="">
                  {isLoadingVouchers
                    ? "Đang tải danh sách voucher..."
                    : t.pointRewards.modal.placeholderVoucher}
                </option>
                {eligibleVouchers.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Khóa học áp dụng */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1.5">
              {t.pointRewards.modal.labelCourse}
            </label>
            <select
              value={courseId}
              onChange={(e) =>
                setCourseId(e.target.value ? Number(e.target.value) : "")
              }
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm cursor-pointer"
            >
              <option value="">{t.pointRewards.modal.allCourses}</option>
              {selectedVoucher?.applicableCourses &&
              selectedVoucher.applicableCourses.length > 0
                ? selectedVoucher.applicableCourses.map((c) => (
                    <option key={c.courseId} value={c.courseId}>
                      {c.courseName}
                    </option>
                  ))
                : null}
            </select>
          </div>

          {/* Số điểm cần đổi */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1.5">
              {t.pointRewards.modal.labelPoints} <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={pointsRequired}
              onChange={(e) => setPointsRequired(e.target.value)}
              placeholder={t.pointRewards.modal.placeholderPoints}
              required
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm placeholder:text-gray-400"
            />
          </div>

          {/* 2 Cols: Tổng số lượng & Giới hạn đổi/học viên */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1.5">
                {t.pointRewards.modal.labelTotalQuantity}
              </label>
              <input
                type="number"
                min="1"
                value={totalQuantity}
                onChange={(e) => setTotalQuantity(e.target.value)}
                placeholder={t.pointRewards.modal.placeholderTotalQuantity}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1.5">
                {t.pointRewards.modal.labelLimitPerUser} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={limitPerUser}
                onChange={(e) => setLimitPerUser(e.target.value)}
                placeholder="1"
                required
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              />
            </div>
          </div>

          {/* 2 Cols: Ngày bắt đầu & Ngày kết thúc */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1.5">
                {t.pointRewards.modal.labelValidFrom} <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm cursor-pointer"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1.5">
                {t.pointRewards.modal.labelValidTo}
              </label>
              <input
                type="date"
                value={validTo}
                onChange={(e) => setValidTo(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm cursor-pointer"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-5 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              {t.pointRewards.modal.btnCancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#910B09] hover:bg-[#7a0907] transition-all shadow-sm active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting
                ? t.pointRewards.modal.btnSaving
                : t.pointRewards.modal.btnSave}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateExchangeItemModal
