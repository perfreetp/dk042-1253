import {
  TrendingUp,
  TrendingDown,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import TrendLineChart from "@/components/charts/TrendLineChart";
import HorizontalBarChart from "@/components/charts/HorizontalBarChart";
import DonutChart from "@/components/charts/DonutChart";
import PieChart from "@/components/charts/PieChart";
import GaugeChart from "@/components/charts/GaugeChart";
import ColumnChart from "@/components/charts/ColumnChart";

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
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="数据规则总数"
          value="2,847"
          change="+5.2%"
          changeType="up"
          icon={<Shield className="w-5 h-5" />}
          iconBg="bg-cyan-50"
          iconColor="text-cyan-600"
        />
        <StatCard
          title="待处理问题"
          value="1,024"
          change="-12.8%"
          changeType="down"
          icon={<AlertTriangle className="w-5 h-5" />}
          iconBg="bg-gold-50"
          iconColor="text-gold-600"
        />
        <StatCard
          title="本月已解决"
          value="3,892"
          change="+23.1%"
          changeType="up"
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBg="bg-success-50"
          iconColor="text-success-600"
        />
        <StatCard
          title="执行中任务"
          value="68"
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
              <p className="text-xs text-slate-500 mt-0.5">近14天问题发现与解决趋势</p>
            </div>
            <select className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20">
              <option>近14天</option>
              <option>近30天</option>
              <option>近90天</option>
            </select>
          </div>
          <div className="p-5">
            <TrendLineChart height={300} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">综合质量仪表盘</h3>
            <p className="text-xs text-slate-500 mt-0.5">实时质量评分</p>
          </div>
          <div className="p-5">
            <GaugeChart value={87.6} height={300} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-card border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">问题类型分布</h3>
            <p className="text-xs text-slate-500 mt-0.5">本周问题分类统计</p>
          </div>
          <div className="p-5">
            <DonutChart height={300} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card border border-slate-100 overflow-hidden lg:col-span-2">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">部门质量排名</h3>
            <p className="text-xs text-slate-500 mt-0.5">各部门本期 vs 上期质量得分</p>
          </div>
          <div className="p-5">
            <ColumnChart height={300} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-card border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">质量维度排名</h3>
            <p className="text-xs text-slate-500 mt-0.5">七大质量维度评分对比</p>
          </div>
          <div className="p-5">
            <HorizontalBarChart height={320} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">数据域分布</h3>
            <p className="text-xs text-slate-500 mt-0.5">各数据域问题占比</p>
          </div>
          <div className="p-5">
            <PieChart height={320} />
          </div>
        </div>
      </div>
    </div>
  );
}
