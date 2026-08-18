import {
  type RefObject,
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
} from "react"
import { createPortal } from "react-dom"
import {
  EllipsisVertical,
  Eye,
  Edit,
  Trash2,
  Calendar,
  TrendingUp,
  ShieldCheck,
  XCircle,
  Ban,
  CheckCircle2,
} from "lucide-react"
import Badge, { type BadgeType } from "../../../../components/ui/Badge"
import type { TableHeader } from "../../../../components/ui/table/types"
import type { VoucherListItem } from "../../types"
import { formatDateToDisplay } from "../../../../lib/utils"
import ProgressBar from "../ProgressBar"

export interface VoucherActionItem {
  key: string
  label: string
  icon: React.ReactNode
  danger?: boolean
  onClick: () => void
}

export interface GetRowActionsParams {
  row: VoucherListItem
  navigate: (path: string) => void
  onOpenActivate: (row: VoucherListItem) => void
  onOpenDisable: (row: VoucherListItem) => void
  onOpenExtend: (row: VoucherListItem) => void
  onOpenIncreaseLimit: (row: VoucherListItem) => void
  onOpenDelete: (row: VoucherListItem) => void
  onOpenApproveDeposit: (row: VoucherListItem) => void
  onOpenReject: (row: VoucherListItem) => void
}

/**
 * Helper to get status badge type and label
 */
export const getStatusBadgeConfig = (
  status: string,
  statusesText: Record<string, string>,
): { type: BadgeType; label: string; showDot?: boolean } => {
  switch (status) {
    case "Active":
      return {
        type: "Green",
        label: statusesText.active || "Đang hoạt động",
        showDot: true,
      }
    case "Draft":
      return {
        type: "Orange",
        label: statusesText.draft || "Bản nháp",
      }
    case "PendingApproval":
      return {
        type: "Yellow",
        label: statusesText.pendingApproval || "Chờ duyệt",
        showDot: true,
      }
    case "PendingDeposit":
      return {
        type: "Orange",
        label: statusesText.pendingDeposit || "Chờ nạp cọc",
        showDot: true,
      }
    case "Disabled":
      return {
        type: "Gray",
        label: statusesText.disabled || "Đã vô hiệu hóa",
      }
    case "Expired":
      return {
        type: "Red",
        label: statusesText.expired || "Đã hết hạn",
      }
    case "Exhausted":
      return {
        type: "Purple",
        label: statusesText.exhausted || "Đã hết lượt",
      }
    case "Rejected":
      return {
        type: "Red",
        label: statusesText.rejected || "Bị từ chối",
      }
    case "Stopped":
      return {
        type: "Gray",
        label: statusesText.stopped || "Đã dừng",
      }
    default:
      return {
        type: "Gray",
        label: status,
      }
  }
}

/**
 * Compute row action list based on sponsorType & status
 */
