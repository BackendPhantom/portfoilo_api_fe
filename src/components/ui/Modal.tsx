/* ============================================
   Devfolio — Modal / Dialog Component
   ============================================ */

import { useEffect, useRef, useCallback, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
  className,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Focus trap
  useEffect(() => {
    if (!open) return;

    const el = contentRef.current;
    if (!el) return;

    // Only auto-focus on initial open — not on every re-render.
    // Try to focus the first input/select/textarea; fall back to the first button.
    const firstInput = el.querySelector<HTMLElement>("input, select, textarea");
    const firstFocusable = el.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    (firstInput ?? firstFocusable)?.focus();

    const getFocusBoundaries = () => {
      const focusable = el.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      return { first: focusable[0], last: focusable[focusable.length - 1] };
    };

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const { first, last } = getFocusBoundaries();
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleTab);
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleTab);
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]); // only re-run when open/closed — NOT on every onClose ref change

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) onClose();
    },
    [onClose]
  );

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      aria-describedby={description ? "modal-desc" : undefined}>
      <div
        ref={contentRef}
        className={cn(
          "w-full rounded-xl border border-surface-800 bg-surface-900 shadow-2xl animate-fade-in",
          sizeClasses[size],
          className
        )}>
        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between border-b border-surface-800 px-6 py-4">
            <div>
              {title && (
                <h2 className="text-lg font-semibold text-surface-100">
                  {title}
                </h2>
              )}
              {description && (
                <p id="modal-desc" className="mt-1 text-sm text-surface-400">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-surface-400 hover:bg-surface-800 hover:text-surface-200 transition-colors cursor-pointer"
              aria-label="Close dialog">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
}

// Confirmation dialog shorthand
interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Delete",
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-surface-400 text-sm mb-6">{message}</p>
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={onClose}
          className="h-10 rounded-lg border border-surface-700 bg-surface-800 px-4 text-sm font-medium text-surface-300 hover:bg-surface-700 transition-colors cursor-pointer">
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="h-10 rounded-lg bg-danger-600 px-4 text-sm font-medium text-white hover:bg-danger-500 disabled:opacity-50 transition-colors cursor-pointer">
          {loading ? "Deleting…" : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
