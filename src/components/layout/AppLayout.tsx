import React from "react";
import { Outlet, ScrollRestoration } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";
import { SidebarProvider, useSidebar } from "../../context/SidebarContext";
import Backdrop from "./Backdrop";
import ScrollToTop from "../common/ScrollToTop";

const LayoutContent: React.FC = () => {
  const { isExpanded, isMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen md:flex w-full overflow-x-clip">
      <ScrollRestoration />
      <ScrollToTop />
      <div>
        <AppSidebar />
        <Backdrop />
      </div>
      <div
        className={`flex-1 min-w-0 transition-all duration-300 ease-in-out ${
          isExpanded ? "md:ml-72.5" : "md:ml-22.5"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AppHeader />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;
