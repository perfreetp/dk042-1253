import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type ModalSize = "sm" | "md" | "lg" | "xl";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  size?: ModalSize;
  closable?: boolean;
  overlayClassName?: string;
  contentClassName?: string;
  footer?: React.ReactNode;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  children,
  title,
  description,
  size = "md",
  closable = true,
  overlayClassName,
  contentClassName,
  footer,
}) => {
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape" && closable) {
        onClose();
      }
    },
    [closable, onClose]
  );

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4",
        "animate-fade-in"
      )}
      role="dialog"
      aria-modal="true"
      onKeyDown={handleKeyDown}
    >
      <div
        className={cn(
          "absolute inset-0 bg-slate-900/50 backdrop-blur-sm",
          "transition-opacity duration-300",
          overlayClassName
        )}
        onClick={() => closable && onClose()}
        aria-hidden="true"
      />
      <div
        className={cn(
          "relative z-10 w-full",
          "bg-white rounded-2xl shadow-modal border border-slate-100",
          "animate-fade-in-up",
          sizeClasses[size],
          contentClassName
        )}
      >
        {(title || closable) && (
          <div className="flex items-start justify-between px-6 pt-6 pb-4">
            <div className="flex-1 pr-4">
              {title && (
                <h3 className="text-lg font-semibold text-navy-800 leading-none">
                  {title}
                </h3>
              )}
              {description && (
                <p className="mt-2 text-sm text-slate-500">{description}</p>
              )}
            </div>
            {closable && (
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  "shrink-0 inline-flex items-center justify-center rounded-lg",
                  "h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100",
                  "transition-colors duration-200 focus:outline-none focus-visible:ring-2",
                  "focus-visible:ring-navy-500/40 focus-visible:ring-offset-2"
                )}
                aria-label="关闭弹窗"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
        <div className="px-6 pb-6">{children}</div>
        {footer && (
          <div
            className={cn(
              "flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100",
              "rounded-b-2xl bg-slate-50/50"
            )}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
Modal.displayName = "Modal";

export { Modal };
