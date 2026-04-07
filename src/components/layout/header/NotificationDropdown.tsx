import { useState } from "react";
import { Link } from "react-router-dom";
import { Dropdown } from "../../ui/dropdown/Dropdown";
import { Bell, X } from "lucide-react";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifying, setNotifying] = useState(true);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleClick = () => {
    toggleDropdown();
    setNotifying(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Toggle notifications"
        aria-expanded={isOpen}
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full dropdown-toggle hover:text-gray-700 h-11 w-11 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
        onClick={handleClick}
      >
        <span
          className={`absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400 ${
            !notifying ? "hidden" : "flex"
          }`}
        >
          <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
        </span>
        <Bell size={20} className="fill-current" />
      </button>
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="fixed right-4 left-4 mt-4.25 flex max-h-120 flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-lg sm:left-auto sm:w-90.25 lg:absolute lg:right-0 lg:top-auto"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
          <h5 className="text-lg font-semibold text-gray-800">Notification</h5>
          <button
            type="button"
            aria-label="Close notifications"
            onClick={toggleDropdown}
            className="text-gray-500 transition hover:text-gray-700 p-1 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
          >
            <X size={20} />
          </button>
        </div>
        <ul className="flex flex-col h-auto overflow-y-auto example-scrollbar">
          {/* Placeholder for no notifications or example items */}
          <li className="p-4 text-center text-gray-500 text-sm">
            No new notifications
          </li>
        </ul>
        <Link
          to="/notifications"
          className="block px-4 py-2 mt-3 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          View All Notifications
        </Link>
      </Dropdown>
    </div>
  );
}
