import { useState } from "react";
import { Dropdown } from "../../ui/dropdown/Dropdown";
import { DropdownItem } from "../../ui/dropdown/DropdownItem";
import { useAuthStore } from "../../../stores/authStore";
import { User, Settings, LifeBuoy, LogOut, ChevronDown } from "lucide-react";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuthStore();

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  console.log("users: ", user);

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dropdown-toggle"
      >
        <span className="mr-3 overflow-hidden rounded-full h-11 w-11 bg-gray-200 flex items-center justify-center">
          <span className="text-sm font-bold text-gray-600">
            {user?.username?.charAt(0).toUpperCase() || "A"}
          </span>
          {/* <img src="/images/user/owner.jpg" alt="User" /> */}
        </span>

        <span className="hidden sm:block mr-1 font-medium text-sm">
          {user?.username || "User"}
        </span>
        <ChevronDown
          className={`text-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          size={18}
        />
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-4 flex w-65 flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-lg"
      >
        <div className="px-2 py-1.5">
          <span className="block font-medium text-gray-700 text-sm">
            {user?.username || "User"}
          </span>
          <span className="mt-0.5 block text-xs text-gray-500">
            {user?.email || "user@example.com"}
          </span>
        </div>

        <ul className="flex flex-col gap-1 pt-4 pb-3 border-b border-gray-200">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              to="/profile"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-sm hover:bg-gray-50 hover:text-gray-700"
            >
              <User className="text-gray-500 group-hover:text-gray-700 w-5 h-5" />
              Edit profile
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              to="/settings"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-sm hover:bg-gray-50 hover:text-gray-700"
            >
              <Settings className="text-gray-500 group-hover:text-gray-700 w-5 h-5" />
              Account settings
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              to="/live-chat"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-sm hover:bg-gray-50 hover:text-gray-700"
            >
              <LifeBuoy className="text-gray-500 group-hover:text-gray-700 w-5 h-5" />
              Support
            </DropdownItem>
          </li>
        </ul>
        <button
          onClick={() => {
            logout();
            closeDropdown();
          }}
          className="flex w-full items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg group text-sm hover:bg-gray-50 hover:text-gray-700"
        >
          <LogOut className="text-gray-500 group-hover:text-gray-700 w-5 h-5" />
          Logout
        </button>
      </Dropdown>
    </div>
  );
}
