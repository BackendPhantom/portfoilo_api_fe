/* ============================================
   Devfolio — Breadcrumbs Component
   ============================================ */

import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface Crumb {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: Crumb[];
  className?: string;
}

export default function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("mb-6", className)}>
      <ol className="flex items-center gap-1.5 text-sm text-surface-400">
        <li>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 hover:text-surface-200 transition-colors">
            <Home className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="sr-only">Dashboard</span>
          </Link>
        </li>

        {items.map((item, idx) => (
          <li key={idx} className="flex items-center gap-1.5">
            <ChevronRight
              className="h-3.5 w-3.5 text-surface-600"
              aria-hidden="true"
            />
            {item.href ? (
              <Link
                to={item.href}
                className="rounded-md px-1.5 py-0.5 hover:text-surface-200 transition-colors">
                {item.label}
              </Link>
            ) : (
              <span
                className="px-1.5 py-0.5 text-surface-200"
                aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
