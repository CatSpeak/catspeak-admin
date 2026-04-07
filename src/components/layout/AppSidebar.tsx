import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";
import {
  LayoutDashboard,
  Users,
  ChevronDown,
  MessageCircle,
  FileWarning,
} from "lucide-react";
import CatSpeakLogo from "../../assets/catspeak_logo.svg";
import CatSpeakIcon from "../../assets/catspeak_icon.svg";

interface NavItem {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string }[];
  section?: string;
}

const navItems: NavItem[] = [
  {
    name: "Dashboard",
    icon: <LayoutDashboard size={20} />,
    path: "/",
  },
  {
    name: "User Management",
    icon: <Users size={20} />,
    subItems: [
      { name: "Users", path: "/users" },
      { name: "Staff", path: "/staff" },
    ],
  },
  {
    name: "Cat Speak",
    icon: <img src={CatSpeakIcon} alt="Logo" className="w-5 h-5" />,
    subItems: [
      { name: "News", path: "/news" },
      { name: "Calendar", path: "/calendar" },
      { name: "Room", path: "/room" },
    ],
  },
  {
    section: "Feedback",
    name: "Live Chat Support",
    icon: <MessageCircle size={20} />,
    path: "/live-chat",
  },
  {
    name: "Handle Reports",
    icon: <FileWarning size={20} />,
    path: "/reports",
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, toggleMobileSidebar } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const [prevPathname, setPrevPathname] = useState(location.pathname);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  if (location.pathname !== prevPathname) {
    let foundActiveIndex: number | null = null;

    navItems.forEach((nav, index) => {
      if (nav.subItems) {
        const isSubmenuActive = nav.subItems.some((subItem) =>
          isActive(subItem.path),
        );
        if (isSubmenuActive) {
          foundActiveIndex = index;
        }
      }
    });

    setOpenSubmenu(foundActiveIndex);
    setPrevPathname(location.pathname);
  }

  const handleSubmenuToggle = (index: number) => {
    setOpenSubmenu((prev) => (prev === index ? null : index));
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col xl:mt-0 top-0 left-0 bg-white border-r border-gray-200 h-screen transition-all duration-300 ease-in-out z-50 
        ${isExpanded || isMobileOpen || isHovered ? "w-72.5" : "w-22.5"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        xl:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-center h-(--header-height)">
        <Link to="/" className="flex items-center gap-2">
          {isExpanded || isHovered || isMobileOpen ? (
            <div className="py-4 scale-75 origin-center">
              <img
                src={CatSpeakLogo}
                alt="CatSpeak Logo"
                className="w-auto h-12"
              />
            </div>
          ) : (
            <div className="scale-50 origin-center">
              <img
                src={CatSpeakIcon}
                alt="CatSpeak Icon"
                className="w-20 h-20"
              />
            </div>
          )}
        </Link>
      </div>

      <div className="flex flex-col overflow-y-auto no-scrollbar flex-1 px-4">
        <nav className="mb-6">
          <ul className="flex flex-col gap-2">
            {navItems.map((nav, index) => (
              <li key={index}>
                {nav.section && (isExpanded || isHovered || isMobileOpen) && (
                  <div className="mb-2 mt-4 ml-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {nav.section}
                  </div>
                )}
                {/* Divider if collapsed and section starts */}
                {nav.section && !isExpanded && !isHovered && !isMobileOpen && (
                  <div className="my-2 border-t border-gray-100"></div>
                )}

                {nav.subItems ? (
                  <>
                    <button
                      onClick={() => handleSubmenuToggle(index)}
                      className={`relative flex items-center w-full gap-3 px-3 py-2 font-medium rounded-lg text-sm transition-colors group
                        ${openSubmenu === index ||
                          nav.subItems.some((sub) => isActive(sub.path))
                          ? "bg-primary/10 text-primary"
                          : "text-gray-700 hover:bg-gray-100"
                        }
                        ${!isExpanded && !isHovered && !isMobileOpen ? "justify-center" : "justify-start"}
                      `}
                    >
                      <span>{nav.icon}</span>
                      {(isExpanded || isHovered || isMobileOpen) && (
                        <>
                          <span className="flex-1 text-left">{nav.name}</span>
                          <ChevronDown
                            size={16}
                            className={`transition-transform duration-200 ${openSubmenu === index ? "rotate-180" : ""
                              }`}
                          />
                        </>
                      )}
                    </button>
                    {/* Submenu */}
                    {(isExpanded || isHovered || isMobileOpen) && (
                      <div
                        className={`overflow-hidden transition-all duration-300 ${openSubmenu === index ? "max-h-96" : "max-h-0"}`}
                      >
                        <ul className="mt-1 ml-9 space-y-1">
                          {nav.subItems.map((subItem) => (
                            <li key={subItem.name}>
                              <Link
                                to={subItem.path}
                                onClick={() => isMobileOpen && toggleMobileSidebar()}
                                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(subItem.path) ? "shadow-sm" : "text-gray-600 hover:bg-gray-50"}`}
                                style={
                                  isActive(subItem.path)
                                    ? {
                                      color: "#F5A623",
                                      background: "rgba(245, 166, 35, 0.1)",
                                    }
                                    : {}
                                }
                              >
                                {subItem.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    to={nav.path!}
                    onClick={() => isMobileOpen && toggleMobileSidebar()}
                    className={`relative flex items-center w-full gap-3 px-3 py-2 font-medium rounded-lg text-sm transition-colors
                      ${isActive(nav.path!)
                        ? "bg-primary/10 text-primary"
                        : "text-gray-700 hover:bg-gray-100"
                      }
                      ${!isExpanded && !isHovered && !isMobileOpen ? "justify-center" : "justify-start"}
                    `}
                  >
                    <span>{nav.icon}</span>
                    {(isExpanded || isHovered || isMobileOpen) && (
                      <span>{nav.name}</span>
                    )}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
