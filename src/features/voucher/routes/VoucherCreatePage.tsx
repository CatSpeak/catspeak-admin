import { useCallback, useEffect, useState, useMemo } from "react"
import { useNavigate, Link } from "react-router-dom"
import {
  Ticket,
  Percent as BadgePercent,
  ListTodo,
  Calendar as CalendarRange,
  Calculator,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  Search,
  X,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react"
import { generateVoucherCode } from "../api/generateVoucherCode"
import { createVoucher } from "../api/createVoucher"
import { getCourses, getClasses } from "../../classes/api/classApi"
import type { AdminCourse, AdminClass } from "../../classes/types"
import type { CreateVoucherRequest } from "../types"
import { useLanguage } from "../../../stores/languageStore"
import { getApiErrorMessage } from "../../../lib/axios"

export default function VoucherCreatePage() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  // Form States
  const [code, setCode] = useState<string>("")
  const [title, setTitle] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const sponsorType = "CatSpeak" as const

  // Discount Configuration
  const [discountType, setDiscountType] = useState<"Percentage" | "FixedAmount">(
    "Percentage",
  )
  const [discountValue, setDiscountValue] = useState<string>("")
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<string>("")
  const [minOrderAmount, setMinOrderAmount] = useState<string>("")

  // Application Conditions
  const [scopeType, setScopeType] = useState<
    "All" | "SpecificCourses" | "SpecificClasses"
  >("All")
  const [courseIds, setCourseIds] = useState<number[]>([])
  const [classIds, setClassIds] = useState<number[]>([])
  const [isOnlyNewUser, setIsOnlyNewUser] = useState<boolean>(false)
  const [isNotCombineOther, setIsNotCombineOther] = useState<boolean>(true)
  const [minLearners, setMinLearners] = useState<number>(1)

  // Validity Period
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], [])
  const [validFrom, setValidFrom] = useState<string>(todayStr)
  const [validTo, setValidTo] = useState<string>("")
  const [isNeverExpired, setIsNeverExpired] = useState<boolean>(false)

  // Usage Limits
  const [isUnlimitedUsage, setIsUnlimitedUsage] = useState<boolean>(false)
  const [totalUsageLimit, setTotalUsageLimit] = useState<string>("100")
  const [perUserLimit, setPerUserLimit] = useState<string>("1")
  const [dailyLimit, setDailyLimit] = useState<string>("")
  const [maxBudget, setMaxBudget] = useState<string>("")

  // Data fetching states for courses/classes
  const [coursesList, setCoursesList] = useState<AdminCourse[]>([])
  const [classesList, setClassesList] = useState<AdminClass[]>([])
  const [loadingItems, setLoadingItems] = useState<boolean>(false)
  const [itemSearch, setItemSearch] = useState<string>("")

  // UI / Async action states
  const [isGeneratingCode, setIsGeneratingCode] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Generate random voucher code
  const handleGenerateCode = async () => {
    try {
      setIsGeneratingCode(true)
      setFormError(null)
      const res = await generateVoucherCode()
      if (res?.code) {
        setCode(res.code)
      }
    } catch (err: unknown) {
      console.error("Failed to generate code:", err)
      // Generate fallback client-side unique code
      const fallbackCode = `CS${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      setCode(fallbackCode)
    } finally {
      setIsGeneratingCode(false)
    }
  }

  // Fetch Courses when scopeType === "SpecificCourses"
  useEffect(() => {
    if (scopeType === "SpecificCourses" && coursesList.length === 0) {
      const fetchCoursesList = async () => {
        try {
          setLoadingItems(true)
          const res = await getCourses("", 1, 100)
          setCoursesList(res?.data || [])
        } catch (err) {
          console.error("Failed to fetch courses:", err)
        } finally {
          setLoadingItems(false)
        }
      }
      fetchCoursesList()
    }
  }, [scopeType, coursesList.length])

  // Fetch Classes when scopeType === "SpecificClasses"
  useEffect(() => {
    if (scopeType === "SpecificClasses" && classesList.length === 0) {
      const fetchClassesList = async () => {
        try {
          setLoadingItems(true)
          const res = await getClasses(1, 100)
          setClassesList(res?.data || [])
        } catch (err) {
          console.error("Failed to fetch classes:", err)
        } finally {
          setLoadingItems(false)
        }
      }
      fetchClassesList()
    }
  }, [scopeType, classesList.length])

  // Filtered Courses list for search
  const filteredCourses = useMemo(() => {
    if (!itemSearch.trim()) return coursesList
    const s = itemSearch.toLowerCase()
    return coursesList.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        String(c.id).includes(s) ||
        (c.language && c.language.toLowerCase().includes(s)),
    )
  }, [coursesList, itemSearch])

  // Filtered Classes list for search
  const filteredClasses = useMemo(() => {
    if (!itemSearch.trim()) return classesList
    const s = itemSearch.toLowerCase()
    return classesList.filter(
      (cl) =>
        cl.name.toLowerCase().includes(s) ||
        String(cl.id).includes(s) ||
        (cl.courseName && cl.courseName.toLowerCase().includes(s)) ||
        (cl.teacherName && cl.teacherName.toLowerCase().includes(s)),
    )
  }, [classesList, itemSearch])

  // Toggle course selection
  const toggleCourse = (id: number) => {
    setCourseIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    )
  }

  // Toggle class selection
  const toggleClass = (id: number) => {
    setClassIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    )
  }

  // Form submission (Save as Draft or Create)
  const handleSubmit = useCallback(
    async (isDraft: boolean) => {
      setFormError(null)

      // Validation
      if (!code.trim()) {
        setFormError(
          t.vouchers.create.codeRequiredError ||
            "Vui lòng nhập hoặc tạo mã voucher.",
        )
        return
      }

      if (!title.trim()) {
        setFormError(
          t.vouchers.create.titleRequiredError || "Vui lòng nhập tên voucher.",
        )
        return
      }

      const numDiscountValue = Number(discountValue)
      if (!discountValue || isNaN(numDiscountValue) || numDiscountValue <= 0) {
        setFormError(
          t.vouchers.create.discountValueRequiredError ||
            "Vui lòng nhập giá trị giảm hợp lệ.",
        )
        return
      }

      if (discountType === "Percentage" && numDiscountValue > 100) {
        setFormError(
          t.vouchers.create.percentageLimitError ||
            "Mức giảm phần trăm không thể vượt quá 100%.",
        )
        return
      }

      if (!validFrom) {
        setFormError(
          t.vouchers.create.validFromRequiredError ||
            "Vui lòng chọn ngày bắt đầu hiệu lực.",
        )
        return
      }

      if (!isNeverExpired && !validTo) {
        setFormError(
          t.vouchers.create.validToRequiredError ||
            "Vui lòng chọn ngày kết thúc hiệu lực.",
        )
        return
      }

      if (!isNeverExpired && validTo && new Date(validTo) <= new Date(validFrom)) {
        setFormError(
          t.vouchers.create.dateRangeInvalidError ||
            "Ngày kết thúc phải lớn hơn ngày bắt đầu.",
        )
        return
      }

      if (scopeType === "SpecificCourses" && courseIds.length === 0) {
        setFormError(
          t.vouchers.create.selectCourseRequiredError ||
            "Vui lòng chọn ít nhất 1 khóa học.",
        )
        return
      }

      if (scopeType === "SpecificClasses" && classIds.length === 0) {
        setFormError(
          t.vouchers.create.selectClassRequiredError ||
            "Vui lòng chọn ít nhất 1 lớp học.",
        )
        return
      }

      // Prepare payload
      const payload: CreateVoucherRequest = {
        isDraft,
        code: code.trim().toUpperCase(),
        title: title.trim(),
        description: description.trim() || null,
        discountType: discountType === "Percentage" ? 1 : 2,
        discountValue: numDiscountValue,
        maxDiscountAmount:
          maxDiscountAmount && !isNaN(Number(maxDiscountAmount))
            ? Number(maxDiscountAmount)
            : null,
        minOrderAmount:
          minOrderAmount && !isNaN(Number(minOrderAmount))
            ? Number(minOrderAmount)
            : 0,
        minLearners: minLearners && !isNaN(Number(minLearners)) ? Number(minLearners) : 1,
        validFrom: new Date(`${validFrom}T00:00:00Z`).toISOString(),
        validTo:
          !isNeverExpired && validTo
            ? new Date(`${validTo}T23:59:59Z`).toISOString()
            : null,
        isNeverExpired,
        sponsorType: sponsorType === "CatSpeak" ? 1 : 2,
        scopeType:
          scopeType === "All" ? 1 : scopeType === "SpecificCourses" ? 2 : 3,
        isOnlyNewUser,
        isNotCombineOther,
        isUnlimitedUsage,
        totalUsageLimit:
          !isUnlimitedUsage && totalUsageLimit && !isNaN(Number(totalUsageLimit))
            ? Number(totalUsageLimit)
            : null,
        perUserLimit:
          perUserLimit && !isNaN(Number(perUserLimit)) ? Number(perUserLimit) : 1,
        dailyLimit:
          dailyLimit && !isNaN(Number(dailyLimit)) ? Number(dailyLimit) : null,
        maxBudget:
          maxBudget && !isNaN(Number(maxBudget)) ? Number(maxBudget) : null,
        instructorIds: [],
        courseIds: scopeType === "SpecificCourses" ? courseIds : [],
        classIds: scopeType === "SpecificClasses" ? classIds : [],
      }

      try {
        setIsSubmitting(true)
        const result = await createVoucher(payload)
        setSuccessMessage(
          isDraft
            ? t.vouchers.create.saveDraftSuccess ||
                "Lưu bản nháp voucher thành công!"
            : t.vouchers.create.createSuccess || "Tạo voucher thành công!",
        )
        setTimeout(() => {
          if (result?.id) {
            navigate(`/voucher/${result.id}`)
          } else {
            navigate("/vouchers")
          }
        }, 1000)
      } catch (err: unknown) {
        console.error("Failed to submit voucher:", err)
        setFormError(
          getApiErrorMessage(
            err,
            t.vouchers.create.createGenericError ||
              "Không thể tạo voucher. Vui lòng kiểm tra lại thông tin.",
          ),
        )
      } finally {
        setIsSubmitting(false)
      }
    },
    [
      code,
      title,
      description,
      discountType,
      discountValue,
      maxDiscountAmount,
      minOrderAmount,
      minLearners,
      validFrom,
      validTo,
      isNeverExpired,
      sponsorType,
      scopeType,
      courseIds,
      classIds,
      isOnlyNewUser,
      isNotCombineOther,
      isUnlimitedUsage,
      totalUsageLimit,
      perUserLimit,
      dailyLimit,
      maxBudget,
      t.vouchers.create,
      navigate,
    ],
  )

  return (
    <div className="space-y-6 pb-16 animate-fade-in">
      {/* ── Breadcrumbs ── */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 font-medium">
        <Link to="/" className="hover:text-primary transition-colors">
          {t.nav.dashboard}
        </Link>
        <ChevronRight size={14} className="text-gray-400" />
        <Link to="/vouchers" className="hover:text-primary transition-colors">
          {t.vouchers.title}
        </Link>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="text-gray-900 font-semibold">
          {t.vouchers.create.breadcrumb}
        </span>
      </nav>

      {/* ── Top Header Banner ── */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 shadow-inner">
            <Ticket size={28} />
          </div>

          <div className="space-y-1">
            <h1 className="text-xl font-bold text-gray-900 leading-snug">
              {t.vouchers.create.title}
            </h1>
            <p className="text-xs text-gray-500 max-w-xl">
              {t.vouchers.create.desc}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/vouchers")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shrink-0 shadow-xs cursor-pointer"
        >
          <ArrowLeft size={16} /> {t.vouchers.create.cancel}
        </button>
      </div>

      {/* ── Alert Messages ── */}
      {formError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 text-red-800 text-xs leading-relaxed animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
          <div className="flex-1 font-medium">{formError}</div>
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 text-emerald-800 text-xs leading-relaxed animate-fade-in">
          <Check className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
          <div className="flex-1 font-medium">{successMessage}</div>
        </div>
      )}

      {/* ── Main Form (2 Columns) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ══════════ LEFT COLUMN (Col-span 2) ══════════ */}
        <div className="lg:col-span-2 space-y-6">
          {/* ── Section 1: Thông tin chung ── */}
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
                    <span>
                      {t.vouchers.create.generateRandom}
                    </span>
                  </button>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="block font-semibold text-gray-700">
                  {t.vouchers.create.voucherName} <span className="text-red-500">*</span>
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

              {/* Sponsor Type */}
              <div className="space-y-2 sm:col-span-2 pt-1">
                <label className="block font-semibold text-gray-700">
                  {t.vouchers.create.sponsorType}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    className="flex items-center gap-3 p-3 rounded-lg border border-blue-500 bg-blue-50/50 text-blue-900 shadow-xs cursor-not-allowed hover:cursor-not-allowed opacity-90 select-none"
                    title={t.vouchers.create.sponsorFixedTooltip}
                  >
                    <input
                      type="radio"
                      name="sponsorType"
                      value="CatSpeak"
                      checked={true}
                      disabled
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-not-allowed hover:cursor-not-allowed"
                    />
                    <div>
                      <p className="text-xs font-semibold text-blue-900">
                        {t.vouchers.sponsorTypes.catspeak}
                      </p>
                      <p className="text-[11px] text-gray-500 font-normal">
                        {t.vouchers.create.sponsorCatspeakDesc}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Section 2: Cấu hình giảm giá ── */}
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
                  {t.vouchers.create.discountType} <span className="text-red-500">*</span>
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
                    {t.vouchers.create.discountValue} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      required
                      min={1}
                      max={discountType === "Percentage" ? 100 : undefined}
                      placeholder={discountType === "Percentage" ? "20" : "50000"}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      className="w-full pl-3 pr-8 py-2 rounded-lg border border-gray-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                    <span className="absolute right-3 font-bold text-gray-500 text-xs pointer-events-none">
                      {discountType === "Percentage" ? "%" : "đ"}
                    </span>
                  </div>
                </div>

                {/* Max Discount Amount */}
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

          {/* ── Section 3: Điều kiện áp dụng ── */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <div className="p-2 rounded-xl bg-violet-50 text-violet-600">
                <ListTodo size={18} />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-base">
                  {t.vouchers.create.conditions}
                </h2>
                <p className="text-xs text-gray-500">
                  {t.vouchers.create.conditionsDesc}
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Scope Type Selector */}
              <div className="space-y-2">
                <label className="block font-semibold text-gray-700">
                  {t.vouchers.create.scopeType} <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label
                    className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer select-none transition-all ${
                      scopeType === "All"
                        ? "border-blue-500 bg-blue-50/50 text-blue-900 font-semibold shadow-xs"
                        : "border-gray-200 hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="scopeType"
                      value="All"
                      checked={scopeType === "All"}
                      onChange={() => setScopeType("All")}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs">{t.vouchers.create.scopeAll}</span>
                  </label>

                  <label
                    className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer select-none transition-all ${
                      scopeType === "SpecificCourses"
                        ? "border-blue-500 bg-blue-50/50 text-blue-900 font-semibold shadow-xs"
                        : "border-gray-200 hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="scopeType"
                      value="SpecificCourses"
                      checked={scopeType === "SpecificCourses"}
                      onChange={() => setScopeType("SpecificCourses")}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs">{t.vouchers.create.scopeCourses}</span>
                  </label>

                  <label
                    className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer select-none transition-all ${
                      scopeType === "SpecificClasses"
                        ? "border-blue-500 bg-blue-50/50 text-blue-900 font-semibold shadow-xs"
                        : "border-gray-200 hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="scopeType"
                      value="SpecificClasses"
                      checked={scopeType === "SpecificClasses"}
                      onChange={() => setScopeType("SpecificClasses")}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs">{t.vouchers.create.scopeClasses}</span>
                  </label>
                </div>
              </div>

              {/* Sub-selector: Specific Courses */}
              {scopeType === "SpecificCourses" && (
                <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200 space-y-3 animate-fade-in">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                    <div className="relative flex-1">
                      <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        placeholder={t.vouchers.create.searchCourses}
                        value={itemSearch}
                        onChange={(e) => setItemSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2 text-xs">
                      <span className="font-semibold text-blue-700">
                        {t.vouchers.create.selectedCount}: {courseIds.length}
                      </span>
                      {courseIds.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setCourseIds([])}
                          className="text-[11px] font-semibold text-red-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <X size={12} /> {t.vouchers.create.clearAll}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 divide-y divide-gray-100">
                    {loadingItems ? (
                      <div className="py-6 text-center text-gray-500 flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        {t.vouchers.create.loadingCourses}
                      </div>
                    ) : filteredCourses.length === 0 ? (
                      <div className="py-6 text-center text-gray-400 italic">
                        {t.vouchers.create.noCoursesFound}
                      </div>
                    ) : (
                      filteredCourses.map((c) => {
                        const isChecked = courseIds.includes(c.id)
                        return (
                          <label
                            key={c.id}
                            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer select-none transition-colors ${
                              isChecked
                                ? "bg-blue-50 text-blue-950"
                                : "hover:bg-white text-gray-800"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleCourse(c.id)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                            />
                            <div className="flex-1 truncate">
                              <span className="font-bold text-xs">{c.name}</span>
                              <span className="text-[11px] text-gray-400 ml-2">
                                (ID: {c.id} · {c.language || t.vouchers.create.languageDefault} · {c.classCount || 0} {t.vouchers.create.classesCountSuffix})
                              </span>
                            </div>
                          </label>
                        )
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Sub-selector: Specific Classes */}
              {scopeType === "SpecificClasses" && (
                <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200 space-y-3 animate-fade-in">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                    <div className="relative flex-1">
                      <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        placeholder={t.vouchers.create.searchClasses}
                        value={itemSearch}
                        onChange={(e) => setItemSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2 text-xs">
                      <span className="font-semibold text-blue-700">
                        {t.vouchers.create.selectedCount}: {classIds.length}
                      </span>
                      {classIds.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setClassIds([])}
                          className="text-[11px] font-semibold text-red-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <X size={12} /> {t.vouchers.create.clearAll}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 divide-y divide-gray-100">
                    {loadingItems ? (
                      <div className="py-6 text-center text-gray-500 flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        {t.vouchers.create.loadingClasses}
                      </div>
                    ) : filteredClasses.length === 0 ? (
                      <div className="py-6 text-center text-gray-400 italic">
                        {t.vouchers.create.noClassesFound}
                      </div>
                    ) : (
                      filteredClasses.map((cl) => {
                        const isChecked = classIds.includes(cl.id)
                        return (
                          <label
                            key={cl.id}
                            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer select-none transition-colors ${
                              isChecked
                                ? "bg-blue-50 text-blue-950"
                                : "hover:bg-white text-gray-800"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleClass(cl.id)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                            />
                            <div className="flex-1 truncate">
                              <span className="font-bold text-xs">{cl.name}</span>
                              <span className="text-[11px] text-gray-400 ml-2">
                                ({t.vouchers.create.codePrefix}: #{cl.id} · {cl.teacherName || t.vouchers.create.teacherDefault} · {cl.price ? `${cl.price.toLocaleString("vi-VN")} đ` : t.vouchers.create.freePrice})
                              </span>
                            </div>
                          </label>
                        )
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Checkboxes & MinLearners */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-100 items-center">
                <label className="flex items-center gap-2.5 cursor-pointer text-gray-700 select-none">
                  <input
                    type="checkbox"
                    checked={isOnlyNewUser}
                    onChange={(e) => setIsOnlyNewUser(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-xs font-medium select-none">
                    {t.vouchers.create.isOnlyNewUser}
                  </span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-gray-700 select-none">
                  <input
                    type="checkbox"
                    checked={isNotCombineOther}
                    onChange={(e) => setIsNotCombineOther(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-xs font-medium select-none">
                    {t.vouchers.create.isNotCombineOther}
                  </span>
                </label>

                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-gray-600">
                    {t.vouchers.create.minLearners}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={minLearners}
                    onChange={(e) => setMinLearners(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════ RIGHT COLUMN (Col-span 1) ══════════ */}
        <div className="lg:col-span-1 space-y-6">
          {/* ── Section 4: Thời gian hiệu lực ── */}
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
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              )}
            </div>
          </div>

          {/* ── Section 5: Giới hạn sử dụng ── */}
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
              <div className="space-y-1.5">
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
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Action Panel (Right-aligned) ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => navigate("/vouchers")}
          className="px-4 py-2 rounded-lg border border-gray-200 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          {t.vouchers.create.cancel}
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit(true)}
            className="px-5 py-2 rounded-lg border border-gray-200 bg-white text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {t.vouchers.create.savingDraft}
              </span>
            ) : (
              t.vouchers.create.saveDraft
            )}
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit(false)}
            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-primary text-white text-xs sm:text-sm font-semibold hover:bg-primary-dark disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting
              ? t.vouchers.create.creating
              : t.vouchers.create.createVoucher}
          </button>
        </div>
      </div>
    </div>
  )
}
