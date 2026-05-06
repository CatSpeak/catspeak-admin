import { MoreVertical, Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePaginatedUsers } from "../hooks/usePaginatedUsers";
import DataTable, { type Column } from "../../../components/ui/DataTable";
import Pagination from "../../../components/ui/Pagination";
import { formatDate } from "../../../lib/utils";
import type { Account } from "../../../entities/types";

const LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced"];

// roleId mapping: 1 = Admin, 2 = Instructor, 3 = Staff, 4 = User (adjust to match backend)
const ROLE_OPTIONS = [
  { label: "User", value: 4 },
  { label: "Instructor", value: 2 },
  { label: "Staff", value: 3 },
];

const STATUS_OPTIONS = [
  { label: "Active", value: 1 },
  { label: "Banned", value: 0 },
];

const columns: Column<Account>[] = [
  {
    header: "ID",
    render: (a) => <span className="font-medium text-gray-900">{a.accountId}</span>,
  },
  {
    header: "Username",
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
        {a.country || "Việt Nam"}
      </span>
    ),
  },
  {
    header: "Level",
    render: (a) => <span className="font-medium text-gray-700">{a.level || "—"}</span>,
  },
  {
    header: "Role",
    render: (a) => (
      <span className="font-medium text-gray-700 capitalize">{a.roleName || "—"}</span>
    ),
  },
  {
    header: "Last Active",
    render: (a) => formatDate(a.lastSeen),
  },
];

export default function UserTable() {
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
    searchInput,
    roleId,
    level,
    status,
    goToPage,
    changeItemsPerPage,
    changeSearch,
    changeRoleId,
    changeLevel,
    changeStatus,
  } = usePaginatedUsers();

  const hasActiveFilters =
    searchInput !== "" ||
    roleId !== undefined ||
    level !== "" ||
    status !== undefined;

  const clearFilters = () => {
    changeSearch("");
    changeRoleId(undefined);
    changeLevel("");
    changeStatus(undefined);
  };

  return (
    <div className="space-y-4 py-8">
      {/* Filter Section */}
      <div className="p-4 rounded-lg bg-orange-50 border border-accent/20 space-y-3">
        {/* Row 1: search + selects */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search input (name / email / phone) */}
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => changeSearch(e.target.value)}
              placeholder="Search by name, email or phone…"
              className="w-full pl-9 pr-3 py-2 text-sm rounded border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Role filter */}
          <select
            value={roleId ?? ""}
            onChange={(e) =>
              changeRoleId(e.target.value === "" ? undefined : Number(e.target.value))
            }
            className="px-3 py-2 text-sm rounded border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">All Roles</option>
            {ROLE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>

          {/* Level filter */}
          <select
            value={level}
            onChange={(e) => changeLevel(e.target.value)}
            className="px-3 py-2 text-sm rounded border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">All Levels</option>
            {LEVEL_OPTIONS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        {/* Row 2: status + clear button */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={status ?? ""}
            onChange={(e) =>
              changeStatus(e.target.value === "" ? undefined : Number(e.target.value))
            }
            className="px-3 py-2 text-sm rounded border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-red-600 border border-gray-200 rounded bg-white hover:border-red-300 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Clear filters
            </button>
          )}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={accounts}
        keyExtractor={(a) => a.accountId}
        loading={loading}
        loadingMessage="Loading users..."
        emptyMessage="No users found"
        error={error}
        onRowClick={(a) => navigate(`/users/${a.accountId}`)}
        renderActions={() => (
          <button
            type="button"
            className="p-1 hover:bg-gray-200 rounded transition-colors text-gray-500"
            onClick={(event) => event.stopPropagation()}
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        )}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageNumbers={pageNumbers}
        totalCount={totalCount}
        itemsPerPage={itemsPerPage}
        entityName="users"
        disabled={!accounts.length}
        onPageChange={goToPage}
        onPageSizeChange={changeItemsPerPage}
      />
    </div>
  );
}
