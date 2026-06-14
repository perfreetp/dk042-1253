import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Settings,
  ClipboardList,
  Ticket,
  FileBarChart,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { path: "/", label: "首页总览", icon: LayoutDashboard },
  { path: "/rules", label: "规则管理", icon: Settings },
  { path: "/tasks", label: "检查任务", icon: ClipboardList },
  { path: "/tickets", label: "问题工单", icon: Ticket },
  { path: "/reports", label: "质量报告", icon: FileBarChart },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-navy-800 text-white flex flex-col h-screen fixed left-0 top-0 z-40 shadow-xl">
      <div className="h-16 flex items-center px-6 border-b border-navy-700/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wide">DQC</h1>
            <p className="text-xs text-navy-300">数据质量中心</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "bg-gradient-to-r from-cyan-500/20 to-cyan-500/10 text-cyan-300 border-l-4 border-cyan-400 shadow-inner"
                  : "text-navy-200 hover:bg-navy-700/50 hover:text-white border-l-4 border-transparent"
              )
            }
          >
            {({ isActive }) => {
              const Icon = item.icon;
              return (
                <>
                  <Icon
                    className={cn(
                      "w-5 h-5 transition-colors",
                      isActive ? "text-cyan-400" : "text-navy-300 group-hover:text-white"
                    )}
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  )}
                </>
              );
            }}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-navy-700/60">
        <div className="bg-navy-900/60 rounded-lg p-4">
          <p className="text-xs text-navy-400 mb-2">系统版本</p>
          <p className="text-sm font-medium text-navy-200">v2.4.1</p>
          <p className="text-xs text-navy-400 mt-1">© 2026 Data Quality</p>
        </div>
      </div>
    </aside>
  );
}
