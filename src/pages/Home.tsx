import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ClipboardList,
  UserCheck,
  Eye,
} from "lucide-react";
import { useDQCStore } from "@/store/dqc";
import TrendLineChart from "@/components/charts/TrendLineChart";
import HorizontalBarChart from "@/components/charts/HorizontalBarChart";
import DonutChart from "@/components/charts/DonutChart";
import PieChart from "@/components/charts/PieChart";
import GaugeChart from "@/components/charts/GaugeChart";
import ColumnChart from "@/components/charts/ColumnChart";
import { RuleType } from "@/data/types";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "up" | "down";
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

function StatCard({
  title,
  value,
  change,
  changeType,
  icon,
  iconBg,
  iconColor,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-card p-5 hover:shadow-card-hover transition-all duration-200 border border-slate-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-800 tabular-nums">
            {value}
          </p>
        </div>
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}
        >
          <div className={iconColor}>{icon}</div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1 text-xs">
        {changeType === "up" ? (
          <TrendingUp className="w-3.5 h-3.5 text-success-500" />
        ) : (
          <TrendingDown className="w-3.5 h-3.5 text-danger-500" />
        )}
        <span
          className={
            changeType === "up" ? "text-success-600" : "text-danger-600"
          }
        >
          {change}
        </span>
        <span className="text-slate-400">较上周</span>
      </div>
    </div>
  );
}

