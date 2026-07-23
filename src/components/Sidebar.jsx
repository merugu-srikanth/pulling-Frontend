import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Globe, Briefcase, Settings, Zap,
  ChevronRight, Activity, Trello, CheckSquare,
  ClipboardList, Users, BarChart3, User, LogOut, ShieldAlert
} from "lucide-react";
import clsx from "clsx";
import toast from "react-hot-toast";

const scraperNavItems = [
  { to: "/",          icon: LayoutDashboard, label: "Scraper Dashboard" },
  { to: "/websites",  icon: Globe,           label: "Websites" },
  { to: "/jobs",      icon: Briefcase,       label: "Jobs" },
];

const kanbanNavItems = [
  { to: "/kanban",           icon: Trello,          label: "Kanban Board" },
  { to: "/my-tasks",         icon: CheckSquare,     label: "My Tasks" },
  { to: "/daily-reports",    icon: ClipboardList,   label: "Daily Reports" },
  { to: "/team-performance", icon: Users,           label: "Team View" },
  { to: "/task-analytics",   icon: BarChart3,       label: "Task Analytics" },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null);

  const loadUser = () => {
    const stored = localStorage.getItem("adminUser");
    if (stored) {
      try {
        setAdminUser(JSON.parse(stored));
      } catch (e) {
        setAdminUser(null);
      }
    } else {
      setAdminUser(null);
    }
  };

  useEffect(() => {
    loadUser();
    window.addEventListener("authChanged", loadUser);
    return () => window.removeEventListener("authChanged", loadUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    toast.success("Logged out successfully.");
    window.dispatchEvent(new Event("authChanged"));
    navigate("/login");
  };

  // Determine permissions
  const isSuperAdmin = adminUser?.role === "super_admin";
  const hasScraperAccess = isSuperAdmin || adminUser?.permissions?.scraping === true;
  const hasKanbanAccess = isSuperAdmin || adminUser?.permissions?.task_manager === true;

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-100 flex flex-col z-30 shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-900 leading-tight font-sans">GovJob Portal</h1>
          <p className="text-xs text-slate-400 font-medium font-sans">Admin Console</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto scrollbar-thin">
        {/* Scraper Section */}
        {hasScraperAccess && (
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 font-sans">Vacancy Scraper</p>
            <div className="space-y-0.5">
              {scraperNavItems.map(({ to, icon: Icon, label }) => {
                const isActive = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
                return (
                  <NavLink
                    key={to}
                    to={to}
                    className={clsx(
                      "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 group font-sans",
                      isActive
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <Icon className={clsx("w-4 h-4 flex-shrink-0", isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} size={16} />
                    <span className="flex-1 text-xs">{label}</span>
                    {isActive && <ChevronRight size={12} className="text-blue-400" />}
                  </NavLink>
                );
              })}
            </div>
          </div>
        )}

        {/* Task Management Section */}
        {hasKanbanAccess && (
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 font-sans">Task Management</p>
            <div className="space-y-0.5">
              {kanbanNavItems.map(({ to, icon: Icon, label }) => {
                const isActive = location.pathname.startsWith(to);
                return (
                  <NavLink
                    key={to}
                    to={to}
                    className={clsx(
                      "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 group font-sans",
                      isActive
                        ? "bg-indigo-50 text-indigo-700 font-semibold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <Icon className={clsx("w-4 h-4 flex-shrink-0", isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-650")} size={16} />
                    <span className="flex-1 text-xs">{label}</span>
                    {isActive && <ChevronRight size={12} className="text-indigo-400" />}
                  </NavLink>
                );
              })}
            </div>
          </div>
        )}

        {/* Settings and Roles */}
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 font-sans">Settings</p>
          <div className="space-y-0.5">
            {isSuperAdmin && (
              <NavLink
                to="/roles"
                className={clsx(
                  "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 group font-sans",
                  location.pathname.startsWith("/roles")
                    ? "bg-slate-100 text-slate-900 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <ShieldAlert className="w-4 h-4 flex-shrink-0 text-slate-400 group-hover:text-slate-600" size={16} />
                <span className="flex-1 text-xs">Role Management</span>
              </NavLink>
            )}

            {hasScraperAccess && (
              <NavLink
                to="/settings"
                className={clsx(
                  "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 group font-sans",
                  location.pathname.startsWith("/settings")
                    ? "bg-slate-100 text-slate-900 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Settings className="w-4 h-4 flex-shrink-0 text-slate-400 group-hover:text-slate-600" size={16} />
                <span className="flex-1 text-xs">Scraper Settings</span>
              </NavLink>
            )}
          </div>
        </div>
      </nav>

      {/* Logged in Admin User Info & Logout */}
      {adminUser && (
        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs uppercase">
                {adminUser.name.slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate leading-snug">{adminUser.name}</p>
                <p className="text-[10px] text-slate-450 font-semibold uppercase tracking-wider">{adminUser.role === "super_admin" ? "Super Admin" : "Moderator"}</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-100 rounded-xl text-xs font-semibold transition"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
