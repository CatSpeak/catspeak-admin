import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { X, ShieldCheck, ShieldAlert, DollarSign, AlertCircle, Calendar, User, Mail, MessageSquare, ExternalLink } from "lucide-react";
import type { PaymentReport } from "../api/paymentReports";
import Button from "../../../components/ui/Button";
import { getApiErrorMessage } from "../../../lib/axios";

interface ProcessReportModalProps {
  report: PaymentReport | null;
  isOpen: boolean;
  onClose: () => void;
  onProcess: (action: "Accept" | "Deny", reason: string) => Promise<void>;
  isProcessing: boolean;
}

export default function ProcessReportModal({
  report,
  isOpen,
  onClose,
  onProcess,
  isProcessing,
}: ProcessReportModalProps) {
  const navigate = useNavigate();
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const [action, setAction] = useState<"Accept" | "Deny">("Accept");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Focus trap and Escape key listener
  useEffect(() => {
    if (!isOpen) return;

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

  if (!isOpen || !report) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      setError("Please provide a reason for this decision.");
      return;
    }

    if (trimmedReason.length < 5) {
      setError("Reason must be at least 5 characters long.");
      return;
    }

    try {
      await onProcess(action, trimmedReason);
      onClose();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to process the payment report."));
    }
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Dynamic Glass Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-[fadeIn_200ms_ease-out]"
        onClick={onClose}
      />

      {/* Modal Dialog Panel */}
      <div
        ref={modalRef}
        className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col z-10 overflow-hidden animate-[scaleIn_200ms_ease-out] border border-gray-100 max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5 text-primary stroke-[2]" />
            </div>
            <h2 id="modal-title" className="text-lg font-bold text-gray-900 leading-tight">
              Review Payment Report
            </h2>
          </div>

          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="flex gap-2 p-3.5 rounded-2xl bg-red-50 text-red-700 text-xs border border-red-100 font-medium animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Details Card */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-3.5">
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Report ID
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  #{report.reportId}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Report Date
                </span>
                <span className="text-xs text-gray-600 flex items-center justify-end gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  {new Date(report.createDate).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200/60">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Reporter (User ID: {report.userId})
                </span>
                <div className="space-y-0.5 mt-0.5">
                  <span className="text-xs font-semibold text-gray-800 flex items-center gap-1">
                    <User className="w-3 h-3 text-gray-400" />
                    {report.username || "N/A"}
                  </span>
                  {report.email && (
                    <span className="text-[11px] text-gray-500 flex items-center gap-1 break-all">
                      <Mail className="w-3 h-3 text-gray-400" />
                      {report.email}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate(`/users/${report.userId}`);
                    }}
                    className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg border border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all shadow-sm focus:outline-none"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View Profile
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Amount Reported
                </span>
                <span className="text-base font-bold text-primary block mt-0.5">
                  {formatAmount(report.amount)}
                </span>
                {report.paymentId && (
                  <span className="text-[10px] text-gray-500 font-medium block mt-0.5">
                    TxID: {report.paymentId}
                  </span>
                )}
              </div>
            </div>

            {/* Reported Explanation */}
            <div className="pt-3 border-t border-gray-200/60">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                User Report Explanation
              </span>
              <div className="mt-1 flex items-start gap-1.5 bg-white p-3 rounded-xl border border-gray-150">
                <MessageSquare className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-750 leading-normal">
                  {report.userExplanation || "No explanation provided"}
                </p>
              </div>
            </div>

            {/* Proof Document URL */}
            {report.proofUrl && (
              <div className="pt-3 border-t border-gray-200/60">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Attachment Proof
                </span>
                <a
                  href={report.proofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs text-primary hover:text-primary-dark hover:bg-gray-50 transition-colors font-bold shadow-sm"
                >
                  View Attachment Proof Document ↗
                </a>
              </div>
            )}
          </div>

          {/* Form section if report is pending (status is 0) */}
          {report.status === 0 ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Decision Type Buttons */}
              <div className="space-y-2">
                <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Action Decision <span className="text-red-500">*</span>
                </span>
                <div className="grid grid-cols-2 gap-3.5">
                  {/* Accept Option Card */}
                  <button
                    type="button"
                    onClick={() => setAction("Accept")}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-success-500/20 ${action === "Accept"
                      ? "border-success-500 bg-success-50/50 text-success-700 shadow-sm"
                      : "border-gray-200 bg-transparent text-gray-500 hover:bg-gray-50"
                      }`}
                  >
                    <ShieldCheck className={`w-6 h-6 mb-1 ${action === "Accept" ? "text-success-600 animate-pulse" : "text-gray-400"}`} />
                    <span className="text-sm font-bold">Accept Report</span>
                    <span className="text-[10px] text-gray-400 mt-0.5">Approve user request</span>
                  </button>

                  {/* Deny Option Card */}
                  <button
                    type="button"
                    onClick={() => setAction("Deny")}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-error-500/20 ${action === "Deny"
                      ? "border-error-500 bg-error-50/50 text-error-700 shadow-sm"
                      : "border-gray-200 bg-transparent text-gray-500 hover:bg-gray-50"
                      }`}
                  >
                    <ShieldAlert className={`w-6 h-6 mb-1 ${action === "Deny" ? "text-error-600 animate-pulse" : "text-gray-400"}`} />
                    <span className="text-sm font-bold">Deny Report</span>
                    <span className="text-[10px] text-gray-400 mt-0.5">Reject user claim</span>
                  </button>
                </div>
              </div>

              {/* Decision Reason Textarea */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Process Reason / Note <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={`Provide details on why this report was ${action === "Accept" ? "accepted" : "denied"}. Mention verification steps or communication with user...`}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none placeholder:text-gray-300 font-medium"
                />
              </div>
            </form>
          ) : (
            // Processed history details (status is 1 or 2)
            <div className="p-4 rounded-2xl border border-dashed border-gray-200 space-y-3">
              <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Processing Decision Details
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold ${report.status === 1
                    ? "bg-success-50 text-success-700 border border-success-100"
                    : "bg-error-50 text-error-700 border border-error-100"
                    }`}
                >
                  {report.status === 1 ? "Accepted" : "Denied"}
                </span>
                {report.processedAt && (
                  <span className="text-xs text-gray-500">
                    on {new Date(report.processedAt).toLocaleString()}
                  </span>
                )}
              </div>
              {report.adminResponseReason && (
                <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 font-medium">
                  <span className="font-bold text-gray-700 block mb-1">Reason:</span>
                  {report.adminResponseReason}
                </div>
              )}
              {report.processedBy && (
                <span className="text-[10px] text-gray-400 block font-medium">
                  Handled by {report.processedBy}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 bg-gray-50 border-t border-gray-100 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isProcessing}
          >
            Close
          </Button>
          {report.status === 0 && (
            <Button
              variant={action === "Accept" ? "primary" : "danger"}
              size="sm"
              onClick={handleSubmit}
              isLoading={isProcessing}
              disabled={isProcessing}
              className="shadow-sm font-semibold"
            >
              Confirm {action}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
