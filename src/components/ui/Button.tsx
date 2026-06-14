import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    "bg-gradient-to-r from-navy-600 to-navy-700 text-white",
    "hover:from-navy-700 hover:to-navy-800",
    "active:from-navy-800 active:to-navy-900",
    "shadow-sm shadow-navy-500/20",
    "focus-visible:ring-navy-500/40",
  ].join(" "),
  secondary: [
    "bg-slate-100 text-navy-800",
    "hover:bg-slate-200",
    "active:bg-slate-300",
    "focus-visible:ring-slate-400/40",
  ].join(" "),
  outline: [
    "bg-white text-navy-700 border border-slate-200",
    "hover:bg-slate-50 hover:border-slate-300",
    "active:bg-slate-100",
    "focus-visible:ring-navy-500/30",
  ].join(" "),
  ghost: [
    "bg-transparent text-navy-700",
    "hover:bg-slate-100",
    "active:bg-slate-200",
    "focus-visible:ring-slate-400/40",
  ].join(" "),
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-xl",
  lg: "h-12 px-6 text-base gap-2.5 rounded-xl",
  icon: "h-10 w-10 rounded-xl",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    const isDisabled = loading || disabled;
    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(
          "inline-flex items-center justify-center font-medium",
          "transition-all duration-200 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden="true" />
        )}
        {!loading && leftIcon && (
          <span className="shrink-0 flex items-center justify-center">{leftIcon}</span>
        )}
        {children && <span className="truncate">{children}</span>}
        {!loading && rightIcon && (
          <span className="shrink-0 flex items-center justify-center">{rightIcon}</span>
        )}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
