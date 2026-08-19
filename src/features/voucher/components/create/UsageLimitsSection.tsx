import React from "react"
import { Calculator } from "lucide-react"
import { useLanguage } from "../../../../stores/languageStore"

interface UsageLimitsSectionProps {
  isUnlimitedUsage: boolean
  setIsUnlimitedUsage: (val: boolean) => void
  totalUsageLimit: string
  setTotalUsageLimit: (val: string) => void
  perUserLimit: string
  setPerUserLimit: (val: string) => void
  dailyLimit: string
  setDailyLimit: (val: string) => void
  // maxBudget: string
  // setMaxBudget: (val: string) => void
}

export const UsageLimitsSection: React.FC<UsageLimitsSectionProps> = ({
  isUnlimitedUsage,
  setIsUnlimitedUsage,
  totalUsageLimit,
  setTotalUsageLimit,
  perUserLimit,
  setPerUserLimit,
  dailyLimit,
  setDailyLimit,
  // maxBudget,
  // setMaxBudget,
}) => {
  const { t } = useLanguage()

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
        <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
          <Calculator size={18} />
        </div>
        <div>
          <h2 className="font-bold text-gray-900 text-base">
            {t.vouchers.create.usageLimits}
          </h2>
          <p className="text-[11px] text-gray-500">
            {t.vouchers.create.usageLimitsDesc}
          </p>
        </div>
      </div>

      <div className="space-y-3.5 text-xs">
        {/* Unlimited Usage Checkbox */}
        <label className="flex items-center gap-2.5 cursor-pointer text-gray-700 select-none">
          <input
            type="checkbox"
            checked={isUnlimitedUsage}
            onChange={(e) => setIsUnlimitedUsage(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
          />
          <span className="text-xs font-semibold text-gray-800 select-none">
            {t.vouchers.create.isUnlimitedUsage}
          </span>
        </label>

        {/* Total Usage Limit */}
        {!isUnlimitedUsage && (
          <div className="space-y-1.5 animate-fade-in">
            <label className="block font-semibold text-gray-700">
              {t.vouchers.create.totalUsageLimit}
            </label>
            <input
              type="number"
              min={1}
              placeholder="100"
              value={totalUsageLimit}
              onChange={(e) => setTotalUsageLimit(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        )}

        {/* Per User Limit */}
        <div className="space-y-1.5">
          <label className="block font-semibold text-gray-700">
            {t.vouchers.create.perUserLimit}
          </label>
          <input
            type="number"
            min={1}
            placeholder="1"
            value={perUserLimit}
            onChange={(e) => setPerUserLimit(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        {/* Daily Limit */}
        <div className="space-y-1.5">
          <label className="block font-semibold text-gray-700">
            {t.vouchers.create.dailyLimit}
          </label>
          <input
            type="number"
            min={1}
            placeholder={t.vouchers.create.unlimitedPlaceholder}
            value={dailyLimit}
            onChange={(e) => setDailyLimit(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        {/* Max Budget */}
        {/* <div className="space-y-1.5">
          <label className="block font-semibold text-gray-700">
            {t.vouchers.create.maxBudget}
          </label>
          <div className="relative flex items-center">
            <input
              type="number"
              min={0}
              step={10000}
              placeholder={t.vouchers.create.unlimitedPlaceholder}
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
              className="w-full pl-3 pr-8 py-2 rounded-lg border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <span className="absolute right-3 font-bold text-gray-400 text-xs pointer-events-none">
              đ
            </span>
          </div>
        </div> */}
      </div>
    </div>
  )
}
