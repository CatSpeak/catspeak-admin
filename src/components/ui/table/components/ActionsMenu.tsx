import { useEffect, useRef, useState, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    placement: "bottom" | "top";
  }>({
    top: 0,
    left: 0,
    placement: "bottom",
  });

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const estimatedMenuHeight = 220;
    const placement =
      spaceBelow < estimatedMenuHeight && rect.top > estimatedMenuHeight
        ? "top"
        : "bottom";

    setCoords({
      top: placement === "bottom" ? rect.bottom + 4 : rect.top - 4,
      left: rect.right,
      placement,
    });
  };

  useLayoutEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleScrollOrResize = (e: Event) => {
      if (menuRef.current && menuRef.current.contains(e.target as Node)) {
        return;
      }
      onClose();
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleScrollOrResize);
    window.addEventListener("scroll", handleScrollOrResize, true);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleScrollOrResize);
      window.removeEventListener("scroll", handleScrollOrResize, true);
    };
  }, [isOpen, onClose]);

  const visibleActions = actions.filter((a) => !a.hidden?.(row));
  if (visibleActions.length === 0) return null;

  return (
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
        type="button"
        onClick={onToggle}
        aria-label={t.table.rowActions}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
      >
        <MoreVertical size={16} />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              transform:
                coords.placement === "top"
                  ? "translate(-100%, -100%)"
                  : "translateX(-100%)",
              zIndex: 9999,
            }}
            className="min-w-[180px] w-max max-w-xs origin-top-right rounded-lg border border-gray-100 bg-white shadow-xl py-1 animate-[fadeIn_100ms_ease-out]"
            onClick={(e) => e.stopPropagation()}
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
                className={`flex w-full items-center justify-start text-left gap-2 px-3 py-2 text-sm whitespace-nowrap transition-colors cursor-pointer ${
                  action.danger
                    ? "text-red-600 hover:bg-red-50"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="shrink-0">{action.icon}</span>
                <span className="whitespace-nowrap text-left">
                  {action.label}
                </span>
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
