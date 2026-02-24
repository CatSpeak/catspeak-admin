// import { Outlet, NavLink } from "react-router-dom";
// import {
//   Bell,
//   ChevronDown,
//   ChevronUp,
//   LayoutDashboard,
//   MessageCircle,
//   FileWarning,
//   Users,
//   Menu,
// } from "lucide-react";
// import { useState } from "react";
// import CatSpeakLogo from "../assets/CatSpeakLogo";

// export default function MainLayout() {
//   const [userManagementOpen, setUserManagementOpen] = useState(true);
//   const [sidebarOpen, setSidebarOpen] = useState(true);

//   return (
//     <div
//       className="flex h-screen overflow-hidden"
//       style={{ background: "var(--color-bg)" }}
//     >
//       {/* Overlay - mobile only */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black/40 z-20 lg:hidden"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       {/* ── Sidebar ── */}
//       <aside
//         className={`fixed lg:relative inset-y-0 left-0 z-30 flex flex-col bg-white border-r transition-transform duration-300 ease-in-out ${
//           sidebarOpen ? "translate-x-0" : "-translate-x-full"
//         } lg:translate-x-0`}
//         style={{
//           width: "var(--sidebar-width)",
//           borderColor: "var(--color-border)",
//         }}
//       >
//         <div style={{ width: "var(--sidebar-width)" }}>
//           {/* User Management Collapsible */}
//           <div className="pt-5 px-3">
//             <button
//               onClick={() => setUserManagementOpen(!userManagementOpen)}
//               className="flex items-center justify-between w-full px-4 py-2.5 rounded-lg text-sm font-bold tracking-wider transition-colors hover:bg-gray-50"
//               style={{ color: "var(--color-primary)" }}
//             >
//               <div className="flex items-center gap-2">
//                 <Users size={16} />
//                 <span>User Management</span>
//               </div>
//               {userManagementOpen ? (
//                 <ChevronUp size={14} />
//               ) : (
//                 <ChevronDown size={14} />
//               )}
//             </button>

//             {/* Sub-menu */}
//             {userManagementOpen && (
//               <div className="mt-1 space-y-1 ml-3">
//                 <NavLink
//                   to="/users"
//                   className={({ isActive }) =>
//                     `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
//                       isActive ? "text-white shadow-md" : "hover:bg-gray-50"
//                     }`
//                   }
//                   style={({ isActive }) =>
//                     isActive
//                       ? { background: "#F5A623", color: "#fff" }
//                       : { color: "var(--color-text-secondary)" }
//                   }
//                   onClick={() =>
//                     window.innerWidth < 1024 && setSidebarOpen(false)
//                   }
//                 >
//                   <Users size={14} />
//                   Users
//                 </NavLink>

//                 <NavLink
//                   to="/staff"
//                   className={({ isActive }) =>
//                     `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
//                       isActive ? "text-white shadow-md" : "hover:bg-gray-50"
//                     }`
//                   }
//                   style={({ isActive }) =>
//                     isActive
//                       ? { background: "#F5A623", color: "#fff" }
//                       : { color: "var(--color-text-secondary)" }
//                   }
//                   onClick={() =>
//                     window.innerWidth < 1024 && setSidebarOpen(false)
//                   }
//                 >
//                   <Users size={14} />
//                   Staff
//                 </NavLink>
//               </div>
//             )}
//           </div>

//           {/* Primary nav */}
//           <nav className="flex-1 px-3 space-y-1 mt-2">
//             {/* Dashboard */}
//             <NavLink
//               to="/"
//               end
//               className={({ isActive }) =>
//                 `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
//                   isActive ? "text-white shadow-md" : "hover:bg-gray-50"
//                 }`
//               }
//               style={({ isActive }) =>
//                 isActive
//                   ? { background: "var(--color-primary)", color: "#fff" }
//                   : { color: "var(--color-text-secondary)" }
//               }
//             >
//               <LayoutDashboard size={16} />
//               Dashboard
//             </NavLink>

//             {/* Section label */}
//             <div className="pt-6 pb-1 px-4">
//               <span
//                 className="text-lg font-bold tracking-wider"
//                 style={{ color: "var(--color-text)" }}
//               >
//                 Feedback
//               </span>
//             </div>

//             <NavLink
//               to="/live-chat"
//               className={({ isActive }) =>
//                 `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
//                   isActive ? "text-white shadow-md" : "hover:bg-gray-50"
//                 }`
//               }
//               style={({ isActive }) =>
//                 isActive
//                   ? { background: "var(--color-primary)", color: "#fff" }
//                   : { color: "var(--color-text-secondary)" }
//               }
//             >
//               <MessageCircle size={16} />
//               Live Chat Support
//             </NavLink>

//             <NavLink
//               to="/reports"
//               className={({ isActive }) =>
//                 `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
//                   isActive ? "text-white shadow-md" : "hover:bg-gray-50"
//                 }`
//               }
//               style={({ isActive }) =>
//                 isActive
//                   ? { background: "var(--color-primary)", color: "#fff" }
//                   : { color: "var(--color-text-secondary)" }
//               }
//             >
//               <FileWarning size={16} />
//               Handle Reports
//             </NavLink>
//           </nav>
//         </div>
//       </aside>

//       {/* ── Main area ── */}
//       <div className="flex flex-1 flex-col overflow-hidden min-w-0">
//         {/* ── Header ── */}
//         <header
//           className="flex items-center justify-between px-5 border-b bg-white shrink-0"
//           style={{
//             height: "var(--header-height)",
//             borderColor: "var(--color-border)",
//           }}
//         >
//           {/* Left */}
//           <div className="flex items-center gap-3">
//             <button
//               className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
//               onClick={() => setSidebarOpen(!sidebarOpen)}
//             >
//               <Menu size={24} style={{ color: "var(--color-text)" }} />
//             </button>
//             <CatSpeakLogo />
//           </div>

//           {/* Right */}
//           <div className="flex items-center gap-4">
//             {/* Notification bell */}
//             <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
//               <Bell size={24} style={{ color: "var(--color-accent)" }} />
//               <span
//                 className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
//                 style={{ background: "var(--color-primary)" }}
//               >
//                 1
//               </span>
//             </button>

//             {/* Admin avatar + name */}
//             <div className="flex items-center gap-2">
//               <div
//                 className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
//                 style={{ background: "var(--color-primary)" }}
//               >
//                 A
//               </div>
//               <span
//                 className="hidden sm:block text-sm font-medium"
//                 style={{ color: "var(--color-text)" }}
//               >
//                 Administrator
//               </span>
//             </div>

//             {/* Language */}
//             <button
//               className="flex items-center gap-1 text-sm font-medium hover:opacity-80 transition-opacity"
//               style={{ color: "var(--color-success)" }}
//             >
//               English
//               <ChevronDown size={14} />
//             </button>
//           </div>
//         </header>

//         {/* ── Page Content ── */}
//         <main className="flex-1 overflow-y-auto p-4 md:p-6">
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );
// }
