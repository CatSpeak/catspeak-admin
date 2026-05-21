import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useInstructorApplications } from "../hooks/useInstructorApplications";
import ApplicationStatusBadge from "./ApplicationStatusBadge";
import DataTable, { type Column } from "../../../components/ui/DataTable";
import Pagination from "../../../components/ui/Pagination";
import { formatDateLong } from "../../../lib/utils";
import type { InstructorApplication, ApplicationStatus } from "../types";

const STATUS_OPTIONS: { label: string; value: ApplicationStatus | "" }[] = [
  { label: "All Statuses", value: "" },
  { label: "Pending", value: "Pending" },
  { label: "Approved", value: "Approved" },
  { label: "Rejected", value: "Rejected" },
  { label: "Request Edit", value: "RequestEdit" },
];

const columns: Column<InstructorApplication>[] = [
  {
    header: "#",
    render: (app) => <span className="font-medium text-gray-900">{app.profileId}</span>,
  },
  {
    header: "Full Name",
    render: (app) => (
      <div>
        <div className="text-sm font-medium text-gray-900">{app.fullName}</div>
        <div className="text-xs text-gray-500">{app.username}</div>
      </div>
    ),
  },
  {
    header: "Email",
    render: (app) => <span className="text-primary underline">{app.accountEmail}</span>,
  },
  {
    header: "Phone",
    render: (app) => app.phoneNumber || "—",
  },
  {
    header: "Submitted",
    render: (app) => (
      <span className="whitespace-nowrap text-gray-600">{formatDateLong(app.submittedAt)}</span>
    ),
  },
  {
    header: "Status",
    render: (app) => <ApplicationStatusBadge status={app.status} />,
  },
];

export default function ApplicationTable() {
  const navigate = useNavigate();
  const {
    applications,
    loading,
    error,
    currentPage,
    pageSize,
    totalPages,
    totalCount,
    search,
    statusFilter,
    pageNumbers,
    goToPage,
    changePageSize,
    changeStatus,
    changeSearch,
  } = useInstructorApplications();

  return (
    <div className="space-y-4 py-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-lg bg-orange-50 border border-accent/20">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => changeSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) =>
            changeStatus(e.target.value as ApplicationStatus | "")
          }
          className="px-3 py-2 text-sm rounded border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary sm:w-44"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        columns={columns}
        data={applications}
        keyExtractor={(app) => app.profileId}
        loading={loading}
        loadingMessage="Loading applications..."
        emptyMessage="No applications found."
        error={error}
        onRowClick={(app) =>
          navigate(`/instructor-applications/${app.profileId}`)
        }
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageNumbers={pageNumbers}
        totalCount={totalCount}
        itemsPerPage={pageSize}
        entityName="applications"
        pageSizeOptions={[10, 20, 50, 100]}
        disabled={!applications.length}
        onPageChange={goToPage}
        onPageSizeChange={changePageSize}
      />
    </div>
  );
}
