import { useState, useMemo, useCallback } from "react"
import {
  FileText,
  RefreshCcw,
  CheckCircle,
  Ban,
  DollarSign,
} from "lucide-react"
import {
  getPayments,
  type Payment,
  type GetPaymentsParams,
  type PaymentSummary,
} from "../api/paymentsApi"
import { PageHeader } from "../../../components/ui/PageHeader"
import Table from "../../../components/ui/table/Table"
import {
  formatAmount,
  formatDateTime,
  formatDateToUtcStartOfDay,
  formatDateToUtcEndOfDay,
} from "../../../lib/utils"
import Badge from "../../../components/ui/Badge"
import { useLanguage } from "../../../stores/languageStore"
import PaymentDetailModal from "../components/PaymentDetailModal"

export default function PaymentsPage() {
  const { t } = useLanguage()

  // State
  const [, setPayments] = useState<Payment[]>([])
  const [statusFilter] = useState<number | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [summary, setSummary] = useState<PaymentSummary>({})

  // Compute metrics directly from additionalData summary
  const metrics = useMemo(() => {
    return {
      total: summary.total ?? 0,
      refunded: summary.refunded ?? 0,
      success: summary.success ?? 0,
      failed: summary.failed ?? 0,
    }
  }, [summary])

  const fetcher = useCallback(
    async (page?: number, pageSize?: number) => {
      const params: GetPaymentsParams = {
        page,
        pageSize,
        status: statusFilter !== null ? statusFilter : undefined,
      }
      const res = await getPayments(params)
      setPayments(res.data)
      if (res.summary) {
        setSummary(res.summary)
      }
      return {
        data: res.data,
        total: res.total,
      }
    },
    [statusFilter],
  )

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Breadcrumb Navigation */}
      <PageHeader
        icon={<DollarSign />}
        title={t.reports.transactionManagementTitle}
        desc={t.reports.paymentReportsDesc}
      />

      {/* Summary Metrics Cards */}
            {/* Summary Metrics Cards (Mobile: 2x2 | Desktop: 4x1) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Card */}
        <div className="bg-white border border-gray-200 p-3.5 sm:p-5 rounded-2xl shadow-sm flex items-center gap-3 sm:gap-4 transition-all hover:shadow-md">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider block truncate">
              {t.reports.totalPayments}
            </span>
            <span className="text-xl sm:text-2xl font-bold text-gray-900 block mt-0.5">
              {metrics.total}
            </span>
          </div>
        </div>

        {/* Refunded Card */}
        <div className="bg-white border border-gray-200 p-3.5 sm:p-5 rounded-2xl shadow-sm flex items-center gap-3 sm:gap-4 transition-all hover:shadow-md">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <RefreshCcw className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider block truncate">
              {t.reports.statusRefunded}
            </span>
            <span className="text-xl sm:text-2xl font-bold text-blue-700 block mt-0.5">
              {metrics.refunded}
            </span>
          </div>
        </div>

        {/* Success Card */}
        <div className="bg-white border border-gray-200 p-3.5 sm:p-5 rounded-2xl shadow-sm flex items-center gap-3 sm:gap-4 transition-all hover:shadow-md">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-success-50 text-success-600 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider block truncate">
              {t.reports.statusSuccess}
            </span>
            <span className="text-xl sm:text-2xl font-bold text-success-700 block mt-0.5">
              {metrics.success}
            </span>
          </div>
        </div>

        {/* Failed Card */}
        <div className="bg-white border border-gray-200 p-3.5 sm:p-5 rounded-2xl shadow-sm flex items-center gap-3 sm:gap-4 transition-all hover:shadow-md">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-error-50 text-error-600 flex items-center justify-center shrink-0">
            <Ban className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider block truncate">
              {t.reports.statusFailed}
            </span>
            <span className="text-xl sm:text-2xl font-bold text-error-700 block mt-0.5">
              {metrics.failed}
            </span>
          </div>
        </div>
      </div>

      {/* Table Element */}
      <Table<Payment>
        key={statusFilter ?? "all"}
        fetcher={fetcher}
        onClickRow={(payment) => {
          setSelectedPayment(payment)
          setIsModalOpen(true)
        }}
        sorter={async (attribute, sortOrder) => {
          let sortBy: string = "createDate"
          if (attribute === "amount") sortBy = "amount"
          else if (attribute === "status") sortBy = "status"
          else sortBy = "createDate"

          const res = await getPayments({
            status: statusFilter !== null ? statusFilter : undefined,
            sortBy,
            sortOrder: sortOrder === "asc" ? "Asc" : "Desc",
          })
          setPayments(res.data)
          if (res.summary) setSummary(res.summary)
          return {
            data: res.data,
            total: res.total,
          }
        }}
        filter={async (attribute, value, toDate) => {
          const params: GetPaymentsParams = {}
          if (attribute === "global") {
            params.search = value ? String(value) : undefined
          } else if (attribute === "paymentType") {
            params.paymentType = value ? String(value) : undefined
          } else if (
            attribute === "createDate" ||
            attribute === "fromDate"
          ) {
            const from =
              typeof value === "string"
                ? value
                : Array.isArray(value)
                  ? value[0]
                  : undefined
            const to = toDate || (Array.isArray(value) ? value[1] : undefined)
            params.fromDate = formatDateToUtcStartOfDay(from)
            params.toDate = formatDateToUtcEndOfDay(to)
          } else if (
            attribute === "status" &&
            value !== undefined &&
            value !== null
          ) {
            const arr = Array.isArray(value) ? value : [value]
            params.status = Number(arr[0])
          }
          const res = await getPayments(params)
          setPayments(res.data)
          if (res.summary) setSummary(res.summary)
          return {
            data: res.data,
            total: res.total,
          }
        }}
        headers={[
          {
            name: t.reports.transactionId,
            accessorKey: "paymentId",
          },
          {
            name: t.reports.transactionType,
            accessorKey: "paymentType",
            showFilter: true,
            values: ["Subscription", "ClassOpeningFee", "ClassEnrollment"],
            valueLabels: [
              t.reports.typeSubscription,
              t.reports.typeClassOpeningFee,
              t.reports.typeClassEnrollment,
            ],
            render: (p) => {
              const type = p.paymentType || "Subscription"
              if (type === "Subscription")
                return <Badge title={t.reports.typeSubscription} type="Orange" />
              if (type === "ClassOpeningFee")
                return <Badge title={t.reports.typeClassOpeningFee} type="Red" />
              if (type === "ClassEnrollment")
                return <Badge title={t.reports.typeClassEnrollment} type="Purple" />
              return <Badge title={type} type="Gray" />
            },
          },
          {
            name: t.reports.paymentUser,
            accessorKey: "username",
            render: (p) => (
              <div className="flex flex-col">
                <span className="font-semibold text-gray-800 text-xs">
                  {p.username || "?"}
                </span>
                {p.email && (
                  <span className="text-[10px] text-gray-400 truncate max-w-37.5">
                    {p.email}
                  </span>
                )}
              </div>
            ),
          },
          {
            name: t.reports.amount,
            accessorKey: "amount",
            allowSort: true,
            render: (p) => (
              <span className="font-bold text-gray-950">
                {formatAmount(p.amount)}
              </span>
            ),
            cellClassName: "px-6 py-4 text-sm whitespace-nowrap",
          },
          {
            name: t.reports.paymentMethod,
            accessorKey: "method",
            render: (p) => (
              <span className="text-xs text-gray-650 max-w-xs md:max-w-md truncate">
                {p.method === "Free" ? t.reports.methodFree : (p.method || "N/A")}
              </span>
            ),
            cellClassName: "px-6 py-4 text-sm",
          },
          {
            name: t.reports.paymentDate,
            accessorKey: "createDate",
            allowSort: true,
            isDuration: true,
            showFilter: true,
            render: (p) => (
              <span className="text-xs text-gray-500 font-medium">
                {formatDateTime(p.createDate)}
              </span>
            ),
            cellClassName: "px-6 py-4 text-sm whitespace-nowrap",
          },
          {
            name: t.common.status,
            accessorKey: "status",
            showFilter: true,
            values: [1, 2, 3, 4, 0],
            valueLabels: [
              t.reports.statusSuccess,
              t.reports.statusFailed,
              t.reports.statusPending,
              t.reports.statusRefunded,
              t.reports.statusCancelled,
            ],
            render: (p) => {
              switch (p.status) {
                case 1:
                  return <Badge title={t.reports.statusSuccess} type="Green" />
                case 2:
                  return <Badge title={t.reports.statusFailed} type="Red" />
                case 3:
                  return <Badge title={t.reports.statusPending} type="Yellow" />
                case 4:
                  return <Badge title={t.reports.statusRefunded} type="Blue" />
                case 0:
                  return <Badge title={t.reports.statusCancelled} type="Gray" />
                default:
                  return <Badge title={p.status?.toString() || "?"} type="Gray" />
              }
            },
          },
        ]}
      />

      {/* Payment Detail Modal */}
      <PaymentDetailModal
        payment={selectedPayment}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedPayment(null)
        }}
      />
    </div>
  )
}
