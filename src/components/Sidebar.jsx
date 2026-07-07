import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Globe, Briefcase, Settings, Zap,
  ChevronRight, Activity
} from "lucide-react";
import clsx from "clsx";

const navItems = [
  { to: "/",          icon: LayoutDashboard, label: "Dashboard",  badge: null },
  { to: "/websites",  icon: Globe,           label: "Websites",   badge: null },
  { to: "/jobs",      icon: Briefcase,       label: "Jobs",       badge: null },
  { to: "/settings",  icon: Settings,        label: "Settings",   badge: null },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-100 flex flex-col z-30 shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center shadow-md shadow-brand-200">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-900 leading-tight">GovJob Scraper</h1>
          <p className="text-xs text-slate-400 font-medium">Admin Dashboard</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-3">Main Menu</p>
        {navItems.map(({ to, icon: Icon, label, badge }) => {
          const isActive = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                isActive
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className={clsx("w-4.5 h-4.5 flex-shrink-0", isActive ? "text-brand-600" : "text-slate-400 group-hover:text-slate-600")} size={18} />
              <span className="flex-1">{label}</span>
              {badge && <span className="badge badge-info">{badge}</span>}
              {isActive && <ChevronRight size={14} className="text-brand-400" />}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-100">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-emerald-50">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-slow" />
          <div>
            <p className="text-xs font-semibold text-emerald-800">System Online</p>
            <p className="text-[10px] text-emerald-600">All services running</p>
          </div>
          <Activity size={14} className="ml-auto text-emerald-500" />
        </div>
      </div>
    </aside>
  );
}
