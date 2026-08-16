import { useState, useMemo, useCallback } from "react"
import {
  FileText,
  AlertCircle,
  CheckCircle,
  Ban,
  DollarSign,
} from "lucide-react"
import {
  getPaymentReports,
  processPaymentReport,
  type PaymentReport,
  type PaymentReportSortBy,
  type GetPaymentReportsParams,
} from "../api/paymentReports"
import { useToastStore } from "../../../stores/toastStore"
import ProcessReportModal from "../components/ProcessReportModal"
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

export default function PaymentReportsPage() {
  const { addToast } = useToastStore()
  const { t } = useLanguage()

  // State
  const [selectedReport, setSelectedReport] = useState<PaymentReport | null>(
    null,
  )
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [reports, setReports] = useState<PaymentReport[]>([])
  const [statusFilter] = useState<
    "Pending" | "Accepted" | "Denied" | "All" | null
  >(null)

  // Compute metrics in-memory from loaded reports
  const metrics = useMemo(() => {
    const counts = { total: 0, pending: 0, accepted: 0, denied: 0 }
    reports.forEach((curr) => {
      counts.total++
      if (curr.status === 0) counts.pending++
      else if (curr.status === 1) counts.accepted++
      else if (curr.status === 2) counts.denied++
    })
    return counts
  }, [reports])

  const fetcher = useCallback(async () => {
    const data = await getPaymentReports(statusFilter)
    setReports(data)
    return {
      data,
      total: data.length,
    }
  }, [statusFilter])

  const handleReviewReport = (report: PaymentReport) => {
    setSelectedReport(report)
    setIsModalOpen(true)
  }

  const handleProcessReport = async (
    action: "Accept" | "Deny",
    reason: string,
  ) => {
    if (!selectedReport) return
    setIsProcessing(true)
    try {
      await processPaymentReport(selectedReport.reportId, { action, reason })
      addToast(
        "success",
        `Payment report #${selectedReport.reportId} has been ${action === "Accept" ? "accepted" : "denied"} successfully.`,
      )
      setRefreshTrigger((prev) => prev + 1)
    } catch (err) {
      console.error("Error processing report:", err)
      throw err
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Breadcrumb Navigation */}
      <PageHeader
        icon={<DollarSign />}
        title={t.reports.paymentReportsTitle}
        desc={t.reports.paymentReportsDesc}
      />

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Card */}
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
              {t.reports.totalReports}
            </span>
            <span className="text-2xl font-bold text-gray-900 block mt-0.5">
              {metrics.total}
            </span>
          </div>
        </div>

        {/* Pending Card */}
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-xl bg-warning-50 text-warning-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
              {t.reports.pendingAction}
            </span>
            <span className="text-2xl font-bold text-warning-700 block mt-0.5 animate-pulse">
              {metrics.pending}
            </span>
          </div>
        </div>

        {/* Accepted Card */}
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-xl bg-success-50 text-success-600 flex items-center justify-center shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
              {t.reports.acceptedClaims}
            </span>
            <span className="text-2xl font-bold text-success-700 block mt-0.5">
              {metrics.accepted}
            </span>
          </div>
        </div>

        {/* Denied Card */}
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-xl bg-error-50 text-error-600 flex items-center justify-center shrink-0">
            <Ban className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
              {t.reports.deniedClaims}
            </span>
            <span className="text-2xl font-bold text-error-700 block mt-0.5">
              {metrics.denied}
            </span>
          </div>
        </div>
      </div>

      {/* Table Element */}
      <Table<PaymentReport>
        key={`${refreshTrigger}-${statusFilter}`}
        fetcher={fetcher}
        sorter={async (attribute, sortOrder) => {
          let sortBy: PaymentReportSortBy | undefined = undefined
          if (attribute === "createDate") sortBy = "ReportDate"
          else if (attribute === "amount") sortBy = "Amount"

          const order =
            sortOrder === "asc"
              ? "Asc"
              : sortOrder === "desc"
                ? "Desc"
                : undefined
          const res = await getPaymentReports({
            SortBy: sortBy,
            SortOrder: order,
          })
          return {
            data: res,
            total: res.length,
          }
        }}
        filter={async (attribute, value, toDate) => {
          const params: GetPaymentReportsParams = {}
          if (attribute === "global") {
            params.SearchKeyword = value ? String(value) : undefined
          } else if (
            attribute === "createDate" ||
            attribute === "dateReported" ||
            attribute === "fromDate"
          ) {
            const from =
              typeof value === "string"
                ? value
                : Array.isArray(value)
                  ? value[0]
                  : undefined
            const to = toDate || (Array.isArray(value) ? value[1] : undefined)
            params.FromDate = formatDateToUtcStartOfDay(from)
            params.ToDate = formatDateToUtcEndOfDay(to)
          } else if (
            attribute === "status" &&
            value !== undefined &&
            value !== null
          ) {
            params.Statuses = Array.isArray(value)
              ? value.map(Number)
              : [Number(value)]
          }
          const res = await getPaymentReports(params)
          return {
            data: res,
            total: res.length,
          }
        }}
        headers={[
          {
            name: t.users.id,
            accessorKey: "reportId",
          },
          {
            name: "Transaction ID",
            accessorKey: "paymentId",
          },
          {
            name: t.reports.reporter,
            accessorKey: "username",
            render: (r) => (
              <div className="flex flex-col">
                <span className="font-semibold text-gray-800 text-xs">
                  {r.username || "?"}
                </span>
                {r.email && (
                  <span className="text-[10px] text-gray-400 truncate max-w-[150px]">
                    {r.email}
                  </span>
                )}
              </div>
            ),
          },
          {
            name: t.reports.amount,
            accessorKey: "amount",
            allowSort: true,
            render: (r) => (
              <span className="font-bold text-gray-950">
                {formatAmount(r.amount)}
              </span>
            ),
            cellClassName: "px-6 py-4 text-sm whitespace-nowrap",
          },
          {
            name: t.reports.reasonReported,
            accessorKey: "userExplanation",
            render: (r) => (
              <p
                className="text-xs text-gray-650 max-w-xs md:max-w-md truncate"
                title={r.userExplanation}
              >
                {r.userExplanation}
              </p>
            ),
            cellClassName: "px-6 py-4 text-sm",
          },
          {
            name: t.reports.dateReported,
            accessorKey: "createDate",
            allowSort: true,
            isDuration: true,
            showFilter: true,
            render: (r) => (
              <span className="text-xs text-gray-500 font-medium">
                {formatDateTime(r.createDate)}
              </span>
            ),
            cellClassName: "px-6 py-4 text-sm whitespace-nowrap",
          },
          {
            name: t.common.status,
            accessorKey: "status",
            showFilter: true,
            values: [0, 1, 2],
            valueLabels: [
              t.common.pending,
              t.common.approved,
              t.common.rejected,
            ],
            render: (p) => {
              switch (p.status) {
                case 0:
                  return <Badge title={t.common.pending} type="Yellow" />
                case 1:
                  return <Badge title={t.common.approved} type="Green" />
                case 2:
                  return <Badge title={t.common.rejected} type="Red" />
                default:
                  return <Badge title={p.status || "?"} type="Gray" />
              }
            },
          },
        ]}
        onClickRow={(r) => {
          handleReviewReport(r)
        }}
      />

      {/* Review Modal Dialog */}
      <ProcessReportModal
        key={selectedReport?.reportId ?? "none"}
        report={selectedReport}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedReport(null)
        }}
        onProcess={handleProcessReport}
        isProcessing={isProcessing}
      />
    </div>
  )
}
