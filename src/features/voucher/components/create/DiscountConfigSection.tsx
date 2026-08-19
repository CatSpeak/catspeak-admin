import React from "react"
import { Percent as BadgePercent, AlertCircle } from "lucide-react"
import { useLanguage } from "../../../../stores/languageStore"

interface DiscountConfigSectionProps {
  discountType: "Percentage" | "FixedAmount"
  setDiscountType: (type: "Percentage" | "FixedAmount") => void
  discountValue: string
  setDiscountValue: (value: string) => void
  discountValueError: string | null
  maxDiscountAmount: string
  setMaxDiscountAmount: (value: string) => void
  minOrderAmount: string
  setMinOrderAmount: (value: string) => void
}

export const DiscountConfigSection: React.FC<DiscountConfigSectionProps> = ({
  discountType,
  setDiscountType,
  discountValue,
  setDiscountValue,
  discountValueError,
  maxDiscountAmount,
  setMaxDiscountAmount,
  minOrderAmount,
  setMinOrderAmount,
}) => {
  const { t } = useLanguage()

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
        <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
          <BadgePercent size={18} />
        </div>
        <div>
          <h2 className="font-bold text-gray-900 text-base">
            {t.vouchers.create.discountConfig}
          </h2>
          <p className="text-xs text-gray-500">
            {t.vouchers.create.discountConfigDesc}
          </p>
        </div>
      </div>

      <div className="space-y-4 text-xs">
        {/* Discount Type Radio */}
        <div className="space-y-2">
          <label className="block font-semibold text-gray-700">
            {t.vouchers.create.discountType}{" "}
            <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer select-none transition-all ${
                discountType === "Percentage"
                  ? "border-blue-500 bg-blue-50/50 text-blue-900 font-semibold shadow-xs"
                  : "border-gray-200 hover:bg-gray-50 text-gray-700"
              }`}
            >
              <input
                type="radio"
                name="discountType"
                value="Percentage"
                checked={discountType === "Percentage"}
                onChange={() => setDiscountType("Percentage")}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <div>
                <p className="text-xs font-semibold">
                  {t.vouchers.discountTypes.percentage}
                </p>
                <p className="text-[11px] text-gray-500 font-normal">
                  {t.vouchers.create.percentageDesc}
                </p>
              </div>
            </label>

            <label
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer select-none transition-all ${
                discountType === "FixedAmount"
                  ? "border-blue-500 bg-blue-50/50 text-blue-900 font-semibold shadow-xs"
                  : "border-gray-200 hover:bg-gray-50 text-gray-700"
              }`}
            >
              <input
                type="radio"
                name="discountType"
                value="FixedAmount"
                checked={discountType === "FixedAmount"}
                onChange={() => setDiscountType("FixedAmount")}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <div>
                <p className="text-xs font-semibold">
                  {t.vouchers.discountTypes.fixedAmount}
                </p>
                <p className="text-[11px] text-gray-500 font-normal">
                  {t.vouchers.create.fixedAmountDesc}
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Numerical Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* Discount Value */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-gray-700">
              {t.vouchers.create.discountValue}{" "}
              <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                required
                min={discountType === "Percentage" ? 0 : 1}
                max={discountType === "Percentage" ? 100 : undefined}
                placeholder={discountType === "Percentage" ? "20" : "50000"}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className={`w-full pl-3 pr-8 py-2 rounded-lg border text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 transition-all ${
                  discountValueError
                    ? "border-red-400 focus:border-red-500 focus:ring-red-200 bg-red-50/20"
                    : "border-gray-200 focus:border-primary focus:ring-primary/20"
                }`}
              />
              <span className="absolute right-3 font-bold text-gray-500 text-xs pointer-events-none">
                {discountType === "Percentage" ? "%" : "đ"}
              </span>
            </div>
            {discountValueError && (
              <p className="text-[11px] text-red-500 font-medium flex items-center gap-1 mt-1 animate-fade-in">
                <AlertCircle size={12} className="shrink-0" />
                {discountValueError}
              </p>
            )}
          </div>

          {/* Max Discount Amount */}
          {discountType === "FixedAmount" && (
            <div className="space-y-1.5">
              <label className="block font-semibold text-gray-700">
                {t.vouchers.create.maxDiscountAmount}
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  min={0}
                  step={5000}
                  placeholder="200000"
                  value={maxDiscountAmount}
                  onChange={(e) => setMaxDiscountAmount(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 rounded-lg border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <span className="absolute right-3 font-bold text-gray-400 text-xs pointer-events-none">
                  đ
                </span>
              </div>
            </div>
          )}

          {/* Min Order Amount */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-gray-700">
              {t.vouchers.create.minOrderAmount}
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                min={0}
                step={5000}
                placeholder="300000"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value)}
                className="w-full pl-3 pr-8 py-2 rounded-lg border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              <span className="absolute right-3 font-bold text-gray-400 text-xs pointer-events-none">
                đ
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
