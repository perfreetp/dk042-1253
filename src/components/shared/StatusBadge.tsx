import * as React from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Shield,
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Ticket,
  ArrowUpCircle,
  MinusCircle,
  Gauge,
} from "lucide-react";
import { cn } from "@/lib/utils";

type RuleStatus = "active" | "inactive" | "draft";
type TaskStatus = "running" | "success" | "failed" | "pending" | "paused";
type TicketStatus = "open" | "processing" | "resolved" | "closed";
type Priority = "critical" | "high" | "medium" | "low";

export type StatusBadgeKind =
  | { type: "rule"; status: RuleStatus }
  | { type: "task"; status: TaskStatus }
  | { type: "ticket"; status: TicketStatus }
  | { type: "priority"; level: Priority };

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  kind: StatusBadgeKind;
  showIcon?: boolean;
  size?: "sm" | "md";
}

interface StatusConfig {
  label: string;
  className: string;
  icon: React.ReactNode;
}

const ruleStatusConfig: Record<RuleStatus, StatusConfig> = {
  active: {
    label: "已启用",
    className: "bg-success-50 text-success-700 before:bg-success-500",
    icon: <ShieldCheck className="h-3.5 w-3.5" />,
  },
  inactive: {
    label: "已停用",
    className: "bg-slate-100 text-slate-600 before:bg-slate-400",
    icon: <ShieldAlert className="h-3.5 w-3.5" />,
  },
  draft: {
    label: "草稿",
    className: "bg-gold-50 text-gold-700 before:bg-gold-500",
    icon: <Shield className="h-3.5 w-3.5" />,
  },
};

const taskStatusConfig: Record<TaskStatus, StatusConfig> = {
  running: {
    label: "执行中",
    className: "bg-cyan-50 text-cyan-700 before:bg-cyan-500",
    icon: <Play className="h-3.5 w-3.5" />,
  },
  success: {
    label: "成功",
    className: "bg-success-50 text-success-700 before:bg-success-500",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  failed: {
    label: "失败",
    className: "bg-danger-50 text-danger-700 before:bg-danger-500",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
  pending: {
    label: "等待中",
    className: "bg-slate-100 text-slate-600 before:bg-slate-400",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  paused: {
    label: "已暂停",
    className: "bg-gold-50 text-gold-700 before:bg-gold-500",
    icon: <Pause className="h-3.5 w-3.5" />,
  },
};

const ticketStatusConfig: Record<TicketStatus, StatusConfig> = {
  open: {
    label: "待处理",
    className: "bg-danger-50 text-danger-700 before:bg-danger-500",
    icon: <Ticket className="h-3.5 w-3.5" />,
  },
  processing: {
    label: "处理中",
    className: "bg-cyan-50 text-cyan-700 before:bg-cyan-500",
    icon: <Play className="h-3.5 w-3.5" />,
  },
  resolved: {
    label: "已解决",
    className: "bg-success-50 text-success-700 before:bg-success-500",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  closed: {
    label: "已关闭",
    className: "bg-slate-100 text-slate-600 before:bg-slate-400",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
};

const priorityConfig: Record<Priority, StatusConfig> = {
  critical: {
    label: "紧急",
    className: "bg-danger-50 text-danger-700 before:bg-danger-500",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
  },
  high: {
    label: "高",
    className: "bg-gold-50 text-gold-700 before:bg-gold-500",
    icon: <ArrowUpCircle className="h-3.5 w-3.5" />,
  },
  medium: {
    label: "中",
    className: "bg-cyan-50 text-cyan-700 before:bg-cyan-500",
    icon: <MinusCircle className="h-3.5 w-3.5" />,
  },
  low: {
    label: "低",
    className: "bg-slate-100 text-slate-600 before:bg-slate-400",
    icon: <Gauge className="h-3.5 w-3.5" />,
  },
};

const sizeClasses = {
  sm: "px-2 py-0.5 text-[11px] gap-1",
  md: "px-2.5 py-0.5 text-xs gap-1.5",
};

function getConfig(kind: StatusBadgeKind): StatusConfig {
  switch (kind.type) {
    case "rule":
      return ruleStatusConfig[kind.status];
    case "task":
      return taskStatusConfig[kind.status];
    case "ticket":
      return ticketStatusConfig[kind.status];
    case "priority":
      return priorityConfig[kind.level];
  }
}

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ className, kind, showIcon = true, size = "md", ...props }, ref) => {
    const config = getConfig(kind);
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full font-medium whitespace-nowrap leading-5",
          "before:inline-flex before:w-1.5 before:h-1.5 before:rounded-full before:shrink-0",
          "before:animate-pulse",
          sizeClasses[size],
          config.className,
          className
        )}
        {...props}
      >
        {showIcon && (
          <span className="shrink-0 inline-flex items-center justify-center">
            {config.icon}
          </span>
        )}
        <span>{config.label}</span>
      </span>
    );
  }
);
StatusBadge.displayName = "StatusBadge";

export { StatusBadge };
