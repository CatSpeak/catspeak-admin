import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import Button from "../../../components/ui/Button";
import { useLanguage } from "../../../stores/languageStore";

interface LanguageRequestRejectModalProps {
  teacherName: string;
  isLoading: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

export default function LanguageRequestRejectModal({
  teacherName,
  isLoading,
  onConfirm,
  onClose,
}: LanguageRequestRejectModalProps) {
  const { t } = useLanguage();
  const [reason, setReason] = useState("");

  const isValid = reason.trim().length > 0;

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
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-gray-900">
              {t.languageRequests.rejectTitle}
            </h2>
            <p className="text-xs text-gray-500 truncate">
              <span className="font-medium text-gray-700">{teacherName}</span>
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
          <p className="text-sm text-gray-600">
            {t.languageRequests.rejectDesc}
          </p>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              {t.languageRequests.rejectionReason}{" "}
              <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder={t.languageRequests.rejectionReasonPlaceholder}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 pb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            {t.common.cancel}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onConfirm(reason)}
            disabled={!isValid || isLoading}
            isLoading={isLoading}
          >
            {t.languageRequests.reject}
          </Button>
        </div>
      </div>
    </div>
  );
}
