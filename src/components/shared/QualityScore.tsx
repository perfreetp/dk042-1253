import * as React from "react";
import { cn } from "@/lib/utils";
import { useCountUp } from "@/hooks/useCountUp";

type ScoreLevel = "excellent" | "good" | "fair" | "poor" | "critical";

export interface QualityScoreProps extends React.HTMLAttributes<HTMLDivElement> {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  animated?: boolean;
  duration?: number;
}

const sizeConfig = {
  sm: {
    container: "w-20 h-20",
    strokeWidth: 6,
    labelSize: "text-xs",
    scoreSize: "text-xl",
  },
  md: {
    container: "w-28 h-28",
    strokeWidth: 8,
    labelSize: "text-sm",
    scoreSize: "text-2xl",
  },
  lg: {
    container: "w-36 h-36",
    strokeWidth: 10,
    labelSize: "text-base",
    scoreSize: "text-4xl",
  },
};

function getScoreLevel(score: number): ScoreLevel {
  if (score >= 90) return "excellent";
  if (score >= 75) return "good";
  if (score >= 60) return "fair";
  if (score >= 40) return "poor";
  return "critical";
}

function getLevelConfig(level: ScoreLevel) {
  const configs: Record<ScoreLevel, { label: string; gradient: string; text: string }> = {
    excellent: {
      label: "优秀",
      gradient: "from-success-400 to-success-600",
      text: "text-success-600",
    },
    good: {
      label: "良好",
      gradient: "from-cyan-400 to-cyan-600",
      text: "text-cyan-600",
    },
    fair: {
      label: "一般",
      gradient: "from-gold-400 to-gold-600",
      text: "text-gold-600",
    },
    poor: {
      label: "较差",
      gradient: "from-gold-500 to-danger-500",
      text: "text-danger-600",
    },
    critical: {
      label: "严重",
      gradient: "from-danger-400 to-danger-600",
      text: "text-danger-600",
    },
  };
  return configs[level];
}

function getGradientId(size: string): string {
  return `quality-score-gradient-${size}-${Math.random().toString(36).slice(2, 9)}`;
}

const QualityScore: React.FC<QualityScoreProps> = ({
  className,
  score,
  size = "md",
  showLabel = true,
  animated = true,
  duration = 1500,
  ...props
}) => {
  const clampedScore = Math.min(Math.max(score, 0), 100);
  const level = getScoreLevel(clampedScore);
  const levelConfig = getLevelConfig(level);
  const config = sizeConfig[size];

  const { value: animatedScore } = useCountUp(clampedScore, {
    decimals: clampedScore % 1 === 0 ? 0 : 1,
    duration,
  });

  const displayScore = animated ? animatedScore : clampedScore;
  const gradientId = React.useMemo(() => getGradientId(size), [size]);

  const radius = 50 - config.strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  return (
    <div
      className={cn(
        "relative inline-flex flex-col items-center justify-center gap-2",
        className
      )}
      {...props}
    >
      <div className={cn("relative", config.container)}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full -rotate-90"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              {levelConfig.gradient.split(" ").map((step, index) => {
                const [color] = step.replace("from-", "").replace("via-", "").replace("to-", "").split(":");
                const stopColor =
                  step.includes("from-") || step.includes("from-success")
                    ? level === "excellent"
                      ? "#34D399"
                      : level === "good"
                      ? "#4FBBD8"
                      : level === "fair"
                      ? "#F2B832"
                      : level === "poor"
                      ? "#F4A100"
                      : "#F87171"
                    : level === "excellent"
                    ? "#059669"
                    : level === "good"
                    ? "#0093B2"
                    : level === "fair"
                    ? "#C78200"
                    : level === "poor"
                    ? "#DC2626"
                    : "#B91C1C";
                return (
                  <stop
                    key={index}
                    offset={`${(index / (levelConfig.gradient.split(" ").length - 1)) * 100}%`}
                    stopColor={stopColor}
                  />
                );
              })}
            </linearGradient>
          </defs>
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#F1F5F9"
            strokeWidth={config.strokeWidth}
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={cn("transition-all duration-1000 ease-out")}
            style={{
              transitionDuration: `${duration}ms`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn(
              "font-bold leading-none tracking-tight",
              config.scoreSize,
              levelConfig.text
            )}
          >
            {displayScore.toFixed(clampedScore % 1 === 0 ? 0 : 1)}
          </span>
        </div>
      </div>
      {showLabel && (
        <div className="flex flex-col items-center gap-0.5">
          <span
            className={cn(
              "font-semibold",
              config.labelSize,
              levelConfig.text
            )}
          >
            {levelConfig.label}
          </span>
          <span className="text-xs text-slate-500">数据质量分</span>
        </div>
      )}
    </div>
  );
};
QualityScore.displayName = "QualityScore";

export { QualityScore };