export const getRowActions = ({
  row,
  navigate,
  onOpenActivate,
  onOpenDisable,
  onOpenExtend,
  onOpenIncreaseLimit,
  onOpenDelete,
  onOpenApproveDeposit,
  onOpenReject,
}: GetRowActionsParams): VoucherActionItem[] => {
  const isCatSpeak = row.sponsorType === "CatSpeak"

  if (isCatSpeak) {
    if (row.status === "Active") {
      const actions: VoucherActionItem[] = [
        {
          key: "view",
          label: "Xem chi tiết",
          icon: <Eye size={14} />,
          onClick: () => navigate(`/voucher/${row.id}`),
        },
        {
          key: "disable",
          label: "Vô hiệu hóa",
          icon: <Ban size={14} />,
          onClick: () => onOpenDisable(row),
        },
      ]

      if (!row.isNeverExpired) {
        actions.push({
          key: "extend",
          label: "Gia hạn",
          icon: <Calendar size={14} />,
          onClick: () => onOpenExtend(row),
        })
      }

      actions.push({
        key: "delete",
        label: "Xóa",
        icon: <Trash2 size={14} />,
        danger: true,
        onClick: () => onOpenDelete(row),
      })

      return actions
    }
    if (row.status === "Disabled") {
      return [
        {
          key: "view",
          label: "Xem chi tiết",
          icon: <Eye size={14} />,
          onClick: () => navigate(`/voucher/${row.id}`),
        },
        {
          key: "activate",
          label: "Kích hoạt",
          icon: <CheckCircle2 size={14} />,
          onClick: () => onOpenActivate(row),
        },
        {
          key: "delete",
          label: "Xóa",
          icon: <Trash2 size={14} />,
          danger: true,
          onClick: () => onOpenDelete(row),
        },
      ]
    }
    if (row.status === "Draft") {
      return [
        {
          key: "edit",
          label: "Sửa",
          icon: <Edit size={14} />,
          onClick: () => navigate(`/voucher/${row.id}`),
        },
        {
          key: "view",
          label: "Xem chi tiết",
          icon: <Eye size={14} />,
          onClick: () => navigate(`/voucher/${row.id}`),
        },
        {
          key: "activate",
          label: "Kích hoạt",
          icon: <CheckCircle2 size={14} />,
          onClick: () => onOpenActivate(row),
        },
        {
          key: "delete",
          label: "Xóa",
          icon: <Trash2 size={14} />,
          danger: true,
          onClick: () => onOpenDelete(row),
        },
      ]
    }
    if (row.status === "Expired") {
      const actions: VoucherActionItem[] = [
        {
          key: "view",
          label: "Xem chi tiết",
          icon: <Eye size={14} />,
          onClick: () => navigate(`/voucher/${row.id}`),
        },
      ]

      if (!row.isNeverExpired) {
        actions.push({
          key: "extend",
          label: "Gia hạn",
          icon: <Calendar size={14} />,
          onClick: () => onOpenExtend(row),
        })
      }

      actions.push({
        key: "delete",
        label: "Xóa",
        icon: <Trash2 size={14} />,
        danger: true,
        onClick: () => onOpenDelete(row),
      })

      return actions
    }
    if (row.status === "Exhausted") {
      return [
        {
          key: "view",
          label: "Xem chi tiết",
          icon: <Eye size={14} />,
          onClick: () => navigate(`/voucher/${row.id}`),
        },
        {
          key: "increase",
          label: "Tăng số lượt",
          icon: <TrendingUp size={14} />,
          onClick: () => onOpenIncreaseLimit(row),
        },
        {
          key: "delete",
          label: "Xóa",
          icon: <Trash2 size={14} />,
          danger: true,
          onClick: () => onOpenDelete(row),
        },
      ]
    }
    return [
      {
        key: "view",
        label: "Xem chi tiết",
        icon: <Eye size={14} />,
        onClick: () => navigate(`/voucher/${row.id}`),
      },
      {
        key: "delete",
        label: "Xóa",
        icon: <Trash2 size={14} />,
        danger: true,
        onClick: () => onOpenDelete(row),
      },
    ]
  }

  // Instructor Sponsor
  if (row.status === "PendingApproval" || row.status === "PendingDeposit") {
    return [
      {
        key: "view",
        label: "Xem chi tiết",
        icon: <Eye size={14} />,
        onClick: () => navigate(`/voucher/${row.id}`),
      },
      {
        key: "approve",
        label: "Xác nhận đã nhận cọc",
        icon: <ShieldCheck size={14} />,
        onClick: () => onOpenApproveDeposit(row),
      },
      {
        key: "reject",
        label: "Từ chối & Hủy",
        icon: <XCircle size={14} />,
        danger: true,
        onClick: () => onOpenReject(row),
      },
    ]
  }
  if (row.status === "Active") {
    return [
      {
        key: "view",
        label: "Xem chi tiết",
        icon: <Eye size={14} />,
        onClick: () => navigate(`/voucher/${row.id}`),
      },
      {
        key: "disable",
        label: "Vô hiệu hóa",
        icon: <Ban size={14} />,
        onClick: () => onOpenDisable(row),
      },
    ]
  }
  return [
    {
      key: "view",
      label: "Xem chi tiết",
      icon: <Eye size={14} />,
      onClick: () => navigate(`/voucher/${row.id}`),
    },
  ]
}

/**
 * Helper to get translated scope type label
 */
export const getScopeTypeLabel = (
  scopeType: string | number | undefined | null,
  scopeTypesText?: {
    all: string
    specificCourses: string
    specificClasses: string
  },
): string => {
  if (!scopeTypesText) {
    if (scopeType === "All" || scopeType === 1 || scopeType === "1")
      return "Tất cả"
    if (scopeType === "SpecificCourses" || scopeType === 2 || scopeType === "2")
      return "Khóa học cụ thể"
    if (scopeType === "SpecificClasses" || scopeType === 3 || scopeType === "3")
      return "Lớp học cụ thể"
    return String(scopeType || "—")
  }
  if (scopeType === "All" || scopeType === 1 || scopeType === "1") {
    return scopeTypesText.all
  }
  if (scopeType === "SpecificCourses" || scopeType === 2 || scopeType === "2") {
    return scopeTypesText.specificCourses
  }
  if (scopeType === "SpecificClasses" || scopeType === 3 || scopeType === "3") {
    return scopeTypesText.specificClasses
  }
  return String(scopeType || "—")
}

