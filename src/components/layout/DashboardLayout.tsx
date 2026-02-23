/* ============================================
   Devfolio — Dashboard Layout
   ============================================ */

import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { cn } from "@/lib/utils";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-surface-950">
      <a href="#main-content" className="skip-nav">
        Skip to main content
      </a>

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />

      <div
        className={cn(
          "flex min-h-screen flex-col transition-all duration-300",
          collapsed ? "lg:ml-[68px]" : "lg:ml-64"
        )}>
        <TopBar
          onMenuToggle={() => setSidebarOpen(true)}
          collapsed={collapsed}
        />

        <main
          id="main-content"
          className="flex-1 px-4 py-6 sm:px-6 lg:px-8"
          role="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
