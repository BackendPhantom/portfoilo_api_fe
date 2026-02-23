/* ============================================
   Devfolio — Badge Component
   ============================================ */

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "brand";

type BadgeSize = "sm" | "md";

export interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  dot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-surface-800 text-surface-300 border-surface-700",
  success: "bg-success-500/10 text-success-500 border-success-500/20",
  warning: "bg-warning-500/10 text-warning-500 border-warning-500/20",
  danger: "bg-danger-500/10 text-danger-500 border-danger-500/20",
  info: "bg-info-500/10 text-info-500 border-info-500/20",
  brand: "bg-brand-500/10 text-brand-400 border-brand-500/20",
};

const dotColors: Record<BadgeVariant, string> = {
  default: "bg-surface-400",
  success: "bg-success-500",
  warning: "bg-warning-500",
  danger: "bg-danger-500",
  info: "bg-info-500",
  brand: "bg-brand-500",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "px-1.5 py-0 text-[0.65rem]",
  md: "px-2.5 py-0.5 text-xs",
};

export default function Badge({
  children,
  variant = "default",
  size = "md",
  className,
  dot,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}>
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full", dotColors[variant])}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
