import { MoreVertical, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePaginatedUsers } from "../hooks/usePaginatedUsers";
import Card from "../../../components/ui/Card";

const FILTER_TEXT_PLACEHOLDERS = [
  "User's Name",
  "User's mail",
  "User's phone",
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

const TABLE_HEADERS = [
  "ID",
  "User Name",
  "Gmail",
  "Phone Number",
  "Date Joined",
  "Country",
  "Level",
  "Last Active",
];

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString() : "—";
}

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
    goToPage,
    changeItemsPerPage,
  } = usePaginatedUsers();

  const handleItemsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    changeItemsPerPage(Number(e.target.value));
  };

  const handleRowClick = (accountId: number) => {
    navigate(`/users/${accountId}`);
  };

  if (loading) {
    return (
      <Card className="flex h-64 items-center justify-center">
         <span className="text-gray-500">Loading...</span>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-600 px-4 py-3 text-sm">
          {error}
        </div>
      )}

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

      <Card noPadding className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-primary text-white">
              <tr>
                {TABLE_HEADERS.map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
                <th className="px-4 py-3 text-center text-xs font-bold w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {accounts.length === 0 ? (
                <tr>
                  <td
                    colSpan={12}
                    className="px-4 py-8 text-center text-sm text-gray-500"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                accounts.map((account, idx) => (
                  <tr
                    key={account.accountId}
                    onClick={() => handleRowClick(account.accountId)}
                    className={`hover:bg-gray-50 transition-colors cursor-pointer ${idx % 2 === 0 ? "bg-gray-50/50" : "bg-white"}`}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {account.accountId}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{account.username}</td>
                    <td className="px-4 py-3 text-sm text-primary underline">
                      {account.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {account.phoneNumber || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {formatDate(account.createDate)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 text-xs rounded bg-primary text-white font-medium">
                        {account.country || "Việt Nam"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-700">
                        {account.level || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {formatDate(account.lastSeen)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        className="p-1 hover:bg-gray-200 rounded transition-colors text-gray-500"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 rounded-lg bg-orange-50 border border-orange-100 gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">
            Rows per page:
          </span>
          <select
            className="px-2 py-1 text-sm rounded border border-gray-300 bg-white focus:outline-none"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
          >
            <option value={10}>10</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
          </select>
          <span className="text-sm ml-2 text-gray-600">
            Total: {totalCount} users
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={!accounts.length || currentPage === 1}
            className="p-1.5 rounded transition-colors disabled:opacity-40 text-primary hover:bg-primary/10 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1">
            {pageNumbers.map((page) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  currentPage === page ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={!accounts.length || currentPage === totalPages}
            className="p-1.5 rounded transition-colors disabled:opacity-40 text-primary hover:bg-primary/10 disabled:hover:bg-transparent"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