export interface GetVoucherTableHeadersOptions {
  vouchersText: {
    code: string
    name: string
    discountType: string
    discountValue: string
    deposit: string
    validity: string
    usage: string
    sponsorType: string
    status: string
    maxDiscount: string
    neverExpired: string
    from: string
    to: string
    discountTypes: {
      percentage: string
      fixedAmount: string
    }
    sponsorTypes: {
      catspeak: string
      instructor: string
    }
    scopeTypes?: {
      all: string
      specificCourses: string
      specificClasses: string
    }
    statuses: Record<string, string>
  }
  openDropdownId: number | null
  setOpenDropdownId: (id: number | null) => void
  dropdownRef?: RefObject<HTMLDivElement | null>
  getRowActions: (row: VoucherListItem) => VoucherActionItem[]
  getStatusBadgeConfig: (status: string) => {
    type: BadgeType
    label: string
    showDot?: boolean
  }
}

interface VoucherRowActionMenuProps {
  actions: VoucherActionItem[]
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
}

function VoucherRowActionMenu({
  actions,
  isOpen,
  onToggle,
  onClose,
}: VoucherRowActionMenuProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [stylePos, setStylePos] = useState<React.CSSProperties | null>(null)

  const calculatePosition = () => {
    if (!buttonRef.current) return null
    const rect = buttonRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const estimatedMenuHeight = 200
    const isTop =
      spaceBelow < estimatedMenuHeight && rect.top > estimatedMenuHeight

    const right = Math.max(8, window.innerWidth - rect.right)

    if (isTop) {
      return {
        position: "fixed" as const,
        bottom: `${window.innerHeight - rect.top + 4}px`,
        right: `${right}px`,
        zIndex: 9999,
      }
    }

    return {
      position: "fixed" as const,
      top: `${rect.bottom + 4}px`,
      right: `${right}px`,
      zIndex: 9999,
    }
  }

  useLayoutEffect(() => {
    if (isOpen) {
      setStylePos(calculatePosition())
    } else {
      setStylePos(null)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        onClose()
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    const handleScrollOrResize = (e: Event) => {
      if (menuRef.current && menuRef.current.contains(e.target as Node)) {
        return
      }
      onClose()
    }

    document.addEventListener("mousedown", handleMouseDown)
    document.addEventListener("keydown", handleKeyDown)
    window.addEventListener("resize", handleScrollOrResize)
    window.addEventListener("scroll", handleScrollOrResize, true)

    return () => {
      document.removeEventListener("mousedown", handleMouseDown)
      document.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("resize", handleScrollOrResize)
      window.removeEventListener("scroll", handleScrollOrResize, true)
    }
  }, [isOpen, onClose])

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isOpen) {
      setStylePos(calculatePosition())
    }
    onToggle()
  }

  return (
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none cursor-pointer"
        title="Tùy chọn thao tác"
      >
        <EllipsisVertical size={16} />
      </button>

      {isOpen &&
        stylePos &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={stylePos}
            className="min-w-[180px] w-max max-w-xs rounded-xl bg-white shadow-xl border border-gray-100 py-1.5 animate-[fadeIn_100ms_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            {actions.map((act) => (
              <button
                key={act.key}
                type="button"
                role="menuitem"
                onClick={() => {
                  onClose()
                  act.onClick()
                }}
                className={`w-full flex items-center justify-start text-left gap-2.5 px-3.5 py-2 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  act.danger
                    ? "text-red-600 hover:bg-red-50"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span className="shrink-0">{act.icon}</span>
                <span className="whitespace-nowrap text-left">{act.label}</span>
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  )
}

/**
 * Generate Voucher table headers configuration
 */
export const getVoucherTableHeaders = ({
  vouchersText,
  openDropdownId,
  setOpenDropdownId,
  getRowActions: computeRowActions,
  getStatusBadgeConfig: computeBadgeConfig,
}: GetVoucherTableHeadersOptions): TableHeader<VoucherListItem>[] => [
  {
    name: vouchersText.code,
    accessorKey: "code",
    render: (row) => (
      <span className="font-bold text-red-600 font-mono tracking-wide whitespace-nowrap">
        {row.code}
      </span>
    ),
  },
  {
    name: vouchersText.name,
    accessorKey: "title",
    render: (row) => (
      <div className="max-w-xs space-y-0.5">
        <p className="font-medium text-gray-900 leading-snug">{row.title}</p>
        {row.description ? (
          <p
            className="text-xs text-gray-500 italic truncate"
            title={row.description}
          >
            {row.description}
          </p>
        ) : (
          <p className="text-xs text-gray-400 italic">—</p>
        )}
      </div>
    ),
  },
  {
    name: vouchersText.discountType,
    accessorKey: "discountType",
    showFilter: true,
    values: [
      {
        label: vouchersText.discountTypes.percentage,
        value: "Percentage",
      },
      {
        label: vouchersText.discountTypes.fixedAmount,
        value: "FixedAmount",
      },
    ],
    render: (row) => {
      const isPercentage = row.discountType === "Percentage"
      return (
        <Badge type={isPercentage ? "Blue" : "Purple"}>
          {isPercentage
            ? vouchersText.discountTypes.percentage
            : vouchersText.discountTypes.fixedAmount}
        </Badge>
      )
    },
  },
  {
    name: vouchersText.discountValue,
    accessorKey: "discountValue",
    render: (row) => {
      const isPercentage = row.discountType === "Percentage"
      const displayValue = isPercentage
        ? `${row.discountValue}%`
        : `${row.discountValue.toLocaleString("vi-VN")} đ`

      return (
        <div className="space-y-0.5 whitespace-nowrap">
          <div className="font-medium text-gray-900">{displayValue}</div>
          {row.maxDiscountAmount != null && row.maxDiscountAmount > 0 && (
            <div className="text-xs text-gray-500 italic">
              {vouchersText.maxDiscount}{" "}
              {row.maxDiscountAmount.toLocaleString("vi-VN")} đ
            </div>
          )}
        </div>
      )
    },
  },
  {
    name: vouchersText.validity,
    accessorKey: "validFrom",
    render: (row) => (
      <div className="text-xs space-y-0.5 whitespace-nowrap">
        <div className="text-gray-700">
          <span className="text-gray-400 mr-1">{vouchersText.from}:</span>
          <span className="font-medium">
            {formatDateToDisplay(row.validFrom) || "—"}
          </span>
        </div>
        <div className="text-gray-700">
          <span className="text-gray-400 mr-1">{vouchersText.to}:</span>
          {row.isNeverExpired ? (
            <span className="text-emerald-600 font-medium">
              {vouchersText.neverExpired}
            </span>
          ) : (
            <span className="font-medium">
              {formatDateToDisplay(row.validTo) || "—"}
            </span>
          )}
        </div>
      </div>
    ),
  },
  {
    name: vouchersText.usage,
    accessorKey: "usedCount",
    render: (row) => (
      <ProgressBar
        usedCount={row.usedCount}
        totalUsageLimit={row.totalUsageLimit}
        isUnlimitedUsage={row.isUnlimitedUsage}
      />
    ),
  },
  {
    name: vouchersText.sponsorType,
    accessorKey: "sponsorType",
    showFilter: true,
    values: [
      {
        label: vouchersText.sponsorTypes.catspeak,
        value: "CatSpeak",
      },
      {
        label: vouchersText.sponsorTypes.instructor,
        value: "Instructor",
      },
    ],
    render: (row) => {
      const isCatSpeak = row.sponsorType === "CatSpeak"
      return (
        <Badge type={isCatSpeak ? "Red" : "Blue"}>
          {isCatSpeak
            ? vouchersText.sponsorTypes.catspeak
            : vouchersText.sponsorTypes.instructor}
        </Badge>
      )
    },
  },
  {
    name: vouchersText.status,
    accessorKey: "status",
    showFilter: true,
    values: [
      { label: vouchersText.statuses.active, value: "Active" },
      { label: vouchersText.statuses.draft, value: "Draft" },
      {
        label: vouchersText.statuses.pendingApproval,
        value: "PendingApproval",
      },
      {
        label: vouchersText.statuses.pendingDeposit,
        value: "PendingDeposit",
      },
      { label: vouchersText.statuses.disabled, value: "Disabled" },
      { label: vouchersText.statuses.expired, value: "Expired" },
      { label: vouchersText.statuses.exhausted, value: "Exhausted" },
      { label: vouchersText.statuses.rejected, value: "Rejected" },
      { label: vouchersText.statuses.stopped, value: "Stopped" },
    ],
    render: (row) => {
      const { type, label, showDot } = computeBadgeConfig(row.status)
      return (
        <Badge type={type} showDot={showDot}>
          {label}
        </Badge>
      )
    },
  },
  {
    name: "",
    id: "actions",
    width: 48,
    render: (row) => {
      const actions = computeRowActions(row)
      return (
        <VoucherRowActionMenu
          actions={actions}
          isOpen={openDropdownId === row.id}
          onToggle={() =>
            setOpenDropdownId(openDropdownId === row.id ? null : row.id)
          }
          onClose={() => setOpenDropdownId(null)}
        />
      )
    },
  },
]
