import React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useLanguage } from "../../../stores/languageStore";

interface DeleteEventDialogProps {
  isOpen: boolean;
  eventTitle: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteEventDialog: React.FC<DeleteEventDialogProps> = ({
  isOpen,
  eventTitle,
  isDeleting,
  onConfirm,
  onCancel,
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">{t.calendar.deleteEvent}</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {t.calendar.deleteConfirmDescPrefix}
              <span className="font-medium text-gray-700">"{eventTitle}"</span>
              {t.calendar.deleteConfirmDescSuffix}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-gray-600 rounded-lg
              hover:bg-gray-100 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {t.common.cancel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium
              text-white bg-red-600 rounded-lg hover:bg-red-700
              transition-colors disabled:opacity-60 cursor-pointer"
          >
            {isDeleting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                {t.calendar.deleting}
              </>
            ) : (
              t.common.delete
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteEventDialog;
