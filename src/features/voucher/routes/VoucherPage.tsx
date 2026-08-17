import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Ticket,
  CheckCircle2,
  Ban,
  FileEdit,
  Layers,
} from "lucide-react"
import { PageHeader } from "../../../components/ui/PageHeader"
import SummaryCard from "../../../components/ui/SummaryCard"
import Badge, { type BadgeType } from "../../../components/ui/Badge"
import Table from "../../../components/ui/table/Table"
import type { TableHeader } from "../../../components/ui/table/types"
import { getVoucherStats } from "../api/getVoucherStats"
import { getVouchers } from "../api/getVouchers"
import type {
  VoucherListItem,
  VoucherStats,
  GetVouchersParams,
} from "../types"
import { useLanguage } from "../../../stores/languageStore"
import { formatDateToDisplay } from "../../../lib/utils"
import ProgressBar from "../components/ProgressBar"

export default function VoucherPage() {
  const { t } = useLanguage()

  const [stats, setStats] = useState<VoucherStats | null>(null)
  const [statsLoading, setStatsLoading] = useState<boolean>(true)

  // Fetch KPI Stats
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true)
      const data = await getVoucherStats()
      setStats(data)
    } catch (error) {
      console.error("Failed to load voucher statistics:", error)
    } finally {
      setStatsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  // Table Data Fetcher with Server-side Pagination
  const fetcher = useCallback(async (page: number = 1, pageSize: number = 10) => {
    const res = await getVouchers({ page, pageSize })
    return {
      data: res.data,
      total: res.pagination?.total ?? res.data.length,
    }
  }, [])

  // Table Filters (Global Search & Single Choice Filters)
  const filter = useCallback(
    async (attribute: string, value: unknown) => {
      const params: GetVouchersParams = {}

      if (attribute === "global") {
        params.search = value ? String(value) : undefined
      } else if (attribute === "status" && value) {
        params.status = Array.isArray(value) ? String(value[0]) : String(value)
      } else if (attribute === "discountType" && value) {
        params.discountType = Array.isArray(value)
          ? String(value[0])
          : String(value)
      } else if (attribute === "sponsorType" && value) {
        params.sponsorType = Array.isArray(value)
          ? String(value[0])
          : String(value)
      }

      const res = await getVouchers(params)
      return {
        data: res.data,
        total: res.pagination?.total ?? res.data.length,
      }
    },
    [],
  )

  // Helper mapping for Status Badge
  const getStatusBadgeConfig = useCallback(
    (status: string): { type: BadgeType; label: string; showDot?: boolean } => {
      switch (status) {
        case "Active":
          return {
            type: "Green",
            label: t.vouchers.statuses.active,
            showDot: true,
          }
        case "Draft":
          return {
            type: "Gray",
            label: t.vouchers.statuses.draft,
          }
        case "PendingApproval":
          return {
            type: "Yellow",
            label: t.vouchers.statuses.pendingApproval,
            showDot: true,
          }
        case "PendingDeposit":
          return {
            type: "Orange",
            label: t.vouchers.statuses.pendingDeposit,
            showDot: true,
          }
        case "Disabled":
          return {
            type: "Gray",
            label: t.vouchers.statuses.disabled,
          }
        case "Expired":
          return {
            type: "Red",
            label: t.vouchers.statuses.expired,
          }
        case "Exhausted":
          return {
            type: "Purple",
            label: t.vouchers.statuses.exhausted,
          }
        case "Rejected":
          return {
            type: "Red",
            label: t.vouchers.statuses.rejected,
          }
        case "Stopped":
          return {
            type: "Gray",
            label: t.vouchers.statuses.stopped,
          }
        default:
          return {
            type: "Gray",
            label: status,
          }
      }
    },
    [t.vouchers.statuses],
  )

  // Table Columns Definition
  const headers: TableHeader<VoucherListItem>[] = useMemo(
    () => [
      {
        name: t.vouchers.code,
        accessorKey: "code",
        render: (row) => (
          <span className="font-bold text-red-600 font-mono tracking-wide whitespace-nowrap">
            {row.code}
          </span>
        ),
      },
      {
        name: t.vouchers.name,
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
        name: t.vouchers.discountType,
        accessorKey: "discountType",
        showFilter: true,
        values: [
          {
            label: t.vouchers.discountTypes.percentage,
            value: "Percentage",
          },
          {
            label: t.vouchers.discountTypes.fixedAmount,
            value: "FixedAmount",
          },
        ],
        render: (row) => {
          const isPercentage = row.discountType === "Percentage"
          return (
            <Badge type={isPercentage ? "Blue" : "Purple"}>
              {isPercentage
                ? t.vouchers.discountTypes.percentage
                : t.vouchers.discountTypes.fixedAmount}
            </Badge>
          )
        },
      },
      {
        name: t.vouchers.discountValue,
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
                  {t.vouchers.maxDiscount}{" "}
                  {row.maxDiscountAmount.toLocaleString("vi-VN")} đ
                </div>
              )}
            </div>
          )
        },
      },
      {
        name: t.vouchers.deposit,
        accessorKey: "depositAmount",
        render: (row) => (
          <div className="space-y-0.5 whitespace-nowrap">
            <div className="font-medium text-gray-900">
              {row.depositAmount != null
                ? `${row.depositAmount.toLocaleString("vi-VN")} đ`
                : "—"}
            </div>
            {row.depositRequired != null && row.depositRequired > 0 && (
              <div className="text-xs text-gray-500 italic">
                / {row.depositRequired.toLocaleString("vi-VN")} đ
              </div>
            )}
          </div>
        ),
      },
      {
        name: t.vouchers.validity,
        accessorKey: "validFrom",
        render: (row) => (
          <div className="text-xs space-y-0.5 whitespace-nowrap">
            <div className="text-gray-700">
              <span className="text-gray-400 mr-1">{t.vouchers.from}:</span>
              <span className="font-medium">
                {formatDateToDisplay(row.validFrom) || "—"}
              </span>
            </div>
            <div className="text-gray-700">
              <span className="text-gray-400 mr-1">{t.vouchers.to}:</span>
              {row.isNeverExpired ? (
                <span className="text-emerald-600 font-medium">
                  {t.vouchers.neverExpired}
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
        name: t.vouchers.usage,
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
        name: t.vouchers.sponsorType,
        accessorKey: "sponsorType",
        showFilter: true,
        values: [
          {
            label: t.vouchers.sponsorTypes.catspeak,
            value: "CatSpeak",
          },
          {
            label: t.vouchers.sponsorTypes.instructor,
            value: "Instructor",
          },
        ],
        render: (row) => {
          const isCatSpeak = row.sponsorType === "CatSpeak"
          return (
            <Badge type={isCatSpeak ? "Red" : "Blue"}>
              {isCatSpeak
                ? t.vouchers.sponsorTypes.catspeak
                : t.vouchers.sponsorTypes.instructor}
            </Badge>
          )
        },
      },
      {
        name: t.vouchers.status,
        accessorKey: "status",
        showFilter: true,
        values: [
          { label: t.vouchers.statuses.active, value: "Active" },
          { label: t.vouchers.statuses.draft, value: "Draft" },
          {
            label: t.vouchers.statuses.pendingApproval,
            value: "PendingApproval",
          },
          {
            label: t.vouchers.statuses.pendingDeposit,
            value: "PendingDeposit",
          },
          { label: t.vouchers.statuses.disabled, value: "Disabled" },
          { label: t.vouchers.statuses.expired, value: "Expired" },
          { label: t.vouchers.statuses.exhausted, value: "Exhausted" },
          { label: t.vouchers.statuses.rejected, value: "Rejected" },
          { label: t.vouchers.statuses.stopped, value: "Stopped" },
        ],
        render: (row) => {
          const { type, label, showDot } = getStatusBadgeConfig(row.status)
          return (
            <Badge type={type} showDot={showDot}>
              {label}
            </Badge>
          )
        },
      },
    ],
    [t.vouchers, getStatusBadgeConfig],
  )

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <PageHeader
        icon={<Ticket />}
        title={t.vouchers.title}
        desc={t.vouchers.desc}
      />

      {/* ── 4 KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          icon={<Layers size={20} />}
          color="#2563EB"
          label={t.vouchers.total}
          value={stats?.total ?? 0}
          loading={statsLoading}
        />
        <SummaryCard
          icon={<CheckCircle2 size={20} />}
          color="#059669"
          label={t.vouchers.active}
          value={stats?.active ?? 0}
          loading={statsLoading}
        />
        <SummaryCard
          icon={<Ban size={20} />}
          color="#DC2626"
          label={t.vouchers.expiredAndDisabled}
          value={(stats?.disabled ?? 0) + (stats?.expired ?? 0)}
          subtitle={`${stats?.disabled ?? 0} ${t.vouchers.disabled.toLowerCase()} · ${stats?.expired ?? 0} ${t.vouchers.expired.toLowerCase()}`}
          loading={statsLoading}
        />
        <SummaryCard
          icon={<FileEdit size={20} />}
          color="#D97706"
          label={t.vouchers.draftOrPending}
          value={stats?.draft ?? 0}
          subtitle={`${stats?.pendingApproval ?? 0} ${t.vouchers.statuses.pendingApproval.toLowerCase()}`}
          loading={statsLoading}
        />
      </div>

      {/* ── Vouchers Table ── */}
      <Table<VoucherListItem>
        fetcher={fetcher}
        filter={filter}
        headers={headers}
        showGlobalSearch={true}
        defaultPageSize={10}
      />
    </div>
  )
}
