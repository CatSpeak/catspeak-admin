import { useParams, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useUserDetail } from "../hooks/useUserDetail";
import { useUserPayments } from "../hooks/useUserPayments";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Globe,
  BookOpen,
  Award,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  AlertTriangle
} from "lucide-react";

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading, error } = useUserDetail(id);
  const { payments, loading: paymentsLoading, error: paymentsError } = useUserPayments(id);

  // Calculate transaction stats
  const stats = useMemo(() => {
    let totalSpent = 0;
    let successfulCount = 0;
    let cancelledCount = 0;
    let pendingCount = 0;

    payments.forEach((p) => {
      if (p.status === 1) {
        totalSpent += p.amount;
        successfulCount++;
      } else if (p.status === 2) {
        cancelledCount++;
      } else {
        pendingCount++;
      }
    });

    return {
      totalSpent,
      successfulCount,
      cancelledCount,
      pendingCount,
      totalCount: payments.length,
    };
  }, [payments]);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in pb-12">
        {/* Header Breadcrumb Skeleton */}
        <div className="flex flex-col gap-2">
          <div className="h-3 bg-gray-200 rounded animate-pulse w-32" />
          <div className="flex items-center justify-between gap-4">
            <div className="h-7 bg-gray-200 rounded animate-pulse w-48" />
            <div className="h-10 bg-gray-200 rounded-xl animate-pulse w-24 shrink-0" />
          </div>
        </div>

        {/* Profile Banner Skeleton */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gray-200 animate-pulse shrink-0" />
          <div className="flex-1 space-y-3 w-full">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <div className="h-7 bg-gray-200 rounded animate-pulse w-48" />
              <div className="h-5 bg-gray-200 rounded-full animate-pulse w-16" />
              <div className="h-5 bg-gray-200 rounded-full animate-pulse w-16" />
            </div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-64 mx-auto md:mx-0" />
            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-40" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
            </div>
          </div>
        </div>

        {/* Info Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="h-5 bg-gray-200 rounded animate-pulse w-36 mb-6" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
                <div className="w-8 h-8 rounded-xl bg-gray-200 animate-pulse shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-20" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                </div>
              </div>
            ))}
          </div>
          {/* Card 2 */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="h-5 bg-gray-200 rounded animate-pulse w-36 mb-6" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
                <div className="w-8 h-8 rounded-xl bg-gray-200 animate-pulse shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-20" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Section Skeleton */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="h-5 bg-gray-200 rounded animate-pulse w-44" />

          {/* Stats Boxes Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-200 animate-pulse shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-16" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
                </div>
              </div>
            ))}
          </div>

          {/* Table Skeleton */}
          <div className="overflow-hidden rounded-2xl border border-gray-200">
            <div className="h-10 bg-gray-100 w-full animate-pulse border-b border-gray-200" />
            <div className="divide-y divide-gray-150 bg-white">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-5 py-4 flex gap-4 items-center">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-28" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-20" />
                  </div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
                  <div className="h-5 bg-gray-200 rounded-full animate-pulse w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 text-error-600">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-semibold">{error ?? "User not found"}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Breadcrumb & Action Header */}
      <div className="flex flex-col gap-2">
        <nav className="flex items-center text-xs font-semibold tracking-wider text-gray-400">
          <span
            onClick={() => navigate("/users")}
            className="cursor-pointer hover:text-primary transition-colors"
          >
            Users
          </span>
          <ChevronRight className="w-3.5 h-3.5 mx-1" />
          <span className="text-gray-600">User Profile</span>
        </nav>

        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            User details
          </h1>

          <button
            onClick={() => navigate("/users")}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold rounded-xl text-white shadow-sm hover:shadow transition-all bg-primary hover:bg-primary-dark shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </div>

      {/* Profile Banner */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6 transition-all hover:shadow-md">
        {/* Avatar Frame with Gradient */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary to-primary-light text-white text-3xl font-extrabold flex items-center justify-center shrink-0 shadow-inner">
          {user.username ? user.username.substring(0, 2).toUpperCase() : "US"}
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
            <h2 className="text-2xl font-bold text-gray-900 leading-tight">
              {user.username}
            </h2>
            <span className="inline-flex px-2.5 py-0.5 rounded-full border border-primary/20 text-[10px] font-bold text-primary bg-primary/5 capitalize">
              {user.roleName || "User"}
            </span>
            <span className={`inline-flex px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${user.status !== 0
              ? "bg-success-50 text-success-700 border-success-100"
              : "bg-error-50 text-error-700 border-error-100"
              }`}>
              {user.status !== 0 ? "Active" : "Banned"}
            </span>
          </div>

          <p className="text-sm text-gray-500 font-medium flex items-center justify-center md:justify-start gap-1.5">
            <Mail className="w-4 h-4 text-gray-400" />
            {user.email}
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-xs text-gray-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Last active: {user.lastSeen ? new Date(user.lastSeen).toLocaleString("en-GB") : "Never"}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Joined: {user.createDate ? new Date(user.createDate).toLocaleDateString("en-GB") : "Unknown"}
            </span>
          </div>
        </div>
      </div>

      {/* Information Section (Side-by-side grids) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information Card */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2 tracking-tight">
            <User className="w-5 h-5 text-primary" />
            Personal Information
          </h3>
          <div className="space-y-4">
            <DetailItem icon={<Clock className="w-4 h-4" />} label="Account ID" value={`#${user.accountId}`} />
            <DetailItem icon={<Mail className="w-4 h-4" />} label="Email Address" value={user.email} copyable />
            <DetailItem icon={<Phone className="w-4 h-4" />} label="Phone Number" value={user.phoneNumber || "Not registered"} />
            <DetailItem icon={<Calendar className="w-4 h-4" />} label="Created Date" value={user.createDate ? new Date(user.createDate).toLocaleDateString("en-GB", { day: 'numeric', month: 'long', year: 'numeric' }) : "Unknown"} />
          </div>
        </div>

        {/* Learning Settings Card */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2 tracking-tight">
            <BookOpen className="w-5 h-5 text-primary" />
            Learning Settings
          </h3>
          <div className="space-y-4">
            <DetailItem icon={<Globe className="w-4 h-4" />} label="Native Language" value={user.naturalLanguage || "Not specified"} />
            <DetailItem icon={<BookOpen className="w-4 h-4" />} label="Learning Language" value={user.languageLearning || "Not specified"} />
            <DetailItem icon={<Award className="w-4 h-4" />} label="Proficiency Level" value={user.proficiency || "Not specified"} />
            <DetailItem icon={<Globe className="w-4 h-4" />} label="Region / Country" value={user.country || "Vietnam"} />
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2 tracking-tight">
          <CreditCard className="w-5 h-5 text-primary" />
          Payment History
        </h3>

        {/* Dynamic Aggregated Metrics */}
        {!paymentsLoading && !paymentsError && payments && payments.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success-50 text-success-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Spent</span>
                <span className="text-base font-bold text-success-700 block mt-0.5">
                  {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(stats.totalSpent)}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Orders</span>
                <span className="text-base font-bold text-gray-900 block mt-0.5">
                  {stats.totalCount} ({stats.successfulCount} Success)
                </span>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-error-50 text-error-600 flex items-center justify-center shrink-0">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Cancelled Orders</span>
                <span className="text-base font-bold text-error-700 block mt-0.5">
                  {stats.cancelledCount} Orders
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Transaction History Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 bg-white">
                {paymentsLoading ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-gray-500 font-semibold">Loading payments history...</span>
                      </div>
                    </td>
                  </tr>
                ) : paymentsError ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-sm text-error-600 font-semibold">
                      {paymentsError}
                    </td>
                  </tr>
                ) : payments && payments.length > 0 ? (
                  payments.map((payment, idx) => {
                    let statusStyles = "";
                    let statusText = "";
                    switch (payment.status) {
                      case 1:
                        statusStyles = "bg-success-50 text-success-700 border-success-100";
                        statusText = "Success";
                        break;
                      case 2:
                        statusStyles = "bg-error-50 text-error-700 border-error-100";
                        statusText = "Cancelled";
                        break;
                      default:
                        statusStyles = "bg-warning-50 text-warning-700 border-warning-100";
                        statusText = "Pending";
                    }

                    return (
                      <tr
                        key={payment.paymentId}
                        className={`hover:bg-gray-50/50 transition-colors ${idx % 2 === 0 ? "bg-gray-50/20" : "bg-white"
                          }`}
                      >
                        <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap font-medium">
                          {new Date(payment.createDate).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-5 py-4 text-xs">
                          <div className="font-bold text-gray-900 text-xs">
                            {payment.method}
                          </div>
                          <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                            Code: {payment.orderCode}
                          </div>
                          {payment.adminNote && (
                            <div className="mt-2 text-[10px] text-gray-600 italic bg-gray-50 p-2 rounded-xl border border-gray-200 leading-normal max-w-sm">
                              {payment.adminNote}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4 text-xs font-bold text-gray-900">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(payment.amount)}
                        </td>
                        <td className="px-5 py-4 text-xs">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${statusStyles}`}>
                            {statusText}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-8 text-center text-sm text-gray-500 font-medium"
                    >
                      No payments history found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  icon,
  label,
  value,
  copyable = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  copyable?: boolean;
}) {
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gray-50 text-gray-500 shrink-0 border border-gray-100">
          {icon}
        </div>
        <div>
          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {label}
          </span>
          <span className="block text-sm font-bold text-gray-800 mt-0.5">
            {value}
          </span>
        </div>
      </div>
      {copyable && value && (
        <button
          onClick={handleCopy}
          title="Copy value"
          className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
          </svg>
        </button>
      )}
    </div>
  );
}
