/* ============================================
   Devfolio — Auth Layout (login/signup pages)
   ============================================ */

import { Outlet, Link } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";

export default function AuthLayout() {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-950 px-4 py-8">
      <a href="#auth-content" className="skip-nav">
        Skip to main content
      </a>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="fixed right-4 top-4 rounded-lg p-2 text-surface-400 hover:bg-surface-800 hover:text-surface-200 transition-colors cursor-pointer"
        aria-label={`Switch to ${
          resolvedTheme === "dark" ? "light" : "dark"
        } mode`}>
        {resolvedTheme === "dark" ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </button>

      {/* Brand */}
      <Link to="/" className="mb-8 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white font-bold text-lg">
          D
        </div>
        <span className="text-2xl font-bold text-surface-100">Devfolio</span>
      </Link>

      <div
        id="auth-content"
        className="w-full max-w-md rounded-xl border border-surface-800 bg-surface-900/50 backdrop-blur-sm p-8"
        role="main">
        <Outlet />
      </div>

      <p className="mt-8 text-xs text-surface-500">
        © {new Date().getFullYear()} Devfolio. All rights reserved.
      </p>
    </div>
  );
}
