import { useEffect, useRef } from "react";
import { MoreVertical } from "lucide-react";
import { useLanguage } from "../../../../stores/languageStore";
import type { TableAction } from "../types";

export interface ActionsMenuProps<T> {
  row: T;
  actions: TableAction<T>[];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export default function ActionsMenu<T>({
  row,
  actions,
  isOpen,
  onToggle,
  onClose,
}: ActionsMenuProps<T>) {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  const visibleActions = actions.filter((a) => !a.hidden?.(row));
  if (visibleActions.length === 0) return null;

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button
        type="button"
        onClick={onToggle}
        aria-label={t.table.rowActions}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <MoreVertical size={16} />
      </button>
      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-1 w-44 origin-top-right rounded-lg border border-gray-100 bg-white shadow-lg py-1"
        >
          {visibleActions.map((action, i) => (
            <button
              key={`${action.label}-${i}`}
              type="button"
              role="menuitem"
              onClick={() => {
                action.handler?.(row);
                onClose();
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
                action.danger
                  ? "text-red-600 hover:bg-red-50"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
