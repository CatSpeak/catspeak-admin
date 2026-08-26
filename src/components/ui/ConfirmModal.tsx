import React, { useEffect, useRef } from "react";
import { AlertTriangle, ShieldCheck, UserMinus, Info, Loader2 } from "lucide-react";

export type ConfirmModalVariant = "primary" | "danger" | "warning" | "info";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmModalVariant;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Xác nhận",
  cancelText = "Hủy bỏ",
  variant = "primary",
  isLoading = false,
  icon,
}) => {
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    cancelBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const renderIcon = () => {
    if (icon) return icon;
    switch (variant) {
      case "danger":
        return <UserMinus className="w-6 h-6 text-red-600" />;
      case "warning":
        return <AlertTriangle className="w-6 h-6 text-amber-600" />;
      case "info":
        return <Info className="w-6 h-6 text-blue-600" />;
      case "primary":
      default:
        return <ShieldCheck className="w-6 h-6 text-[#800000]" />;
    }
  };

  const getIconBg = () => {
    switch (variant) {
      case "danger":
        return "bg-red-100";
      case "warning":
        return "bg-amber-100";
      case "info":
        return "bg-blue-100";
      case "primary":
      default:
        return "bg-red-50";
    }
  };

  const getConfirmBtnClass = () => {
    switch (variant) {
      case "danger":
        return "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500";
      case "warning":
        return "bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500";
      case "info":
        return "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500";
      case "primary":
      default:
        return "bg-[#800000] hover:bg-[#660000] text-white focus:ring-[#800000]";
    }
  };

  return (
    <div
      className="fixed inset-0 z-70 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed -inset-10 bg-black/35 backdrop-blur-xs transition-opacity animate-[fadeIn_150ms_ease-out]"
        onClick={() => !isLoading && onClose()}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 overflow-hidden transform transition-all animate-[scaleIn_200ms_ease-out] z-10 border border-gray-100">
        <div className="flex flex-col items-center text-center">
          {/* Top Icon Badge */}
          <div className={`w-14 h-14 rounded-full ${getIconBg()} flex items-center justify-center mb-4 shadow-sm`}>
            {renderIcon()}
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {title}
          </h3>

          {/* Description */}
          <div className="text-sm text-gray-600 leading-relaxed mb-6">
            {description}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 w-full">
            <button
              ref={cancelBtnRef}
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50 transition-colors"
            >
              {cancelText}
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => {
                onConfirm();
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 disabled:opacity-50 transition-colors shadow-sm ${getConfirmBtnClass()}`}
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
