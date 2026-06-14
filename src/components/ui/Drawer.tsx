import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type DrawerSize = "sm" | "md" | "lg" | "xl";

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  size?: DrawerSize;
  closable?: boolean;
  overlayClassName?: string;
  contentClassName?: string;
  footer?: React.ReactNode;
}

const sizeClasses: Record<DrawerSize, string> = {
  sm: "w-80",
  md: "w-96",
  lg: "w-[32rem]",
  xl: "w-[40rem]",
};

const Drawer: React.FC<DrawerProps> = ({
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
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && closable) {
        onClose();
      }
    },
    [closable, onClose]
  );

  React.useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      className={cn("fixed inset-0 z-50")}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cn(
          "absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in",
          overlayClassName
        )}
        onClick={() => closable && onClose()}
        aria-hidden="true"
      />
      <div
        className={cn(
          "fixed top-0 right-0 h-full",
          "bg-white shadow-modal border-l border-slate-100",
          "transform transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
          sizeClasses[size],
          contentClassName
        )}
      >
        <div className="flex flex-col h-full">
          {(title || closable) && (
            <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100">
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
                  aria-label="关闭抽屉"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
          <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
          {footer && (
            <div
              className={cn(
                "flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100",
                "bg-slate-50/50"
              )}
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
Drawer.displayName = "Drawer";

export { Drawer };
