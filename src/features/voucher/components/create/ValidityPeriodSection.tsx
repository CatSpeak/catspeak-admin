import React from "react"
import { Calendar as CalendarRange, AlertCircle } from "lucide-react"
import { useLanguage } from "../../../../stores/languageStore"

interface ValidityPeriodSectionProps {
  validFrom: string
  setValidFrom: (date: string) => void
  validTo: string
  setValidTo: (date: string) => void
  isNeverExpired: boolean
  setIsNeverExpired: (val: boolean) => void
  todayStr: string
  dateRangeError: string | null
}

export const ValidityPeriodSection: React.FC<ValidityPeriodSectionProps> = ({
  validFrom,
  setValidFrom,
  validTo,
  setValidTo,
  isNeverExpired,
  setIsNeverExpired,
  todayStr,
  dateRangeError,
}) => {
  const { t } = useLanguage()

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
        <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
          <CalendarRange size={18} />
        </div>
        <div>
          <h2 className="font-bold text-gray-900 text-base">
            {t.vouchers.create.validityPeriod}
          </h2>
          <p className="text-[11px] text-gray-500">
            {t.vouchers.create.validityPeriodDesc}
          </p>
        </div>
      </div>

      <div className="space-y-3.5 text-xs">
        {/* Valid From */}
        <div className="space-y-1.5">
          <label className="block font-semibold text-gray-700">
            {t.vouchers.create.validFrom} <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            required
            value={validFrom}
            onChange={(e) => setValidFrom(e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border text-xs sm:text-sm focus:outline-none focus:ring-2 transition-all ${
              dateRangeError
                ? "border-red-400 focus:border-red-500 focus:ring-red-200 bg-red-50/20"
                : "border-gray-200 focus:border-primary focus:ring-primary/20"
            }`}
          />
        </div>

        {/* Is Never Expired Checkbox */}
        <label className="flex items-center gap-2.5 cursor-pointer text-gray-700 select-none pt-1">
          <input
            type="checkbox"
            checked={isNeverExpired}
            onChange={(e) => setIsNeverExpired(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
          />
          <span className="text-xs font-semibold text-gray-800 select-none">
            {t.vouchers.create.isNeverExpired}
          </span>
        </label>

        {/* Valid To */}
        {!isNeverExpired && (
          <div className="space-y-1.5 animate-fade-in">
            <label className="block font-semibold text-gray-700">
              {t.vouchers.create.validTo} <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required={!isNeverExpired}
              min={validFrom || todayStr}
              value={validTo}
              onChange={(e) => setValidTo(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border text-xs sm:text-sm focus:outline-none focus:ring-2 transition-all ${
                dateRangeError
                  ? "border-red-400 focus:border-red-500 focus:ring-red-200 bg-red-50/20"
                  : "border-gray-200 focus:border-primary focus:ring-primary/20"
              }`}
            />
            {dateRangeError && (
              <p className="text-[11px] text-red-500 font-medium flex items-center gap-1 mt-1 animate-fade-in">
                <AlertCircle size={12} className="shrink-0" />
                {dateRangeError}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
