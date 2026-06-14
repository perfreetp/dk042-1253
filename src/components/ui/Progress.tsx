import * as React from "react";
import { cn } from "@/lib/utils";

type ProgressColor = "primary" | "success" | "warning" | "danger" | "cyan" | "gold";
type ProgressSize = "sm" | "md" | "lg";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  color?: ProgressColor;
  size?: ProgressSize;
  showLabel?: boolean;
  animated?: boolean;
}

const colorClasses: Record<ProgressColor, string> = {
  primary: "bg-gradient-to-r from-navy-500 to-navy-600",
  success: "bg-gradient-to-r from-success-400 to-success-500",
  warning: "bg-gradient-to-r from-gold-400 to-gold-500",
  danger: "bg-gradient-to-r from-danger-400 to-danger-500",
  cyan: "bg-gradient-to-r from-cyan-400 to-cyan-500",
  gold: "bg-gradient-to-r from-gold-400 to-gold-500",
};

const sizeClasses: Record<ProgressSize, string> = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      value = 0,
      max = 100,
      color = "primary",
      size = "md",
      showLabel = false,
      animated = false,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className={cn("w-full", className)}
        {...props}
      >
        {showLabel && (
          <div className="flex justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-600">{Math.round(percentage)}%</span>
          </div>
        )}
        <div
          className={cn(
            "w-full bg-slate-100 rounded-full overflow-hidden",
            sizeClasses[size]
          )}
        >
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700 ease-out",
              colorClasses[color],
              animated && "animate-pulse"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };
