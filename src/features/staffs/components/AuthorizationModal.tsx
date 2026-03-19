import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Shield, RotateCcw } from "lucide-react";
import type { PermissionGroup } from "../types/permission";
import { MOCK_PERMISSION_GROUPS } from "../types/permission";
import PermissionToggle from "./PermissionToggle";
import Button from "../../../components/ui/Button";

interface AuthorizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffName: string;
}

export default function AuthorizationModal({
  isOpen,
  onClose,
  staffName,
}: AuthorizationModalProps) {
  const [groups, setGroups] = useState<PermissionGroup[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setGroups(
        MOCK_PERMISSION_GROUPS.map((g) => ({
          ...g,
          permissions: g.permissions.map((p) => ({ ...p })),
        })),
      );
      setHasChanges(false);
    }
  }, [isOpen]);

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleToggle = useCallback((permissionId: string) => {
    setGroups((prev) =>
      prev.map((group) => ({
        ...group,
        permissions: group.permissions.map((p) =>
          p.id === permissionId ? { ...p, enabled: !p.enabled } : p,
        ),
      })),
    );
    setHasChanges(true);
  }, []);

  const handleReset = () => {
    setGroups(
      MOCK_PERMISSION_GROUPS.map((g) => ({
        ...g,
        permissions: g.permissions.map((p) => ({ ...p })),
      })),
    );
    setHasChanges(false);
  };

  const handleSave = () => {
    // UI-only: no API call yet
    console.log(
      "Saving permissions for",
      staffName,
      groups.flatMap((g) =>
        g.permissions.filter((p) => p.enabled).map((p) => p.id),
      ),
    );
    setHasChanges(false);
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Authorization for ${staffName}`}
        className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-4 sm:px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-gray-900">Authorization</h2>
            <p className="truncate text-xs text-gray-500">{staffName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          <div className="space-y-6">
            {groups.map((group) => (
              <section key={group.id}>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                  {group.title}
                </h3>
                <div className="space-y-2">
                  {group.permissions.map((permission) => (
                    <PermissionToggle
                      key={permission.id}
                      permission={permission}
                      onToggle={handleToggle}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-gray-200 bg-gray-50 px-5 py-3 sm:px-6">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={!hasChanges}
            leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
          >
            Reset
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