export default function Home() {
  const store = useDQCStore();
  const navigate = useNavigate();

  const ruleStatValue = store.ruleStats().total;
  const ticketStatValue = store.ticketStats().open + store.ticketStats().inProgress;
  const resolvedValue = store.ticketStats().resolved + store.ticketStats().closed;
  const runningTasks = store.taskStats().running;

  const overallScore = store.overallQualityScore();

  const donutData = useMemo(() => {
    const RULE_TYPE_LABELS = store.RULE_TYPE_LABELS;
    const DONUT_COLORS = ["#00B4D8", "#F4A100", "#10B981", "#EF4444", "#8B5CF6"];
    const countMap: Record<string, number> = {};
    for (const rt of Object.values(RuleType)) {
      countMap[rt] = 0;
    }
    for (const a of store.anomalies) {
      const rule = store.rules.find((r) => r.id === a.ruleId);
      if (rule) countMap[rule.type] = (countMap[rule.type] || 0) + 1;
    }
    return Object.entries(RULE_TYPE_LABELS).map(([key, label], i) => ({
      name: label + "问题",
      value: countMap[key] || 0,
      color: DONUT_COLORS[i],
    }));
  }, [store.anomalies, store.rules, store.RULE_TYPE_LABELS]);

  const columnData = useMemo(() => {
    const departments = [...new Set(store.users.map((u) => u.department))];
    return departments
      .map((dept) => {
        const userIds = store.users
          .filter((u) => u.department === dept)
          .map((u) => u.id);
        const deptTopics = store.topics.filter((t) =>
          userIds.includes(t.ownerId)
        );
        if (deptTopics.length === 0) return null;
        const shortName = dept.replace(/部|中心/g, "");
        const avg =
          deptTopics.reduce((sum, t) => sum + t.score, 0) /
          deptTopics.length;
        return {
          name: shortName,
          current: Math.round(avg * 10) / 10,
          previous: Math.round((avg - 2) * 10) / 10,
        };
      })
      .filter(Boolean) as { name: string; current: number; previous: number }[];
  }, [store.users, store.topics]);

  const pieData = useMemo(() => {
    const PIE_COLORS = ["#00B4D8", "#F4A100", "#10B981", "#8B5CF6", "#EC4899", "#6366F1", "#14B8A6", "#F97316", "#06B6D4", "#8B5CF6"];
    return store.topics.map((t, i) => ({
      name: t.name.replace("数据", "数据域"),
      value: t.issueCount,
      color: PIE_COLORS[i % PIE_COLORS.length],
    }));
  }, [store.topics]);

  const horizontalBarData = useMemo(() => {
    const RULE_TYPE_OPTIONS = [
      { value: RuleType.Completeness, label: "完整性" },
      { value: RuleType.Accuracy, label: "准确性" },
      { value: RuleType.Consistency, label: "一致性" },
      { value: RuleType.Timeliness, label: "及时性" },
      { value: RuleType.Uniqueness, label: "唯一性" },
    ];
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

  const trendChartData = useMemo(
    () =>
      store.trendData.map((p) => ({
        date: p.date.slice(5),
        discovered: p.anomalyCount,
        resolved: Math.round(p.anomalyCount * (0.6 + Math.random() * 0.3)),
      })),
    [store.trendData]
  );

  const pendingAssign = store.tickets.filter((t) => t.status === "open" && !t.assigneeId).length;
  const pendingProcess = store.ticketStats().inProgress;
  const pendingReview = store.ticketStats().pendingReview;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="数据规则总数"
          value={ruleStatValue.toLocaleString()}
          change="+5.2%"
          changeType="up"
          icon={<Shield className="w-5 h-5" />}
          iconBg="bg-cyan-50"
          iconColor="text-cyan-600"
        />
        <StatCard
          title="待处理问题"
          value={ticketStatValue.toLocaleString()}
          change="-12.8%"
          changeType="down"
          icon={<AlertTriangle className="w-5 h-5" />}
          iconBg="bg-gold-50"
          iconColor="text-gold-600"
        />
        <StatCard
          title="本月已解决"
          value={resolvedValue.toLocaleString()}
          change="+23.1%"
          changeType="up"
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBg="bg-success-50"
          iconColor="text-success-600"
        />
        <StatCard
          title="执行中任务"
          value={runningTasks.toLocaleString()}
          change="+8.4%"
          changeType="up"
          icon={<Clock className="w-5 h-5" />}
          iconBg="bg-navy-50"
          iconColor="text-navy-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-card border border-slate-100 overflow-hidden lg:col-span-2">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-800">质量趋势分析</h3>
              <p className="text-xs text-slate-500 mt-0.5">近30天问题发现与解决趋势</p>
            </div>
          </div>
          <div className="p-5">
            <TrendLineChart data={trendChartData} height={300} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">综合质量仪表盘</h3>
            <p className="text-xs text-slate-500 mt-0.5">实时质量评分</p>
          </div>
          <div className="p-5">
            <GaugeChart value={overallScore} height={300} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-card border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">问题类型分布</h3>
            <p className="text-xs text-slate-500 mt-0.5">按规则类型分类统计</p>
          </div>
          <div className="p-5">
            <DonutChart data={donutData} height={300} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card border border-slate-100 overflow-hidden lg:col-span-2">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">部门质量排名</h3>
            <p className="text-xs text-slate-500 mt-0.5">各部门本期 vs 上期质量得分</p>
          </div>
          <div className="p-5">
            <ColumnChart data={columnData} height={300} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-card border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">质量维度排名</h3>
            <p className="text-xs text-slate-500 mt-0.5">五大质量维度评分对比</p>
          </div>
          <div className="p-5">
            <HorizontalBarChart data={horizontalBarData} height={320} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">数据域分布</h3>
            <p className="text-xs text-slate-500 mt-0.5">各数据域问题占比</p>
          </div>
          <div className="p-5">
            <PieChart data={pieData} height={320} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">待办工作台</h3>
          <button
            onClick={() => navigate("/tickets")}
            className="flex items-center gap-1 text-sm text-cyan-600 hover:text-cyan-700 font-medium transition-colors"
          >
            查看全部
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate("/tickets")}
              className="flex items-center gap-4 p-4 bg-gold-50/60 rounded-xl border border-gold-100 hover:bg-gold-50 transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gold-100">
                <ClipboardList className="w-6 h-6 text-gold-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800 tabular-nums">
                  {pendingAssign}
                </p>
                <p className="text-sm text-slate-500">待分派工单</p>
              </div>
            </button>

            <button
              onClick={() => navigate("/tickets")}
              className="flex items-center gap-4 p-4 bg-cyan-50/60 rounded-xl border border-cyan-100 hover:bg-cyan-50 transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-cyan-100">
                <UserCheck className="w-6 h-6 text-cyan-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800 tabular-nums">
                  {pendingProcess}
                </p>
                <p className="text-sm text-slate-500">待处理工单</p>
              </div>
            </button>

            <button
              onClick={() => navigate("/tickets")}
              className="flex items-center gap-4 p-4 bg-success-50/60 rounded-xl border border-success-100 hover:bg-success-50 transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-success-100">
                <Eye className="w-6 h-6 text-success-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800 tabular-nums">
                  {pendingReview}
                </p>
                <p className="text-sm text-slate-500">待复检工单</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
