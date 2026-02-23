/* ============================================
   Devfolio — Avatar Component
   ============================================ */

import { cn, getInitials } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  firstName?: string;
  lastName?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl",
};

export default function Avatar({
  src,
  firstName = "",
  lastName = "",
  size = "md",
  className,
}: AvatarProps) {
  const initials = getInitials(firstName, lastName);

  if (src) {
    return (
      <img
        src={src}
        alt={`${firstName} ${lastName}`}
        className={cn(
          "rounded-full object-cover ring-2 ring-surface-700",
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-brand-600/20 font-semibold text-brand-400 ring-2 ring-surface-700",
        sizeClasses[size],
        className
      )}
      aria-label={`${firstName} ${lastName}`}>
      {initials || "?"}
    </div>
  );
}
