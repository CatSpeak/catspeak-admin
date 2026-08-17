import React, { useMemo, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { useSidebar } from "../../context/SidebarContext"
import { useLanguage } from "../../stores/languageStore"
import {
  LayoutDashboard,
  Users,
  ChevronDown,
  FileWarning,
  GraduationCap,
  Package,
  Ticket,
  RotateCcw,
  CreditCard,
} from "lucide-react"
import CatSpeakLogo from "../../assets/catspeak_logo.svg"
import CatSpeakIcon from "../../assets/catspeak_icon.svg"

import { useAuthStore } from "../../stores/authStore"

interface NavSubItem {
  name: string
  path: string
  permission?: string
}

interface NavItem {
  name: string
  icon: React.ReactNode
  path?: string
  permission?: string
  subItems?: NavSubItem[]
  section?: string
}

const isPathActive = (pathname: string, path: string) => {
  if (path === "/") return pathname === "/"
  return pathname === path || pathname.startsWith(`${path}/`)
}

const AppSidebar: React.FC = () => {
  const { t } = useLanguage()
  const currentUser = useAuthStore((state) => state.user)
  const {
    isExpanded,
    isMobileOpen,
    isHovered,
    setIsHovered,
    toggleMobileSidebar,
  } = useSidebar()
  const location = useLocation()

  const isPermitted = React.useCallback(
    (code?: string) => {
      if (!currentUser) return false
      if (currentUser.roleId === 1) return true // Primary Admin full access
      if (!code) return true
      return currentUser.permissions?.includes(code) ?? false
    },
    [currentUser],
  )

  const navItems: NavItem[] = useMemo(() => {
    const rawItems: NavItem[] = [
      {
        name: t.nav.dashboard,
        icon: <LayoutDashboard size={20} />,
        path: "/",
        permission: "dashboard",
      },
      {
        name: t.nav.userManagement,
        icon: <Users size={20} />,
        subItems: [
          { name: t.nav.users, path: "/users", permission: "users" },
          { name: t.nav.staffs, path: "/staffs", permission: "staffs" },
        ],
      },
      {
        name: t.nav.planManagement,
        icon: <Package size={20} />,
        path: "/plans",
        permission: "plans",
      },
      {
        name: t.nav.vouchers || "Quản lý voucher",
        icon: <Ticket size={20} />,
        path: "/vouchers",
        permission: "vouchers",
      },
      {
        name: t.nav.catSpeak,
        icon: <img src={CatSpeakIcon} alt="Logo" className="w-5 h-5" />,
        subItems: [
          { name: t.nav.news, path: "/news", permission: "news" },
          { name: t.nav.calendar, path: "/calendar", permission: "calendar" },
          { name: t.nav.room, path: "/room", permission: "room" },
          { name: t.nav.classes, path: "/classes", permission: "classes" },
          { name: t.nav.reels, path: "/reels", permission: "reels" },
          {
            name: t.nav.broadcastMail || "Gửi Mail Hàng Loạt",
            path: "/broadcast-mail",
            permission: "broadcast_mail",
          },
        ],
      },
      {
        section: t.nav.finance || "Tài chính & Thanh toán",
        name: t.nav.refunds || "Yêu cầu hoàn tiền",
        icon: <RotateCcw size={20} />,
        path: "/refunds",
        permission: "payment_reports",
      },
      {
        name: t.nav.paymentReports || "Báo cáo thanh toán",
        icon: <CreditCard size={20} />,
        path: "/payments",
        permission: "payment_reports",
      },
      {
        section: t.nav.applications,
        name: t.nav.instructorApplications,
        icon: <GraduationCap size={20} />,
        path: "/instructor-applications",
        permission: "instructor_applications",
      },
      {
        section: t.nav.feedback,
        name: t.nav.letterReports || "Báo cáo nội dung",
        icon: <FileWarning size={20} />,
        path: "/reports",
        permission: "letter_reports",
      },
    ]

    return rawItems
      .map((item) => {
        if (item.subItems) {
          const filteredSub = item.subItems.filter((sub) =>
            isPermitted(sub.permission),
          )
          if (filteredSub.length === 0) return null
          return { ...item, subItems: filteredSub }
        }
        return isPermitted(item.permission) ? item : null
      })
      .filter((item): item is NavItem => item !== null)
  }, [t, isPermitted])

  const [submenuOverride, setSubmenuOverride] = useState<
    number | null | "auto"
  >("auto")

  const isActive = (path: string) => {
    return isPathActive(location.pathname, path)
  }

  const activeSubmenuIndex = useMemo(() => {
    const index = navItems.findIndex((nav) =>
      nav.subItems?.some((subItem) =>
        isPathActive(location.pathname, subItem.path),
      ),
    )
    return index === -1 ? null : index
  }, [location.pathname, navItems])

  const openSubmenu =
    submenuOverride === "auto" ? activeSubmenuIndex : submenuOverride

  const handleSubmenuToggle = (index: number) => {
    setSubmenuOverride((prev) => {
      const current = prev === "auto" ? activeSubmenuIndex : prev
      return current === index ? null : index
    })
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out z-50 
        ${isExpanded || isMobileOpen || isHovered ? "w-72.5" : "w-22.5"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-center h-16 shrink-0">
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

      <div className="flex flex-col overflow-y-auto flex-1 px-4 min-h-0">
        <nav className="mb-6">
          <ul className="flex flex-col gap-2">
            {navItems.map((nav, index) => (
              <li key={nav.path ?? nav.name}>
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
                      aria-expanded={openSubmenu === index}
                      aria-controls={`sidebar-submenu-${index}`}
                      aria-label={nav.name}
                      title={nav.name}
                      className={`relative flex items-center w-full gap-3 px-3 py-2 font-medium rounded-lg text-sm transition-colors group
                        ${
                          openSubmenu === index ||
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
                            className={`transition-transform duration-200 ${
                              openSubmenu === index ? "rotate-180" : ""
                            }`}
                          />
                        </>
                      )}
                    </button>
                    {/* Submenu */}
                    {(isExpanded || isHovered || isMobileOpen) && (
                      <div
                        id={`sidebar-submenu-${index}`}
                        className={`overflow-hidden transition-all duration-300 ${openSubmenu === index ? "max-h-96" : "max-h-0"}`}
                      >
                        <ul className="mt-1 ml-9 space-y-1">
                          {nav.subItems.map((subItem) => (
                            <li key={subItem.name}>
                              <Link
                                to={subItem.path}
                                onClick={() => {
                                  setSubmenuOverride("auto")
                                  if (isMobileOpen) toggleMobileSidebar()
                                }}
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
                    onClick={() => {
                      setSubmenuOverride("auto")
                      if (isMobileOpen) toggleMobileSidebar()
                    }}
                    aria-label={nav.name}
                    title={nav.name}
                    className={`relative flex items-center w-full gap-3 px-3 py-2 font-medium rounded-lg text-sm transition-colors
                      ${
                        isActive(nav.path!)
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
  )
}

export default AppSidebar
