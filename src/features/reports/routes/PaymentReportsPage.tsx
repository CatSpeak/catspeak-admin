import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  AlertCircle,
  CheckCircle,
  Ban,
  ChevronRight,
  DollarSign,
} from "lucide-react";
import {
  getPaymentReports,
  processPaymentReport,
  type PaymentReport,
} from "../api/paymentReports";
import { useToastStore } from "../../../stores/toastStore";
import PaymentReportsTable from "../components/PaymentReportsTable";
import ProcessReportModal from "../components/ProcessReportModal";
import { PageHeader } from "../../../components/ui/PageHeader";
import Table from "../../../components/ui/table/Table";
import { formatAmount, formatDate } from "../../../lib/utils";
import Badge from "../../../components/ui/Badge";

export default function PaymentReportsPage() {
  const navigate = useNavigate();
  const { addToast } = useToastStore();

  // State
  const [selectedReport, setSelectedReport] = useState<PaymentReport | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [reports, setReports] = useState<PaymentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch reports list once on load or refresh
  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getPaymentReports(null);
        if (cancelled) return;
        setReports(data);
      } catch {
        if (cancelled) return;
        setError("Failed to load payment reports. Please try again.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    fetchData();
    return () => {
      cancelled = true;
    };
  }, [refreshTrigger]);

  // Compute metrics in-memory from loaded reports
  const metrics = useMemo(() => {
    const counts = { total: 0, pending: 0, accepted: 0, denied: 0 };
    reports.forEach((curr) => {
      counts.total++;
      if (curr.status === 0) counts.pending++;
      else if (curr.status === 1) counts.accepted++;
      else if (curr.status === 2) counts.denied++;
    });
    return counts;
  }, [reports]);

  const handleReviewReport = (report: PaymentReport) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const handleProcessReport = async (
    action: "Accept" | "Deny",
    reason: string,
  ) => {
    if (!selectedReport) return;
    setIsProcessing(true);
    try {
      await processPaymentReport(selectedReport.reportId, { action, reason });
      addToast(
        "success",
        `Payment report #${selectedReport.reportId} has been ${action === "Accept" ? "accepted" : "denied"} successfully.`,
      );
      // Force table and card refresh
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      console.error("Error processing report:", err);
      throw err; // Propagate error back to the modal's internal state
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Breadcrumb Navigation */}
      <PageHeader
        icon={<DollarSign />}
        title="Payment Reports"
        desc="Track successful transactions, refunds, and financial summaries."
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
              Total Reports
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
              Pending Action
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
              Accepted Claims
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
              Denied Claims
            </span>
            <span className="text-2xl font-bold text-error-700 block mt-0.5">
              {metrics.denied}
            </span>
          </div>
        </div>
      </div>

      {/* Table Element */}
      <Table<PaymentReport>
        fetcher={() => {
          const data = reports;
          return {
            data,
            total: data.length,
          };
        }}
        headers={[
          {
            name: "ID",
            accessorKey: "reportId",
          },
          {
            name: "Transaction ID",
            accessorKey: "paymentId",
          },
          {
            name: "Reporter",
            accessorKey: "username",
            render: (r) => (
              <div className="flex flex-col">
                <span className="font-semibold text-gray-800 text-xs">
                  {r.username || "Unknown"}
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
            name: "Amount",
            accessorKey: "amount",
            render: (r) => (
              <span className="font-bold text-gray-950">
                {formatAmount(r.amount)}
              </span>
            ),
            cellClassName: "px-6 py-4 text-sm whitespace-nowrap",
          },
          {
            name: "Reason Reported",
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
            name: "Date Reported",
            accessorKey: "createDate",
            render: (r) => (
              <span className="text-xs text-gray-500 font-medium">
                {formatDate(r.createDate)}
              </span>
            ),
            cellClassName: "px-6 py-4 text-sm whitespace-nowrap",
          },
          {
            name: "Status",
            accessorKey: "status",
            values: [0, 1, 2],
            valueLabels: ["Pending", "Accepted", "Denied"],
            render: (p) => {
              switch (p.status) {
                case 0:
                  return <Badge title="Pending" type="Yellow" />;
                case 1:
                  return <Badge title="Accepted" type="Green" />;
                case 2:
                  return <Badge title="Denied" type="Red" />;
                default:
                  return <Badge title={p.status || "Unknown"} type="Gray" />;
              }
            },
          },
        ]}
        onClickRow={(r) => {
          handleReviewReport(r);
        }}
      />

      {/* <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm">
        <h2 className="text-base font-bold text-gray-900 mb-4 tracking-tight">
          Reports Log
        </h2>
        <PaymentReportsTable
          reports={reports}
          loading={loading}
          error={error}
          onReviewReport={handleReviewReport}
          onRefresh={() => setRefreshTrigger((prev) => prev + 1)}
        />
      </div> */}

      {/* Review Modal Dialog */}
      <ProcessReportModal
        key={selectedReport?.reportId ?? "none"}
        report={selectedReport}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedReport(null);
        }}
        onProcess={handleProcessReport}
        isProcessing={isProcessing}
      />
    </div>
  );
}
