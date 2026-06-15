import { useMemo, useState } from "react";
import { FileBarChart, Download, ChevronRight, Filter, TrendingUp, TrendingDown } from "lucide-react";
import { useDQCStore } from "@/store/dqc";
import { RuleType } from "@/data/types";
import TrendLineChart from "@/components/charts/TrendLineChart";
import HorizontalBarChart from "@/components/charts/HorizontalBarChart";
import DonutChart from "@/components/charts/DonutChart";
import ColumnChart from "@/components/charts/ColumnChart";
import GaugeChart from "@/components/charts/GaugeChart";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

type TimeRange = 7 | 30 | 90;

const RULE_TYPE_OPTIONS = [
  { value: RuleType.Completeness, label: "完整性" },
  { value: RuleType.Accuracy, label: "准确性" },
  { value: RuleType.Consistency, label: "一致性" },
  { value: RuleType.Timeliness, label: "及时性" },
  { value: RuleType.Uniqueness, label: "唯一性" },
];

const DONUT_COLORS = ["#00B4D8", "#F4A100", "#10B981", "#EF4444", "#8B5CF6"];

export default function Reports() {
  const store = useDQCStore();
  const [selectedDept, setSelectedDept] = useState<string>("");
  const [selectedSystem, setSelectedSystem] = useState<string>("");
  const [selectedRuleType, setSelectedRuleType] = useState<string>("");
  const [timeRange, setTimeRange] = useState<TimeRange>(30);

  const departments = useMemo(
    () => [...new Set(store.topics.map((t) => t.department))],
    [store.topics]
  );

  const systems = useMemo(
    () => [...new Set(store.topics.map((t) => t.system))],
    [store.topics]
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

  const filteredTasks = useMemo(() => {
    return store.tasks.filter((t) => {
      const taskRuleIds = (t as any).ruleId ? [(t as any).ruleId] : (t.ruleIds || []);
      return taskRuleIds.some((rid: string) => filteredRuleIds.includes(rid));
    });
  }, [store.tasks, filteredRuleIds]);

  const filteredTickets = useMemo(
    () => store.tickets.filter((t) => filteredTopicIds.includes(t.topicId)),
    [store.tickets, filteredTopicIds]
  );

  const overallScore = useMemo(() => {
    if (filteredTopics.length === 0) return 0;
    return Math.round(
      (filteredTopics.reduce((sum, t) => sum + t.score, 0) / filteredTopics.length) * 10
    ) / 10;
  }, [filteredTopics]);

  const filteredTrendData = useMemo(() => {
    const now = new Date("2026-06-15T00:00:00Z");
    const cutoff = new Date(now);
    cutoff.setDate(now.getDate() - timeRange);
    return store.trendData.filter((p) => new Date(p.date) >= cutoff);
  }, [store.trendData, timeRange]);

  const trendChartData = useMemo(
    () =>
      filteredTrendData.map((p) => ({
        date: p.date.slice(5),
        score: p.score,
        discovered: p.anomalyCount,
        resolved: Math.round(p.anomalyCount * (0.6 + Math.random() * 0.3)),
      })),
    [filteredTrendData]
  );

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
    }));
  }, [filteredAnomalies, store.rules]);

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
      previous: Math.round(
        ((v.scores.reduce((a, b) => a + b, 0) / v.scores.length - 2) * 10)
      ) / 10,
    }));
  }, [filteredTopics, selectedRuleType, store.rules]);

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
    });
  }, [filteredRules, filteredTopics]);

  const ruleCoverageRate = useMemo(() => {
    if (filteredTopics.length === 0) return 0;
    const covered = filteredTopics.filter((t) => t.ruleCount > 0).length;
    return Math.round((covered / filteredTopics.length) * 100 * 10) / 10;
  }, [filteredTopics]);

  const issueResolutionRate = useMemo(() => {
    const total = filteredTickets.length;
    if (total === 0) return 0;
    const resolved = filteredTickets.filter(
      (t) => t.status === "resolved" || t.status === "closed"
    ).length;
    return Math.round((resolved / total) * 100 * 10) / 10;
  }, [filteredTickets]);

  const avgResponseTime = useMemo(() => {
    const baseTime = 4.2;
    const deptFactor = selectedDept ? 0.8 : 1;
    const systemFactor = selectedSystem ? 0.9 : 1;
    return Math.round(baseTime * deptFactor * systemFactor * 10) / 10;
  }, [selectedDept, selectedSystem]);

  const duplicateIssueRate = useMemo(() => {
    const baseRate = 3.8;
    const typeFactor = selectedRuleType ? 0.7 : 1;
    return Math.round(baseRate * typeFactor * 10) / 10;
  }, [selectedRuleType]);

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
        score: overallScore,
        status: "generating" as const,
        createdAt: `${currentMonth}-01 02:00`,
        creator: "系统",
      },
      {
        id: `RPT-${lastMonthStr}`,
        name: `${lastMonth.getMonth() + 1}月数据质量月报`,
        type: "月度报告",
        period: `${lastMonthStr}-01 ~ ${lastMonthStr}-${String(new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0).getDate()).padStart(2, "0")}`,
        score: Math.round((overallScore - 2.5) * 10) / 10,
        status: "completed" as const,
        createdAt: `${lastMonthStr}-01 02:00`,
        creator: "系统",
      },
      {
        id: "RPT-2026-W24",
        name: "第24周质量周报",
        type: "周度报告",
        period: "2026-06-09 ~ 2026-06-15",
        score: overallScore + 0.5,
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
  }, [overallScore]);

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
    rows.push(["综合质量分", String(overallScore)]);
    rows.push(["规则数量", String(filteredRules.length)]);
    rows.push(["任务数量", String(filteredTasks.length)]);
    rows.push(["异常数量", String(filteredAnomalies.length)]);
    rows.push(["工单总数", String(filteredTickets.length)]);
    rows.push(["规则覆盖率", `${ruleCoverageRate}%`]);
    rows.push(["问题解决率", `${issueResolutionRate}%`]);
    rows.push(["平均响应时间", `${avgResponseTime}h`]);
    rows.push(["重复问题率", `${duplicateIssueRate}%`]);
    rows.push([""]);

    rows.push(["各主题质量分", ""]);
    rows.push(["主题名称", "质量分"]);
    filteredTopics.forEach((t) => {
      rows.push([t.name, String(t.score)]);
    });
    rows.push([""]);

    rows.push(["问题类型分布", ""]);
    rows.push(["问题类型", "数量"]);
    donutData.forEach((d) => {
      rows.push([d.name, String(d.value)]);
    });

    const csvContent = "\uFEFF" + rows.map((r) => r.join(",")).join("\n");
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
    rows.push(["规则数", String(store.ruleStats().total)]);
    rows.push(["任务数", String(store.taskStats().total)]);
    rows.push(["异常数", String(store.anomalies.length)]);
    rows.push(["工单数", String(store.ticketStats().total)]);
    rows.push(["已解决工单", String(store.ticketStats().resolved + store.ticketStats().closed)]);

    const csvContent = "\uFEFF" + rows.map((r) => r.join(",")).join("\n");
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
      previous: `${Math.round((ruleCoverageRate - 3.3) * 10) / 10}%`,
      change: "+3.3%",
      up: true,
    },
    {
      label: "问题解决率",
      current: `${issueResolutionRate}%`,
      previous: `${Math.round((issueResolutionRate - 3.7) * 10) / 10}%`,
      change: "+3.7%",
      up: true,
    },
    {
      label: "平均响应时间",
      current: `${avgResponseTime}h`,
      previous: `${Math.round((avgResponseTime + 1.6) * 10) / 10}h`,
      change: "-27.6%",
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

  const currentFilterReport = useMemo(() => {
    const deptLabel = selectedDept || "全部部门";
    const sysLabel = selectedSystem || "全部系统";
    const typeLabel = selectedRuleType
      ? RULE_TYPE_OPTIONS.find((o) => o.value === selectedRuleType)?.label || "全部类型"
      : "全部类型";
    return {
      name: `自定义报告_${deptLabel}_${sysLabel}_${typeLabel}`,
      period: `近${timeRange}天`,
      score: overallScore,
      ruleCount: filteredRules.length,
      anomalyCount: filteredAnomalies.length,
      ticketCount: filteredTickets.length,
    };
  }, [
    selectedDept,
    selectedSystem,
    selectedRuleType,
    timeRange,
    overallScore,
    filteredRules,
    filteredAnomalies,
    filteredTickets,
  ]);

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
                  className={`flex-1 px-3 py-2 text-xs rounded-lg font-medium transition-colors ${
                    timeRange === d
                      ? "bg-navy-600 text-white shadow-sm"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  近{d}天
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-card border border-slate-100 p-5 lg:col-span-1">
          <h3 className="font-semibold text-slate-800 mb-4">综合质量概览</h3>
          <GaugeChart value={overallScore} height={260} />
        </div>

        <div className="bg-white rounded-xl shadow-card border border-slate-100 p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800">关键指标对比</h3>
              <p className="text-xs text-slate-500 mt-0.5">本期 vs 上期</p>
            </div>
          </div>
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
          <TrendLineChart data={trendChartData} height={280} />
        </div>

        <div className="bg-white rounded-xl shadow-card border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800">维度质量分析</h3>
              <p className="text-xs text-slate-500 mt-0.5">各指标类型得分</p>
            </div>
          </div>
          <HorizontalBarChart data={horizontalBarData} height={280} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-card border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800">问题类型分布</h3>
              <p className="text-xs text-slate-500 mt-0.5">按规则类型统计异常</p>
            </div>
            <Badge variant="info">共 {filteredAnomalies.length} 个异常</Badge>
          </div>
          <DonutChart data={donutData} height={280} />
        </div>

        <div className="bg-white rounded-xl shadow-card border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800">部门质量对比</h3>
              <p className="text-xs text-slate-500 mt-0.5">各部门质量得分排名</p>
            </div>
          </div>
          <ColumnChart data={columnData} height={280} />
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
                  className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    report.type === "月度报告"
                      ? "bg-cyan-50"
                      : report.type === "周度报告"
                      ? "bg-success-50"
                      : report.type === "季度报告"
                      ? "bg-gold-50"
                      : "bg-navy-50"
                  }`}
                >
                  <FileBarChart
                    className={`w-5 h-5 ${
                      report.type === "月度报告"
                        ? "text-cyan-600"
                        : report.type === "周度报告"
                        ? "text-success-600"
                        : report.type === "季度报告"
                        ? "text-gold-600"
                        : "text-navy-600"
                    }`}
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
