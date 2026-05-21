import { useState } from "react";
import { X, AlertTriangle, CheckCircle2, Edit3 } from "lucide-react";
import Button from "../../../components/ui/Button";
import type { BanDuration } from "../types";

export type ReviewAction = "approve" | "reject" | "requestEdit";

interface ReviewModalProps {
  action: ReviewAction;
  applicantName: string;
  isLoading: boolean;
  onConfirm: (opts: ReviewModalResult) => void;
  onClose: () => void;
}

export interface ReviewModalResult {
  action: ReviewAction;
  reason?: string;
  banDuration?: BanDuration;
  editNote?: string;
}

const BAN_DURATION_OPTIONS: { label: string; value: BanDuration }[] = [
  { label: "30 Days", value: "ThirtyDays" },
  { label: "6 Months", value: "SixMonths" },
  { label: "1 Year", value: "OneYear" },
  { label: "2 Years", value: "TwoYears" },
];

const ACTION_CONFIG = {
  approve: {
    title: "Approve Application",
    icon: <CheckCircle2 className="w-6 h-6 text-emerald-500" />,
    description: "This will approve the instructor profile and grant the user instructor access.",
    confirmLabel: "Approve",
    confirmVariant: "primary" as const,
    confirmClass: "!bg-emerald-600 hover:!bg-emerald-700",
  },
  reject: {
    title: "Reject Application",
    icon: <AlertTriangle className="w-6 h-6 text-red-500" />,
    description: "Please provide a reason for rejection and select a reapplication ban duration.",
    confirmLabel: "Reject",
    confirmVariant: "danger" as const,
    confirmClass: "",
  },
  requestEdit: {
    title: "Request Edit",
    icon: <Edit3 className="w-6 h-6 text-blue-500" />,
    description: "Write a note explaining what the applicant needs to update before resubmitting.",
    confirmLabel: "Send Request",
    confirmVariant: "primary" as const,
    confirmClass: "!bg-blue-600 hover:!bg-blue-700",
  },
};

export default function ReviewModal({
  action,
  applicantName,
  isLoading,
  onConfirm,
  onClose,
}: ReviewModalProps) {
  const [reason, setReason] = useState("");
  const [banDuration, setBanDuration] = useState<BanDuration>("ThirtyDays");
  const [editNote, setEditNote] = useState("");

  const config = ACTION_CONFIG[action];

  const handleSubmit = () => {
    onConfirm({
      action,
      ...(action === "reject" ? { reason, banDuration } : {}),
      ...(action === "requestEdit" ? { editNote } : {}),
    });
  };

  const isValid = () => {
    if (action === "reject") return reason.trim().length > 0;
    if (action === "requestEdit") return editNote.trim().length > 0;
    return true;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-gray-100">
          {config.icon}
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-gray-900">{config.title}</h2>
            <p className="text-xs text-gray-500 truncate">
              Applicant: <span className="font-medium text-gray-700">{applicantName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          <p className="text-sm text-gray-600">{config.description}</p>

          {action === "reject" && (
            <>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Explain why this application is being rejected..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent resize-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Ban Duration
                </label>
                <select
                  value={banDuration}
                  onChange={(e) => setBanDuration(e.target.value as BanDuration)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  {BAN_DURATION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400">
                  The user cannot reapply until this ban expires.
                </p>
              </div>
            </>
          )}

          {action === "requestEdit" && (
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Edit Note <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Describe what changes the applicant needs to make..."
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 pb-6">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant={config.confirmVariant}
            size="sm"
            className={config.confirmClass}
            onClick={handleSubmit}
            disabled={!isValid() || isLoading}
            isLoading={isLoading}
          >
            {config.confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
