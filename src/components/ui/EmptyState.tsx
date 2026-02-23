/* ============================================
   Devfolio — EmptyState Component
   ============================================ */

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { FolderOpen } from "lucide-react";
import Button from "./Button";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-surface-700 bg-surface-900/30 py-16 px-8 text-center",
        className
      )}>
      <div className="mb-4 rounded-full bg-surface-800 p-4 text-surface-500">
        {icon || <FolderOpen className="h-8 w-8" />}
      </div>
      <h3 className="mb-1 text-lg font-semibold text-surface-200">{title}</h3>
      {description && (
        <p className="mb-6 max-w-sm text-sm text-surface-400">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} size="sm">
          {action.label}
        </Button>
      )}
    </div>
  );
}
