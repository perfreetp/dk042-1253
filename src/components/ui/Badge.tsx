import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  withDot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: [
    "bg-slate-100 text-slate-700",
    "before:bg-slate-500",
  ].join(" "),
  success: [
    "bg-success-50 text-success-700",
    "before:bg-success-500",
  ].join(" "),
  warning: [
    "bg-gold-50 text-gold-700",
    "before:bg-gold-500",
  ].join(" "),
  danger: [
    "bg-danger-50 text-danger-700",
    "before:bg-danger-500",
  ].join(" "),
  info: [
    "bg-cyan-50 text-cyan-700",
    "before:bg-cyan-500",
  ].join(" "),
};

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", withDot = false, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1.5",
        "px-2.5 py-0.5 rounded-full text-xs font-medium",
        "leading-5 whitespace-nowrap",
        variantClasses[variant],
        withDot && "before:inline-flex before:w-1.5 before:h-1.5 before:rounded-full before:shrink-0",
        className
      )}
      {...props}
    />
  )
);
Badge.displayName = "Badge";

export { Badge };
