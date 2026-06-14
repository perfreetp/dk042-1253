import { Ticket as TicketIcon, User, Clock, MessageSquare, Filter, Search } from "lucide-react";

export default function Tickets() {
  const tickets = [
    {
      id: "TK-2024001",
      title: "客户表手机号格式异常批量数据",
      type: "完整性问题",
      priority: "high",
      status: "processing",
      assignee: "李四",
      dataCount: 245,
      createdAt: "2026-06-15 09:15",
      deadline: "2026-06-17 18:00",
    },
    {
      id: "TK-2024002",
      title: "交易订单状态枚举值错误",
      type: "一致性问题",
      priority: "critical",
      status: "pending",
      assignee: "王五",
      dataCount: 128,
      createdAt: "2026-06-15 08:45",
      deadline: "2026-06-15 18:00",
    },
    {
      id: "TK-2024003",
      title: "产品编码重复数据处理",
      type: "唯一性问题",
      priority: "medium",
      status: "resolved",
      assignee: "张三",
      dataCount: 56,
      createdAt: "2026-06-14 16:30",
      deadline: "2026-06-16 18:00",
    },
    {
      id: "TK-2024004",
      title: "财务科目余额不平衡",
      type: "准确性问题",
      priority: "critical",
      status: "processing",
      assignee: "赵六",
      dataCount: 32,
      createdAt: "2026-06-14 14:20",
      deadline: "2026-06-15 12:00",
    },
    {
      id: "TK-2024005",
      title: "风控黑名单数据缺失",
      type: "完整性问题",
      priority: "high",
      status: "pending",
      assignee: "孙七",
      dataCount: 18,
      createdAt: "2026-06-14 11:05",
      deadline: "2026-06-16 18:00",
    },
    {
      id: "TK-2024006",
      title: "CRM客户信息字段异常",
      type: "格式校验",
      priority: "low",
      status: "resolved",
      assignee: "李四",
      dataCount: 678,
      createdAt: "2026-06-13 15:40",
      deadline: "2026-06-15 18:00",
    },
  ];

  const priorityConfig = {
    critical: { label: "紧急", class: "bg-danger-50 text-danger-700 border-danger-200" },
    high: { label: "高", class: "bg-gold-50 text-gold-700 border-gold-200" },
    medium: { label: "中", class: "bg-cyan-50 text-cyan-700 border-cyan-200" },
    low: { label: "低", class: "bg-slate-50 text-slate-600 border-slate-200" },
  };

  const statusConfig = {
    pending: { label: "待处理", class: "bg-slate-100 text-slate-700" },
    processing: { label: "处理中", class: "bg-cyan-50 text-cyan-700" },
    resolved: { label: "已解决", class: "bg-success-50 text-success-700" },
    closed: { label: "已关闭", class: "bg-slate-100 text-slate-500" },
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">问题工单</h1>
          <p className="text-sm text-slate-500 mt-1">
            追踪和处理数据质量问题，指派责任人并跟进进度
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-sm text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4" />
            高级筛选
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "待处理工单", value: "168", trend: "+12", color: "danger" },
          { label: "处理中", value: "89", trend: "+5", color: "cyan" },
          { label: "本月已解决", value: "456", trend: "+18%", color: "success" },
          { label: "超期未处理", value: "23", trend: "-3", color: "gold" },
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow-card border border-slate-100 p-5"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500">{item.label}</p>
              <TicketIcon
                className={`w-5 h-5 ${
                  item.color === "danger"
                    ? "text-danger-500"
                    : item.color === "cyan"
                    ? "text-cyan-500"
                    : item.color === "success"
                    ? "text-success-500"
                    : "text-gold-500"
                }`}
              />
            </div>
            <p className="text-2xl font-bold text-slate-800 tabular-nums">
              {item.value}
            </p>
            <p
              className={`text-xs mt-2 ${
                item.color === "danger" || item.color === "gold"
                  ? "text-danger-600"
                  : "text-success-600"
              }`}
            >
              {item.trend}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-card border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜索工单号、标题..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400"
            />
          </div>
          <div className="flex items-center gap-2">
            {Object.entries(statusConfig).map(([key, config]) => (
              <button
                key={key}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  key === "pending"
                    ? "bg-navy-50 text-navy-700"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-50">
          {tickets.map((ticket) => {
            const priority = priorityConfig[ticket.priority as keyof typeof priorityConfig];
            const status = statusConfig[ticket.status as keyof typeof statusConfig];
            return (
              <div
                key={ticket.id}
                className="p-5 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="font-mono text-xs text-navy-600 font-medium">
                        {ticket.id}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded border text-xs font-medium ${priority.class}`}
                      >
                        {priority.label}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${status.class}`}
                      >
                        {status.label}
                      </span>
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {ticket.type}
                      </span>
                    </div>
                    <h4 className="font-medium text-slate-800 mb-3">
                      {ticket.title}
                    </h4>
                    <div className="flex items-center gap-5 text-xs text-slate-500 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        <span>处理人: {ticket.assignee}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>截止: {ticket.deadline}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>影响数据: {ticket.dataCount} 条</span>
                      </div>
                      <span>创建于 {ticket.createdAt}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button className="px-3 py-1.5 text-xs border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
                      详情
                    </button>
                    <button className="px-3 py-1.5 text-xs bg-navy-700 hover:bg-navy-800 text-white rounded-lg transition-colors">
                      处理
                    </button>
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
