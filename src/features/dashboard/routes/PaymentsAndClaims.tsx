import { AlertCircle, RefreshCw } from "lucide-react";
import { useDashboardStats } from "../hooks/useDashboardStats";
import PaymentsDashboard from "../components/PaymentsDashboard";

export default function PaymentsAndClaims() {
  const {
    data: paymentStats,
    loading: paymentLoading,
    error: paymentError,
    refetch: refetchPayments,
  } = useDashboardStats();

  if (paymentLoading && !paymentStats) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 bg-white rounded-3xl border border-gray-200 shadow-sm">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
        <p className="text-sm font-medium text-gray-500">
          Retrieving payments statistics...
        </p>
      </div>
    );
  }

  if (paymentError) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 bg-white rounded-3xl border border-gray-200 shadow-sm p-6 text-center">
        <div className="p-3 bg-error-50 text-error-600 rounded-full">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div>
          <p className="text-base font-semibold text-gray-800">
            Failed to Load Dashboard Stats
          </p>
          <p className="text-sm text-gray-500 mt-1">{paymentError}</p>
        </div>
        <button
          onClick={refetchPayments}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-primary hover:bg-primary-dark text-white shadow-sm transition-all cursor-pointer"
        >
          <RefreshCw size={14} />
          Try Again
        </button>
      </div>
    );
  }

  return paymentStats ? (
    <PaymentsDashboard
      data={paymentStats}
      loading={paymentLoading}
      refetch={refetchPayments}
    />
  ) : null;
}
