import { useState, useMemo } from "react";
import {
  Play,
  Search,
  Plus,
  Clock,
  Loader,
  CheckCircle2,
  XCircle,
  Zap,
  CalendarClock,
  BarChart3,
  AlertTriangle,
  ChevronRight,
  Timer,
  FileText,
  Link2,
  ArrowRight,
} from "lucide-react";
import { useDQCStore } from "@/store/dqc";
import { TaskStatus, Priority } from "@/data/types";
import { Modal } from "@/components/ui/Modal";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<
  TaskStatus,
  {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    progressColor: string;
    badgeVariant: "default" | "success" | "warning" | "danger" | "info";
    icon: typeof Clock;
  }
> = {
  [TaskStatus.Pending]: {
    label: "待执行",
    color: "text-slate-600",
    bgColor: "bg-slate-50",
    borderColor: "border-l-slate-400",
    progressColor: "bg-slate-300",
    badgeVariant: "default",
    icon: Clock,
  },
  [TaskStatus.Running]: {
    label: "运行中",
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
    borderColor: "border-l-cyan-500",
    progressColor: "bg-gradient-to-r from-cyan-400 to-cyan-500",
    badgeVariant: "info",
    icon: Loader,
  },
  [TaskStatus.Success]: {
    label: "已完成",
    color: "text-success-600",
    bgColor: "bg-success-50",
    borderColor: "border-l-success-500",
    progressColor: "bg-gradient-to-r from-success-400 to-success-500",
    badgeVariant: "success",
    icon: CheckCircle2,
  },
  [TaskStatus.Failed]: {
    label: "失败",
    color: "text-danger-600",
    bgColor: "bg-danger-50",
    borderColor: "border-l-danger-500",
    progressColor: "bg-gradient-to-r from-danger-400 to-danger-500",
    badgeVariant: "danger",
    icon: XCircle,
  },
};

const SEVERITY_CONFIG: Record<
  Priority,
  { label: string; className: string }
> = {
  [Priority.Critical]: { label: "紧急", className: "bg-danger-50 text-danger-700" },
  [Priority.High]: { label: "高", className: "bg-gold-50 text-gold-700" },
  [Priority.Medium]: { label: "中", className: "bg-cyan-50 text-cyan-700" },
  [Priority.Low]: { label: "低", className: "bg-slate-100 text-slate-600" },
};

