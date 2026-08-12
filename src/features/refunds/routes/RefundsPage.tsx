import { useState, useMemo, useCallback } from "react";
import {
  DollarSign,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  Building2,
} from "lucide-react";
import {
  getRefunds,
  processRefund,
  type PaymentRefund,
  type RefundStatus,
  type GetRefundsParams,
} from "../api/refundsApi";
import PayoutBalanceWidget from "../components/PayoutBalanceWidget";
import ProcessRefundModal from "../components/ProcessRefundModal";
import { PageHeader } from "../../../components/ui/PageHeader";
import Table from "../../../components/ui/table/Table";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import { formatAmount, formatDateTime } from "../../../lib/utils";
import { useToastStore } from "../../../stores/toastStore";
import { useLanguage } from "../../../stores/languageStore";

export default function RefundsPage() {
  const { addToast } = useToastStore();
  const { t } = useLanguage();

  const [selectedRefund, setSelectedRefund] = useState<PaymentRefund | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [refundsList, setRefundsList] = useState<PaymentRefund[]>([]);

  // Status Filter State
  const [statusFilter, setStatusFilter] = useState<RefundStatus | "All">("All");

  // Compute metrics in-memory from loaded list
  const metrics = useMemo(() => {
    const counts = { total: 0, pending: 0, approved: 0, rejected: 0, failed: 0 };
    refundsList.forEach((r) => {
      counts.total++;
      if (r.status === 0) counts.pending++;
      else if (r.status === 1) counts.approved++;
      else if (r.status === 2) counts.rejected++;
      else if (r.status === 3) counts.failed++;
    });
    return counts;
  }, [refundsList]);

  const fetcher = useCallback(async () => {
    const params: GetRefundsParams = {};
    if (statusFilter !== "All") {
      params.status = statusFilter;
    }

    const res = await getRefunds(params);
    setRefundsList(res.data);
    return {
      data: res.data,
      total: res.total_records ?? res.data.length,
    };
  }, [statusFilter]);

  const handleReview = (refundItem: PaymentRefund) => {
    setSelectedRefund(refundItem);
    setIsModalOpen(true);
  };

  const handleProcessRefund = async (
    action: "Approve" | "Reject",
    reason: string
  ) => {
    if (!selectedRefund) return;
    setIsProcessing(true);
    try {
      const res = await processRefund(selectedRefund.refundId, { action, reason });
      addToast(
        "success",
        res.message ||
          `Yêu cầu hoàn tiền #${selectedRefund.refundId} đã được ${
            action === "Approve" ? "phê duyệt và chuyển khoản" : "từ chối"
          } thành công.`
      );
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: unknown) {
      console.error("Error processing refund:", err);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

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

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Requests Card */}
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
              Tổng yêu cầu
            </span>
            <span className="text-2xl font-bold text-gray-900 block mt-0.5">
              {metrics.total}
            </span>
          </div>
        </div>

        {/* Pending Card */}
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
              Chờ xử lý
            </span>
            <span className="text-2xl font-bold text-amber-600 block mt-0.5">
              {metrics.pending}
            </span>
          </div>
        </div>

        {/* Approved Card */}
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
              Đã chuyển tiền
            </span>
            <span className="text-2xl font-bold text-emerald-600 block mt-0.5">
              {metrics.approved}
            </span>
          </div>
        </div>

        {/* Rejected / Failed Card */}
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
              Từ chối / Lỗi
            </span>
            <span className="text-2xl font-bold text-rose-600 block mt-0.5">
              {metrics.rejected + metrics.failed}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Bar & Status Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-wrap gap-1.5">
          {[
            { key: "All", label: "Tất cả", count: metrics.total },
            { key: 0, label: "Chờ xử lý", count: metrics.pending },
            { key: 1, label: "Đã duyệt & Chuyển khoản", count: metrics.approved },
            { key: 2, label: "Từ chối", count: metrics.rejected },
            { key: 3, label: "Thất bại", count: metrics.failed },
          ].map((tab) => {
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={String(tab.key)}
                onClick={() => setStatusFilter(tab.key as RefundStatus | "All")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive
                      ? "bg-slate-700 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table Element */}
      <Table<PaymentRefund>
        key={`${refreshTrigger}-${statusFilter}`}
        fetcher={fetcher}
        headers={[
          {
            name: "ID",
            accessorKey: "refundId",
            render: (r) => (
              <span className="font-mono font-bold text-gray-900">
                #{r.refundId}
              </span>
            ),
          },
          {
            name: "Mã Thanh Toán",
            accessorKey: "paymentId",
            render: (r) => (
              <span className="font-mono text-xs text-gray-600 font-medium">
                #{r.paymentId}
              </span>
            ),
          },
          {
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
            name: "Ngày Gửi",
            accessorKey: "createDate",
            render: (r) => (
              <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                {formatDateTime(r.createDate)}
              </span>
            ),
            cellClassName: "px-6 py-4 text-sm whitespace-nowrap",
          },
          {
            name: "Trạng Thái",
            accessorKey: "status",
            render: (r) => {
              switch (r.status) {
                case 0:
                  return <Badge title="Chờ xử lý" type="Yellow" showDot />;
                case 1:
                  return <Badge title="Đã chuyển tiền" type="Green" showDot />;
                case 2:
                  return <Badge title="Từ chối" type="Red" showDot />;
                case 3:
                  return <Badge title="Lỗi chuyển tiền" type="Orange" showDot />;
                default:
                  return <Badge title={String(r.status)} type="Gray" />;
              }
            },
          },
          {
            name: "Hành Động",
            accessorKey: "refundId",
            render: (r) => (
              <Button
                variant={r.status === 0 ? "primary" : "outline"}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReview(r);
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
          setIsModalOpen(false);
          setSelectedRefund(null);
        }}
        onProcess={handleProcessRefund}
        isProcessing={isProcessing}
      />
    </div>
  );
}
