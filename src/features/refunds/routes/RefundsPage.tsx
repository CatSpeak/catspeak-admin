import { useState, useCallback } from "react"
import { DollarSign, Building2, Calendar, X } from "lucide-react"
import {
  getRefunds,
  processRefund,
  type PaymentRefund,
  type RefundStatus,
  type GetRefundsParams,
} from "../api/refundsApi"
import PayoutBalanceWidget from "../components/PayoutBalanceWidget"
import ProcessRefundModal from "../components/ProcessRefundModal"
import { PageHeader } from "../../../components/ui/PageHeader"
import Table from "../../../components/ui/table/Table"
import Badge from "../../../components/ui/Badge"
import Button from "../../../components/ui/Button"
import { formatAmount, formatDateTime } from "../../../lib/utils"
import { useToastStore } from "../../../stores/toastStore"
import { useLanguage } from "../../../stores/languageStore"

export default function RefundsPage() {
  const { addToast } = useToastStore()
  const { t } = useLanguage()

  const [selectedRefund, setSelectedRefund] = useState<PaymentRefund | null>(
    null,
  )
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0)

  // Status & Date Filter State
  const [statusFilter, setStatusFilter] = useState<RefundStatus | "All">("All")
  const [fromDate, setFromDate] = useState<string>("")
  const [toDate, setToDate] = useState<string>("")

  const fetcher = useCallback(
    async (page?: number, pageSize?: number) => {
      const params: GetRefundsParams = {}
      if (page !== undefined) params.Page = page
      if (pageSize !== undefined) params.PageSize = pageSize
      if (statusFilter !== "All") {
        params.Status = statusFilter
      }
      if (fromDate) params.FromDate = fromDate
      if (toDate) params.ToDate = toDate

      const res = await getRefunds(params)
      return {
        data: res.data,
        total: res.total_records ?? res.data.length,
      }
    },
    [statusFilter, fromDate, toDate],
  )

  const handleReview = (refundItem: PaymentRefund) => {
    setSelectedRefund(refundItem)
    setIsModalOpen(true)
  }

  const handleProcessRefund = async (
    action: "Approve" | "Reject",
    reason: string,
  ) => {
    if (!selectedRefund) return
    setIsProcessing(true)
    try {
      const res = await processRefund(selectedRefund.refundId, {
        action,
        reason,
      })
      addToast(
        "success",
        res.message ||
          `Yêu cầu hoàn tiền #${selectedRefund.refundId} đã được ${
            action === "Approve" ? "phê duyệt và chuyển khoản" : "từ chối"
          } thành công.`,
      )
      setRefreshTrigger((prev) => prev + 1)
    } catch (err: unknown) {
      console.error("Error processing refund:", err)
      throw err
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <PageHeader
        icon={<DollarSign />}
        title={t.refunds?.title || "Quản Lý Hoàn Tiền (Refund Management)"}
        desc={
          t.refunds?.desc ||
          "Xử lý các yêu cầu hoàn tiền từ học viên và chuyển khoản tự động qua cổng PayOS Payout Gateway."
        }
      />

      {/* PayOS Payout Balance Card */}
      <PayoutBalanceWidget key={refreshTrigger} />

      {/* Filter Bar & Status Tabs + Date Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-wrap gap-1.5">
          {[
            { key: "All", label: "Tất cả" },
            { key: 0, label: "Chờ xử lý" },
            { key: 1, label: "Đã duyệt & Chuyển khoản" },
            { key: 2, label: "Từ chối" },
            { key: 3, label: "Thất bại" },
          ].map((tab) => {
            const isActive = statusFilter === tab.key
            return (
              <button
                key={String(tab.key)}
                onClick={() => setStatusFilter(tab.key as RefundStatus | "All")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Right: Date Range Pickers */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
            <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span>Từ:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg border border-gray-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
            <span>Đến:</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg border border-gray-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer"
            />
          </div>
          {(fromDate || toDate) && (
            <button
              type="button"
              onClick={() => {
                setFromDate("")
                setToDate("")
              }}
              className="p-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Xóa bộ lọc ngày"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Table Element */}
      <Table<PaymentRefund>
        key={`${refreshTrigger}-${statusFilter}`}
        keyExtractor={(r) => String(r.refundId)}
        fetcher={fetcher}
        filter={async (attribute, value, toDate) => {
          const params: GetRefundsParams = {}
          if (statusFilter !== "All") {
            params.Status = statusFilter
          }

          if (
            attribute === "global" ||
            attribute === "Search" ||
            attribute === "username" ||
            attribute === "email" ||
            attribute === "reason"
          ) {
            params.Search = value ? String(value) : undefined
          } else if (
            attribute === "createDate" ||
            attribute === "fromDate" ||
            attribute === "FromDate"
          ) {
            const from =
              typeof value === "string"
                ? value
                : Array.isArray(value)
                  ? value[0]
                  : undefined
            const to =
              toDate || (Array.isArray(value) ? value[1] : undefined)
            params.FromDate = from || undefined
            params.ToDate = to || undefined
          } else if (attribute === "toDate" || attribute === "ToDate") {
            params.ToDate = value ? String(value) : undefined
          } else if (
            attribute === "status" &&
            value !== undefined &&
            value !== null
          ) {
            params.Status = Number(value)
          }

          const res = await getRefunds(params)
          return res.data
        }}
        headers={[
          {
            id: "refundId",
            name: "ID",
            accessorKey: "refundId",
            showFilter: false,
            render: (r) => (
              <span className="font-mono font-bold text-gray-900">
                #{r.refundId}
              </span>
            ),
          },
          {
            id: "paymentId",
            name: "Mã Thanh Toán",
            accessorKey: "paymentId",
            showFilter: false,
            render: (r) => (
              <span className="font-mono text-xs text-gray-600 font-medium">
                #{r.paymentId}
              </span>
            ),
          },
          {
            id: "username",
            name: "Học Viên",
            accessorKey: "username",
            showFilter: false,
            render: (r) => (
              <div className="flex flex-col">
                <span className="font-bold text-gray-800 text-xs">
                  {r.username || "Chưa cập nhật"}
                </span>
                {r.email && (
                  <span className="text-[11px] text-gray-400 truncate max-w-[170px]">
                    {r.email}
                  </span>
                )}
              </div>
            ),
          },
          {
            id: "amountVnd",
            name: "Số Tiền (VND)",
            accessorKey: "amountVnd",
            showFilter: false,
            render: (r) => (
              <span className="font-extrabold text-emerald-600">
                {formatAmount(r.amountVnd)}
              </span>
            ),
            cellClassName: "px-6 py-4 text-sm whitespace-nowrap",
          },
          {
            id: "bankInfo",
            name: "Thông Tin Ngân Hàng",
            accessorKey: "accountNumber",
            showFilter: false,
            render: (r) => (
              <div className="flex flex-col text-xs">
                <span className="font-bold text-gray-900 flex items-center gap-1 uppercase">
                  <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                  {r.accountHolderName}
                </span>
                <span className="font-mono text-indigo-600 font-semibold text-[11px]">
                  STK: {r.accountNumber} (BIN: {r.bankBin})
                </span>
              </div>
            ),
          },
          {
            id: "reason",
            name: "Lý Do Hoàn Tiền",
            accessorKey: "reason",
            showFilter: false,
            render: (r) => (
              <p
                className="text-xs text-gray-600 max-w-xs truncate font-medium"
                title={r.reason}
              >
                {r.reason || "—"}
              </p>
            ),
            cellClassName: "px-6 py-4 text-sm",
          },
          {
            id: "createDate",
            name: "Ngày Gửi",
            accessorKey: "createDate",
            isDuration: true,
            showFilter: true,
            render: (r) => (
              <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                {formatDateTime(r.createDate)}
              </span>
            ),
            cellClassName: "px-6 py-4 text-sm whitespace-nowrap",
          },
          {
            id: "status",
            name: "Trạng Thái",
            accessorKey: "status",
            showFilter: false,
            render: (r) => {
              switch (r.status) {
                case 0:
                  return <Badge title="Chờ xử lý" type="Yellow" showDot />
                case 1:
                  return <Badge title="Đã chuyển tiền" type="Green" showDot />
                case 2:
                  return <Badge title="Từ chối" type="Red" showDot />
                case 3:
                  return <Badge title="Lỗi chuyển tiền" type="Orange" showDot />
                default:
                  return <Badge title={String(r.status)} type="Gray" />
              }
            },
          },
          {
            id: "actions",
            name: "Hành Động",
            allowSort: false,
            showFilter: false,
            render: (r) => (
              <Button
                variant={r.status === 0 ? "primary" : "outline"}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleReview(r)
                }}
                className="text-xs cursor-pointer shadow-none font-semibold"
              >
                {r.status === 0 ? "Xử lý ngay" : "Xem chi tiết"}
              </Button>
            ),
          },
        ]}
        onClickRow={(r) => handleReview(r)}
      />

      {/* Process Refund Modal */}
      <ProcessRefundModal
        key={selectedRefund?.refundId ?? "none"}
        refund={selectedRefund}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedRefund(null)
        }}
        onProcess={handleProcessRefund}
        isProcessing={isProcessing}
      />
    </div>
  )
}
