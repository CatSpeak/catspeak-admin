import { useNavigate } from "react-router-dom";
import { usePaginatedStaffs } from "../hooks/usePaginatedStaffs";
import DataTable, { type Column } from "../../../components/ui/DataTable";
import Pagination from "../../../components/ui/Pagination";
import StaffActionMenu from "./StaffActionMenu";
import { formatDate } from "../../../lib/utils";
import type { Account } from "../../../entities/types";

const FILTER_TEXT_PLACEHOLDERS = [
  "Staff's Name",
  "Staff's mail",
  "Staff's phone",
  "Time range of creation",
];

const FILTER_SELECT_PLACEHOLDERS = [
  "Payment range",
  "Last login time",
  "Visit Duration",
  "Proficiency",
  "Language learning",
  "Natural language",
];

const columns: Column<Account>[] = [
  {
    header: "ID",
    render: (a) => <span className="font-medium text-gray-900">{a.accountId}</span>,
  },
  {
    header: "Staff Name",
    render: (a) => a.username,
  },
  {
    header: "Gmail",
    render: (a) => <span className="text-primary underline">{a.email}</span>,
  },
  {
    header: "Phone Number",
    render: (a) => a.phoneNumber || "—",
  },
  {
    header: "Date Joined",
    render: (a) => formatDate(a.createDate),
  },
  {
    header: "Country",
    render: (a) => (
      <span className="inline-block px-2 py-0.5 text-xs rounded bg-primary text-white font-medium">
        {a.country || "Vietnam"}
      </span>
    ),
  },
  {
    header: "Community",
    render: (a) => <span className="font-medium text-gray-700">{a.level || "—"}</span>,
  },
  {
    header: "Visit Duration",
    render: (a) => a.visitDurationForStaff,
  },
];

export default function StaffTable() {
  const navigate = useNavigate();
  const {
    accounts,
    loading,
    error,
    currentPage,
    itemsPerPage,
    totalPages,
    totalCount,
    pageNumbers,
    goToPage,
    changeItemsPerPage,
  } = usePaginatedStaffs();

  return (
    <div className="space-y-4 py-8">
      {/* Filter Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 p-4 rounded-lg bg-orange-50 border border-accent/20">
        {FILTER_TEXT_PLACEHOLDERS.map((placeholder) => (
          <input
            key={placeholder}
            type="text"
            placeholder={placeholder}
            className="px-3 py-2 text-sm rounded border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
          />
        ))}
        {FILTER_SELECT_PLACEHOLDERS.map((placeholder) => (
          <select
            key={placeholder}
            className="px-3 py-2 text-sm rounded border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
            defaultValue=""
          >
            <option value="" disabled>
              {placeholder}
            </option>
          </select>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={accounts}
        keyExtractor={(a) => a.accountId}
        loading={loading}
        loadingMessage="Loading staffs..."
        emptyMessage="No staffs found"
        error={error}
        onRowClick={(a) => navigate(`/staffs/${a.accountId}`)}
        renderActions={(a) => <StaffActionMenu staffName={a.username} />}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageNumbers={pageNumbers}
        totalCount={totalCount}
        itemsPerPage={itemsPerPage}
        entityName="staffs"
        disabled={!accounts.length}
        onPageChange={goToPage}
        onPageSizeChange={changeItemsPerPage}
      />
    </div>
  );
}
