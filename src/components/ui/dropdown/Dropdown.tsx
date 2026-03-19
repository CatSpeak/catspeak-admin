import type React from "react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface DropdownProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  usePortal?: boolean;
}

export const Dropdown: React.FC<DropdownProps> = ({
  isOpen,
  onClose,
  children,
  className = "absolute right-0 mt-2",
  style,
  usePortal = false,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest(".dropdown-toggle")
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    // Add scroll listener to close dropdown on scroll since it might be fixed
    const handleScroll = (event: Event) => {
      // Only close if scrolling outside the dropdown
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        // Debounce or just close
        onClose();
      }
    };

    // Add true to capture phase so we catch all scrolls
    document.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("scroll", handleScroll, true);
    };
  }, [onClose]);

  if (!isOpen) return null;

  const content = (
    <div
      ref={dropdownRef}
      style={style}
      className={`z-50 rounded-xl border border-gray-200 bg-white shadow-lg ${className}`}
    >
      {children}
    </div>
  );

  return usePortal ? createPortal(content, document.body) : content;
};
