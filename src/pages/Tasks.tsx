import { Play, Pause, RefreshCw, Clock, CheckCircle2, XCircle, Loader } from "lucide-react";

export default function Tasks() {
  const tasks = [
    {
      id: "DQ-8821",
      name: "客户数据日检任务",
      type: "定时任务",
      status: "success",
      progress: 100,
      startTime: "2026-06-15 02:00",
      endTime: "2026-06-15 02:15",
      duration: "15分23秒",
      ruleCount: 128,
      issueCount: 23,
    },
    {
      id: "DQ-8822",
      name: "交易数据实时校验",
      type: "实时任务",
      status: "running",
      progress: 68,
      startTime: "2026-06-15 08:00",
      endTime: "-",
      duration: "运行中",
      ruleCount: 256,
      issueCount: 45,
    },
    {
      id: "DQ-8823",
      name: "财务月度校验",
      type: "定时任务",
      status: "pending",
      progress: 0,
      startTime: "2026-06-15 22:00",
      endTime: "-",
      duration: "-",
      ruleCount: 89,
      issueCount: "-",
    },
    {
      id: "DQ-8824",
      name: "产品数据一致性校验",
      type: "手动任务",
      status: "failed",
      progress: 52,
      startTime: "2026-06-14 16:30",
      endTime: "2026-06-14 16:48",
      duration: "18分05秒",
      ruleCount: 64,
      issueCount: 12,
    },
    {
      id: "DQ-8825",
      name: "风控数据全量校验",
      type: "手动任务",
      status: "success",
      progress: 100,
      startTime: "2026-06-14 10:00",
      endTime: "2026-06-14 10:42",
      duration: "42分18秒",
      ruleCount: 187,
      issueCount: 8,
    },
  ];

  const statusConfig = {
    success: {
      icon: CheckCircle2,
      color: "text-success-500",
      bg: "bg-success-50",
      text: "成功",
      textClass: "text-success-700",
      progress: "bg-success-500",
    },
    running: {
      icon: Loader,
      color: "text-cyan-500",
      bg: "bg-cyan-50",
      text: "运行中",
      textClass: "text-cyan-700",
      progress: "bg-cyan-500",
    },
    pending: {
      icon: Clock,
      color: "text-slate-400",
      bg: "bg-slate-50",
      text: "待执行",
      textClass: "text-slate-600",
      progress: "bg-slate-200",
    },
    failed: {
      icon: XCircle,
      color: "text-danger-500",
      bg: "bg-danger-50",
      text: "失败",
      textClass: "text-danger-700",
      progress: "bg-danger-500",
    },
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">检查任务</h1>
          <p className="text-sm text-slate-500 mt-1">
            管理数据质量检查任务，查看执行状态和结果
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-sm text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
            <RefreshCw className="w-4 h-4" />
            刷新
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-navy-700 hover:bg-navy-800 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
            <Play className="w-4 h-4" />
            新建任务
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "今日任务", value: "156", icon: Play, color: "navy" },
          { label: "运行中", value: "12", icon: Loader, color: "cyan" },
          { label: "成功完成", value: "128", icon: CheckCircle2, color: "success" },
          { label: "执行失败", value: "16", icon: XCircle, color: "danger" },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-card border border-slate-100 p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-slate-500">{item.label}</p>
                <Icon
                  className={`w-5 h-5 ${
                    item.color === "navy"
                      ? "text-navy-500"
                      : item.color === "cyan"
                      ? "text-cyan-500"
                      : item.color === "success"
                      ? "text-success-500"
                      : "text-danger-500"
                  }`}
                />
              </div>
              <p className="text-2xl font-bold text-slate-800 tabular-nums">
                {item.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-card border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">任务列表</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {tasks.map((task) => {
            const config = statusConfig[task.status as keyof typeof statusConfig];
            const StatusIcon = config.icon;
            return (
              <div
                key={task.id}
                className="p-5 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.textClass}`}
                      >
                        <StatusIcon
                          className={`w-3.5 h-3.5 ${task.status === "running" ? "animate-spin" : ""}`}
                        />
                        {config.text}
                      </span>
                      <span className="font-mono text-xs text-slate-400">
                        {task.id}
                      </span>
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {task.type}
                      </span>
                    </div>
                    <h4 className="font-semibold text-slate-800 mb-3">
                      {task.name}
                    </h4>
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-500">执行进度</span>
                        <span className="font-medium text-slate-700 tabular-nums">
                          {task.progress}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${config.progress}`}
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-xs text-slate-500">
                      <span>开始: {task.startTime}</span>
                      <span>结束: {task.endTime}</span>
                      <span>耗时: {task.duration}</span>
                      <span>规则数: {task.ruleCount}</span>
                      <span>发现问题: {task.issueCount}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {task.status === "running" ? (
                      <button className="p-2 text-gold-600 hover:bg-gold-50 rounded-lg transition-colors">
                        <Pause className="w-4 h-4" />
                      </button>
                    ) : task.status === "pending" || task.status === "failed" ? (
                      <button className="p-2 text-success-600 hover:bg-success-50 rounded-lg transition-colors">
                        <Play className="w-4 h-4" />
                      </button>
                    ) : (
                      <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
