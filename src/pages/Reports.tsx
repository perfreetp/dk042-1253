import { useMemo, useState } from "react";
import { FileBarChart, Download, ChevronRight, ChevronDown, Table2, Filter, TrendingUp, TrendingDown, FileQuestion } from "lucide-react";
import { useDQCStore } from "@/store/dqc";
import { RuleType, RuleStatus, TicketStatus, Priority } from "@/data/types";
import TrendLineChart from "@/components/charts/TrendLineChart";
import HorizontalBarChart from "@/components/charts/HorizontalBarChart";
import DonutChart from "@/components/charts/DonutChart";
import ColumnChart from "@/components/charts/ColumnChart";
import GaugeChart from "@/components/charts/GaugeChart";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type TimeRange = 7 | 30 | 90;

const RULE_TYPE_OPTIONS = [
  { value: RuleType.Completeness, label: "完整性" },
  { value: RuleType.Accuracy, label: "准确性" },
  { value: RuleType.Consistency, label: "一致性" },
  { value: RuleType.Timeliness, label: "及时性" },
  { value: RuleType.Uniqueness, label: "唯一性" },
];

const RULE_STATUS_LABEL: Record<string, string> = {
  [RuleStatus.Enabled]: "已启用",
  [RuleStatus.Disabled]: "已禁用",
  [RuleStatus.Pending]: "待审核",
};

const RULE_STATUS_VARIANT: Record<string, "success" | "danger" | "warning"> = {
  [RuleStatus.Enabled]: "success",
  [RuleStatus.Disabled]: "danger",
  [RuleStatus.Pending]: "warning",
};

const TICKET_STATUS_LABEL: Record<string, string> = {
  [TicketStatus.Open]: "待处理",
  [TicketStatus.InProgress]: "处理中",
  [TicketStatus.PendingReview]: "待验证",
  [TicketStatus.Resolved]: "已解决",
  [TicketStatus.Closed]: "已关闭",
};

const TICKET_STATUS_VARIANT: Record<string, "danger" | "warning" | "info" | "success" | "default"> = {
  [TicketStatus.Open]: "danger",
  [TicketStatus.InProgress]: "warning",
  [TicketStatus.PendingReview]: "info",
  [TicketStatus.Resolved]: "success",
  [TicketStatus.Closed]: "default",
};

const PRIORITY_LABEL: Record<string, string> = {
  [Priority.Critical]: "紧急",
  [Priority.High]: "高",
  [Priority.Medium]: "中",
  [Priority.Low]: "低",
};

const PRIORITY_VARIANT: Record<string, "danger" | "warning" | "info" | "default"> = {
  [Priority.Critical]: "danger",
  [Priority.High]: "warning",
  [Priority.Medium]: "info",
  [Priority.Low]: "default",
};

const DONUT_COLORS = ["#00B4D8", "#F4A100", "#10B981", "#EF4444", "#8B5CF6"];

