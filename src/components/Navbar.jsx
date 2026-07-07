import { Bell, Search, RefreshCw, User } from "lucide-react";
import { useState } from "react";

export default function Navbar({ title, subtitle, onRefresh, loading }) {
  const [searching, setSearching] = useState(false);

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-slate-100 px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Title */}
        <div>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="btn-secondary"
              title="Refresh"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              <span>{loading ? "Loading..." : "Refresh"}</span>
            </button>
          )}

          <button className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
          </button>

          <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center shadow-sm">
              <User size={14} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-slate-800">Admin</p>
              <p className="text-[10px] text-slate-400">Super User</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
