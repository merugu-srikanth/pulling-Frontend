import { useEffect, useState, useCallback } from "react";
import {
  Globe, Briefcase, TrendingUp, AlertTriangle,
  Clock, CheckCircle, Play, Download, BarChart2, Activity
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { toast } from "react-hot-toast";
import Navbar from "../components/Navbar";
import { StatCard } from "../components/StatsCards";
import { statsAPI, websitesAPI, logsAPI, jobsAPI } from "../services/api";

const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const SAMPLE_TREND = [
  { day: "Mon", jobs: 42 }, { day: "Tue", jobs: 78 }, { day: "Wed", jobs: 55 },
  { day: "Thu", jobs: 91 }, { day: "Fri", jobs: 63 }, { day: "Sat", jobs: 110 },
  { day: "Sun", jobs: 87 },
];

function LogRow({ log }) {
  const isSuccess = log.status === "success";
  const isRunning = log.status === "running";
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
        isSuccess ? "bg-emerald-50" : isRunning ? "bg-blue-50" : "bg-red-50"
      }`}>
        {isSuccess ? <CheckCircle size={13} className="text-emerald-600" /> :
         isRunning  ? <Activity size={13} className="text-blue-600 animate-pulse" /> :
                      <AlertTriangle size={13} className="text-red-500" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-700 truncate">{log.websiteUrl}</p>
        <p className="text-[10px] text-slate-400">
          {log.jobsFound} jobs · {new Date(log.startTime).toLocaleTimeString("en-IN")}
        </p>
      </div>
      <span className={`badge text-[10px] ${
        isSuccess ? "badge-success" : isRunning ? "badge-info" : "badge-error"
      }`}>
        {log.status}
      </span>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [scraping, setScraping] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, logsRes] = await Promise.all([
        statsAPI.get(),
        logsAPI.getAll(),
      ]);
      setStats(statsRes.data);
      setLogs(logsRes.data.slice(0, 8));
    } catch {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleScrapeAll = async () => {
    setScraping(true);
    const tid = toast.loading("Scraping all websites...");
    try {
      const res = await websitesAPI.scrapeAll();
      toast.success(`Done! ${res.data.totalJobs} new jobs found`, { id: tid });
      fetchData();
    } catch {
      toast.error("Scraping failed", { id: tid });
    } finally {
      setScraping(false);
    }
  };

  const sourceData = logs.reduce((acc, log) => {
    const src = log.websiteUrl?.split("/")[2]?.replace("www.", "") || "unknown";
    const existing = acc.find((a) => a.name === src);
    if (existing) existing.value++;
    else acc.push({ name: src, value: 1 });
    return acc;
  }, []).slice(0, 5);

  return (
    <div className="flex-1 flex flex-col">
      <Navbar
        title="Dashboard"
        subtitle={`Last updated: ${new Date().toLocaleTimeString("en-IN")}`}
        onRefresh={fetchData}
        loading={loading}
      />

      <main className="flex-1 p-8 space-y-8 page-enter">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard title="Total Websites"  value={stats?.totalWebsites}    icon={Globe}         color="blue"    delay={0}   trendLabel="Registered" />
          <StatCard title="Total Jobs"      value={stats?.totalJobs}         icon={Briefcase}     color="violet"  delay={80}  trendLabel="Collected" />
          <StatCard title="Jobs Today"      value={stats?.jobsToday}         icon={TrendingUp}    color="emerald" delay={160} trendLabel="New today" />
          <StatCard title="Failed Sites"    value={stats?.failedWebsites}    icon={AlertTriangle} color="red"     delay={240} trendLabel="Need attention" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Area Chart */}
          <div className="lg:col-span-2 card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-slate-800">Jobs Scraped This Week</h3>
                <p className="text-xs text-slate-400 mt-0.5">Daily collection trend</p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50">
                <BarChart2 size={13} className="text-brand-600" />
                <span className="text-xs font-semibold text-brand-700">Weekly</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={SAMPLE_TREND} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "none", borderRadius: "10px", color: "#f1f5f9", fontSize: "12px" }}
                  cursor={{ stroke: "#3b82f6", strokeWidth: 1, strokeDasharray: "4 4" }}
                />
                <Area type="monotone" dataKey="jobs" stroke="#3b82f6" strokeWidth={2.5} fill="url(#grad)" dot={{ fill: "#3b82f6", r: 3 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="card">
            <h3 className="font-bold text-slate-800 mb-1">Source Distribution</h3>
            <p className="text-xs text-slate-400 mb-4">Jobs by website</p>
            {sourceData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={sourceData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                      {sourceData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#1e293b", border: "none", borderRadius: "10px", color: "#f1f5f9", fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {sourceData.map((d, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-xs text-slate-600 flex-1 truncate">{d.name}</span>
                      <span className="text-xs font-bold text-slate-700">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                <BarChart2 size={32} className="mb-2 opacity-30" />
                <p className="text-xs">No data yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="card space-y-4">
            <h3 className="font-bold text-slate-800">Quick Actions</h3>
            <div className="space-y-2.5">
              <button
                onClick={handleScrapeAll}
                disabled={scraping}
                className="btn-primary w-full justify-center py-3"
              >
                <Play size={15} className={scraping ? "animate-pulse" : ""} />
                {scraping ? "Scraping..." : "Scrape All Websites"}
              </button>
              <a href="/jobs" className="btn-secondary w-full justify-center py-3 block text-center">
                <Briefcase size={15} />
                View All Jobs
              </a>
              <button
                onClick={() => jobsAPI.exportExcel()}
                className="btn-success w-full justify-center py-3"
              >
                <Download size={15} />
                Export to Excel
              </button>
            </div>

            {/* Info Row */}
            <div className="pt-2 border-t border-slate-100 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1.5"><Clock size={11} /> Last Run</span>
                <span className="font-semibold text-slate-700">
                  {stats?.lastRun ? new Date(stats.lastRun).toLocaleDateString("en-IN") : "Never"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1.5"><CheckCircle size={11} /> Success Rate</span>
                <span className="font-bold text-emerald-600">{stats?.successRate ?? "—"}%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1.5"><Globe size={11} /> Active Sites</span>
                <span className="font-semibold text-slate-700">{stats?.activeWebsites ?? "—"}</span>
              </div>
            </div>
          </div>

          {/* Recent Logs */}
          <div className="lg:col-span-2 card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">Recent Activity</h3>
              <a href="/websites" className="text-xs text-brand-600 font-semibold hover:underline">View all →</a>
            </div>
            <div className="space-y-0">
              {logs.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <Activity size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">No activity yet</p>
                  <p className="text-xs mt-1">Start scraping to see logs here</p>
                </div>
              ) : (
                logs.map((log) => <LogRow key={log.id} log={log} />)
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
