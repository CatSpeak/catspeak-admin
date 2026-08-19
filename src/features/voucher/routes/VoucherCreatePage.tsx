import { useCallback, useEffect, useState, useMemo, useRef } from "react"
import { useNavigate, useLocation, useParams, Link } from "react-router-dom"
import {
  Ticket,
  ArrowLeft,
  ChevronRight,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react"
import { generateVoucherCode } from "../api/generateVoucherCode"
import { createVoucher } from "../api/createVoucher"
import { updateVoucher } from "../api/updateVoucher"
import { getVoucherDetail } from "../api/getVoucherDetail"
import { getCourses, getClasses } from "../../classes/api/classApi"
import type { AdminCourse, AdminClass } from "../../classes/types"
import type {
  CreateVoucherRequest,
  VoucherDetailDto,
  VoucherListItem,
} from "../types"
import { useLanguage } from "../../../stores/languageStore"
import { getApiErrorMessage } from "../../../lib/axios"
import {
  GeneralInfoSection,
  DiscountConfigSection,
  ConditionsSection,
  ValidityPeriodSection,
  UsageLimitsSection,
} from "../components/create"

export default function VoucherCreatePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id: paramId } = useParams<{ id?: string }>()
  const { t } = useLanguage()
  const topRef = useRef<HTMLDivElement>(null)

  // Voucher passed via location.state (e.g. from table action "Sửa")
  const stateVoucher =
    (
      location.state as {
        voucher?: VoucherListItem | VoucherDetailDto
        editVoucher?: VoucherListItem | VoucherDetailDto
        editId?: number | string
      } | null
    )?.voucher ||
    (location.state as any)?.editVoucher ||
    null

  const editId = useMemo(() => {
    const rawStateId = (location.state as any)?.editId
    if (rawStateId && !isNaN(Number(rawStateId))) return Number(rawStateId)
    if (stateVoucher?.id && !isNaN(Number(stateVoucher.id)))
      return Number(stateVoucher.id)
    if (paramId && !isNaN(Number(paramId))) return Number(paramId)
    return null
  }, [location.state, stateVoucher, paramId])

  const isEditMode = Boolean(editId && editId > 0)

  // Validity Period default
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], [])

  // Form States initialized with stateVoucher fallback if present
  const [code, setCode] = useState<string>(() => stateVoucher?.code || "")
  const [title, setTitle] = useState<string>(() => stateVoucher?.title || "")
  const [description, setDescription] = useState<string>(
    () => stateVoucher?.description || "",
  )
  const sponsorType = "CatSpeak" as const

  // Discount Configuration
  const [discountType, setDiscountType] = useState<
    "Percentage" | "FixedAmount"
  >(() =>
    stateVoucher?.discountType === "FixedAmount" ||
    stateVoucher?.discountType === 2
      ? "FixedAmount"
      : "Percentage",
  )
  const [discountValue, setDiscountValue] = useState<string>(() =>
    stateVoucher?.discountValue !== undefined &&
    stateVoucher?.discountValue !== null
      ? String(stateVoucher.discountValue)
      : "",
  )
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<string>(() =>
    stateVoucher?.maxDiscountAmount !== undefined &&
    stateVoucher?.maxDiscountAmount !== null
      ? String(stateVoucher.maxDiscountAmount)
      : "",
  )
  const [minOrderAmount, setMinOrderAmount] = useState<string>(() =>
    stateVoucher?.minOrderAmount !== undefined &&
    stateVoucher?.minOrderAmount !== null
      ? String(stateVoucher.minOrderAmount)
      : "",
  )

  // Application Conditions
  const [scopeType, setScopeType] = useState<
    "All" | "SpecificCourses" | "SpecificClasses"
  >(() => {
    if (
      stateVoucher?.scopeType === "SpecificCourses" ||
      stateVoucher?.scopeType === 2
    )
      return "SpecificCourses"
    if (
      stateVoucher?.scopeType === "SpecificClasses" ||
      stateVoucher?.scopeType === 3
    )
      return "SpecificClasses"
    return "All"
  })
  const [courseIds, setCourseIds] = useState<number[]>(() => {
    if (
      (stateVoucher as any)?.courses &&
      Array.isArray((stateVoucher as any).courses)
    ) {
      return (stateVoucher as any).courses.map((c: any) => c.id)
    }
    if (
      (stateVoucher as any)?.courseIds &&
      Array.isArray((stateVoucher as any).courseIds)
    ) {
      return (stateVoucher as any).courseIds
    }
    return []
  })
  const [classIds, setClassIds] = useState<number[]>(() => {
    if (
      (stateVoucher as any)?.classes &&
      Array.isArray((stateVoucher as any).classes)
    ) {
      return (stateVoucher as any).classes.map((cl: any) => cl.id)
    }
    if (
      (stateVoucher as any)?.classIds &&
      Array.isArray((stateVoucher as any).classIds)
    ) {
      return (stateVoucher as any).classIds
    }
    return []
  })
  const [isOnlyNewUser, setIsOnlyNewUser] = useState<boolean>(() =>
    (stateVoucher as any)?.isOnlyNewUser !== undefined
      ? Boolean((stateVoucher as any).isOnlyNewUser)
      : false,
  )
  const [isNotCombineOther, setIsNotCombineOther] = useState<boolean>(() =>
    (stateVoucher as any)?.isNotCombineOther !== undefined
      ? Boolean((stateVoucher as any).isNotCombineOther)
      : true,
  )
  const [minLearners, setMinLearners] = useState<number>(() =>
    (stateVoucher as any)?.minLearners !== undefined &&
    (stateVoucher as any)?.minLearners !== null
      ? Number((stateVoucher as any).minLearners)
      : 1,
  )

  // Validity Period
  const [validFrom, setValidFrom] = useState<string>(() => {
    if (stateVoucher?.validFrom) {
      try {
        return stateVoucher.validFrom.split("T")[0]
      } catch {
        return todayStr
      }
    }
    return todayStr
  })
  const [validTo, setValidTo] = useState<string>(() => {
    if (stateVoucher?.validTo) {
      try {
        return stateVoucher.validTo.split("T")[0]
      } catch {
        return ""
      }
    }
    return ""
  })
  const [isNeverExpired, setIsNeverExpired] = useState<boolean>(() =>
    stateVoucher?.isNeverExpired !== undefined
      ? Boolean(stateVoucher.isNeverExpired)
      : false,
  )

  // Usage Limits
  const [isUnlimitedUsage, setIsUnlimitedUsage] = useState<boolean>(() =>
    stateVoucher?.isUnlimitedUsage !== undefined
      ? Boolean(stateVoucher.isUnlimitedUsage)
      : false,
  )
  const [totalUsageLimit, setTotalUsageLimit] = useState<string>(() =>
    stateVoucher?.totalUsageLimit !== undefined &&
    stateVoucher?.totalUsageLimit !== null
      ? String(stateVoucher.totalUsageLimit)
      : "",
  )
  const [perUserLimit, setPerUserLimit] = useState<string>(() =>
    (stateVoucher as any)?.perUserLimit !== undefined &&
    (stateVoucher as any)?.perUserLimit !== null
      ? String((stateVoucher as any).perUserLimit)
      : "",
  )
  const [dailyLimit, setDailyLimit] = useState<string>(() =>
    (stateVoucher as any)?.dailyLimit !== undefined &&
    (stateVoucher as any)?.dailyLimit !== null
      ? String((stateVoucher as any).dailyLimit)
      : "",
  )
  // const [maxBudget, setMaxBudget] = useState<string>(() =>
  //   stateVoucher?.maxBudget !== undefined && stateVoucher?.maxBudget !== null
  //     ? String(stateVoucher.maxBudget)
  //     : "",
  // )

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

  // Scroll to top helper
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" })
    document.documentElement.scrollTo({ top: 0, left: 0, behavior: "smooth" })
    document.body.scrollTo({ top: 0, left: 0, behavior: "smooth" })
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])

  // Automatically scroll to top whenever an error is displayed
  useEffect(() => {
    if (formError) {
      scrollToTop()
    }
  }, [formError, scrollToTop])

  // Validation memo for Discount Value (real-time FE check)
  const discountValueError = useMemo(() => {
    if (!discountValue || !discountValue.trim()) return null
    const num = Number(discountValue)
    if (isNaN(num)) return "Vui lòng nhập giá trị giảm hợp lệ."
    if (discountType === "Percentage") {
      if (num < 0 || num > 100) {
        return "Giá trị giảm (phần trăm) phải từ 0 đến 100."
      }
    } else {
      if (num <= 0) {
        return "Giá trị giảm phải lớn hơn 0."
      }
    }
    return null
  }, [discountValue, discountType])

  // Validation memo for Date Range (real-time FE check: validTo must not be before validFrom)
  const dateRangeError = useMemo(() => {
    if (isNeverExpired || !validFrom || !validTo) return null
    if (validTo < validFrom) {
      return "Ngày kết thúc không được nhỏ hơn ngày bắt đầu."
    }
    return null
  }, [isNeverExpired, validFrom, validTo])

  // Helper to populate form fields from a voucher object
  const applyVoucherData = useCallback(
    (v: Partial<VoucherDetailDto & VoucherListItem>) => {
      if (!v) return

      if (v.code) setCode(v.code)
      if (v.title) setTitle(v.title)
      if (v.description !== undefined && v.description !== null)
        setDescription(v.description)

      if (v.discountType === "FixedAmount" || (v.discountType as any) === 2) {
        setDiscountType("FixedAmount")
      } else {
        setDiscountType("Percentage")
      }

      if (v.discountValue !== undefined && v.discountValue !== null) {
        setDiscountValue(String(v.discountValue))
      }
      if (v.maxDiscountAmount !== undefined && v.maxDiscountAmount !== null) {
        setMaxDiscountAmount(String(v.maxDiscountAmount))
      } else if (v.maxDiscountAmount === null) {
        setMaxDiscountAmount("")
      }

      if (v.minOrderAmount !== undefined && v.minOrderAmount !== null) {
        setMinOrderAmount(String(v.minOrderAmount))
      } else if (v.minOrderAmount === null) {
        setMinOrderAmount("")
      }

      if (v.minLearners !== undefined && v.minLearners !== null) {
        setMinLearners(Number(v.minLearners))
      }

      if (v.scopeType === "SpecificCourses" || (v.scopeType as any) === 2) {
        setScopeType("SpecificCourses")
      } else if (
        v.scopeType === "SpecificClasses" ||
        (v.scopeType as any) === 3
      ) {
        setScopeType("SpecificClasses")
      } else {
        setScopeType("All")
      }

      if (v.courses && Array.isArray(v.courses)) {
        setCourseIds(v.courses.map((c) => c.id))
      } else if ((v as any).courseIds && Array.isArray((v as any).courseIds)) {
        setCourseIds((v as any).courseIds)
      }

      if (v.classes && Array.isArray(v.classes)) {
        setClassIds(v.classes.map((cl) => cl.id))
      } else if ((v as any).classIds && Array.isArray((v as any).classIds)) {
        setClassIds((v as any).classIds)
      }

      if (v.isOnlyNewUser !== undefined) {
        setIsOnlyNewUser(Boolean(v.isOnlyNewUser))
      }
      if (v.isNotCombineOther !== undefined) {
        setIsNotCombineOther(Boolean(v.isNotCombineOther))
      }

      if (v.validFrom) {
        try {
          setValidFrom(v.validFrom.split("T")[0])
        } catch {
          // ignore
        }
      }
      if (v.validTo) {
        try {
          setValidTo(v.validTo.split("T")[0])
        } catch {
          // ignore
        }
      } else if (v.validTo === null) {
        setValidTo("")
      }
      if (v.isNeverExpired !== undefined) {
        setIsNeverExpired(Boolean(v.isNeverExpired))
      }

      if (v.isUnlimitedUsage !== undefined) {
        setIsUnlimitedUsage(Boolean(v.isUnlimitedUsage))
      }
      if (v.totalUsageLimit !== undefined && v.totalUsageLimit !== null) {
        setTotalUsageLimit(String(v.totalUsageLimit))
      } else if (v.totalUsageLimit === null) {
        setTotalUsageLimit("")
      }

      if (v.perUserLimit !== undefined && v.perUserLimit !== null) {
        setPerUserLimit(String(v.perUserLimit))
      }
      if (v.dailyLimit !== undefined && v.dailyLimit !== null) {
        setDailyLimit(String(v.dailyLimit))
      } else if (v.dailyLimit === null) {
        setDailyLimit("")
      }
      // if (v.maxBudget !== undefined && v.maxBudget !== null) {
      //   setMaxBudget(String(v.maxBudget))
      // } else if (v.maxBudget === null) {
      //   setMaxBudget("")
      // }
    },
    [],
  )

  // Fetch full details if editId exists to ensure relations (courses/classes, minLearners...) are fully populated
  useEffect(() => {
    if (editId) {
      let isMounted = true
      const fetchDetail = async () => {
        try {
          const detail = await getVoucherDetail(editId)
          if (detail && isMounted) {
            applyVoucherData(detail)
          }
        } catch (err) {
          console.error("Failed to load voucher detail for edit:", err)
        }
      }
      fetchDetail()
      return () => {
        isMounted = false
      }
    }
  }, [editId, applyVoucherData])

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
      if (
        !discountValue ||
        discountValue.trim() === "" ||
        isNaN(numDiscountValue)
      ) {
        setFormError(
          t.vouchers.create.discountValueRequiredError ||
            "Vui lòng nhập giá trị giảm hợp lệ.",
        )
        return
      }

      if (discountType === "Percentage") {
        if (numDiscountValue < 0 || numDiscountValue > 100) {
          setFormError(
            t.vouchers.create.percentageLimitError ||
              "Giá trị giảm (nếu loại giảm là Phần trăm) phải từ 0 đến 100.",
          )
          return
        }
      } else {
        if (numDiscountValue <= 0) {
          setFormError(
            t.vouchers.create.discountValueRequiredError ||
              "Giá trị giảm phải lớn hơn 0.",
          )
          return
        }
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

      if (!isNeverExpired && validTo && validFrom && validTo < validFrom) {
        setFormError(
          t.vouchers.create.dateRangeInvalidError ||
            "Ngày kết thúc không được nhỏ hơn ngày bắt đầu.",
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
        minLearners:
          minLearners && !isNaN(Number(minLearners)) ? Number(minLearners) : 1,
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
          !isUnlimitedUsage &&
          totalUsageLimit &&
          !isNaN(Number(totalUsageLimit))
            ? Number(totalUsageLimit)
            : null,
        perUserLimit:
          perUserLimit && !isNaN(Number(perUserLimit))
            ? Number(perUserLimit)
            : 1,
        dailyLimit:
          dailyLimit && !isNaN(Number(dailyLimit)) ? Number(dailyLimit) : null,
        // maxBudget:
        //   maxBudget && !isNaN(Number(maxBudget)) ? Number(maxBudget) : null,
        instructorIds: [],
        courseIds: scopeType === "SpecificCourses" ? courseIds : [],
        classIds: scopeType === "SpecificClasses" ? classIds : [],
      }

      try {
        setIsSubmitting(true)
        let result: any
        if (isEditMode && editId) {
          result = await updateVoucher(editId, payload)
          setSuccessMessage(
            isDraft
              ? t.vouchers.create.saveDraftSuccess ||
                  "Lưu bản nháp voucher thành công!"
              : t.vouchers.create.updateSuccess ||
                  "Cập nhật voucher thành công!",
          )
        } else {
          result = await createVoucher(payload)
          setSuccessMessage(
            isDraft
              ? t.vouchers.create.saveDraftSuccess ||
                  "Lưu bản nháp voucher thành công!"
              : t.vouchers.create.createSuccess || "Tạo voucher thành công!",
          )
        }
        setTimeout(() => {
          if (result?.id) {
            navigate(`/voucher/${result.id}`)
          } else if (editId) {
            navigate(`/voucher/${editId}`)
          } else {
            navigate("/vouchers")
          }
        }, 1000)
      } catch (err: unknown) {
        console.error("Failed to submit voucher:", err)
        setFormError(
          getApiErrorMessage(
            err,
            isEditMode
              ? t.vouchers.create.updateGenericError ||
                  "Không thể cập nhật voucher. Vui lòng kiểm tra lại thông tin."
              : t.vouchers.create.createGenericError ||
                  "Không thể tạo voucher. Vui lòng kiểm tra lại thông tin.",
          ),
        )
      } finally {
        setIsSubmitting(false)
      }
    },
    [
      isEditMode,
      editId,
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
      // maxBudget,
      t.vouchers.create,
      navigate,
    ],
  )

  return (
    <div ref={topRef} className="space-y-6 animate-fade-in">
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
          {isEditMode
            ? t.vouchers.create.editBreadcrumb || "Chỉnh sửa voucher"
            : t.vouchers.create.breadcrumb}
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
              {isEditMode
                ? t.vouchers.create.editTitle || "Chỉnh sửa voucher"
                : t.vouchers.create.title}
            </h1>
            <p className="text-xs text-gray-500 max-w-xl">
              {isEditMode
                ? t.vouchers.create.editDesc ||
                  "Cập nhật thông tin, cấu hình mức giảm và điều kiện áp dụng cho mã ưu đãi."
                : t.vouchers.create.desc}
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
          <GeneralInfoSection
            code={code}
            setCode={setCode}
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            isGeneratingCode={isGeneratingCode}
            handleGenerateCode={handleGenerateCode}
          />

          {/* ── Section 2: Cấu hình giảm giá ── */}
          <DiscountConfigSection
            discountType={discountType}
            setDiscountType={setDiscountType}
            discountValue={discountValue}
            setDiscountValue={setDiscountValue}
            discountValueError={discountValueError}
            maxDiscountAmount={maxDiscountAmount}
            setMaxDiscountAmount={setMaxDiscountAmount}
            minOrderAmount={minOrderAmount}
            setMinOrderAmount={setMinOrderAmount}
          />

          {/* ── Section 3: Điều kiện áp dụng ── */}
          <ConditionsSection
            scopeType={scopeType}
            setScopeType={setScopeType}
            courseIds={courseIds}
            setCourseIds={setCourseIds}
            toggleCourse={toggleCourse}
            classIds={classIds}
            setClassIds={setClassIds}
            toggleClass={toggleClass}
            isOnlyNewUser={isOnlyNewUser}
            setIsOnlyNewUser={setIsOnlyNewUser}
            isNotCombineOther={isNotCombineOther}
            setIsNotCombineOther={setIsNotCombineOther}
            minLearners={minLearners}
            setMinLearners={setMinLearners}
            itemSearch={itemSearch}
            setItemSearch={setItemSearch}
            loadingItems={loadingItems}
            filteredCourses={filteredCourses}
            filteredClasses={filteredClasses}
          />
        </div>

        {/* ══════════ RIGHT COLUMN (Col-span 1) ══════════ */}
        <div className="lg:col-span-1 space-y-6">
          {/* ── Section 4: Thời gian hiệu lực ── */}
          <ValidityPeriodSection
            validFrom={validFrom}
            setValidFrom={setValidFrom}
            validTo={validTo}
            setValidTo={setValidTo}
            isNeverExpired={isNeverExpired}
            setIsNeverExpired={setIsNeverExpired}
            todayStr={todayStr}
            dateRangeError={dateRangeError}
          />

          {/* ── Section 5: Giới hạn sử dụng ── */}
          <UsageLimitsSection
            isUnlimitedUsage={isUnlimitedUsage}
            setIsUnlimitedUsage={setIsUnlimitedUsage}
            totalUsageLimit={totalUsageLimit}
            setTotalUsageLimit={setTotalUsageLimit}
            perUserLimit={perUserLimit}
            setPerUserLimit={setPerUserLimit}
            dailyLimit={dailyLimit}
            setDailyLimit={setDailyLimit}
            // maxBudget={maxBudget}
            // setMaxBudget={setMaxBudget}
          />
        </div>
      </div>

      {/* ── Bottom Action Panel (Right-aligned) ── */}
      <div className="sticky bottom-0 z-20 bg-white py-4 flex flex-wrap items-center justify-between gap-3">
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
              ? isEditMode
                ? t.vouchers.create.updating || "Đang cập nhật..."
                : t.vouchers.create.creating
              : isEditMode
                ? t.vouchers.create.updateVoucher || "Cập nhật voucher"
                : t.vouchers.create.createVoucher}
          </button>
        </div>
      </div>
    </div>
  )
}
