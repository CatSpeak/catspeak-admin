import { useState, useMemo, useEffect } from "react";
import { Search, X, RefreshCw, AlertTriangle, CheckCircle, Ban, ArrowRight, Eye } from "lucide-react";
import type { PaymentReport } from "../api/paymentReports";
import DataTable, { type Column } from "../../../components/ui/DataTable";
import Pagination from "../../../components/ui/Pagination";
import { formatDate } from "../../../lib/utils";

interface PaymentReportsTableProps {
  reports: PaymentReport[];
  loading: boolean;
  error: string | null;
  onReviewReport: (report: PaymentReport) => void;
  onRefresh: () => void;
}

export default function PaymentReportsTable({
  reports,
  loading,
  error,
  onReviewReport,
  onRefresh,
}: PaymentReportsTableProps) {
  // Filters
  const [statusFilter, setStatusFilter] = useState<"All" | "Pending" | "Accepted" | "Denied">("All");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);



  // Client-side search & status filtering logic
  const filteredReports = useMemo(() => {
    let result = reports;

    // Filter by status tab
    if (statusFilter !== "All") {
      const statusMap: Record<string, number> = { Pending: 0, Accepted: 1, Denied: 2 };
      const targetStatus = statusMap[statusFilter];
      result = reports.filter((report) => report.status === targetStatus);
    }

    if (!debouncedSearch) return result;

    const query = debouncedSearch.toLowerCase();
    return result.filter((report) => {
      const idStr = String(report.reportId).toLowerCase();
      const txIdStr = report.paymentId ? String(report.paymentId).toLowerCase() : "";
      const nameStr = report.username ? report.username.toLowerCase() : "";
      const emailStr = report.email ? report.email.toLowerCase() : "";
      const reasonStr = report.userExplanation ? report.userExplanation.toLowerCase() : "";

      return (
        idStr.includes(query) ||
        txIdStr.includes(query) ||
        nameStr.includes(query) ||
        emailStr.includes(query) ||
        reasonStr.includes(query)
      );
    });
  }, [reports, statusFilter, debouncedSearch]);

  // Pagination calculations
  const totalCount = filteredReports.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let p = startPage; p <= endPage; p++) {
      pages.push(p);
    }
    return pages;
  }, [currentPage, totalPages]);

  const paginatedReports = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredReports.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredReports, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1);
  };

  // Helper to format currency
  const formatAmount = (amount: number) => {
    try {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(amount);
    } catch {
      return `${amount} VND`;
    }
  };

  // DataTable column definitions
  const columns: Column<PaymentReport>[] = [
    {
      header: "ID",
      render: (r) => <span className="font-semibold text-gray-900">#{r.reportId}</span>,
      cellClassName: "px-6 py-4 text-sm whitespace-nowrap w-20",
    },
    {
      header: "Transaction ID",
      render: (r) => <span className="font-mono text-xs text-gray-500">{r.paymentId || "—"}</span>,
      cellClassName: "px-6 py-4 text-sm whitespace-nowrap w-40",
    },
    {
      header: "Reporter",
      render: (r) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-800 text-xs">{r.username || "Unknown"}</span>
          {r.email && (
            <span className="text-[10px] text-gray-400 truncate max-w-[150px]">{r.email}</span>
          )}
        </div>
      ),
      cellClassName: "px-6 py-4 text-sm whitespace-nowrap",
    },
    {
      header: "Amount",
      render: (r) => <span className="font-bold text-gray-950">{formatAmount(r.amount)}</span>,
      cellClassName: "px-6 py-4 text-sm whitespace-nowrap",
    },
    {
      header: "Reason Reported",
      render: (r) => (
        <p className="text-xs text-gray-650 max-w-xs md:max-w-md truncate" title={r.userExplanation}>
          {r.userExplanation}
        </p>
      ),
      cellClassName: "px-6 py-4 text-sm",
    },
    {
      header: "Date Reported",
      render: (r) => <span className="text-xs text-gray-500 font-medium">{formatDate(r.createDate)}</span>,
      cellClassName: "px-6 py-4 text-sm whitespace-nowrap",
    },
    {
      header: "Status",
      render: (r) => {
        let styles = "";
        let icon = null;
        let text = "";
        switch (r.status) {
          case 0:
            styles = "bg-warning-50 text-warning-700 border-warning-100";
            icon = <AlertTriangle className="w-3.5 h-3.5 text-warning-600" />;
            text = "Pending";
            break;
          case 1:
            styles = "bg-success-50 text-success-700 border-success-100";
            icon = <CheckCircle className="w-3.5 h-3.5 text-success-600" />;
            text = "Accepted";
            break;
          case 2:
            styles = "bg-error-50 text-error-700 border-error-100";
            icon = <Ban className="w-3.5 h-3.5 text-error-600" />;
            text = "Denied";
            break;
        }
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold ${styles}`}>
            {icon}
            {text}
          </span>
        );
      },
      cellClassName: "px-6 py-4 text-sm whitespace-nowrap w-28",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Filters & Search Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between p-4 bg-orange-50/50 border border-orange-100/60 rounded-2xl">
        {/* Status Filter Tab Pills */}
        <div className="flex items-center bg-gray-100/80 p-1 rounded-xl self-start">
          {(["All", "Pending", "Accepted", "Denied"] as const).map((tab) => {
            const isActive = statusFilter === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setStatusFilter(tab);
                  setCurrentPage(1);
                }}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 focus:outline-none ${isActive
                  ? "bg-white text-primary shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
                  }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Search & Actions */}
        <div className="flex flex-1 max-w-xl items-center gap-3 self-stretch lg:self-auto">
          {/* Live Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search reports by ID, transaction, user, reason..."
              className="w-full pl-10 pr-9 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 text-gray-400"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            title="Refresh payment reports"
            className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-650 disabled:opacity-40 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-primary" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={paginatedReports}
        keyExtractor={(r) => r.reportId}
        loading={loading}
        emptyMessage={
          searchInput
            ? `No reports matching "${searchInput}" found.`
            : `No ${statusFilter === "All" ? "" : statusFilter.toLowerCase()} payment reports available.`
        }
        error={error}
        onRowClick={(r) => onReviewReport(r)}
        renderActions={(r) => (
          <button
            type="button"
            onClick={() => onReviewReport(r)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all whitespace-nowrap bg-white hover:bg-gray-50 border-gray-200 text-gray-700"
          >
            {r.status === 0 ? (
              <>
                Process
                <ArrowRight className="w-3.5 h-3.5 text-primary" />
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-gray-400" />
                View Details
              </>
            )}
          </button>
        )}
      />

      {/* Pagination Footer */}
      {totalCount > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageNumbers={pageNumbers}
          totalCount={totalCount}
          itemsPerPage={itemsPerPage}
          entityName="reports"
          disabled={loading || totalCount === 0}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
}
