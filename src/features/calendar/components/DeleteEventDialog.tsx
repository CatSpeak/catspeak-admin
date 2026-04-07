import React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

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
            <h3 className="text-base font-bold text-gray-900">Delete Event</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Are you sure you want to delete{" "}
              <span className="font-medium text-gray-700">"{eventTitle}"</span>?
              This action cannot be undone.
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
            Cancel
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
                Deleting…
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteEventDialog;
