import { FileBarChart, Download, Calendar, TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
import TrendLineChart from "@/components/charts/TrendLineChart";
import HorizontalBarChart from "@/components/charts/HorizontalBarChart";
import DonutChart from "@/components/charts/DonutChart";
import ColumnChart from "@/components/charts/ColumnChart";
import GaugeChart from "@/components/charts/GaugeChart";

export default function Reports() {
  const reports = [
    {
      id: "RPT-202606",
      name: "6月数据质量月报",
      type: "月度报告",
      period: "2026-06-01 ~ 2026-06-15",
      score: 87.6,
      status: "generating",
      createdAt: "2026-06-15 08:00",
      creator: "系统",
    },
    {
      id: "RPT-202605",
      name: "5月数据质量月报",
      type: "月度报告",
      period: "2026-05-01 ~ 2026-05-31",
      score: 85.2,
      status: "completed",
      createdAt: "2026-06-01 02:00",
      creator: "系统",
    },
    {
      id: "RPT-2026-W24",
      name: "第24周质量周报",
      type: "周度报告",
      period: "2026-06-09 ~ 2026-06-15",
      score: 88.1,
      status: "completed",
      createdAt: "2026-06-15 02:00",
      creator: "系统",
    },
    {
      id: "RPT-2026-Q2",
      name: "Q2季度质量分析报告",
      type: "季度报告",
      period: "2026-04-01 ~ 2026-06-30",
      score: 0,
      status: "scheduled",
      createdAt: "2026-07-01 02:00",
      creator: "系统",
    },
    {
      id: "RPT-CUSTOM-001",
      name: "客户数据域专项分析",
      type: "专项报告",
      period: "2026-05-01 ~ 2026-06-15",
      score: 92.4,
      status: "completed",
      createdAt: "2026-06-10 14:30",
      creator: "张三",
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
          <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-sm text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
            <Calendar className="w-4 h-4" />
            选择周期
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-navy-700 hover:bg-navy-800 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
            <FileBarChart className="w-4 h-4" />
            生成报告
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-card border border-slate-100 p-5 lg:col-span-1">
          <h3 className="font-semibold text-slate-800 mb-4">综合质量概览</h3>
          <GaugeChart value={87.6} height={260} />
        </div>

        <div className="bg-white rounded-xl shadow-card border border-slate-100 p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800">关键指标对比</h3>
              <p className="text-xs text-slate-500 mt-0.5">本期 vs 上期</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {[
              {
                label: "规则覆盖率",
                current: "92.4%",
                previous: "89.1%",
                change: "+3.3%",
                up: true,
              },
              {
                label: "问题解决率",
                current: "87.2%",
                previous: "83.5%",
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
            ].map((item, idx) => (
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
                  <span
                    className={
                      item.up ? "text-success-600" : "text-danger-600"
                    }
                  >
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
              <p className="text-xs text-slate-500 mt-0.5">近30天质量得分变化</p>
            </div>
          </div>
          <TrendLineChart height={280} />
        </div>

        <div className="bg-white rounded-xl shadow-card border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800">维度质量分析</h3>
              <p className="text-xs text-slate-500 mt-0.5">七大维度得分</p>
            </div>
          </div>
          <HorizontalBarChart height={280} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-card border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800">问题类型分布</h3>
              <p className="text-xs text-slate-500 mt-0.5">本月问题分类统计</p>
            </div>
          </div>
          <DonutChart height={280} />
        </div>

        <div className="bg-white rounded-xl shadow-card border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800">部门质量对比</h3>
              <p className="text-xs text-slate-500 mt-0.5">各部门质量得分排名</p>
            </div>
          </div>
          <ColumnChart height={280} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">报告列表</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {reports.map((report) => (
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
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
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
