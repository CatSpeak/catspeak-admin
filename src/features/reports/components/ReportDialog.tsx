import { useEffect, useState, useRef } from "react";
import {
  X,
  Trash2,
  Calendar,
  User,
  Globe,
  FileText,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { getLetterReportById, deleteLetterReport, type LetterReport } from "../api/letterReports";
import { useToastStore } from "../../../stores/toastStore";
import { formatDateTime } from "../../../lib/utils";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";

interface ReportDialogProps {
  id: string | number;
  onClose: () => void;
  onDeleteSuccess: () => void;
}

export default function ReportDialog({ id, onClose, onDeleteSuccess }: ReportDialogProps) {
  const { addToast } = useToastStore();
  const [report, setReport] = useState<LetterReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Fetch report details on mount/id change
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setConfirmDelete(false);

    getLetterReportById(id)
      .then((data) => {
        if (!active) return;
        setReport(data);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        console.error("Error loading letter report:", err);
        setError("Failed to load report details. Please try again.");
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  // Focus trap & Escape key listener
  useEffect(() => {
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
  }, [onClose]);

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setIsDeleting(true);
    try {
      await deleteLetterReport(id);
      addToast("success", `Report #${id} has been deleted successfully.`);
      onDeleteSuccess();
    } catch (err) {
      console.error("Error deleting report:", err);
      addToast("error", "Failed to delete the report. Please try again.");
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (r: LetterReport) => {
    const statusVal = r.status !== undefined ? r.status : r.decision;
    if (statusVal === 1 || statusVal === "innocent" || statusVal === "Innocent") {
      return <Badge title="Innocent" type="Green" />;
    }
    if (statusVal === 2 || statusVal === "violation" || statusVal === "Violation") {
      return <Badge title="Violation" type="Red" />;
    }
    if (statusVal === 0 || statusVal === "pending" || statusVal === "Pending") {
      return <Badge title="Pending" type="Yellow" />;
    }
    return <Badge title={String(statusVal ?? "Undecided")} type="Gray" />;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 animate-[fadeIn_150ms_ease-out]"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        ref={modalRef}
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden animate-[scaleIn_200ms_ease-out] flex flex-col max-h-[90vh] border border-gray-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-150 bg-gray-50/50">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Report Details
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Reviewing letter report #{id}
            </p>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading && (
            <div className="space-y-5 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3" />
              <div className="p-4 bg-gray-55/50 border border-gray-100 rounded-xl space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
                <div className="h-4 bg-gray-200 rounded w-4/5" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-650" />
              </div>
              <p className="text-sm font-semibold text-red-700 bg-red-50 px-4 py-2 rounded-xl">
                {error}
              </p>
              <Button size="sm" variant="outline" onClick={onClose}>
                Close Dialog
              </Button>
            </div>
          )}

          {!loading && !error && report && (
            <div className="space-y-5">
              {/* Status Header */}
              <div className="flex items-center justify-between bg-gray-50/70 border border-gray-100 p-3 rounded-xl">
                <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                  Report Status
                </span>
                {getStatusBadge(report)}
              </div>

              {/* Letter Content Card */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Letter Content
                </span>
                <div className="bg-gradient-to-br from-orange-50/30 to-amber-50/10 p-5 rounded-2xl border border-amber-100/60 shadow-sm relative overflow-hidden group">
                  {/* Decorative background quote mark */}
                  <span className="absolute -right-3 -bottom-5 text-8xl font-serif text-amber-200/10 select-none pointer-events-none group-hover:scale-110 transition-transform duration-300">
                    ”
                  </span>
                  <p className="text-sm text-gray-800 leading-relaxed font-medium whitespace-pre-wrap relative z-10">
                    {report.content}
                  </p>
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-150">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Author
                  </span>
                  <span className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    {report.authorUsername || report.ownerId || "Unknown"}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Language Community
                  </span>
                  <span className="text-sm font-semibold text-gray-850 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-gray-400" />
                    {report.languageCommunity || "N/A"}
                  </span>
                </div>

                <div className="space-y-0.5 col-span-2 pt-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Created At
                  </span>
                  <span className="text-xs text-gray-650 flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    {report.createDate ? formatDateTime(report.createDate) : "Unknown Date"}
                  </span>
                </div>

                {report.reportersCount !== undefined && (
                  <div className="space-y-0.5 col-span-2 pt-2 border-t border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Reporters Count
                    </span>
                    <span className="text-xs text-gray-650 flex items-center gap-1.5 font-bold text-red-600 bg-red-50/50 w-max px-2.5 py-0.5 rounded-lg border border-red-100">
                      {report.reportersCount} reporter(s)
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-150 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            size="sm"
          >
            Cancel
          </Button>

          {!loading && !error && report && (
            <Button
            size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              {isDeleting
                ? "Deleting..."
                : confirmDelete
                ? "Click to Confirm Delete"
                : "Delete"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
