import React from "react";
import { Eye, EyeOff, Trash2, X, AlertTriangle } from "lucide-react";
import Button from "../../../components/ui/Button";

interface ReelBulkActionBarProps {
  selectedCount: number;
  onClear: () => void;
  onBulkAction: (action: "publish" | "unpublish" | "delete") => Promise<void>;
}

export default function ReelBulkActionBar({
  selectedCount,
  onClear,
  onBulkAction,
}: ReelBulkActionBarProps) {
  const [showConfirmDelete, setShowConfirmDelete] = React.useState(false);

  if (selectedCount === 0) return null;

  const handleBulkClick = async (action: "publish" | "unpublish" | "delete") => {
    if (action === "delete") {
      setShowConfirmDelete(true);
    } else {
      await onBulkAction(action);
    }
  };

  const handleConfirmDelete = async () => {
    await onBulkAction("delete");
    setShowConfirmDelete(false);
  };

  return (
    <>
      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl bg-gray-900 text-white rounded-2xl shadow-2xl p-4 flex items-center justify-between gap-4 border border-gray-800 animate-[slideUp_250ms_ease-out]"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onClear}
            className="p-1 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            title="Deselect All"
            aria-label="Deselect all selected reels"
          >
            <X className="w-4.5 h-4.5" />
          </button>
          <span className="text-sm font-bold tracking-wide">
            {selectedCount} {selectedCount === 1 ? "reel" : "reels"} selected
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Bulk Publish */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleBulkClick("publish")}
            className="!text-white hover:!bg-white/10 text-xs font-semibold px-3 py-2 flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Publish</span>
          </Button>

          {/* Bulk Unpublish */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleBulkClick("unpublish")}
            className="!text-white hover:!bg-white/10 text-xs font-semibold px-3 py-2 flex items-center gap-1.5"
          >
            <EyeOff className="w-4 h-4 text-gray-400" />
            <span className="hidden sm:inline">Draft</span>
          </Button>

          {/* Bulk Delete */}
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleBulkClick("delete")}
            className="!bg-red-650 hover:!bg-red-705 text-xs font-semibold px-3 py-2 flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      {/* Bulk Delete Confirm Overlay */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
            onClick={() => setShowConfirmDelete(false)}
          />

          <div className="relative bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-[scaleIn_200ms_ease-out] z-10 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500">
              <AlertTriangle className="w-6 h-6 animate-bounce" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-gray-900">
                Bulk Delete Reels
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Are you sure you want to permanently delete the <span className="font-semibold text-gray-900">{selectedCount}</span> selected video reels?
                This action cannot be undone and will overwrite server records.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2 w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirmDelete(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmDelete}
                className="flex-1"
              >
                Delete {selectedCount} items
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
