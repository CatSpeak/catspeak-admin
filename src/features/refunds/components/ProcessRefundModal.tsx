import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  User,
  Mail,
  MessageSquare,
  ExternalLink,
  CreditCard,
  Building,
  Hash,
  Send,
  AlertTriangle,
} from "lucide-react";
import type { PaymentRefund } from "../api/refundsApi";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import { getApiErrorMessage } from "../../../lib/axios";
import { formatAmount, formatDateTime } from "../../../lib/utils";
import { useLanguage } from "../../../stores/languageStore";

interface ProcessRefundModalProps {
  refund: PaymentRefund | null;
  isOpen: boolean;
  onClose: () => void;
  onProcess: (action: "Approve" | "Reject", reason: string) => Promise<void>;
  isProcessing: boolean;
}

export default function ProcessRefundModal({
  refund,
  isOpen,
  onClose,
  onProcess,
  isProcessing,
}: ProcessRefundModalProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const [action, setAction] = useState<"Approve" | "Reject">("Approve");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Suggested default reasons
  const approvePresets = [
    "Đủ điều kiện hoàn tiền theo chính sách hệ thống.",
    "Giao dịch sự cố, xác nhận hoàn tiền qua PayOS.",
  ];

  const rejectPresets = [
    "Tài khoản đã sử dụng quá thời lượng cho phép hoàn tiền.",
    "Yêu cầu không đủ điều kiện theo chính sách hoàn tiền.",
    "Thông tin tài khoản ngân hàng thụ hưởng không đúng.",
  ];

  // Focus trap & ESC key handling
  useEffect(() => {
    if (!isOpen) return;

    setAction("Approve");
    setReason("Đủ điều kiện hoàn tiền theo chính sách.");
    setError(null);

    const previouslyActive = document.activeElement as HTMLElement;
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      previouslyActive?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen || !refund) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      setError("Vui lòng nhập lý do xử lý yêu cầu hoàn tiền.");
      return;
    }

    if (trimmedReason.length < 3) {
      setError("Lý do quá ngắn. Vui lòng nhập thông tin chi tiết hơn.");
      return;
    }

    try {
      await onProcess(action, trimmedReason);
      onClose();
    } catch (err: unknown) {
      setError(
        getApiErrorMessage(err, "Không thể xử lý yêu cầu hoàn tiền. Vui lòng thử lại.")
      );
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <Badge title="Pending (Chờ duyệt)" type="Yellow" showDot />;
      case 1:
        return <Badge title="Approved (Đã hoàn tiền)" type="Green" showDot />;
      case 2:
        return <Badge title="Rejected (Từ chối)" type="Red" showDot />;
      case 3:
        return <Badge title="Failed (Lỗi chuyển khoản)" type="Orange" showDot />;
      default:
        return <Badge title="Unknown" type="Gray" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="refund-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        ref={modalRef}
        className="relative bg-white rounded-3xl w-full max-w-xl shadow-2xl flex flex-col z-10 overflow-hidden border border-gray-100 max-h-[90vh] my-auto animate-fade-in"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2
                id="refund-modal-title"
                className="text-lg font-bold text-gray-900 leading-tight"
              >
                Chi tiết yêu cầu hoàn tiền #{refund.refundId}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Mã giao dịch gốc: <span className="font-semibold text-gray-700">#{refund.paymentId}</span>
              </p>
            </div>
          </div>

          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-200/80 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-rose-50 text-rose-700 text-xs border border-rose-200 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <div className="flex-1 whitespace-pre-wrap">{error}</div>
            </div>
          )}

          {/* Refund Details Grid */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/70 space-y-4">
            {/* Top row: Status & Date */}
            <div className="flex flex-wrap justify-between items-center gap-2 pb-3 border-b border-gray-200/70">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Trạng thái hiện tại
                </span>
                <div className="mt-1">{getStatusBadge(refund.status)}</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Ngày yêu cầu
                </span>
                <span className="text-xs text-gray-600 font-medium flex items-center justify-end gap-1 mt-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  {formatDateTime(refund.createDate)}
                </span>
              </div>
            </div>

            {/* Middle section: Student & Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Học viên yêu cầu
                </span>
                <div className="space-y-0.5 mt-1">
                  <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    {refund.username || "N/A"}
                  </span>
                  {refund.email && (
                    <span className="text-[11px] text-gray-500 flex items-center gap-1.5 break-all">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      {refund.email}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate(`/users/${refund.userId}`);
                    }}
                    className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg border border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all shadow-sm cursor-pointer"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Xem hồ sơ học viên (ID: {refund.userId})
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Số tiền hoàn trả
                </span>
                <span className="text-xl font-extrabold text-emerald-600 block mt-1">
                  {formatAmount(refund.amountVnd)}
                </span>
                <span className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">
                  {refund.paymentType || "Subscription"}
                </span>
              </div>
            </div>

            {/* Bank details card */}
            <div className="pt-3 border-t border-gray-200/70">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                Thông tin ngân hàng nhận tiền hoàn
              </span>
              <div className="bg-white p-3.5 rounded-xl border border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 block font-medium">Mã Ngân Hàng (BIN)</span>
                  <span className="font-mono font-bold text-gray-800 flex items-center gap-1 mt-0.5">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    {refund.bankBin}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-medium">Số Tài Khoản</span>
                  <span className="font-mono font-bold text-indigo-600 flex items-center gap-1 mt-0.5">
                    <Hash className="w-3.5 h-3.5 text-indigo-400" />
                    {refund.accountNumber}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-medium">Chủ Tài Khoản</span>
                  <span className="font-bold text-gray-900 uppercase mt-0.5 block truncate" title={refund.accountHolderName}>
                    {refund.accountHolderName}
                  </span>
                </div>
              </div>
            </div>

            {/* User Reason */}
            <div className="pt-3 border-t border-gray-200/70">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Lý do xin hoàn tiền
              </span>
              <div className="mt-1 flex items-start gap-2 bg-white p-3 rounded-xl border border-gray-200">
                <MessageSquare className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-700 leading-relaxed font-medium">
                  {refund.reason || "Không ghi lý do."}
                </p>
              </div>
            </div>
          </div>

          {/* Form Action Section if Pending (status === 0) */}
          {refund.status === 0 ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Decision Toggle */}
              <div className="space-y-2">
                <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Quyết định xử lý <span className="text-rose-500">*</span>
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setAction("Approve");
                      setReason(approvePresets[0]);
                    }}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                      action === "Approve"
                        ? "border-emerald-500 bg-emerald-50/60 text-emerald-700 shadow-sm font-bold"
                        : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50 font-medium"
                    }`}
                  >
                    <CheckCircle2
                      className={`w-6 h-6 mb-1 ${
                        action === "Approve" ? "text-emerald-600" : "text-gray-400"
                      }`}
                    />
                    <span className="text-xs">Phê duyệt & Chuyển tiền</span>
                    <span className="text-[10px] text-gray-400 mt-0.5 font-normal">
                      Tự động payout qua PayOS
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAction("Reject");
                      setReason(rejectPresets[0]);
                    }}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                      action === "Reject"
                        ? "border-rose-500 bg-rose-50/60 text-rose-700 shadow-sm font-bold"
                        : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50 font-medium"
                    }`}
                  >
                    <XCircle
                      className={`w-6 h-6 mb-1 ${
                        action === "Reject" ? "text-rose-600" : "text-gray-400"
                      }`}
                    />
                    <span className="text-xs">Từ chối hoàn tiền</span>
                    <span className="text-[10px] text-gray-400 mt-0.5 font-normal">
                      Hủy bỏ yêu cầu của học viên
                    </span>
                  </button>
                </div>
              </div>

              {/* Warning for Approve Action */}
              {action === "Approve" && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Chú ý:</strong> Khi chọn Phê duyệt, hệ thống sẽ thực hiện gọi API PayOS Payout để chuyển số tiền <strong>{formatAmount(refund.amountVnd)}</strong> đến tài khoản <strong>{refund.accountNumber} ({refund.accountHolderName})</strong> và thu hồi quyền lợi gói học.
                  </span>
                </div>
              )}

              {/* Preset buttons */}
              <div className="space-y-1.5">
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Mẫu lý do nhanh
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(action === "Approve" ? approvePresets : rejectPresets).map(
                    (preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setReason(preset)}
                        className="text-[11px] px-2.5 py-1 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 text-gray-700 font-medium transition-colors cursor-pointer"
                      >
                        {preset}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Reason textarea */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Lý do phản hồi cho học viên <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ghi rõ lý do xử lý hoàn tiền..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none font-medium text-gray-800"
                />
              </div>
            </form>
          ) : (
            /* Processed Info (status 1, 2, 3) */
            <div className="p-4 rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 space-y-3 text-xs">
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Lịch sử xử lý admin
              </span>
              <div className="flex items-center gap-2">
                {getStatusBadge(refund.status)}
                {refund.processedAt && (
                  <span className="text-gray-500 font-medium">
                    vào lúc {formatDateTime(refund.processedAt)}
                  </span>
                )}
              </div>
              {refund.adminResponseReason && (
                <div className="p-3 rounded-xl bg-white border border-gray-200 text-gray-700">
                  <span className="font-bold text-gray-900 block mb-1">Lý do xử lý:</span>
                  {refund.adminResponseReason}
                </div>
              )}
              {refund.payOSReferenceId && (
                <div className="text-gray-600 font-mono text-[11px]">
                  <strong>PayOS Reference ID:</strong> {refund.payOSReferenceId}
                </div>
              )}
              {refund.processedBy && (
                <span className="text-[11px] text-gray-400 block">
                  Người thực hiện: <strong>{refund.processedBy}</strong>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 bg-gray-50 border-t border-gray-100 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isProcessing}
            className="cursor-pointer"
          >
            {t.common.close}
          </Button>
          {refund.status === 0 && (
            <Button
              variant={action === "Approve" ? "primary" : "danger"}
              size="sm"
              onClick={handleSubmit}
              isLoading={isProcessing}
              disabled={isProcessing}
              className="shadow-sm font-semibold cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              {action === "Approve" ? "Xác nhận & Chuyển khoản" : "Xác nhận Từ chối"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