function EmptyState({ message = "当前筛选条件下暂无数据" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <FileQuestion className="w-8 h-8 text-slate-400" />
      </div>
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}

export default function Reports() {
  const store = useDQCStore();
  const [selectedDept, setSelectedDept] = useState<string>("");
  const [selectedSystem, setSelectedSystem] = useState<string>("");
  const [selectedRuleType, setSelectedRuleType] = useState<string>("");
  const [timeRange, setTimeRange] = useState<TimeRange>(30);
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);

  const departments = useMemo(
    () => [...new Set(store.topics.map((t) => t.department))],
    [store.topics]
  );

  const systems = useMemo(
    () => [...new Set(store.topics.map((t) => t.system))],
    [store.topics]
  );

  const filterParams = useMemo(() => {
    const params: { department?: string; system?: string; ruleType?: RuleType } = {};
    if (selectedDept) params.department = selectedDept;
    if (selectedSystem) params.system = selectedSystem;
    if (selectedRuleType) params.ruleType = selectedRuleType as RuleType;
    return params;
  }, [selectedDept, selectedSystem, selectedRuleType]);

  const fs = useMemo(
    () => store.getFilteredStats(filterParams),
    [store, filterParams]
  );

  const fTrend = useMemo(
    () => store.getFilteredTrendData(filterParams, timeRange),
    [store, filterParams, timeRange]
  );

  const filteredTopics = useMemo(() => {
    let result = [...store.topics];
    if (selectedDept) {
      result = result.filter((t) => t.department === selectedDept);
    }
    if (selectedSystem) {
      result = result.filter((t) => t.system === selectedSystem);
    }
    return result;
  }, [store.topics, selectedDept, selectedSystem]);

  const filteredTopicIds = useMemo(
    () => filteredTopics.map((t) => t.id),
    [filteredTopics]
  );

  const filteredRules = useMemo(() => {
    let result = store.rules.filter((r) => filteredTopicIds.includes(r.topicId));
    if (selectedRuleType) {
      result = result.filter((r) => r.type === selectedRuleType);
    }
    return result;
  }, [store.rules, filteredTopicIds, selectedRuleType]);

  const filteredRuleIds = useMemo(
    () => filteredRules.map((r) => r.id),
    [filteredRules]
  );

  const filteredAnomalies = useMemo(
    () => store.anomalies.filter((a) => filteredRuleIds.includes(a.ruleId)),
    [store.anomalies, filteredRuleIds]
  );

  const filteredTickets = useMemo(
    () => store.tickets.filter((t) => filteredTopicIds.includes(t.topicId)),
    [store.tickets, filteredTopicIds]
  );

  const hasData = fs.overallScore > 0 || filteredTopics.length > 0;

  const trendChartData = useMemo(() => {
    if (fTrend.length === 0) return [];
    return fTrend.map((p) => ({
      date: p.date.slice(5),
      score: p.score,
      discovered: p.anomalyCount,
      resolved: p.resolvedCount ?? Math.round(p.anomalyCount * 0.7),
    }));
  }, [fTrend]);

  const donutData = useMemo(() => {
    const countMap: Record<string, number> = {};
    for (const rt of Object.values(RuleType)) {
      countMap[rt] = 0;
    }
    for (const a of filteredAnomalies) {
      const rule = store.rules.find((r) => r.id === a.ruleId);
      if (rule) countMap[rule.type] = (countMap[rule.type] || 0) + 1;
    }
    return RULE_TYPE_OPTIONS.map((opt, i) => ({
      name: opt.label + "问题",
      value: countMap[opt.value] || 0,
      color: DONUT_COLORS[i],
    })).filter((d) => d.value > 0);
  }, [filteredAnomalies, store.rules]);

  const horizontalBarData = useMemo(() => {
    return RULE_TYPE_OPTIONS.map((opt) => {
      const typeRules = filteredRules.filter(
        (r) => r.type === opt.value && r.status !== "disabled"
      );
      const typeTopics = new Set(typeRules.map((r) => r.topicId));
      const avg =
        typeTopics.size > 0
          ? filteredTopics
              .filter((t) => typeTopics.has(t.id))
              .reduce((sum, t) => sum + t.score, 0) / typeTopics.size
          : 0;
      return { name: opt.label, score: Math.round(avg * 10) / 10 };
    }).filter((d) => d.score > 0);
  }, [filteredRules, filteredTopics]);

  const columnData = useMemo(() => {
    const deptMap = new Map<string, { name: string; scores: number[] }>();
    let deptTopics = filteredTopics;
    if (selectedRuleType) {
      const typeRuleTopicIds = new Set(
        store.rules
          .filter((r) => r.type === selectedRuleType)
          .map((r) => r.topicId)
      );
      deptTopics = deptTopics.filter((t) => typeRuleTopicIds.has(t.id));
    }
    for (const topic of deptTopics) {
      const dept = topic.department;
      if (!deptMap.has(dept)) {
        const shortName = dept.replace(/部|中心/g, "");
        deptMap.set(dept, { name: shortName, scores: [] });
      }
      deptMap.get(dept)!.scores.push(topic.score);
    }
    return Array.from(deptMap.entries()).map(([, v]) => ({
      name: v.name,
      current: Math.round((v.scores.reduce((a, b) => a + b, 0) / v.scores.length) * 10) / 10,
      previous: Math.max(
        0,
        Math.round(((v.scores.reduce((a, b) => a + b, 0) / v.scores.length - 2) * 10)) / 10
      ),
    }));
  }, [filteredTopics, selectedRuleType, store.rules]);

  const ruleCoverageRate = useMemo(() => {
    if (filteredTopics.length === 0) return 0;
    const covered = filteredTopics.filter((t) => t.ruleCount > 0).length;
    return Math.round((covered / filteredTopics.length) * 100 * 10) / 10;
  }, [filteredTopics]);

  const issueResolutionRate = useMemo(() => {
    const total = fs.ticketStats.total;
    if (total === 0) return 0;
    const resolved = fs.ticketStats.closedOrResolved;
    return Math.round((resolved / total) * 100 * 10) / 10;
  }, [fs.ticketStats]);

  const avgResponseTime = useMemo(() => {
    const closedOrResolved = filteredTickets.filter(
      (t) => t.status === "closed" || t.status === "resolved"
    );
    if (closedOrResolved.length === 0) return 0;
    const totalHours = closedOrResolved.reduce((sum, t) => {
      const created = new Date(t.createdAt).getTime();
      const updated = new Date(t.updatedAt).getTime();
      const diffHours = Math.max(0.5, (updated - created) / (1000 * 60 * 60));
      return sum + diffHours;
    }, 0);
    return Math.round((totalHours / closedOrResolved.length) * 10) / 10;
  }, [filteredTickets]);

  const duplicateIssueRate = useMemo(() => {
    const base = 2 + Math.min(filteredTopics.length * 0.15, 5);
    const typeFactor = selectedRuleType ? 0.8 : 1;
    return Math.round(base * typeFactor * 10) / 10;
  }, [filteredTopics.length, selectedRuleType]);

  const monthlyReports = useMemo(() => {
    const now = new Date("2026-06-15T00:00:00Z");
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const lastMonth = new Date(now);
    lastMonth.setMonth(now.getMonth() - 1);
    const lastMonthStr = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, "0")}`;

    return [
      {
        id: `RPT-${currentMonth}`,
        name: `${now.getMonth() + 1}月数据质量月报`,
        type: "月度报告",
        period: `${currentMonth}-01 ~ ${currentMonth}-${String(now.getDate()).padStart(2, "0")}`,
        score: fs.overallScore,
        status: "generating" as const,
        createdAt: `${currentMonth}-01 02:00`,
        creator: "系统",
      },
      {
        id: `RPT-${lastMonthStr}`,
        name: `${lastMonth.getMonth() + 1}月数据质量月报`,
        type: "月度报告",
        period: `${lastMonthStr}-01 ~ ${lastMonthStr}-${String(new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0).getDate()).padStart(2, "0")}`,
        score: Math.max(0, Math.round((fs.overallScore - 2.5) * 10) / 10),
        status: "completed" as const,
        createdAt: `${lastMonthStr}-01 02:00`,
        creator: "系统",
      },
      {
        id: "RPT-2026-W24",
        name: "第24周质量周报",
        type: "周度报告",
        period: "2026-06-09 ~ 2026-06-15",
        score: Math.min(100, fs.overallScore + 0.5),
        status: "completed" as const,
        createdAt: "2026-06-15 02:00",
        creator: "系统",
      },
      {
        id: "RPT-2026-Q2",
        name: "Q2季度质量分析报告",
        type: "季度报告",
        period: "2026-04-01 ~ 2026-06-30",
        score: 0,
        status: "scheduled" as const,
        createdAt: "2026-07-01 02:00",
        creator: "系统",
      },
    ];
  }, [fs.overallScore]);

  const handleExportReport = () => {
    const rows: string[][] = [];

    rows.push(["数据质量报告", ""]);
    rows.push(["生成时间", new Date().toLocaleString("zh-CN")]);
    rows.push([""]);

    rows.push(["筛选条件", ""]);
    rows.push(["部门", selectedDept || "全部"]);
    rows.push(["系统", selectedSystem || "全部"]);
    rows.push(["指标类型", selectedRuleType ? RULE_TYPE_OPTIONS.find((o) => o.value === selectedRuleType)?.label || "全部" : "全部"]);
    rows.push(["时间范围", `近${timeRange}天`]);
    rows.push([""]);

    rows.push(["核心指标", "数值"]);
    rows.push(["综合质量分", String(fs.overallScore)]);
    rows.push(["规则数量", String(fs.ruleCount)]);
    rows.push(["任务数量", String(fs.taskCount)]);
    rows.push(["异常数量", String(fs.anomalyCount)]);
    rows.push(["工单总数", String(fs.ticketStats.total)]);
    rows.push(["待处理工单", String(fs.ticketStats.open)]);
    rows.push(["处理中工单", String(fs.ticketStats.inProgress)]);
    rows.push(["待复检工单", String(fs.ticketStats.pendingReview)]);
    rows.push(["已解决工单", String(fs.ticketStats.resolved)]);
    rows.push(["已关闭工单", String(fs.ticketStats.closed)]);
    rows.push(["规则覆盖率", `${ruleCoverageRate}%`]);
    rows.push(["问题解决率", `${issueResolutionRate}%`]);
    rows.push(["平均响应时间", `${avgResponseTime}h`]);
    rows.push(["重复问题率", `${duplicateIssueRate}%`]);
    rows.push([""]);

    rows.push(["各主题质量分", ""]);
    rows.push(["主题名称", "质量分"]);
    fs.topicScores.forEach((t) => {
      rows.push([t.topicName, String(t.score)]);
    });
    rows.push([""]);

    rows.push(["问题类型分布", ""]);
    rows.push(["问题类型", "数量"]);
    donutData.forEach((d) => {
      rows.push([d.name, String(d.value)]);
    });
    rows.push([""]);

    rows.push(["规则明细", ""]);
    rows.push(["规则名称", "类型", "所属主题", "状态", "目标阈值", "告警阈值"]);
    if (filteredRules.length === 0) {
      rows.push(["(无数据)"]);
    } else {
      filteredRules.forEach((r) => {
        const topic = store.topics.find((t) => t.id === r.topicId);
        const typeLabel = RULE_TYPE_OPTIONS.find((o) => o.value === r.type)?.label || r.type;
        const statusLabel = RULE_STATUS_LABEL[r.status] || r.status;
        rows.push([
          r.name,
          typeLabel,
          topic?.name || "",
          statusLabel,
          r.threshold.target != null ? String(r.threshold.target) : "",
          r.threshold.warning != null ? String(r.threshold.warning) : "",
        ]);
      });
    }
    rows.push([""]);

    rows.push(["异常明细", ""]);
    rows.push(["异常描述", "数据标识", "严重程度", "所属规则", "所属主题"]);
    if (filteredAnomalies.length === 0) {
      rows.push(["(无数据)"]);
    } else {
      filteredAnomalies.forEach((a) => {
        const rule = store.rules.find((r) => r.id === a.ruleId);
        const topic = store.topics.find((t) => t.id === a.topicId);
        const severityLabel = PRIORITY_LABEL[a.severity] || a.severity;
        rows.push([
          a.description,
          a.dataKey,
          severityLabel,
          rule?.name || "",
          topic?.name || "",
        ]);
      });
    }
    rows.push([""]);

    rows.push(["工单明细", ""]);
    rows.push(["工单号", "标题", "状态", "优先级", "责任人", "所属主题"]);
    if (filteredTickets.length === 0) {
      rows.push(["(无数据)"]);
    } else {
      filteredTickets.forEach((t) => {
        const topic = store.topics.find((tp) => tp.id === t.topicId);
        const statusLabel = TICKET_STATUS_LABEL[t.status] || t.status;
        const priorityLabel = PRIORITY_LABEL[t.priority] || t.priority;
        const assignee = store.users?.find((u) => u.id === t.assigneeId);
        rows.push([
          t.id,
          t.title,
          statusLabel,
          priorityLabel,
          assignee?.name || t.assigneeId,
          topic?.name || "",
        ]);
      });
    }
    rows.push([""]);

    rows.push(["趋势数据", ""]);
    rows.push(["日期", "质量分", "异常数", "已解决数"]);
    if (fTrend.length === 0) {
      rows.push(["(无数据)"]);
    } else {
      fTrend.forEach((p) => {
        rows.push([
          p.date,
          String(p.score),
          String(p.anomalyCount),
          String(p.resolvedCount ?? ""),
        ]);
      });
    }

    const csvContent = "\uFEFF" + rows.map((r) => r.map(cell => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `质量报告_${new Date().toISOString().slice(0, 10).replace(/-/g, "")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadReport = (report: typeof monthlyReports[0]) => {
    const rows: string[][] = [];

    rows.push(["报告名称", report.name]);
    rows.push(["报告类型", report.type]);
    rows.push(["报告周期", report.period]);
    rows.push(["质量分", String(report.score)]);
    rows.push(["创建人", report.creator]);
    rows.push(["创建时间", report.createdAt]);
    rows.push([""]);

    rows.push(["统计数据", ""]);
    rows.push(["规则数", String(fs.ruleCount)]);
    rows.push(["任务数", String(fs.taskCount)]);
    rows.push(["异常数", String(fs.anomalyCount)]);
    rows.push(["工单数", String(fs.ticketStats.total)]);
    rows.push(["已解决工单", String(fs.ticketStats.closedOrResolved)]);

    const csvContent = "\uFEFF" + rows.map((r) => r.map(cell => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.name}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const kpiCards = [
    {
      label: "规则覆盖率",
      current: `${ruleCoverageRate}%`,
      previous: `${Math.max(0, Math.round((ruleCoverageRate - 3.3) * 10) / 10)}%`,
      change: "+3.3%",
      up: true,
    },
    {
      label: "问题解决率",
      current: `${issueResolutionRate}%`,
      previous: `${Math.max(0, Math.round((issueResolutionRate - 3.7) * 10) / 10)}%`,
      change: "+3.7%",
      up: true,
    },
    {
      label: "平均响应时间",
      current: `${avgResponseTime}h`,
      previous: `${Math.round((avgResponseTime + 1.6) * 10) / 10}h`,
      change: avgResponseTime > 0 ? "-27.6%" : "0%",
      up: true,
    },
    {
      label: "重复问题率",
      current: `${duplicateIssueRate}%`,
      previous: `${Math.round((duplicateIssueRate + 1.4) * 10) / 10}%`,
      change: "-26.9%",
      up: true,
    },
  ];

  const overviewCards = [
    {
      label: "综合质量分",
      value: fs.overallScore,
      suffix: "分",
      color: "text-navy-700",
      bg: "from-navy-50 to-navy-100/50",
      filterLabel: selectedDept || selectedSystem || selectedRuleType
        ? (selectedDept || "") + (selectedSystem ? ` / ${selectedSystem}` : "") + (selectedRuleType ? ` / ${RULE_TYPE_OPTIONS.find(o => o.value === selectedRuleType)?.label}` : "")
        : "全部",
    },
    {
      label: "规则数量",
      value: fs.ruleCount,
      suffix: "条",
      color: "text-cyan-700",
      bg: "from-cyan-50 to-cyan-100/50",
      filterLabel: selectedRuleType ? RULE_TYPE_OPTIONS.find(o => o.value === selectedRuleType)?.label || "全部" : "全部类型",
    },
    {
      label: "任务数量",
      value: fs.taskCount,
      suffix: "个",
      color: "text-success-700",
      bg: "from-success-50 to-success-100/50",
      filterLabel: selectedSystem || "全部系统",
    },
    {
      label: "异常数量",
      value: fs.anomalyCount,
      suffix: "条",
      color: "text-gold-700",
      bg: "from-gold-50 to-gold-100/50",
      filterLabel: selectedRuleType ? RULE_TYPE_OPTIONS.find(o => o.value === selectedRuleType)?.label || "全部" : "全部类型",
    },
    {
      label: "工单数量",
      value: fs.ticketStats.total,
      suffix: "张",
      color: "text-danger-700",
      bg: "from-danger-50 to-danger-100/50",
      filterLabel: selectedDept || "全部部门",
    },
  ];

  const currentFilterReport = useMemo(() => {
    const deptLabel = selectedDept || "全部部门";
    const sysLabel = selectedSystem || "全部系统";
    const typeLabel = selectedRuleType
      ? RULE_TYPE_OPTIONS.find((o) => o.value === selectedRuleType)?.label || "全部类型"
      : "全部类型";
    return {
      name: `自定义报告_${deptLabel}_${sysLabel}_${typeLabel}`,
      period: `近${timeRange}天`,
      score: fs.overallScore,
      ruleCount: fs.ruleCount,
      anomalyCount: fs.anomalyCount,
      ticketCount: fs.ticketStats.total,
    };
  }, [
    selectedDept,
    selectedSystem,
    selectedRuleType,
    timeRange,
    fs,
  ]);

  const toggleTopic = (topicId: string) => {
    setExpandedTopicId((prev) => (prev === topicId ? null : topicId));
  };

  const expandedTopicData = useMemo(() => {
    if (!expandedTopicId) return null;
    const topic = filteredTopics.find((t) => t.id === expandedTopicId);
    if (!topic) return null;

    const rules = filteredRules.filter((r) => r.topicId === expandedTopicId);
    const ruleIds = rules.map((r) => r.id);
    const anomalies = filteredAnomalies.filter((a) => ruleIds.includes(a.ruleId));
    const tickets = filteredTickets.filter((t) => t.topicId === expandedTopicId);

    const anomalyByType: { type: string; label: string; count: number; color: string }[] = [];
    const typeCountMap: Record<string, number> = {};
    for (const a of anomalies) {
      const rule = rules.find((r) => r.id === a.ruleId);
      if (rule) {
        typeCountMap[rule.type] = (typeCountMap[rule.type] || 0) + 1;
      }
    }
    for (const opt of RULE_TYPE_OPTIONS) {
      const count = typeCountMap[opt.value] || 0;
      if (count > 0) {
        const idx = RULE_TYPE_OPTIONS.indexOf(opt);
        anomalyByType.push({ type: opt.value, label: opt.label, count, color: DONUT_COLORS[idx] });
      }
    }

    return { topic, rules, anomalies, tickets, anomalyByType };
  }, [expandedTopicId, filteredTopics, filteredRules, filteredAnomalies, filteredTickets]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">质量报告</h1>
          <p className="text-sm text-slate-500 mt-1">
            查看数据质量分析报告，了解整体质量状况和趋势
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleExportReport}
            leftIcon={<Download className="w-4 h-4" />}
          >
            导出报告
          </Button>
        </div>
      </div>

      <div className="bg-slate-50/50 rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-slate-500" />
          <h3 className="font-semibold text-slate-800">筛选条件</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">部门</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 bg-white"
            >
              <option value="">全部部门</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">系统</label>
            <select
              value={selectedSystem}
              onChange={(e) => setSelectedSystem(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 bg-white"
            >
              <option value="">全部系统</option>
              {systems.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">指标类型</label>
            <select
              value={selectedRuleType}
              onChange={(e) => setSelectedRuleType(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 bg-white"
            >
              <option value="">全部类型</option>
              {RULE_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">时间范围</label>
            <div className="flex gap-2">
              {([7, 30, 90] as TimeRange[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setTimeRange(d)}
                  className={cn(
                    "flex-1 px-3 py-2 text-xs rounded-lg font-medium transition-colors",
                    timeRange === d
                      ? "bg-navy-600 text-white shadow-sm"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  )}
                >
                  近{d}天
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {overviewCards.map((card, idx) => (
          <div
            key={idx}
            className={cn(
              "bg-gradient-to-br rounded-xl border border-slate-100 p-4 shadow-card",
              card.bg
            )}
          >
            <p className="text-xs text-slate-500 mb-1">{card.label}</p>
            <p className={cn("text-2xl font-bold tabular-nums", card.color)}>
              {card.value.toLocaleString()}
              <span className="text-sm font-medium text-slate-500 ml-0.5">{card.suffix}</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-1.5 truncate">
              筛选: {card.filterLabel}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-card border border-slate-100 p-5 lg:col-span-1">
          <h3 className="font-semibold text-slate-800 mb-4">综合质量概览</h3>
          {hasData ? (
            <GaugeChart value={fs.overallScore} height={260} />
          ) : (
            <EmptyState />
          )}
        </div>

        <div className="bg-white rounded-xl shadow-card border border-slate-100 p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800">关键指标对比</h3>
              <p className="text-xs text-slate-500 mt-0.5">本期 vs 上期</p>
            </div>
          </div>
          {hasData ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {kpiCards.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-50/80 rounded-xl border border-slate-100"
                >
                  <p className="text-xs text-slate-500 mb-1.5">{item.label}</p>
                  <p className="text-xl font-bold text-slate-800 tabular-nums">
                    {item.current}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-xs">
                    {item.up ? (
                      <TrendingUp className="w-3.5 h-3.5 text-success-500" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 text-danger-500" />
                    )}
                    <span className={item.up ? "text-success-600" : "text-danger-600"}>
                      {item.change}
                    </span>
                    <span className="text-slate-400">vs {item.previous}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-card border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800">质量趋势</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                近{timeRange}天质量得分变化
              </p>
            </div>
          </div>
          {trendChartData.length > 0 ? (
            <TrendLineChart data={trendChartData} height={280} />
          ) : (
            <EmptyState message="当前筛选条件下暂无趋势数据" />
          )}
        </div>

        <div className="bg-white rounded-xl shadow-card border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800">维度质量分析</h3>
              <p className="text-xs text-slate-500 mt-0.5">各指标类型得分</p>
            </div>
          </div>
          {horizontalBarData.length > 0 ? (
            <HorizontalBarChart data={horizontalBarData} height={280} />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-card border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800">问题类型分布</h3>
              <p className="text-xs text-slate-500 mt-0.5">按规则类型统计异常</p>
            </div>
            <Badge variant="info">共 {fs.anomalyCount} 个异常</Badge>
          </div>
          {donutData.length > 0 ? (
            <DonutChart data={donutData} height={280} />
          ) : (
            <EmptyState />
          )}
        </div>

        <div className="bg-white rounded-xl shadow-card border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800">部门质量对比</h3>
              <p className="text-xs text-slate-500 mt-0.5">各部门质量得分排名</p>
            </div>
          </div>
          {columnData.length > 0 ? (
            <ColumnChart data={columnData} height={280} />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-800">当前筛选报告</h3>
            <p className="text-xs text-slate-500 mt-0.5">基于当前筛选条件生成的实时报告</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportReport}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            导出CSV
          </Button>
        </div>
        <div className="p-5">
          <div className="bg-gradient-to-r from-navy-50 to-cyan-50 rounded-xl p-5 border border-navy-100">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-slate-800 text-lg">{currentFilterReport.name}</h4>
                <p className="text-sm text-slate-500 mt-1">报告周期：{currentFilterReport.period}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-navy-700 tabular-nums">{currentFilterReport.score}</p>
                <p className="text-xs text-slate-500 mt-1">综合质量分</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-navy-100">
              <div className="text-center">
                <p className="text-xl font-bold text-slate-700 tabular-nums">{currentFilterReport.ruleCount}</p>
                <p className="text-xs text-slate-500 mt-1">规则数</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-slate-700 tabular-nums">{currentFilterReport.anomalyCount}</p>
                <p className="text-xs text-slate-500 mt-1">异常数</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-slate-700 tabular-nums">{currentFilterReport.ticketCount}</p>
                <p className="text-xs text-slate-500 mt-1">工单数</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Table2 className="w-4 h-4 text-slate-500" />
            <div>
              <h3 className="font-semibold text-slate-800">筛选明细</h3>
              <p className="text-xs text-slate-500 mt-0.5">当前筛选范围内的主题、规则、异常和工单明细</p>
            </div>
          </div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-3 gap-4 mb-5">
            <div className="bg-cyan-50/60 rounded-lg p-3 text-center border border-cyan-100">
              <p className="text-2xl font-bold text-cyan-700 tabular-nums">{filteredTopics.length}</p>
              <p className="text-xs text-cyan-600 mt-0.5">主题数</p>
            </div>
            <div className="bg-navy-50/60 rounded-lg p-3 text-center border border-navy-100">
              <p className="text-2xl font-bold text-navy-700 tabular-nums">{filteredRules.length}</p>
              <p className="text-xs text-navy-600 mt-0.5">规则数</p>
            </div>
            <div className="bg-gold-50/60 rounded-lg p-3 text-center border border-gold-100">
              <p className="text-2xl font-bold text-gold-700 tabular-nums">{filteredAnomalies.length}</p>
              <p className="text-xs text-gold-600 mt-0.5">异常数</p>
            </div>
          </div>

          {filteredTopics.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="grid grid-cols-[1fr_100px_100px_80px_64px_64px_64px_40px] gap-2 px-4 py-2.5 bg-slate-50 text-xs font-medium text-slate-500 border-b border-slate-200">
                <span>主题名称</span>
                <span>系统</span>
                <span>部门</span>
                <span>质量分</span>
                <span className="text-center">规则数</span>
                <span className="text-center">异常数</span>
                <span className="text-center">工单数</span>
                <span></span>
              </div>
              {filteredTopics.map((topic) => {
                const isExpanded = expandedTopicId === topic.id;
                const topicRules = filteredRules.filter((r) => r.topicId === topic.id);
                const topicRuleIds = topicRules.map((r) => r.id);
                const topicAnomalyCount = filteredAnomalies.filter((a) =>
                  topicRuleIds.includes(a.ruleId)
                ).length;
                const topicTicketCount = filteredTickets.filter(
                  (t) => t.topicId === topic.id
                ).length;

                return (
                  <div key={topic.id}>
                    <button
                      onClick={() => toggleTopic(topic.id)}
                      className={cn(
                        "w-full grid grid-cols-[1fr_100px_100px_80px_64px_64px_64px_40px] gap-2 px-4 py-3 text-sm text-left items-center transition-colors hover:bg-slate-50/80",
                        isExpanded && "bg-cyan-50/30"
                      )}
                    >
                      <span className="font-medium text-slate-800 truncate">{topic.name}</span>
                      <span className="text-slate-600 truncate">{topic.system}</span>
                      <span className="text-slate-600 truncate">{topic.department}</span>
                      <span className="font-semibold text-slate-700 tabular-nums">{topic.score}</span>
                      <span className="text-center text-slate-600 tabular-nums">{topicRules.length}</span>
                      <span className="text-center text-slate-600 tabular-nums">{topicAnomalyCount}</span>
                      <span className="text-center text-slate-600 tabular-nums">{topicTicketCount}</span>
                      <span className="flex items-center justify-center">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                      </span>
                    </button>

                    {isExpanded && expandedTopicData && expandedTopicData.topic.id === topic.id && (
                      <div className="bg-slate-50/40 border-t border-slate-100 px-6 py-4 space-y-5">
                        <div>
                          <h4 className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">关联规则</h4>
                          {expandedTopicData.rules.length === 0 ? (
                            <p className="text-xs text-slate-400 py-2">暂无关联规则</p>
                          ) : (
                            <div className="border border-slate-200 rounded-lg overflow-hidden">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="bg-slate-100/80">
                                    <th className="text-left px-3 py-2 font-medium text-slate-600">规则名称</th>
                                    <th className="text-left px-3 py-2 font-medium text-slate-600">类型</th>
                                    <th className="text-left px-3 py-2 font-medium text-slate-600">状态</th>
                                    <th className="text-right px-3 py-2 font-medium text-slate-600">目标阈值</th>
                                    <th className="text-right px-3 py-2 font-medium text-slate-600">告警阈值</th>
                                    <th className="text-left px-3 py-2 font-medium text-slate-600">执行频率</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {expandedTopicData.rules.map((rule) => (
                                    <tr key={rule.id} className="hover:bg-white/60">
                                      <td className="px-3 py-2 text-slate-700 font-medium">{rule.name}</td>
                                      <td className="px-3 py-2">
                                        <Badge variant="info">
                                          {RULE_TYPE_OPTIONS.find((o) => o.value === rule.type)?.label || rule.type}
                                        </Badge>
                                      </td>
                                      <td className="px-3 py-2">
                                        <Badge variant={RULE_STATUS_VARIANT[rule.status] || "default"}>
                                          {RULE_STATUS_LABEL[rule.status] || rule.status}
                                        </Badge>
                                      </td>
                                      <td className="px-3 py-2 text-right text-slate-600 tabular-nums">
                                        {rule.threshold.target != null ? `${rule.threshold.target}%` : "-"}
                                      </td>
                                      <td className="px-3 py-2 text-right text-slate-600 tabular-nums">
                                        {rule.threshold.warning != null ? `${rule.threshold.warning}%` : "-"}
                                      </td>
                                      <td className="px-3 py-2 text-slate-500">{rule.frequency}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>

                        <div>
                          <h4 className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">问题分布</h4>
                          {expandedTopicData.anomalyByType.length === 0 ? (
                            <p className="text-xs text-slate-400 py-2">暂无异常</p>
                          ) : (
                            <div className="flex flex-wrap gap-3">
                              {expandedTopicData.anomalyByType.map((item) => {
                                const maxCount = Math.max(
                                  ...expandedTopicData.anomalyByType.map((d) => d.count)
                                );
                                const widthPct = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                                return (
                                  <div key={item.type} className="flex items-center gap-2 min-w-[140px]">
                                    <span className="text-xs text-slate-600 w-12 shrink-0">{item.label}</span>
                                    <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
                                      <div
                                        className="h-full rounded-full transition-all"
                                        style={{
                                          width: `${widthPct}%`,
                                          backgroundColor: item.color,
                                          minWidth: item.count > 0 ? "8px" : "0",
                                        }}
                                      />
                                    </div>
                                    <span className="text-xs font-semibold text-slate-700 tabular-nums w-6 text-right">
                                      {item.count}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        <div>
                          <h4 className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">关联工单</h4>
                          {expandedTopicData.tickets.length === 0 ? (
                            <p className="text-xs text-slate-400 py-2">暂无关联工单</p>
                          ) : (
                            <div className="space-y-2">
                              {expandedTopicData.tickets.map((ticket) => (
                                <div
                                  key={ticket.id}
                                  className="flex items-center gap-3 px-3 py-2 bg-white rounded-lg border border-slate-100 text-xs"
                                >
                                  <span className="font-mono text-slate-500 shrink-0">{ticket.id}</span>
                                  <span className="text-slate-700 font-medium truncate flex-1">{ticket.title}</span>
                                  <Badge variant={TICKET_STATUS_VARIANT[ticket.status] || "default"}>
                                    {TICKET_STATUS_LABEL[ticket.status] || ticket.status}
                                  </Badge>
                                  <Badge variant={PRIORITY_VARIANT[ticket.priority] || "default"}>
                                    {PRIORITY_LABEL[ticket.priority] || ticket.priority}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">报告列表</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {monthlyReports.map((report) => (
            <div
              key={report.id}
              className="p-5 hover:bg-slate-50/50 transition-colors flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div
                  className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0",
                    report.type === "月度报告"
                      ? "bg-cyan-50"
                      : report.type === "周度报告"
                      ? "bg-success-50"
                      : report.type === "季度报告"
                      ? "bg-gold-50"
                      : "bg-navy-50"
                  )}
                >
                  <FileBarChart
                    className={cn(
                      "w-5 h-5",
                      report.type === "月度报告"
                        ? "text-cyan-600"
                        : report.type === "周度报告"
                        ? "text-success-600"
                        : report.type === "季度报告"
                        ? "text-gold-600"
                        : "text-navy-600"
                    )}
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-slate-800 truncate">
                      {report.name}
                    </h4>
                    <Badge variant="default">{report.type}</Badge>
                    <Badge
                      variant={
                        report.status === "completed"
                          ? "success"
                          : report.status === "generating"
                          ? "info"
                          : "default"
                      }
                    >
                      {report.status === "completed"
                        ? "已完成"
                        : report.status === "generating"
                        ? "生成中"
                        : "待生成"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                    <span>周期: {report.period}</span>
                    {report.score > 0 && (
                      <span>
                        质量分:{" "}
                        <span className="font-semibold text-slate-700 tabular-nums">
                          {report.score}
                        </span>
                      </span>
                    )}
                    <span>创建人: {report.creator}</span>
                    <span>{report.createdAt}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {report.status === "completed" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownloadReport(report)}
                    leftIcon={<Download className="w-3.5 h-3.5" />}
                  >
                    下载
                  </Button>
                )}
                <button className="p-2 text-slate-400 hover:text-navy-600 hover:bg-slate-100 rounded-lg transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
