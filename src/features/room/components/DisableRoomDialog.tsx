import React from "react";
import { Ban, X, Loader2 } from "lucide-react";
import { useLanguage } from "../../../stores/languageStore";

interface DisableRoomDialogProps {
  isOpen: boolean;
  roomName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDisabling?: boolean;
}

const DisableRoomDialog: React.FC<DisableRoomDialogProps> = ({
  isOpen,
  roomName,
  onConfirm,
  onCancel,
  isDisabling = false,
}) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-slideUp">
        <div className="flex items-center justify-between px-6 pt-5 pb-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-50">
              <Ban size={20} className="text-amber-600" />
            </div>
            <h3 className="font-bold text-gray-900">{t.room.disableRoom}</h3>
          </div>
          <button onClick={onCancel} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-4">
          <p className="text-sm text-gray-600">
            {t.room.disableRoomConfirmDesc} <span className="font-semibold text-gray-900">"{roomName}"</span>
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50/50 border-t border-gray-100">
          <button
            onClick={onCancel}
            disabled={isDisabling}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {t.common.cancel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isDisabling}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isDisabling && <Loader2 size={14} className="animate-spin" />}
            {isDisabling ? t.common.loading : t.common.disable}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisableRoomDialog;
