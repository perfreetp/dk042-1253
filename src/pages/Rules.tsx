import { Plus, Search, Filter, Download } from "lucide-react";

export default function Rules() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">规则管理</h1>
          <p className="text-sm text-slate-500 mt-1">
            管理数据质量校验规则，配置检查逻辑和阈值
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-navy-700 hover:bg-navy-800 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          新建规则
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-slate-100 p-5">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜索规则名称、编码..."
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-sm text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4" />
            筛选
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-sm text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" />
            导出
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "规则总数", value: "2,847", trend: "+5.2%", color: "cyan" },
          { label: "启用规则", value: "2,412", trend: "+3.8%", color: "success" },
          { label: "停用规则", value: "435", trend: "-2.1%", color: "slate" },
          { label: "异常规则", value: "23", trend: "+8", color: "danger" },
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow-card border border-slate-100 p-5"
          >
            <p className="text-sm text-slate-500 mb-2">{item.label}</p>
            <p className="text-2xl font-bold text-slate-800 tabular-nums">
              {item.value}
            </p>
            <p
              className={`text-xs mt-2 ${
                item.trend.startsWith("+") || item.color === "danger"
                  ? item.color === "danger"
                    ? "text-danger-600"
                    : "text-success-600"
                  : "text-danger-600"
              }`}
            >
              {item.trend}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-card border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">规则列表</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-slate-600">
                  规则编码
                </th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">
                  规则名称
                </th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">
                  数据域
                </th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">
                  类型
                </th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">
                  状态
                </th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">
                  更新时间
                </th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  code: "R-00123",
                  name: "客户手机号有效性校验",
                  domain: "客户数据",
                  type: "格式校验",
                  status: "enabled",
                  time: "2026-06-14 15:30",
                },
                {
                  code: "R-00124",
                  name: "交易金额非空校验",
                  domain: "交易数据",
                  type: "完整性校验",
                  status: "enabled",
                  time: "2026-06-14 10:22",
                },
                {
                  code: "R-00125",
                  name: "产品编码唯一性校验",
                  domain: "产品数据",
                  type: "唯一性校验",
                  status: "disabled",
                  time: "2026-06-13 18:45",
                },
                {
                  code: "R-00126",
                  name: "订单状态枚举值校验",
                  domain: "交易数据",
                  type: "一致性校验",
                  status: "enabled",
                  time: "2026-06-13 09:12",
                },
                {
                  code: "R-00127",
                  name: "财务数据平衡校验",
                  domain: "财务数据",
                  type: "准确性校验",
                  status: "error",
                  time: "2026-06-12 16:28",
                },
              ].map((row, idx) => (
                <tr
                  key={idx}
                  className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-5 py-3.5 font-mono text-navy-600">
                    {row.code}
                  </td>
                  <td className="px-5 py-3.5 text-slate-800 font-medium">
                    {row.name}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{row.domain}</td>
                  <td className="px-5 py-3.5 text-slate-600">{row.type}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        row.status === "enabled"
                          ? "bg-success-50 text-success-700"
                          : row.status === "disabled"
                          ? "bg-slate-100 text-slate-600"
                          : "bg-danger-50 text-danger-700"
                      }`}
                    >
                      {row.status === "enabled"
                        ? "启用"
                        : row.status === "disabled"
                        ? "停用"
                        : "异常"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">{row.time}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button className="text-cyan-600 hover:text-cyan-700 text-xs font-medium">
                        编辑
                      </button>
                      <span className="text-slate-200">|</span>
                      <button className="text-slate-500 hover:text-slate-700 text-xs font-medium">
                        详情
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
