import * as React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCountUp } from "@/hooks/useCountUp";

type TrendDirection = "up" | "down" | "neutral";

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: number;
  icon?: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  duration?: number;
  accentColor?: "navy" | "cyan" | "gold" | "success" | "danger";
}

const accentColorClasses: Record<string, string> = {
  navy: "from-navy-500/10 to-navy-500/0 text-navy-600",
  cyan: "from-cyan-500/10 to-cyan-500/0 text-cyan-600",
  gold: "from-gold-500/10 to-gold-500/0 text-gold-600",
  success: "from-success-500/10 to-success-500/0 text-success-600",
  danger: "from-danger-500/10 to-danger-500/0 text-danger-600",
};

const StatCard: React.FC<StatCardProps> = ({
  className,
  title,
  value,
  icon,
  trend,
  trendLabel,
  suffix = "",
  prefix = "",
  decimals = 0,
  duration = 1500,
  accentColor = "navy",
  ...props
}) => {
  const { value: animatedValue } = useCountUp(value, { decimals, duration });

  const trendDirection: TrendDirection =
    trend === undefined
      ? "neutral"
      : trend > 0
      ? "up"
      : trend < 0
      ? "down"
      : "neutral";

  const trendIcon =
    trendDirection === "up" ? (
      <TrendingUp className="h-3.5 w-3.5 shrink-0" />
    ) : trendDirection === "down" ? (
      <TrendingDown className="h-3.5 w-3.5 shrink-0" />
    ) : (
      <Minus className="h-3.5 w-3.5 shrink-0" />
    );

  const trendColorClass =
    trendDirection === "up"
      ? "text-success-600 bg-success-50"
      : trendDirection === "down"
      ? "text-danger-600 bg-danger-50"
      : "text-slate-600 bg-slate-100";

  const formattedValue = React.useMemo(() => {
    const factor = Math.pow(10, decimals);
    const rounded = Math.round(animatedValue * factor) / factor;
    return rounded.toLocaleString("zh-CN", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }, [animatedValue, decimals]);

  return (
    <div
      className={cn(
        "relative rounded-xl p-5 bg-white border border-slate-100 shadow-card",
        "overflow-hidden transition-all duration-300 ease-out",
        "hover:shadow-card-hover hover:-translate-y-0.5",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "absolute top-0 right-0 w-40 h-40 bg-gradient-to-br",
          accentColorClasses[accentColor],
          "-translate-y-1/2 translate-x-1/2 rounded-full opacity-60 blur-2xl pointer-events-none"
        )}
        aria-hidden="true"
      />
      <div className="relative flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <div className="flex items-baseline gap-0.5">
            {prefix && (
              <span className="text-sm font-medium text-slate-500 mr-0.5">{prefix}</span>
            )}
            <span
              className={cn(
                "text-2xl font-bold tracking-tight",
                `text-${accentColor}-700`
              )}
              style={{
                color:
                  accentColor === "navy"
                    ? "#1E3F80"
                    : accentColor === "cyan"
                    ? "#0093B2"
                    : accentColor === "gold"
                    ? "#C78200"
                    : accentColor === "success"
                    ? "#059669"
                    : "#DC2626",
              }}
            >
              {formattedValue}
            </span>
            {suffix && (
              <span className="text-sm font-medium text-slate-500 ml-0.5">{suffix}</span>
            )}
          </div>
        </div>
        {icon && (
          <div
            className={cn(
              "inline-flex items-center justify-center rounded-xl p-2.5",
              "bg-gradient-to-br shrink-0",
              accentColorClasses[accentColor]
            )}
          >
            {icon}
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div className="relative mt-4 flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5",
              "text-xs font-semibold",
              trendColorClass
            )}
          >
            {trendIcon}
            {trendDirection === "up" && "+"}
            {trend.toFixed(1)}%
          </span>
          {trendLabel && (
            <span className="text-xs text-slate-500">{trendLabel}</span>
          )}
        </div>
      )}
    </div>
  );
};
StatCard.displayName = "StatCard";

export { StatCard };
