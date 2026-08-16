import { useState, useCallback } from "react"
import { DollarSign, Building2 } from "lucide-react"
import {
  getRefunds,
  processRefund,
  type PaymentRefund,
  type GetRefundsParams,
} from "../api/refundsApi"
import PayoutBalanceWidget from "../components/PayoutBalanceWidget"
import ProcessRefundModal from "../components/ProcessRefundModal"
import { PageHeader } from "../../../components/ui/PageHeader"
import Table from "../../../components/ui/table/Table"
import Badge from "../../../components/ui/Badge"
import Button from "../../../components/ui/Button"
import {
  formatAmount,
  formatDateTime,
  formatDateToUtcStartOfDay,
  formatDateToUtcEndOfDay,
} from "../../../lib/utils"
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

  const fetcher = useCallback(
    async (page?: number, pageSize?: number) => {
      const params: GetRefundsParams = {}
      if (page !== undefined) params.Page = page
      if (pageSize !== undefined) params.PageSize = pageSize

      const res = await getRefunds(params)
      return {
        data: res.data,
        total: res.total_records ?? res.data.length,
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refreshTrigger],
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

      {/* Table Element with Integrated Filters */}
      <Table<PaymentRefund>
        key={refreshTrigger}
        keyExtractor={(r) => String(r.refundId)}
        fetcher={fetcher}
        filter={async (attribute, value, toDate) => {
          const params: GetRefundsParams = {}

          if (
            attribute === "global" ||
            attribute === "Search" ||
            attribute === "username" ||
            attribute === "email" ||
            attribute === "reason" ||
            attribute === "accountNumber"
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
            const to = toDate || (Array.isArray(value) ? value[1] : undefined)
            params.FromDate = formatDateToUtcStartOfDay(from)
            params.ToDate = formatDateToUtcEndOfDay(to)
          } else if (
            attribute === "status" &&
            value !== undefined &&
            value !== null
          ) {
            if (Array.isArray(value)) {
              if (value.length === 1) {
                params.Status = Number(value[0])
              }
            } else {
              params.Status = Number(value)
            }
          }

          const res = await getRefunds(params)
          return {
            data: res.data,
            total: res.total_records ?? res.data.length,
          }
        }}
        headers={[
          {
            id: "refundId",
            name: "ID",
            accessorKey: "refundId",
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
            showFilter: true,
            values: [0, 1, 2, 3],
            valueLabels: [
              "Chờ xử lý",
              "Đã duyệt & Chuyển khoản",
              "Từ chối",
              "Thất bại",
            ],
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
