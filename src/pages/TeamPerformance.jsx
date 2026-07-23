import { useState, useEffect } from "react";
import { Users, TrendingUp, Award, Clock, ArrowUpRight } from "lucide-react";
import { kanbanAPI } from "../services/kanban";
import toast from "react-hot-toast";

export default function TeamPerformance() {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);

  useEffect(() => {
    const loadPerformance = async () => {
      try {
        const [usersRes, tasksRes] = await Promise.all([
          kanbanAPI.getUsers(),
          kanbanAPI.getTasks(),
        ]);

        const allUsers = usersRes.data;
        const allTasks = tasksRes.data;

        setUsers(allUsers);
        setTasks(allTasks);

        // Map tasks to users to calculate metrics
        const performance = allUsers.map((user) => {
          const userTasks = allTasks.filter((t) => t.assignedTo?._id === user._id);
          const completed = userTasks.filter((t) => t.status === "Completed").length;
          const pending = userTasks.filter((t) => t.status === "Pending").length;
          const inProgress = userTasks.filter((t) => t.status === "In Progress").length;
          const total = userTasks.length;

          // Efficiency calculations:
          // A combination of task completions vs total tasks, adjusted if estimate hours are met.
          let efficiency = 100;
          if (total > 0) {
            const completionRate = (completed / total) * 100;
            
            // Check hours ratio for completed tasks
            const completedWithHours = userTasks.filter(t => t.status === "Completed" && t.estimatedHours > 0);
            let hoursRatioSum = 0;
            completedWithHours.forEach(t => {
              // Less actual hours relative to estimate increases efficiency
              const ratio = t.actualHours > 0 ? (t.estimatedHours / t.actualHours) : 1;
              hoursRatioSum += Math.min(Math.max(ratio, 0.5), 1.5); // Cap between 50% and 150%
            });

            const avgHoursPerformance = completedWithHours.length > 0 ? (hoursRatioSum / completedWithHours.length) * 100 : 100;
            efficiency = Math.round((completionRate * 0.7) + (avgHoursPerformance * 0.3));
          } else {
            efficiency = 100; // default for no tasks
          }

          return {
            ...user,
            completed,
            pending,
            inProgress,
            total,
            efficiency: Math.min(efficiency, 100), // Cap at 100%
          };
        });

        setPerformanceData(performance);
      } catch (err) {
        console.error(err);
        toast.error("Failed to compile team performance metrics");
      }
    };

    loadPerformance();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-sans">Team View</h1>
          <p className="text-sm text-slate-500 font-medium font-sans">
            Review work metrics, completion status, and member efficiency.
          </p>
        </div>
      </div>

      {/* Grid of Team Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {performanceData.map((member) => (
          <div key={member._id} className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs font-sans space-y-4">
            {/* Header info */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm uppercase">
                  {member.name.slice(0, 2)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">{member.name}</h3>
                  <p className="text-xs text-slate-450 font-semibold">{member.role}</p>
                </div>
              </div>
              
              {/* Efficiency circle badge */}
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Efficiency</span>
                <span className="text-lg font-extrabold text-indigo-600">{member.efficiency}%</span>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-xl p-3 text-center">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Completed</span>
                <p className="text-xl font-bold text-emerald-700 mt-1">{member.completed}</p>
              </div>

              <div className="bg-amber-50/50 border border-amber-100/50 rounded-xl p-3 text-center">
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Pending</span>
                <p className="text-xl font-bold text-amber-700 mt-1">{member.pending}</p>
              </div>

              <div className="bg-blue-50/50 border border-blue-100/50 rounded-xl p-3 text-center">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">In Progress</span>
                <p className="text-xl font-bold text-blue-700 mt-1">{member.inProgress}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Task Completion Progress</span>
                <span>{member.total > 0 ? Math.round((member.completed / member.total) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${member.total > 0 ? (member.completed / member.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
