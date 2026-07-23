import { useState, useEffect } from "react";
import { BarChart as BarChartIcon, TrendingUp, AlertTriangle, CheckCircle2, ListTodo, Activity } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { kanbanAPI } from "../services/kanban";
import toast from "react-hot-toast";

const COLORS = {
  Todo: "#94a3b8",        // Gray
  "In Progress": "#3b82f6", // Blue
  Review: "#a855f7",      // Purple
  Completed: "#10b981",   // Green
  Pending: "#f59e0b",     // Orange
  Cancelled: "#ef4444",   // Red
};

export default function TaskAnalytics() {
  const [summary, setSummary] = useState({
    Todo: 0,
    "In Progress": 0,
    Review: 0,
    Completed: 0,
    Pending: 0,
    Cancelled: 0,
    Overdue: 0,
  });

  const [recentTasks, setRecentTasks] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [barData, setBarData] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [sumRes, tasksRes] = await Promise.all([
          kanbanAPI.getTaskSummary(),
          kanbanAPI.getTasks(),
        ]);

        const sum = sumRes.data;
        setSummary(sum);

        // Populate Recharts Data
        const pie = Object.keys(COLORS).map((key) => ({
          name: key,
          value: sum[key] || 0,
        })).filter(item => item.value > 0);
        setPieData(pie);

        const bar = Object.keys(COLORS).map((key) => ({
          name: key,
          Tasks: sum[key] || 0,
        }));
        setBarData(bar);

        // Get 5 most recently updated tasks
        const sorted = [...tasksRes.data]
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          .slice(0, 5);
        setRecentTasks(sorted);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load task analytics");
      }
    };

    fetchAnalytics();
  }, []);

  const totalTasks = Object.keys(COLORS).reduce((acc, key) => acc + (summary[key] || 0), 0);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
          <BarChartIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-sans">Task Analytics</h1>
          <p className="text-sm text-slate-500 font-medium font-sans">
            Deep dive into project workloads, timelines, and efficiency indicators.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-150 rounded-2xl p-4 shadow-xs flex items-center gap-3 font-sans">
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
            <ListTodo className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Tasks</span>
            <span className="text-lg font-bold text-slate-800">{totalTasks}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-150 rounded-2xl p-4 shadow-xs flex items-center gap-3 font-sans">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active (In Prog)</span>
            <span className="text-lg font-bold text-blue-700">{summary["In Progress"]}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-150 rounded-2xl p-4 shadow-xs flex items-center gap-3 font-sans">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100/50 flex items-center justify-center text-emerald-500">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Completed</span>
            <span className="text-lg font-bold text-emerald-700">{summary.Completed}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-150 rounded-2xl p-4 shadow-xs flex items-center gap-3 font-sans">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100/50 flex items-center justify-center text-rose-500">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Overdue</span>
            <span className="text-lg font-bold text-rose-700">{summary.Overdue}</span>
          </div>
        </div>
      </div>

      {/* Recharts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs flex flex-col items-center">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 self-start font-sans">
            Task Progress distribution
          </h3>
          {pieData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-450 font-sans">
              No tasks logged yet.
            </div>
          ) : (
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name] || "#CBD5E1"} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} Tasks`]} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Bar Chart */}
        <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 font-sans">
            Status Volume comparison
          </h3>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 600, fill: "#64748B" }} />
                <YAxis tick={{ fontSize: 10, fontWeight: 600, fill: "#64748B" }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="Tasks" radius={[6, 6, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name] || "#CBD5E1"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Updates */}
      <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 font-sans">
          <Activity className="w-4 h-4 text-slate-400" />
          Recent Task Updates
        </h3>
        {recentTasks.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center font-sans">No tasks registered.</p>
        ) : (
          <div className="divide-y divide-slate-100 font-sans">
            {recentTasks.map((t) => (
              <div key={t._id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div>
                  <h4 className="font-bold text-slate-800 leading-snug">{t.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Last modified: {new Date(t.updatedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    t.status === "Completed" ? "bg-emerald-100 text-emerald-700" :
                    t.status === "In Progress" ? "bg-blue-100 text-blue-700" :
                    t.status === "Cancelled" ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-700"
                  }`}>
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
