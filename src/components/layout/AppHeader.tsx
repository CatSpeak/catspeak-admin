import React from "react";
import { useSidebar } from "../../context/SidebarContext";
import { Menu, Search } from "lucide-react";
import UserDropdown from "./header/UserDropdown";
import NotificationDropdown from "./header/NotificationDropdown";

const AppHeader: React.FC = () => {
  const { toggleSidebar, toggleMobileSidebar } = useSidebar();

  const handleToggle = () => {
    if (window.innerWidth >= 1280) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  return (
    <header className="sticky top-0 z-40 flex w-full bg-white border-b border-gray-200">
      <div className="flex grow items-center justify-between px-4 py-3 shadow-none md:px-6 2xl:px-11">
        <div className="flex items-center gap-2 sm:gap-4 xl:hidden">
          {/* Hamburger Toggle */}
          <button
            aria-controls="sidebar"
            onClick={handleToggle}
            className="z-50 block rounded-sm border border-gray-200 bg-white p-1.5 shadow-sm xl:hidden"
          >
            <Menu size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Desktop Toggle (Optional, can be hidden if Sidebar handles it) */}
        <div className="hidden xl:block">
          <button
            onClick={handleToggle}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <Menu size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="hidden sm:block ml-4">
          <form action="#" method="POST">
            <div className="relative">
              <button className="absolute left-0 top-1/2 -translate-y-1/2">
                <Search
                  size={20}
                  className="text-gray-400 hover:text-primary transition-colors"
                />
              </button>

              <input
                type="text"
                placeholder="Type to search..."
                className="w-full bg-transparent pl-9 pr-4 text-sm font-medium focus:outline-none xl:w-125"
              />
            </div>
          </form>
        </div>

        {/* Header Right Side */}
        <div className="flex items-center gap-3 2xsm:gap-7 ml-auto">
          <ul className="flex items-center gap-2 2xsm:gap-4">
            {/* Notification Dropdown */}
            <NotificationDropdown />
          </ul>

          {/* User Dropdown */}
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
