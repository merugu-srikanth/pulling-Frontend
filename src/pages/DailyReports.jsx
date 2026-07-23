import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { ClipboardList, Send, Calendar as CalendarIcon, User, AlertCircle, Sparkles } from "lucide-react";
import { kanbanAPI } from "../services/kanban";
import toast from "react-hot-toast";

export default function DailyReports() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [reports, setReports] = useState([]);
  const [activeUser, setActiveUser] = useState(null);

  // Form State
  const [completedTasks, setCompletedTasks] = useState("");
  const [pendingTasks, setPendingTasks] = useState("");
  const [remarks, setRemarks] = useState("");
  const [blockers, setBlockers] = useState("");
  const [tomorrowPlan, setTomorrowPlan] = useState("");

  const getActiveUser = () => {
    const stored = localStorage.getItem("activeUser");
    return stored ? JSON.parse(stored) : null;
  };

  const fetchReportsForDate = async (date) => {
    try {
      const dateStr = date.toISOString().split("T")[0];
      const res = await kanbanAPI.getDailyReportsByDate(dateStr);
      setReports(res.data);

      // If active user has a report for this date, populate form
      const user = getActiveUser();
      if (user) {
        const userReport = res.data.find((r) => r.userId?._id === user._id);
        if (userReport) {
          setCompletedTasks(userReport.completedTasks);
          setPendingTasks(userReport.pendingTasks);
          setRemarks(userReport.remarks);
          setBlockers(userReport.blockers);
          setTomorrowPlan(userReport.tomorrowPlan);
        } else {
          setCompletedTasks("");
          setPendingTasks("");
          setRemarks("");
          setBlockers("");
          setTomorrowPlan("");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load reports for date");
    }
  };

  useEffect(() => {
    setActiveUser(getActiveUser());
    fetchReportsForDate(selectedDate);

    const handleUserChange = () => {
      setActiveUser(getActiveUser());
    };
    window.addEventListener("activeUserChanged", handleUserChange);
    return () => window.removeEventListener("activeUserChanged", handleUserChange);
  }, [selectedDate]);

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!activeUser) {
      toast.error("Please select an active profile in the sidebar");
      return;
    }

    try {
      const dateStr = selectedDate.toISOString().split("T")[0];
      await kanbanAPI.createDailyReport({
        userId: activeUser._id,
        date: dateStr,
        completedTasks,
        pendingTasks,
        remarks,
        blockers,
        tomorrowPlan,
      });
      toast.success("Daily report submitted successfully");
      fetchReportsForDate(selectedDate);
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit daily report");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
          <ClipboardList className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-sans">Daily Reports</h1>
          <p className="text-sm text-slate-500 font-medium font-sans">
            Log your daily standup details and review teammate updates.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Calendar & Submission Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Form */}
          <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-xs">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2 font-sans">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Log Standup for {selectedDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h2>

            <form onSubmit={handleSubmitReport} className="space-y-4 font-sans">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Today's Completed Tasks
                </label>
                <textarea
                  required
                  placeholder="- Finished Task 1&#10;- Refactored database module"
                  rows={2}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition resize-none"
                  value={completedTasks}
                  onChange={(e) => setCompletedTasks(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Today's Pending Tasks
                </label>
                <textarea
                  placeholder="- Task 2 status is in review"
                  rows={2}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition resize-none"
                  value={pendingTasks}
                  onChange={(e) => setPendingTasks(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Tomorrow's Plan
                </label>
                <textarea
                  required
                  placeholder="- Start Task 3 implementation&#10;- Call with design team"
                  rows={2}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition resize-none"
                  value={tomorrowPlan}
                  onChange={(e) => setTomorrowPlan(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Blockers / Impediments
                  </label>
                  <input
                    type="text"
                    placeholder="None / Waiting on API deployment..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
                    value={blockers}
                    onChange={(e) => setBlockers(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Remarks
                  </label>
                  <input
                    type="text"
                    placeholder="E.g., productive day!"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition shadow-md shadow-indigo-100"
                >
                  <Send className="w-4 h-4" />
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right column: Interactive calendar and team logs */}
        <div className="space-y-6">
          {/* Calendar Box */}
          <div className="bg-white border border-slate-150 rounded-2xl p-4 shadow-xs">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5 font-sans">
              <CalendarIcon className="w-4 h-4 text-slate-400" />
              Select Date
            </h2>
            <div className="flex justify-center border rounded-xl overflow-hidden p-2 bg-slate-50 border-slate-150">
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                className="border-0 bg-transparent w-full text-sm font-sans"
              />
            </div>
          </div>

          {/* Team Logs */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">
              Team Logs ({reports.length})
            </h3>
            {reports.length === 0 ? (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-400 font-sans">
                No reports submitted for this date.
              </div>
            ) : (
              reports.map((rep) => (
                <div key={rep._id} className="bg-white border border-slate-150 rounded-2xl p-4 shadow-xs space-y-3 font-sans">
                  <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs uppercase">
                      {rep.userId?.name.slice(0, 2) || "??"}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{rep.userId?.name || "Unknown Member"}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{rep.userId?.role || "Developer"}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-bold text-slate-500 uppercase tracking-wider text-[9px] block">Completed</span>
                      <p className="text-slate-700 mt-0.5 whitespace-pre-line">{rep.completedTasks}</p>
                    </div>

                    {rep.pendingTasks && (
                      <div>
                        <span className="font-bold text-slate-500 uppercase tracking-wider text-[9px] block">Pending</span>
                        <p className="text-slate-700 mt-0.5 whitespace-pre-line">{rep.pendingTasks}</p>
                      </div>
                    )}

                    <div>
                      <span className="font-bold text-slate-500 uppercase tracking-wider text-[9px] block">Tomorrow's Plan</span>
                      <p className="text-slate-700 mt-0.5 whitespace-pre-line">{rep.tomorrowPlan}</p>
                    </div>

                    {rep.blockers && (
                      <div className="bg-rose-50 border border-rose-100 rounded-xl p-2.5 flex items-start gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-rose-800 uppercase tracking-wider text-[9px] block">Blocker</span>
                          <p className="text-rose-700 mt-0.5">{rep.blockers}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
