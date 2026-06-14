import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Search,
  Bell,
  ChevronDown,
  ChevronRight,
  Settings,
  LogOut,
  User,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  path?: string;
}

const routeBreadcrumbMap: Record<string, BreadcrumbItem[]> = {
  "/": [{ label: "首页总览" }],
  "/rules": [{ label: "首页总览", path: "/" }, { label: "规则管理" }],
  "/tasks": [{ label: "首页总览", path: "/" }, { label: "检查任务" }],
  "/tickets": [{ label: "首页总览", path: "/" }, { label: "问题工单" }],
  "/reports": [{ label: "首页总览", path: "/" }, { label: "质量报告" }],
};

export default function Topbar() {
  const location = useLocation();
  const [searchValue, setSearchValue] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const breadcrumbs = routeBreadcrumbMap[location.pathname] || [
    { label: "首页总览", path: "/" },
  ];

  const notifications = [
    { id: 1, title: "新工单分配", desc: "工单 #2024001 已分配给您", time: "5分钟前", unread: true },
    { id: 2, title: "任务完成", desc: "日检任务 DQ-8821 执行成功", time: "30分钟前", unread: true },
    { id: 3, title: "规则告警", desc: "R-00123 规则触发阈值告警", time: "1小时前", unread: true },
    { id: 4, title: "系统更新", desc: "系统将于今晚22:00进行维护", time: "3小时前", unread: false },
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1 max-w-2xl">
        <nav className="flex items-center gap-1 text-sm">
          {breadcrumbs.map((item, index) => (
            <div key={index} className="flex items-center gap-1">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
              {item.path ? (
                <span className="text-slate-500 hover:text-navy-600 cursor-pointer transition-colors">
                  {item.label}
                </span>
              ) : (
                <span className="font-medium text-navy-700">{item.label}</span>
              )}
            </div>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="搜索规则、任务、工单..."
            className="w-72 h-9 pl-9 pr-4 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setShowNotification(!showNotification);
              setShowUserMenu(false);
            }}
            className="relative w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-navy-700 transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger-500 ring-2 ring-white" />
          </button>

          {showNotification && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-modal border border-slate-100 overflow-hidden animate-fade-in-up">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">通知中心</h3>
                <span className="text-xs bg-cyan-50 text-cyan-600 px-2 py-0.5 rounded-full font-medium">
                  {notifications.filter(n => n.unread).length} 条未读
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      "px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer",
                      n.unread && "bg-cyan-50/30"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                        n.unread ? "bg-cyan-500" : "bg-slate-300"
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800">{n.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{n.desc}</p>
                        <p className="text-xs text-slate-400 mt-1">{n.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
                <button className="w-full text-xs text-cyan-600 hover:text-cyan-700 font-medium py-1">
                  查看全部通知
                </button>
              </div>
            </div>
          )}
        </div>

        <button className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-navy-700 transition-colors">
          <HelpCircle className="w-5 h-5" />
        </button>

        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotification(false);
            }}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-navy-500 to-navy-700 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
              ZS
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-slate-800">张三</p>
              <p className="text-xs text-slate-500">数据管理员</p>
            </div>
            <ChevronDown className={cn(
              "w-4 h-4 text-slate-400 transition-transform",
              showUserMenu && "rotate-180"
            )} />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-modal border border-slate-100 overflow-hidden animate-fade-in-up">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <p className="text-sm font-semibold text-slate-800">张三</p>
                <p className="text-xs text-slate-500">zhangsan@company.com</p>
              </div>
              <div className="py-1">
                <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors">
                  <User className="w-4 h-4" /> 个人中心
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors">
                  <Settings className="w-4 h-4" /> 账号设置
                </button>
              </div>
              <div className="py-1 border-t border-slate-100">
                <button className="w-full px-4 py-2 text-left text-sm text-danger-600 hover:bg-danger-50 flex items-center gap-2 transition-colors">
                  <LogOut className="w-4 h-4" /> 退出登录
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
