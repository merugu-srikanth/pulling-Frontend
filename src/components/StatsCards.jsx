import clsx from "clsx";
import { TrendingUp } from "lucide-react";

function StatCard({ title, value, icon: Icon, color, trend, trendLabel, delay = 0 }) {
  const colors = {
    blue:    { bg: "bg-blue-50",    icon: "bg-blue-100 text-blue-600",   text: "text-blue-600",   ring: "ring-blue-100"   },
    emerald: { bg: "bg-emerald-50", icon: "bg-emerald-100 text-emerald-600", text: "text-emerald-600", ring: "ring-emerald-100" },
    violet:  { bg: "bg-violet-50",  icon: "bg-violet-100 text-violet-600", text: "text-violet-600", ring: "ring-violet-100"  },
    amber:   { bg: "bg-amber-50",   icon: "bg-amber-100 text-amber-600",  text: "text-amber-600",  ring: "ring-amber-100"   },
    red:     { bg: "bg-red-50",     icon: "bg-red-100 text-red-600",      text: "text-red-600",    ring: "ring-red-100"     },
    indigo:  { bg: "bg-indigo-50",  icon: "bg-indigo-100 text-indigo-600",text: "text-indigo-600", ring: "ring-indigo-100"  },
  };
  const c = colors[color] || colors.blue;

  return (
    <div
      className="card-hover animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
          <p className="text-3xl font-extrabold text-slate-900 leading-none mt-2">
            {value === null || value === undefined ? (
              <span className="skeleton h-8 w-20 inline-block" />
            ) : (
              typeof value === "number" ? value.toLocaleString() : value
            )}
          </p>
          {trendLabel && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp size={11} className={c.text} />
              <span className={clsx("text-xs font-medium", c.text)}>{trendLabel}</span>
            </div>
          )}
        </div>
        <div className={clsx("p-3 rounded-2xl ring-1", c.icon, c.ring)}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

export default function StatsCards({ stats, loading }) {
  return null; // exported separately; use StatCard
}

export { StatCard };
