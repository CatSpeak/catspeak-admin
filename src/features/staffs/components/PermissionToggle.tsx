import type { Permission } from "../types/permission";

interface PermissionToggleProps {
  permission: Permission;
  onToggle: (permissionId: string) => void;
}

export default function PermissionToggle({
  permission,
  onToggle,
}: PermissionToggleProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggle(permission.id);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-gray-50 px-4 py-3 transition-colors hover:bg-gray-100">
      {/* Label & Description */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900">{permission.name}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
          {permission.description}
        </p>
      </div>

      {/* Toggle Switch */}
      <button
        type="button"
        role="switch"
        aria-checked={permission.enabled}
        aria-label={`Toggle ${permission.name}`}
        tabIndex={0}
        onClick={() => onToggle(permission.id)}
        onKeyDown={handleKeyDown}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
          permission.enabled ? "bg-primary" : "bg-gray-300"
        }`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out ${
            permission.enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
