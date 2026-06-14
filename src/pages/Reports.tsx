import { useMemo, useState } from "react";
import { FileBarChart, Download, ChevronRight, Filter, TrendingUp, TrendingDown } from "lucide-react";
import { useDQCStore } from "@/store/dqc";
import { RuleType } from "@/data/types";
import TrendLineChart from "@/components/charts/TrendLineChart";
import HorizontalBarChart from "@/components/charts/HorizontalBarChart";
import DonutChart from "@/components/charts/DonutChart";
import ColumnChart from "@/components/charts/ColumnChart";
import GaugeChart from "@/components/charts/GaugeChart";

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
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [selectedRuleType, setSelectedRuleType] = useState<string>("");
  const [timeRange, setTimeRange] = useState<TimeRange>(30);

  const departments = useMemo(
    () => [...new Set(store.users.map((u) => u.department))],
    [store.users]
  );

  const topicOptions = useMemo(
    () => store.topics.map((t) => ({ id: t.id, name: t.name })),
    [store.topics]
  );

  const overallScore = store.overallQualityScore();

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
        discovered: p.anomalyCount,
        resolved: Math.round(p.anomalyCount * (0.6 + Math.random() * 0.3)),
      })),
    [filteredTrendData]
  );

  const filteredAnomalies = useMemo(() => {
    let result = [...store.anomalies];
    if (selectedRuleType) {
      const ruleIds = store.rules
        .filter((r) => r.type === selectedRuleType)
        .map((r) => r.id);
      result = result.filter((a) => ruleIds.includes(a.ruleId));
    }
    if (selectedTopic) {
      result = result.filter((a) => a.topicId === selectedTopic);
    }
    if (selectedDept) {
      const deptUserIds = store.users
        .filter((u) => u.department === selectedDept)
        .map((u) => u.id);
      const deptTopicIds = store.topics
        .filter((t) => deptUserIds.includes(t.ownerId))
        .map((t) => t.id);
      result = result.filter((a) => deptTopicIds.includes(a.topicId));
    }
    return result;
  }, [store.anomalies, store.rules, store.topics, store.users, selectedDept, selectedTopic, selectedRuleType]);

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
    for (const dept of departments) {
      const userIds = store.users
        .filter((u) => u.department === dept)
        .map((u) => u.id);
      const deptTopics = store.topics.filter((t) =>
        userIds.includes(t.ownerId)
      );
      if (deptTopics.length > 0) {
        const shortName = dept.replace(/部|中心/g, "");
        deptMap.set(dept, {
          name: shortName,
          scores: deptTopics.map((t) => t.score),
        });
      }
    }
    return Array.from(deptMap.entries()).map(([, v]) => ({
      name: v.name,
      current: Math.round(v.scores.reduce((a, b) => a + b, 0) / v.scores.length * 10) / 10,
      previous: Math.round((v.scores.reduce((a, b) => a + b, 0) / v.scores.length - 2) * 10) / 10,
    }));
  }, [departments, store.users, store.topics]);

  const horizontalBarData = useMemo(() => {
    return RULE_TYPE_OPTIONS.map((opt) => {
      const typeRules = store.rules.filter((r) => r.type === opt.value && r.status !== "disabled");
      const typeTopics = new Set(typeRules.map((r) => r.topicId));
      const avg =
        typeTopics.size > 0
          ? store.topics
              .filter((t) => typeTopics.has(t.id))
              .reduce((sum, t) => sum + t.score, 0) / typeTopics.size
          : 0;
      return { name: opt.label, score: Math.round(avg * 10) / 10 };
    });
  }, [store.rules, store.topics]);

  const ruleCoverageRate = useMemo(() => {
    if (store.topics.length === 0) return 0;
    const covered = store.topics.filter((t) => t.ruleCount > 0).length;
    return Math.round((covered / store.topics.length) * 100 * 10) / 10;
  }, [store.topics]);

  const issueResolutionRate = useMemo(() => {
    const ts = store.ticketStats();
    const total = ts.open + ts.inProgress + ts.pendingReview + ts.resolved + ts.closed;
    if (total === 0) return 0;
    return Math.round(((ts.resolved + ts.closed) / total) * 100 * 10) / 10;
  }, [store]);

  const monthlyReports = useMemo(() => {
    const rStats = store.ruleStats();
    const tStats = store.taskStats();
    const tkStats = store.ticketStats();
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
  }, [overallScore, store]);

  const handleExportReport = () => {
    const rStats = store.ruleStats();
    const tStats = store.taskStats();
    const tkStats = store.ticketStats();
    const rows = [
      ["指标", "数值"],
      ["综合质量分", String(overallScore)],
      ["规则总数", String(rStats.total)],
      ["已启用规则", String(rStats.enabled)],
      ["任务总数", String(tStats.total)],
      ["执行中任务", String(tStats.running)],
      ["成功任务", String(tStats.success)],
      ["异常总数", String(store.anomalies.length)],
      ["工单总数", String(tkStats.total)],
      ["待处理工单", String(tkStats.open)],
      ["处理中工单", String(tkStats.inProgress)],
      ["已解决工单", String(tkStats.resolved + tkStats.closed)],
      ["规则覆盖率", `${ruleCoverageRate}%`],
      ["问题解决率", `${issueResolutionRate}%`],
    ];
    const csvContent = "\uFEFF" + rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `质量报告_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadReport = (report: typeof monthlyReports[0]) => {
    const rStats = store.ruleStats();
    const tStats = store.taskStats();
    const tkStats = store.ticketStats();
    const rows = [
      ["报告名称", report.name],
      ["报告周期", report.period],
      ["质量分", String(report.score)],
      ["规则数", String(rStats.total)],
      ["任务数", String(tStats.total)],
      ["异常数", String(store.anomalies.length)],
      ["工单数", String(tkStats.total)],
      ["已解决工单", String(tkStats.resolved + tkStats.closed)],
    ];
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
      current: "4.2h",
      previous: "5.8h",
      change: "-27.6%",
      up: true,
    },
    {
      label: "重复问题率",
      current: "3.8%",
      previous: "5.2%",
      change: "-26.9%",
      up: true,
    },
  ];

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
          <button
            onClick={handleExportReport}
            className="flex items-center gap-2 px-4 py-2.5 bg-navy-700 hover:bg-navy-800 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            导出报告
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-slate-100 p-5">
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
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
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
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            >
              <option value="">全部系统</option>
              {topicOptions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">指标类型</label>
            <select
              value={selectedRuleType}
              onChange={(e) => setSelectedRuleType(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
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
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
          <h3 className="font-semibold text-slate-800">月度报告列表</h3>
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
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded flex-shrink-0">
                      {report.type}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                        report.status === "completed"
                          ? "bg-success-50 text-success-700"
                          : report.status === "generating"
                          ? "bg-cyan-50 text-cyan-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {report.status === "completed"
                        ? "已完成"
                        : report.status === "generating"
                        ? "生成中"
                        : "待生成"}
                    </span>
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
                  <button
                    onClick={() => handleDownloadReport(report)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    下载
                  </button>
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
