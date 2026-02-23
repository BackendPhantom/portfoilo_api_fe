/* ============================================
   Devfolio — Sidebar Navigation
   ============================================ */

import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import Avatar from "@/components/ui/Avatar";
import {
  LayoutDashboard,
  FolderKanban,
  Zap,
  Briefcase,
  GraduationCap,
  FileText,
  Award,
  Link2,
  Mail,
  Key,
  Settings,
  LogOut,
  X,
  ChevronLeft,
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboard/projects", label: "Projects", icon: FolderKanban },
  { to: "/dashboard/skills", label: "Skills", icon: Zap },
  { to: "/dashboard/experience", label: "Experience", icon: Briefcase },
  { to: "/dashboard/education", label: "Education", icon: GraduationCap },
  { to: "/dashboard/blog", label: "Blog Posts", icon: FileText },
  { to: "/dashboard/certifications", label: "Certifications", icon: Award },
  { to: "/dashboard/social-links", label: "Social Links", icon: Link2 },
  { to: "/dashboard/messages", label: "Messages", icon: Mail },
  { to: "/dashboard/api-keys", label: "API Keys", icon: Key },
];

const bottomItems = [
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({
  open,
  onClose,
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full flex-col border-r border-surface-800 bg-surface-950 transition-all duration-300",
          collapsed ? "w-[68px]" : "w-64",
          // Mobile: slide in/out
          "lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Main navigation">
        {/* Logo / Brand */}
        <div
          className={cn(
            "flex h-16 items-center border-b border-surface-800 px-4",
            collapsed && "justify-center"
          )}>
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white font-bold text-sm">
                D
              </div>
              <span className="text-lg font-bold text-surface-100">
                Devfolio
              </span>
            </div>
          )}
          {collapsed && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white font-bold text-sm">
              D
            </div>
          )}

          {/* Mobile close */}
          <button
            onClick={onClose}
            className="ml-auto rounded-lg p-1.5 text-surface-400 hover:bg-surface-800 hover:text-surface-200 lg:hidden cursor-pointer"
            aria-label="Close sidebar">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1" role="list">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === "/dashboard"}
                  onClick={onClose}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive(item.to)
                      ? "bg-brand-600/10 text-brand-400 border border-brand-600/20"
                      : "text-surface-400 hover:bg-surface-800/80 hover:text-surface-200 border border-transparent",
                    collapsed && "justify-center px-0"
                  )}
                  aria-current={isActive(item.to) ? "page" : undefined}
                  title={collapsed ? item.label : undefined}>
                  <item.icon
                    className={cn(
                      "h-5 w-5 shrink-0",
                      isActive(item.to)
                        ? "text-brand-400"
                        : "text-surface-500 group-hover:text-surface-300"
                    )}
                    aria-hidden="true"
                  />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom section */}
        <div className="border-t border-surface-800 px-3 py-4 space-y-1">
          {bottomItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive(item.to)
                  ? "bg-brand-600/10 text-brand-400"
                  : "text-surface-400 hover:bg-surface-800/80 hover:text-surface-200",
                collapsed && "justify-center px-0"
              )}
              title={collapsed ? item.label : undefined}>
              <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}

          <button
            onClick={logout}
            className={cn(
              "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-surface-400 hover:bg-danger-600/10 hover:text-danger-500 transition-colors cursor-pointer",
              collapsed && "justify-center px-0"
            )}
            title={collapsed ? "Logout" : undefined}>
            <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
            {!collapsed && <span>Logout</span>}
          </button>

          {/* Collapse toggle — desktop only */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex w-full items-center justify-center gap-2 rounded-lg py-2 text-surface-500 hover:bg-surface-800 hover:text-surface-300 transition-colors cursor-pointer"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
            <ChevronLeft
              className={cn(
                "h-4 w-4 transition-transform",
                collapsed && "rotate-180"
              )}
              aria-hidden="true"
            />
          </button>
        </div>

        {/* User profile */}
        {user && !collapsed && (
          <div className="border-t border-surface-800 px-4 py-3">
            <div className="flex items-center gap-3">
              <Avatar
                src={user.avatar}
                firstName={user.first_name}
                lastName={user.last_name}
                size="sm"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-surface-200">
                  {user.first_name} {user.last_name}
                </p>
                <p className="truncate text-xs text-surface-500">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
