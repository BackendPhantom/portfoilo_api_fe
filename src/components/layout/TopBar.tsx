/* ============================================
   Devfolio — Top Bar (Header for Dashboard)
   ============================================ */

import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import Avatar from "@/components/ui/Avatar";
import { Menu, Moon, Sun, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface TopBarProps {
  onMenuToggle: () => void;
  collapsed: boolean;
}

export default function TopBar({ onMenuToggle, collapsed }: TopBarProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center justify-between border-b border-surface-800 bg-surface-950/80 backdrop-blur-lg px-4 sm:px-6 transition-all",
        collapsed ? "lg:pl-[calc(68px+1.5rem)]" : "lg:pl-[calc(16rem+1.5rem)]"
      )}>
      {/* Left: Menu toggle (mobile) */}
      <button
        onClick={onMenuToggle}
        className="rounded-lg p-2 text-surface-400 hover:bg-surface-800 hover:text-surface-200 lg:hidden cursor-pointer"
        aria-label="Toggle navigation menu">
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-surface-400 hover:bg-surface-800 hover:text-surface-200 transition-colors cursor-pointer"
          aria-label={`Switch to ${
            resolvedTheme === "dark" ? "light" : "dark"
          } mode`}>
          {resolvedTheme === "dark" ? (
            <Sun className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Moon className="h-5 w-5" aria-hidden="true" />
          )}
        </button>

        {/* Notifications placeholder */}
        <Link
          to="/dashboard/messages"
          className="relative rounded-lg p-2 text-surface-400 hover:bg-surface-800 hover:text-surface-200 transition-colors"
          aria-label="Messages">
          <Bell className="h-5 w-5" aria-hidden="true" />
          {/* Unread indicator */}
          <span
            className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-500"
            aria-hidden="true"
          />
        </Link>

        {/* User avatar link */}
        {user && (
          <Link
            to="/dashboard/settings"
            className="ml-1 rounded-full ring-2 ring-transparent hover:ring-brand-500/50 transition-all">
            <Avatar
              src={user.avatar}
              firstName={user.first_name}
              lastName={user.last_name}
              size="sm"
            />
          </Link>
        )}
      </div>
    </header>
  );
}
