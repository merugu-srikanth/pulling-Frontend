import { useState, useEffect } from "react";
import { Save, Clock, RotateCcw, Database, Calendar, Repeat2, AlarmClock, Globe, CheckSquare, Square } from "lucide-react";
import { toast } from "react-hot-toast";
import Navbar from "../components/Navbar";
import { settingsAPI, websitesAPI } from "../services/api";

/* ─── Toggle ──────────────────────────────────────────────────────────────── */
function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
        checked ? "bg-brand-600" : "bg-slate-200"
      } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
        checked ? "translate-x-5" : "translate-x-0"
      }`} />
    </button>
  );
}

/* ─── Section wrapper ─────────────────────────────────────────────────────── */
function Section({ icon: Icon, title, description, children }) {
  return (
    <div className="card space-y-5">
      <div className="flex items-start gap-3 pb-4 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
          <Icon size={17} className="text-brand-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800">{title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

/* ─── Cron helpers ────────────────────────────────────────────────────────── */
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function parseCronToState(cron) {
  if (!cron) return { mode: "daily", time: "08:00", days: [1, 2, 3, 4, 5], hours: 6 };
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) return { mode: "custom", time: "08:00", days: [1,2,3,4,5], hours: 6 };

  const [min, hour, dom, month, dow] = parts;

  // Every N hours: 0 */N * * *
  if (hour.startsWith("*/") && dom === "*" && month === "*" && dow === "*") {
    return { mode: "hourly", time: "08:00", days: [1,2,3,4,5], hours: parseInt(hour.slice(2)) || 6 };
  }

  // Daily or weekly: M H * * (*|DOW)
  const minNum = parseInt(min);
  const hourNum = parseInt(hour);
  if (!isNaN(minNum) && !isNaN(hourNum) && dom === "*" && month === "*") {
    const hh = String(hourNum).padStart(2, "0");
    const mm = String(minNum).padStart(2, "0");
    const time = `${hh}:${mm}`;

    if (dow === "*") return { mode: "daily", time, days: [1,2,3,4,5], hours: 6 };

    const days = [];
    dow.split(",").forEach(d => {
      if (d.includes("-")) {
        const [s, e] = d.split("-").map(Number);
        for (let i = s; i <= e; i++) days.push(i);
      } else if (!isNaN(parseInt(d))) {
        days.push(parseInt(d));
      }
    });
    return { mode: "weekly", time, days, hours: 6 };
  }

  return { mode: "custom", time: "08:00", days: [1,2,3,4,5], hours: 6 };
}

function buildCron(mode, time, days, hours) {
  const [hStr = "8", mStr = "0"] = (time || "08:00").split(":");
  const h = parseInt(hStr);
  const m = parseInt(mStr);

  if (mode === "daily")  return `${m} ${h} * * *`;
  if (mode === "hourly") return `0 */${hours} * * *`;
  if (mode === "weekly") {
    if (days.length === 0) return `${m} ${h} * * *`;
    return `${m} ${h} * * ${[...days].sort((a, b) => a - b).join(",")}`;
  }
  return "";
}

function fmt12h(time24) {
  const [hStr, mStr] = (time24 || "08:00").split(":");
  let h = parseInt(hStr);
  const m = String(parseInt(mStr)).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

function cronPreview(mode, time, days, hours) {
  if (mode === "daily")  return `Every day at ${fmt12h(time)}`;
  if (mode === "hourly") return `Every ${hours} hour${hours > 1 ? "s" : ""}`;
  if (mode === "weekly") {
    if (days.length === 0) return "No days selected";
    const names = [...days].sort((a,b)=>a-b).map(d => DAYS[d]).join(", ");
    return `Every ${names} at ${fmt12h(time)}`;
  }
  return "";
}

/* ─── Schedule Builder ────────────────────────────────────────────────────── */
function ScheduleBuilder({ cronExpression, onChange }) {
  const init = parseCronToState(cronExpression);
  const [mode, setMode]     = useState(init.mode);
  const [time, setTime]     = useState(init.time);
  const [days, setDays]     = useState(new Set(init.days));
  const [hours, setHours]   = useState(init.hours);
  const [custom, setCustom] = useState(cronExpression || "0 8 * * *");

  // Emit cron upward whenever any sub-state changes
  useEffect(() => {
    const cron = mode === "custom" ? custom : buildCron(mode, time, [...days], hours);
    onChange(cron);
  }, [mode, time, days, hours, custom]); // eslint-disable-line

  const toggleDay = (d) => {
    setDays(prev => {
      const next = new Set(prev);
      next.has(d) ? next.delete(d) : next.add(d);
      return next;
    });
  };

  const HOUR_OPTIONS = [1, 2, 3, 4, 6, 8, 12, 24];

  const modeBtn = (m, label, Icon) => (
    <button
      key={m}
      onClick={() => setMode(m)}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
        mode === m
          ? "bg-brand-600 text-white border-brand-600 shadow-sm"
          : "bg-white text-slate-600 border-slate-200 hover:border-brand-300 hover:text-brand-700"
      }`}
    >
      <Icon size={14} />
      {label}
    </button>
  );

  return (
    <div className="space-y-4">
      {/* Mode selector */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-2">Repeat Type</label>
        <div className="flex flex-wrap gap-2">
          {modeBtn("daily",  "Daily",   Calendar)}
          {modeBtn("weekly", "Weekly",  Repeat2)}
          {modeBtn("hourly", "Hourly",  Clock)}
          {modeBtn("custom", "Custom",  AlarmClock)}
        </div>
      </div>

      {/* Time picker — shown for daily and weekly */}
      {(mode === "daily" || mode === "weekly") && (
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-2">Run at Time</label>
          <input
            type="time"
            className="input w-36 font-mono"
            value={time}
            onChange={e => setTime(e.target.value)}
          />
          <p className="text-xs text-slate-400 mt-1">{fmt12h(time)}</p>
        </div>
      )}

      {/* Day selector — weekly only */}
      {mode === "weekly" && (
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-2">Run on Days</label>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((d, i) => (
              <button
                key={i}
                onClick={() => toggleDay(i)}
                className={`w-12 py-2 rounded-xl text-xs font-bold transition-all border ${
                  days.has(i)
                    ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                    : "bg-slate-50 text-slate-500 border-slate-200 hover:border-brand-300 hover:text-brand-700"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          {/* Quick presets */}
          <div className="flex flex-wrap gap-2 mt-2">
            {[
              { label: "Mon–Fri", days: [1,2,3,4,5] },
              { label: "Weekends", days: [0,6] },
              { label: "Every day", days: [0,1,2,3,4,5,6] },
            ].map(({ label, days: d }) => (
              <button
                key={label}
                onClick={() => setDays(new Set(d))}
                className="text-xs px-3 py-1 rounded-lg bg-slate-100 hover:bg-brand-50 text-slate-600 hover:text-brand-700 font-medium transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hour interval — hourly only */}
      {mode === "hourly" && (
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-2">Run Every</label>
          <div className="flex flex-wrap gap-2">
            {HOUR_OPTIONS.map(h => (
              <button
                key={h}
                onClick={() => setHours(h)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                  hours === h
                    ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:border-brand-300"
                }`}
              >
                {h === 24 ? "24h" : `${h}h`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom cron expression */}
      {mode === "custom" && (
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-2">Cron Expression</label>
          <input
            className="input font-mono"
            placeholder="0 8 * * *"
            value={custom}
            onChange={e => setCustom(e.target.value)}
          />
          <p className="text-xs text-slate-400 mt-1.5">
            Format: <code className="bg-slate-100 px-1 rounded">minute  hour  day  month  weekday</code>
          </p>
        </div>
      )}

      {/* Live preview */}
      {mode !== "custom" && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-brand-50 border border-brand-100">
          <Clock size={13} className="text-brand-500 flex-shrink-0" />
          <div>
            <span className="text-xs font-semibold text-brand-800">
              {cronPreview(mode, time, [...days], hours)}
            </span>
            <span className="text-[10px] text-brand-400 ml-2 font-mono">
              ({buildCron(mode, time, [...days], hours)})
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Website Auto-Scrape Toggle ──────────────────────────────────────────── */
function WebsiteToggleRow({ site, onToggle }) {
  const [loading, setLoading] = useState(false);
  const enabled = site.autoScrape !== false;

  const handle = async () => {
    setLoading(true);
    try {
      await onToggle(site.id, !enabled);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${
      enabled ? "bg-brand-50/40 border-brand-100" : "bg-slate-50 border-slate-100"
    }`}>
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={handle}
          disabled={loading}
          className="flex-shrink-0"
        >
          {enabled
            ? <CheckSquare size={16} className="text-brand-600" />
            : <Square size={16} className="text-slate-300" />}
        </button>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-700 truncate">{site.name}</p>
          <p className="text-[10px] text-slate-400 font-mono truncate">{site.url}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
        {site.status === "error" && (
          <span className="text-[10px] font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">error</span>
        )}
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
          enabled ? "bg-brand-100 text-brand-700" : "bg-slate-200 text-slate-500"
        }`}>
          {enabled ? "included" : "excluded"}
        </span>
      </div>
    </div>
  );
}

/* ─── Main Settings Page ──────────────────────────────────────────────────── */
export default function Settings() {
  const [config, setConfig] = useState(null);
  const [saving, setSaving] = useState(false);
  const [websites, setWebsites] = useState([]);

  useEffect(() => {
    settingsAPI.get()
      .then(res => setConfig(res.data))
      .catch(() => toast.error("Failed to load settings"));
    websitesAPI.getAll()
      .then(res => setWebsites(res.data))
      .catch(() => {});
  }, []);

  const handleToggleAutoScrape = async (id, autoScrape) => {
    try {
      await websitesAPI.update(id, { autoScrape });
      setWebsites(prev => prev.map(w => w.id === id ? { ...w, autoScrape } : w));
    } catch {
      toast.error("Failed to update website");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const tid = toast.loading("Saving settings...");
    try {
      const res = await settingsAPI.update(config);
      setConfig(res.data);
      toast.success("Settings saved!", { id: tid });
    } catch {
      toast.error("Failed to save", { id: tid });
    } finally {
      setSaving(false);
    }
  };

  if (!config) {
    return (
      <div className="flex-1 flex flex-col">
        <Navbar title="Settings" subtitle="Configure your scraper" />
        <main className="flex-1 p-8">
          <div className="space-y-5">
            {[1, 2, 3].map(i => <div key={i} className="skeleton h-40 rounded-2xl" />)}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <Navbar title="Settings" subtitle="Configure scraper behavior and schedule" />

      <main className="flex-1 p-8 page-enter">
        <div className="max-w-2xl space-y-5">

          {/* ── Scheduler ───────────────────────────────────────────────── */}
          <Section icon={Clock} title="Auto Scraping Schedule" description="Pick when to automatically scrape all websites">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700">Enable Auto Scraping</p>
                <p className="text-xs text-slate-400 mt-0.5">Runs scraper on the schedule you set below</p>
              </div>
              <Toggle
                checked={config.enabled}
                onChange={v => setConfig(c => ({ ...c, enabled: v }))}
              />
            </div>

            <div className={`transition-opacity duration-200 ${config.enabled ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
              <ScheduleBuilder
                cronExpression={config.cronExpression}
                onChange={cron => setConfig(c => ({ ...c, cronExpression: cron }))}
              />
            </div>

            {config.lastRun && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 text-xs text-slate-600">
                <Clock size={12} />
                Last run:&nbsp;<span className="font-semibold">{new Date(config.lastRun).toLocaleString("en-IN")}</span>
              </div>
            )}
          </Section>

          {/* ── Website Selection ───────────────────────────────────────── */}
          <Section icon={Globe} title="Websites for Auto-Scraping" description="Select which websites are included when auto-scrape runs">
            {websites.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No websites added yet</p>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-slate-500">
                    <span className="font-semibold text-brand-600">{websites.filter(w => w.autoScrape !== false).length}</span>
                    {" "}of{" "}
                    <span className="font-semibold">{websites.length}</span>
                    {" "}websites selected
                  </p>
                  <div className="flex gap-2">
                    <button
                      className="text-xs px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 font-semibold hover:bg-brand-100 transition-colors"
                      onClick={() => websites.forEach(w => handleToggleAutoScrape(w.id, true))}
                    >
                      Select All
                    </button>
                    <button
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200 transition-colors"
                      onClick={() => websites.forEach(w => handleToggleAutoScrape(w.id, false))}
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {websites.map(site => (
                    <WebsiteToggleRow key={site.id} site={site} onToggle={handleToggleAutoScrape} />
                  ))}
                </div>
              </>
            )}
          </Section>

          {/* ── Retry Settings ──────────────────────────────────────────── */}
          <Section icon={RotateCcw} title="Retry Settings" description="Configure how failed requests are handled">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Retry Count</label>
                <input
                  type="number" min={0} max={10} className="input"
                  value={config.retryCount}
                  onChange={e => setConfig(c => ({ ...c, retryCount: parseInt(e.target.value) || 0 }))}
                />
                <p className="text-xs text-slate-400 mt-1">Times to retry on failure</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Retry Delay (ms)</label>
                <input
                  type="number" min={500} max={30000} step={500} className="input"
                  value={config.retryDelay}
                  onChange={e => setConfig(c => ({ ...c, retryDelay: parseInt(e.target.value) || 2000 }))}
                />
                <p className="text-xs text-slate-400 mt-1">Milliseconds between retries</p>
              </div>
            </div>
          </Section>

          {/* ── Storage Info ─────────────────────────────────────────────── */}
          <Section icon={Database} title="Storage" description="Database configuration">
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <div className="flex items-center gap-3">
                <Database size={14} className="text-emerald-600" />
                <div>
                  <p className="text-xs font-semibold text-slate-700">Storage Mode</p>
                  <p className="text-[10px] text-slate-400">MongoDB Atlas (Cloud Database)</p>
                </div>
              </div>
              <span className="badge badge-success">Connected</span>
            </div>
            <p className="text-xs text-slate-500 bg-brand-50 border border-brand-100 rounded-xl px-3 py-2.5">
              All data (jobs, websites, logs) is stored in <code className="font-mono text-brand-700">MongoDB Atlas</code>.
              Duplicate jobs are automatically filtered and date changes are highlighted.
            </p>
          </Section>

          {/* ── Save ─────────────────────────────────────────────────────── */}
          <div className="flex justify-end">
            <button onClick={handleSave} disabled={saving} className="btn-primary px-8 py-3">
              <Save size={15} />
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
