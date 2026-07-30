import { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";
import { useLanguage } from "../../../stores/languageStore";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  isDeleting,
  onConfirm,
  onClose,
}: DeleteConfirmModalProps) {
  const { t } = useLanguage();
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Focus the cancel button on mount and handle ESC
  useEffect(() => {
    if (!isOpen) return;
    cancelRef.current?.focus();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-[fadeIn_150ms_ease-out]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-lg p-6 space-y-5 animate-[scaleIn_200ms_ease-out]">
        {/* Icon */}
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {t.news.deletePost}
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            {t.news.deleteConfirmMessage}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 pt-1">
          <button
            ref={cancelRef}
            onClick={onClose}
            disabled={isDeleting}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {t.common.cancel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-full transition-colors disabled:opacity-50 inline-flex items-center gap-2"
          >
            {isDeleting && (
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {isDeleting ? t.news.deleting : t.common.delete}
          </button>
        </div>
      </div>
    </div>
  );
}
