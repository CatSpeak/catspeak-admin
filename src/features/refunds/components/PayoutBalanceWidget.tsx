import { useState, useEffect, useCallback } from "react";
import { Wallet, RefreshCw, AlertCircle, Building2 } from "lucide-react";
import { getPayoutBalance, type PayoutBalanceData } from "../api/refundsApi";
import { formatAmount } from "../../../lib/utils";
import Button from "../../../components/ui/Button";
import { useLanguage } from "../../../stores/languageStore";

export default function PayoutBalanceWidget() {
  const { t } = useLanguage();
  const [payoutInfo, setPayoutInfo] = useState<PayoutBalanceData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPayoutBalance();
      if (res.data) {
        setPayoutInfo(res.data);
      } else {
        setError(res.desc || "Failed to load payout balance");
      }
    } catch (err: unknown) {
      console.error("Error loading PayOS payout balance:", err);
      setError("Unable to connect to PayOS payout account.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const rawBalance = payoutInfo?.balance ? Number(payoutInfo.balance) : 0;

  return (
    <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 shadow-xl border border-slate-700/50 overflow-hidden">
      {/* Decorative Background Accents */}
      <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Section: Account & Title Info */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-400 flex items-center justify-center shrink-0 shadow-inner">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                PayOS Payout Gateway
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </span>
            </div>

            {loading ? (
              <div className="mt-2 h-7 w-48 bg-slate-700/60 rounded-lg animate-pulse" />
            ) : error ? (
              <div className="flex items-center gap-2 mt-2 text-xs text-rose-300 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            ) : (
              <div className="mt-1">
                <p className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                  {formatAmount(rawBalance)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Middle / Details Section */}
        {payoutInfo && !loading && !error && (
          <div className="flex flex-wrap items-center gap-4 py-2 px-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-medium">
                  Tài khoản chi (Payout)
                </span>
                <span className="font-semibold text-slate-200">
                  {payoutInfo.accountName}
                </span>
              </div>
            </div>
            <div className="h-6 w-px bg-slate-700 hidden sm:block" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-medium">
                Số tài khoản
              </span>
              <span className="font-mono font-semibold text-indigo-300">
                {payoutInfo.accountNumber}
              </span>
            </div>
          </div>
        )}

        {/* Right Section: Action Button */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBalance}
            disabled={loading}
            className="!border-slate-700 !bg-slate-800/80 !text-slate-200 hover:!bg-slate-700 hover:!text-white transition-all cursor-pointer shadow-sm"
          >
            <RefreshCw
              className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin text-indigo-400" : ""}`}
            />
            <span>{t.common.refresh || "Làm mới số dư"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
