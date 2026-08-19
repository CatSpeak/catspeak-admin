import React from "react"
import { Ticket, Loader2, Sparkles } from "lucide-react"
import { useLanguage } from "../../../../stores/languageStore"

interface GeneralInfoSectionProps {
  code: string
  setCode: (code: string) => void
  title: string
  setTitle: (title: string) => void
  description: string
  setDescription: (description: string) => void
  isGeneratingCode: boolean
  handleGenerateCode: () => void
}

export const GeneralInfoSection: React.FC<GeneralInfoSectionProps> = ({
  code,
  setCode,
  title,
  setTitle,
  description,
  setDescription,
  isGeneratingCode,
  handleGenerateCode,
}) => {
  const { t } = useLanguage()

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
        <div className="p-2 rounded-xl bg-red-50 text-red-600">
          <Ticket size={18} />
        </div>
        <div>
          <h2 className="font-bold text-gray-900 text-base">
            {t.vouchers.create.generalInfo}
          </h2>
          <p className="text-xs text-gray-500">
            {t.vouchers.create.generalInfoDesc}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        {/* Code */}
        <div className="space-y-1.5 sm:col-span-2">
          <label className="block font-semibold text-gray-700">
            {t.vouchers.create.code} <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2 w-full">
            <input
              type="text"
              required
              placeholder={t.vouchers.create.codePlaceholder}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-xs sm:text-sm font-mono text-gray-900 tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <button
              type="button"
              disabled={isGeneratingCode}
              onClick={handleGenerateCode}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 transition-all shrink-0 shadow-xs whitespace-nowrap cursor-pointer"
              title={t.vouchers.create.generateRandom}
            >
              {isGeneratingCode ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
              ) : (
                <Sparkles size={14} className="text-primary" />
              )}
              <span>{t.vouchers.create.generateRandom}</span>
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1.5 sm:col-span-2">
          <label className="block font-semibold text-gray-700">
            {t.vouchers.create.voucherName}{" "}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder={t.vouchers.create.voucherNamePlaceholder}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5 sm:col-span-2">
          <label className="block font-semibold text-gray-700">
            {t.vouchers.create.description}
          </label>
          <textarea
            rows={2}
            placeholder={t.vouchers.create.descriptionPlaceholder}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>
    </div>
  )
}