function formatDateTime(iso?: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDuration(start?: string, end?: string) {
  if (!start) return "-";
  const s = new Date(start).getTime();
  const e = end ? new Date(end).getTime() : Date.now();
  const diff = Math.max(0, e - s);
  const totalSec = Math.floor(diff / 1000);
  const m = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (m === 0) return `${sec}秒`;
  return `${m}分${String(sec).padStart(2, "0")}秒`;
}

function isScheduledTask(frequency: string) {
  const lower = frequency.toLowerCase();
  return (
    lower.includes("每日") ||
    lower.includes("每小时") ||
    lower.includes("每30分钟") ||
    lower.includes("每2小时") ||
    lower.includes("每周") ||
    lower.includes("每月") ||
    lower.includes("cron")
  );
}

type FilterStatus = "all" | TaskStatus;

export default function Tasks() {
  const store = useDQCStore();
  const stats = store.taskStats();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRuleIds, setSelectedRuleIds] = useState<string[]>([]);
  const [taskName, setTaskName] = useState("");
  const [triggerType, setTriggerType] = useState<"manual" | "scheduled">("manual");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const filteredTasks = useMemo(() => {
    let result = store.tasks;
    if (filterStatus !== "all") {
      result = result.filter((t) => t.status === filterStatus);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q)
      );
    }
    return result;
  }, [store.tasks, filterStatus, searchQuery]);

  const selectedTask = selectedTaskId ? store.getTaskById(selectedTaskId) : null;
  const selectedTaskAnomalies = selectedTaskId ? store.getAnomaliesByTaskId(selectedTaskId) : [];
  const selectedTaskRule = selectedTask ? store.getRuleById(selectedTask.ruleId) : null;
  const selectedTaskTopic = selectedTaskRule ? store.getTopicById(selectedTaskRule.topicId) : null;

  const toggleRuleSelection = (ruleId: string) => {
    setSelectedRuleIds((prev) =>
      prev.includes(ruleId) ? prev.filter((id) => id !== ruleId) : [...prev, ruleId]
    );
  };

  const handleCreateTask = () => {
    if (selectedRuleIds.length === 0 || !taskName.trim()) return;
    store.createTask(selectedRuleIds, taskName.trim(), triggerType);
    setShowCreateModal(false);
    setSelectedRuleIds([]);
    setTaskName("");
    setTriggerType("manual");
  };

  const enabledRules = store.rules.filter((r) => r.status === "enabled");

  const filterTabs: { key: FilterStatus; label: string; count: number }[] = [
    { key: "all", label: "全部", count: stats.total },
    { key: TaskStatus.Pending, label: "待执行", count: stats.pending },
    { key: TaskStatus.Running, label: "运行中", count: stats.running },
    { key: TaskStatus.Success, label: "已完成", count: stats.success },
    { key: TaskStatus.Failed, label: "失败", count: stats.failed },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">检查任务</h1>
          <p className="text-sm text-slate-500 mt-1">
            管理数据质量检查任务，查看执行状态和结果
          </p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowCreateModal(true)}>
          新建任务
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          title="全部任务"
          value={stats.total}
          accentColor="navy"
          icon={<BarChart3 className="w-5 h-5" />}
        />
        <StatCard
          title="待执行"
          value={stats.pending}
          accentColor="gold"
          icon={<Clock className="w-5 h-5" />}
        />
        <StatCard
          title="运行中"
          value={stats.running}
          accentColor="cyan"
          icon={<Loader className="w-5 h-5" />}
        />
        <StatCard
          title="已完成"
          value={stats.success}
          accentColor="success"
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
        <StatCard
          title="失败"
          value={stats.failed}
          accentColor="danger"
          icon={<XCircle className="w-5 h-5" />}
        />
      </div>

      <div className="bg-white rounded-xl shadow-card border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜索任务名称、ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400"
            />
          </div>
          <div className="flex items-center gap-1">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterStatus(tab.key)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
                  filterStatus === tab.key
                    ? "bg-navy-50 text-navy-700"
                    : "text-slate-500 hover:bg-slate-100"
                )}
              >
                {tab.label}
                <span className="ml-1 text-[11px] opacity-70">{tab.count}</span>
              </button>
            ))}
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">暂无匹配的任务</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filteredTasks.map((task) => {
              const config = STATUS_CONFIG[task.status];
              const rule = store.getRuleById(task.ruleId);
              const isScheduled = rule ? isScheduledTask(rule.frequency) : false;
              const isRunning = task.status === TaskStatus.Running;

              return (
                <div
                  key={task.id}
                  className={cn(
                    "relative flex border-l-4 cursor-pointer transition-all duration-200 hover:bg-slate-50/80",
                    config.borderColor,
                    isRunning && "animate-[pulse-glow_2s_ease-in-out_infinite]"
                  )}
                  onClick={() => setSelectedTaskId(task.id)}
                >
                  <div className="flex-1 p-5">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <Badge variant={config.badgeVariant} withDot>
                        {config.label}
                      </Badge>
                      <span className="font-mono text-xs text-slate-400">
                        {task.id}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium",
                          isScheduled
                            ? "bg-navy-50 text-navy-600"
                            : "bg-gold-50 text-gold-600"
                        )}
                      >
                        {isScheduled ? (
                          <CalendarClock className="w-3 h-3" />
                        ) : (
                          <Zap className="w-3 h-3" />
                        )}
                        {isScheduled ? "定时任务" : "临时任务"}
                      </span>
                      {task.anomalyCount > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-danger-50 text-danger-600">
                          <AlertTriangle className="w-3 h-3" />
                          {task.anomalyCount} 个异常
                        </span>
                      )}
                    </div>

                    <h4 className="font-semibold text-slate-800 mb-3">{task.name}</h4>

                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-500">执行进度</span>
                        <span className={cn("font-medium tabular-nums", config.color)}>
                          {task.progress}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-700 ease-out",
                            config.progressColor,
                            isRunning && "animate-pulse"
                          )}
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-5 text-xs text-slate-500 flex-wrap">
                      <span>开始: {formatDateTime(task.startedAt)}</span>
                      <span>结束: {formatDateTime(task.finishedAt)}</span>
                      <span className="flex items-center gap-1">
                        <Timer className="w-3 h-3" />
                        耗时: {formatDuration(task.startedAt, task.finishedAt)}
                      </span>
                      {task.recordCount > 0 && (
                        <span>数据量: {task.recordCount.toLocaleString()}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-4" onClick={(e) => e.stopPropagation()}>
                    {isRunning && (
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<Play className="w-3.5 h-3.5" />}
                        onClick={() => store.simulateTaskProgress(task.id)}
                      >
                        推进
                      </Button>
                    )}
                    <button
                      className="p-1.5 text-slate-400 hover:text-navy-600 hover:bg-slate-100 rounded-lg transition-colors"
                      onClick={() => setSelectedTaskId(task.id)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="新建检查任务"
        description="选择规则并发起数据质量检查任务"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              取消
            </Button>
            <Button
              leftIcon={<Play className="w-4 h-4" />}
              disabled={selectedRuleIds.length === 0 || !taskName.trim()}
              onClick={handleCreateTask}
            >
              发起检查
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              任务名称 <span className="text-danger-500">*</span>
            </label>
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="请输入任务名称"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              触发类型
            </label>
            <div className="flex gap-3">
              {([
                { value: "manual" as const, label: "手动触发", icon: Zap },
                { value: "scheduled" as const, label: "定时调度", icon: CalendarClock },
              ]).map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setTriggerType(opt.value)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all",
                      triggerType === opt.value
                        ? "border-navy-400 bg-navy-50 text-navy-700 ring-2 ring-navy-500/20"
                        : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              选择规则 <span className="text-danger-500">*</span>
              <span className="text-xs text-slate-400 font-normal ml-2">
                已选 {selectedRuleIds.length} 项
              </span>
            </label>
            <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
              {enabledRules.map((rule) => {
                const checked = selectedRuleIds.includes(rule.id);
                return (
                  <label
                    key={rule.id}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors",
                      checked ? "bg-navy-50/60" : "hover:bg-slate-50"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleRuleSelection(rule.id)}
                      className="w-4 h-4 rounded border-slate-300 text-navy-600 focus:ring-navy-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-slate-800 font-medium truncate">
                        {rule.name}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{store.RULE_TYPE_LABELS[rule.type]}</span>
                        <span>·</span>
                        <span>{rule.frequency}</span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </Modal>

      <Drawer
        open={!!selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        title="任务详情"
        size="lg"
      >
        {selectedTask && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant={STATUS_CONFIG[selectedTask.status].badgeVariant} withDot>
                  {STATUS_CONFIG[selectedTask.status].label}
                </Badge>
                <span className="font-mono text-xs text-slate-400">
                  {selectedTask.id}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-800 mb-4">
                {selectedTask.name}
              </h2>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "开始时间", value: formatDateTime(selectedTask.startedAt) },
                  { label: "结束时间", value: formatDateTime(selectedTask.finishedAt) },
                  {
                    label: "耗时",
                    value: formatDuration(selectedTask.startedAt, selectedTask.finishedAt),
                  },
                  {
                    label: "执行进度",
                    value: `${selectedTask.progress}%`,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-slate-50 rounded-lg px-3 py-2.5"
                  >
                    <p className="text-xs text-slate-500 mb-0.5">{item.label}</p>
                    <p className="text-sm font-semibold text-slate-800">{item.value}</p>
                  </div>
                ))}
              </div>

              {selectedTask.status === TaskStatus.Running && (
                <div className="mt-3">
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500 transition-all duration-700 ease-out animate-pulse"
                      style={{ width: `${selectedTask.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-500" />
                影响范围统计
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-cyan-50/50 border border-cyan-100 rounded-lg px-4 py-3">
                  <p className="text-xs text-cyan-600 mb-1">检查数据量</p>
                  <p className="text-xl font-bold text-cyan-700 tabular-nums">
                    {selectedTask.recordCount.toLocaleString()}
                  </p>
                </div>
                <div className="bg-danger-50/50 border border-danger-100 rounded-lg px-4 py-3">
                  <p className="text-xs text-danger-600 mb-1">异常数量</p>
                  <p className="text-xl font-bold text-danger-700 tabular-nums">
                    {selectedTask.anomalyCount}
                  </p>
                </div>
              </div>
            </div>

            {selectedTaskTopic && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-navy-500" />
                  关联主题
                </h3>
                <div className="bg-navy-50/50 border border-navy-100 rounded-lg px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-navy-800">
                      {selectedTaskTopic.name}
                    </p>
                    <p className="text-xs text-navy-500 mt-0.5">
                      {selectedTaskTopic.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-navy-700 tabular-nums">
                      {selectedTaskTopic.score}
                    </p>
                    <p className="text-xs text-navy-400">质量得分</p>
                  </div>
                </div>
              </div>
            )}

            {selectedTask.status === TaskStatus.Running && (
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  leftIcon={<Play className="w-3.5 h-3.5" />}
                  onClick={() => store.simulateTaskProgress(selectedTask.id)}
                >
                  模拟推进进度
                </Button>
                <span className="text-xs text-slate-400">
                  点击推进任务执行进度
                </span>
              </div>
            )}

            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-gold-500" />
                异常明细
                {selectedTaskAnomalies.length > 0 && (
                  <span className="text-xs font-normal text-slate-400">
                    共 {selectedTaskAnomalies.length} 条
                  </span>
                )}
              </h3>
              {selectedTaskAnomalies.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">暂无异常记录</p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="text-left px-3 py-2.5 text-xs font-medium text-slate-500">
                          异常描述
                        </th>
                        <th className="text-left px-3 py-2.5 text-xs font-medium text-slate-500">
                          数据标识
                        </th>
                        <th className="text-center px-3 py-2.5 text-xs font-medium text-slate-500">
                          严重程度
                        </th>
                        <th className="text-center px-3 py-2.5 text-xs font-medium text-slate-500">
                          关联工单
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedTaskAnomalies.map((anomaly) => {
                        const severity = SEVERITY_CONFIG[anomaly.severity];
                        return (
                          <tr key={anomaly.id} className="hover:bg-slate-50/50">
                            <td className="px-3 py-2.5 text-slate-700 max-w-[200px] truncate">
                              {anomaly.description}
                            </td>
                            <td className="px-3 py-2.5 font-mono text-xs text-slate-500">
                              {anomaly.dataKey}
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <span
                                className={cn(
                                  "inline-block px-2 py-0.5 rounded text-xs font-medium",
                                  severity.className
                                )}
                              >
                                {severity.label}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              {anomaly.ticketed && anomaly.ticketId ? (
                                <span className="inline-flex items-center gap-1 text-xs text-navy-600 font-medium hover:text-navy-800 cursor-pointer">
                                  {anomaly.ticketId}
                                  <ArrowRight className="w-3 h-3" />
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
