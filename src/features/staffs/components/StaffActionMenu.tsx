import { useState, useRef } from "react";
import { Shield, Trash2 } from "lucide-react";
import { Dropdown } from "../../../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../../../components/ui/dropdown/DropdownItem";
import AuthorizationModal from "./AuthorizationModal";

interface StaffActionMenuProps {
  staffName: string;
}

export default function StaffActionMenu({ staffName }: StaffActionMenuProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const handleToggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isDropdownOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "fixed",
        top: `${rect.bottom + 8}px`,
        left: `${rect.right - 192}px`, // 192px = w-48
        width: "192px",
      });
    }

    setIsDropdownOpen((prev) => !prev);
  };

  const handleOpenAuthorization = () => {
    setIsDropdownOpen(false);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          className="dropdown-toggle rounded p-1 text-gray-500 transition-colors hover:bg-gray-200"
          onClick={handleToggleDropdown}
          aria-label="Staff actions"
          aria-expanded={isDropdownOpen}
          aria-haspopup="true"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </button>

        <Dropdown
          isOpen={isDropdownOpen}
          onClose={() => setIsDropdownOpen(false)}
          className="py-1"
          style={dropdownStyle}
          usePortal={true}
        >
          <DropdownItem
            onClick={handleOpenAuthorization}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <Shield className="h-4 w-4 text-primary" />
            Authorization
          </DropdownItem>

          <div className="my-1 border-t border-gray-100" />

          <DropdownItem
            onClick={() => setIsDropdownOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 opacity-50 cursor-not-allowed"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </DropdownItem>
        </Dropdown>
      </div>

      <AuthorizationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        staffName={staffName}
      />
    </>
  );
}
