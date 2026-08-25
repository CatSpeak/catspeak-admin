import { useState, useCallback, useMemo, useEffect } from "react";
import {
  DollarSign,
  ImageIcon,
} from "lucide-react";
import {
  getPaymentIssues,
  type PaymentIssue,
  type GetPaymentIssuesParams,
} from "../api/paymentIssuesApi";
import { processPaymentReport, type PaymentReport } from "../api/paymentReports";
import { processRefund, type PaymentRefund } from "../../refunds/api/refundsApi";
import PayoutBalanceWidget from "../../refunds/components/PayoutBalanceWidget";
import PaymentIssuesSummaryCards from "../components/PaymentIssuesSummaryCards";
import ProcessReportModal from "../components/ProcessReportModal";
import ProcessRefundModal from "../../refunds/components/ProcessRefundModal";
import { PageHeader } from "../../../components/ui/PageHeader";
import Table from "../../../components/ui/table/Table";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import {
  formatAmount,
  formatDateTime,
  formatDateToUtcStartOfDay,
  formatDateToUtcEndOfDay,
} from "../../../lib/utils";
import { useToastStore } from "../../../stores/toastStore";
import { useLanguage } from "../../../stores/languageStore";

export default function PaymentIssuesPage() {
  const { addToast } = useToastStore();
  const { t } = useLanguage();

  // State
  const [selectedReport, setSelectedReport] = useState<PaymentReport | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState<PaymentRefund | null>(null);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [allIssuesForMetrics, setAllIssuesForMetrics] = useState<PaymentIssue[]>([]);

  // Tải dữ liệu để tính metrics
  const loadMetricsData = useCallback(async () => {
    try {
      const res = await getPaymentIssues({ pageSize: 1000 });
      setAllIssuesForMetrics(res.data);
    } catch (err) {
      console.error("Failed to load metric counts:", err);
    }
  }, []);

  useEffect(() => {
    loadMetricsData();
  }, [loadMetricsData, refreshTrigger]);

  // Tính toán số lượng metrics
  const metrics = useMemo(() => {
    const counts = {
      total: allIssuesForMetrics.length,
      reports: 0,
      refunds: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    };
    allIssuesForMetrics.forEach((curr) => {
      if (curr.type === "REPORT") counts.reports++;
      else if (curr.type === "REFUND") counts.refunds++;

      if (curr.status === 0) counts.pending++;
      else if (curr.status === 1) counts.approved++;
      else if (curr.status === 2 || curr.status === 3) counts.rejected++;
    });
    return counts;
  }, [allIssuesForMetrics]);

  // Fetcher phân trang cho Table
  const fetcher = useCallback(
    async (page?: number, pageSize?: number) => {
      const params: GetPaymentIssuesParams = {};
      if (page !== undefined) params.Page = page;
      if (pageSize !== undefined) params.PageSize = pageSize;

      const res = await getPaymentIssues(params);
      return {
        data: res.data,
        total: res.total_records,
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refreshTrigger],
  );

  // Xử lý click dòng mở Modal tương ứng
  const handleReview = (item: PaymentIssue) => {
    if (item.type === "REPORT") {
      const reportObj: PaymentReport = {
        reportId: item.id,
        paymentId: item.paymentId,
        paymentType: item.paymentType,
        userId: item.userId,
        username: item.username || "",
        email: item.email || "",
        amount: item.amountVnd,
        userExplanation: item.reason,
        proofUrl: item.proofUrl || null,
        createDate: item.createDate,
        status: item.status as 0 | 1 | 2,
        adminResponseReason: item.adminResponseReason || null,
        processedBy: item.processedBy || null,
        processedAt: item.processedAt || null,
      };
      setSelectedReport(reportObj);
      setIsReportModalOpen(true);
    } else {
      const refundObj: PaymentRefund = {
        refundId: item.id,
        paymentId: item.paymentId,
        userId: item.userId,
        username: item.username || "",
        email: item.email || "",
        amountVnd: item.amountVnd,
        paymentType: item.paymentType || "Subscription",
        bankBin: item.bankBin || "",
        accountNumber: item.accountNumber || "",
        accountHolderName: item.accountHolderName || "",
        reason: item.reason,
        status: item.status as 0 | 1 | 2 | 3,
        payOSReferenceId: item.payOSReferenceId || null,
        adminResponseReason: item.adminResponseReason || null,
        processedBy: item.processedBy || null,
        createDate: item.createDate,
        processedAt: item.processedAt || null,
      };
      setSelectedRefund(refundObj);
      setIsRefundModalOpen(true);
    }
  };

  // Xử lý Duyệt/Từ chối Báo cáo
  const handleProcessReport = async (action: "Accept" | "Deny", reason: string) => {
    if (!selectedReport) return;
    setIsProcessing(true);
    try {
      await processPaymentReport(selectedReport.reportId, { action, reason });
      addToast(
        "success",
        action === "Accept"
          ? (t.reports?.reportAcceptedSuccess || `Báo cáo sự cố #${selectedReport.reportId} đã được chấp nhận thành công.`).replace("{id}", String(selectedReport.reportId))
          : (t.reports?.reportDeniedSuccess || `Báo cáo sự cố #${selectedReport.reportId} đã bị từ chối.`).replace("{id}", String(selectedReport.reportId)),
      );
      setRefreshTrigger((prev) => prev + 1);
    } finally {
      setIsProcessing(false);
    }
  };

  // Xử lý Duyệt/Từ chối Hoàn tiền (PayOS Gateway)
  const handleProcessRefund = async (action: "Approve" | "Reject", reason: string, amount?: number) => {
    if (!selectedRefund) return;
    setIsProcessing(true);
    try {
      const res = await processRefund(selectedRefund.refundId, { action, reason, amount });
      addToast(
        "success",
        res.message ||
        (action === "Approve"
          ? (t.reports?.refundApprovedSuccess || `Yêu cầu hoàn tiền #${selectedRefund.refundId} đã được phê duyệt và chuyển khoản thành công.`).replace("{id}", String(selectedRefund.refundId))
          : (t.reports?.refundRejectedSuccess || `Yêu cầu hoàn tiền #${selectedRefund.refundId} đã bị từ chối.`).replace("{id}", String(selectedRefund.refundId))),
      );
      setRefreshTrigger((prev) => prev + 1);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <PageHeader
        icon={<DollarSign />}
        title={t.reports?.paymentIssuesTitle || "Quản Lý Báo Cáo & Hoàn Tiền"}
        desc={
          t.reports?.paymentIssuesDesc ||
          "Xử lý các khiếu nại báo cáo giao dịch và phê duyệt hoàn tiền tự động qua PayOS Gateway."
        }
      />

      {/* PayOS Payout Balance Widget (Từ /refunds) */}
      <PayoutBalanceWidget key={refreshTrigger} />

      {/* Summary Metrics Cards */}
      <PaymentIssuesSummaryCards metrics={metrics} />

      {/* Unified Table */}
      <Table<PaymentIssue>
        key={refreshTrigger}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        fetcher={fetcher}
        filter={async (attribute, value, toDate) => {
          const params: GetPaymentIssuesParams = {};

          if (attribute === "global" || attribute === "Search") {
            params.Search = value ? String(value) : undefined;
          } else if (attribute === "type") {
            params.Type = value ? String(value) : undefined;
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
                  : undefined;
            const to = toDate || (Array.isArray(value) ? value[1] : undefined);
            params.FromDate = formatDateToUtcStartOfDay(from);
            params.ToDate = formatDateToUtcEndOfDay(to);
          } else if (attribute === "status" && value !== undefined && value !== null) {
            params.Status = Array.isArray(value) ? Number(value[0]) : Number(value);
          }

          const res = await getPaymentIssues(params);
          return {
            data: res.data,
            total: res.total_records,
          };
        }}
        sorter={async (attribute, sortOrder) => {
          let sortBy: "date" | "amount" | "status" = "date";
          if (attribute === "amountVnd") sortBy = "amount";
          else if (attribute === "status") sortBy = "status";
          else sortBy = "date";

          const res = await getPaymentIssues({
            SortBy: sortBy,
            SortOrder: sortOrder === "asc" ? "Asc" : "Desc",
          });
          return {
            data: res.data,
            total: res.total_records,
          };
        }}
        headers={[
          {
            id: "paymentId",
            name: t.reports?.transactionId || "Mã giao dịch",
            accessorKey: "paymentId",
            render: (r) => (
              <div className="flex flex-col">
                <span className="font-mono font-bold text-xs text-gray-900">
                  #PAY-{r.paymentId}
                </span>
                <span className="text-[10px] text-gray-400 font-mono">
                  ID: #{r.id}
                </span>
              </div>
            ),
          },
          {
            id: "type",
            name: t.reports?.requestType || "Loại yêu cầu",
            accessorKey: "type",
            showFilter: true,
            values: ["ALL", "REPORT", "REFUND"],
            valueLabels: [
              t.common?.all || "Tất cả",
              t.reports?.issueReport || "Báo cáo sự cố",
              t.reports?.refundRequest || "Yêu cầu hoàn tiền",
            ],
            render: (r) => (
              <div>
                {r.type === "REPORT" ? (
                  <Badge title={t.reports?.issueReport || "Báo cáo"} type="Purple" showDot />
                ) : (
                  <Badge title={t.reports?.refundRequest || "Hoàn tiền"} type="Orange" showDot />
                )}
              </div>
            ),
          },
          {
            id: "username",
            name: t.reports?.reporter || "Người gửi yêu cầu",
            accessorKey: "username",
            render: (r) => (
              <div className="flex flex-col">
                <span className="font-bold text-gray-800 text-xs">
                  {r.username || "?"}
                </span>
                {r.email && (
                  <span className="text-[11px] text-gray-400 truncate max-w-37.5">
                    {r.email}
                  </span>
                )}
              </div>
            ),
          },
          {
            id: "amountVnd",
            name: t.reports?.amount || "Số tiền",
            accessorKey: "amountVnd",
            allowSort: true,
            render: (r) => (
              <div className="flex flex-col">
                {r.type === "REPORT" ? (
                  <>
                    <span className="font-bold text-gray-950 text-xs">
                      {formatAmount(r.amountVnd)}
                    </span>
                    <span className="text-[10px] text-gray-400">{t.reports?.orderValue || "Giá trị đơn"}</span>
                  </>
                ) : (
                  <>
                    <span className="font-extrabold text-orange-600 text-xs">
                      -{formatAmount(r.amountVnd)}
                    </span>
                    <span className="text-[10px] text-orange-400 font-medium">{t.reports?.refundAmount || "Tiền hoàn"}</span>
                  </>
                )}
              </div>
            ),
            cellClassName: "px-6 py-4 whitespace-nowrap",
          },
          {
            id: "reason",
            name: t.reports?.reasonReported || "Lý do hoàn tiền",
            accessorKey: "reason",
            render: (r) => (
              <div className="max-w-xs md:max-w-md space-y-1">
                <p className="text-xs text-gray-700 truncate font-medium" title={r.reason}>
                  {r.reason || "—"}
                </p>
                {r.type === "REPORT" && r.proofUrl && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-primary font-medium">
                    <ImageIcon className="w-3 h-3" /> {t.reports?.hasProof || "Có ảnh hóa đơn"}
                  </span>
                )}
              </div>
            ),
            cellClassName: "px-6 py-4 text-sm",
          },
          {
            id: "createDate",
            name: t.reports?.dateReported || "Ngày tạo",
            accessorKey: "createDate",
            allowSort: true,
            isDuration: true,
            showFilter: true,
            render: (r) => (
              <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                {formatDateTime(r.createDate)}
              </span>
            ),
          },
          {
            id: "status",
            name: t.common?.status || "Trạng thái",
            accessorKey: "status",
            showFilter: true,
            values: [0, 1, 2, 3],
            valueLabels: [
              t.reports?.statusPending || "Chờ xử lý",
              t.reports?.approvedOrAccepted || "Đã chấp nhận / Hoàn tiền",
              t.common?.rejected || "Từ chối",
              t.reports?.statusTransferFailed || "Thất bại",
            ],
            render: (r) => {
              if (r.type === "REPORT") {
                switch (r.status) {
                  case 0:
                    return <Badge title={t.reports?.statusPendingReview || "Chờ xem xét"} type="Yellow" showDot />;
                  case 1:
                    return <Badge title={t.reports?.statusAccepted || "Đã chấp nhận"} type="Green" showDot />;
                  case 2:
                    return <Badge title={t.common?.rejected || "Từ chối"} type="Red" showDot />;
                  default:
                    return <Badge title={`#${r.status}`} type="Gray" />;
                }
              } else {
                switch (r.status) {
                  case 0:
                    return <Badge title={t.reports?.statusPendingRefund || "Chờ hoàn tiền"} type="Yellow" showDot />;
                  case 1:
                    return <Badge title={t.reports?.statusRefundTransferred || "Đã chuyển tiền"} type="Green" showDot />;
                  case 2:
                    return <Badge title={t.common?.rejected || "Từ chối"} type="Red" showDot />;
                  case 3:
                    return <Badge title={t.reports?.statusTransferFailed || "Lỗi chuyển tiền"} type="Orange" showDot />;
                  default:
                    return <Badge title={`#${r.status}`} type="Gray" />;
                }
              }
            },
          },
          {
            id: "actions",
            name: t.common?.actions || "Hành động",
            allowSort: false,
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
                {r.status === 0 ? (t.reports?.processNow || "Xử lý ngay") : (t.reports?.viewDetails || t.common?.detail || "Xem chi tiết")}
              </Button>
            ),
          },
        ]}
        onClickRow={handleReview}
      />

      {/* Modal Xử Lý Báo Cáo */}
      <ProcessReportModal
        key={selectedReport?.reportId ?? "none-report"}
        report={selectedReport}
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setSelectedReport(null);
        }}
        onProcess={handleProcessReport}
        isProcessing={isProcessing}
      />

      {/* Modal Xử Lý Hoàn Tiền */}
      <ProcessRefundModal
        key={selectedRefund?.refundId ?? "none-refund"}
        refund={selectedRefund}
        isOpen={isRefundModalOpen}
        onClose={() => {
          setIsRefundModalOpen(false);
          setSelectedRefund(null);
        }}
        onProcess={handleProcessRefund}
        isProcessing={isProcessing}
      />
    </div>
  );
}
