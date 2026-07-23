import { useState, useEffect } from "react";
import { CheckSquare, Clock, Calendar, CheckCircle2, ChevronRight } from "lucide-react";
import { kanbanAPI } from "../services/kanban";
import TaskDetailsModal from "../components/TaskDetailsModal";
import toast from "react-hot-toast";

const STATUS_SECTIONS = [
  { id: "Todo", name: "To Do", border: "border-slate-200", text: "text-slate-700", bg: "bg-slate-50" },
  { id: "In Progress", name: "In Progress", border: "border-blue-200", text: "text-blue-700", bg: "bg-blue-50/30" },
  { id: "Review", name: "In Review", border: "border-purple-200", text: "text-purple-700", bg: "bg-purple-50/30" },
  { id: "Completed", name: "Completed", border: "border-emerald-200", text: "text-emerald-700", bg: "bg-emerald-50/30" },
  { id: "Pending", name: "Pending / Blocked", border: "border-amber-200", text: "text-amber-700", bg: "bg-amber-50/30" },
  { id: "Cancelled", name: "Cancelled", border: "border-rose-200", text: "text-rose-700", bg: "bg-rose-50/30" },
];

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getActiveUser = () => {
    const stored = localStorage.getItem("activeUser");
    return stored ? JSON.parse(stored) : null;
  };

  const fetchMyTasks = async () => {
    const user = getActiveUser();
    if (!user) return;

    try {
      const [tasksRes, usersRes] = await Promise.all([
        kanbanAPI.getTasks({ assignedTo: user._id }),
        kanbanAPI.getUsers(),
      ]);
      setTasks(tasksRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load your tasks");
    }
  };

  useEffect(() => {
    setActiveUser(getActiveUser());
    fetchMyTasks();

    const handleUserChange = () => {
      setActiveUser(getActiveUser());
    };
    window.addEventListener("activeUserChanged", handleUserChange);
    return () => window.removeEventListener("activeUserChanged", handleUserChange);
  }, []);

  // Fetch tasks again when active user changes
  useEffect(() => {
    if (activeUser) {
      fetchMyTasks();
    }
  }, [activeUser]);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
          <CheckSquare className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-sans">My Tasks</h1>
          <p className="text-sm text-slate-500 font-medium font-sans">
            Personal workbench for <span className="font-semibold text-indigo-600">{activeUser?.name || "Member"}</span>.
          </p>
        </div>
      </div>

      {/* Tasks grouped by Status */}
      <div className="space-y-4">
        {STATUS_SECTIONS.map((sec) => {
          const secTasks = tasks.filter((t) => t.status === sec.id);
          return (
            <div key={sec.id} className={`bg-white border ${sec.border} rounded-2xl overflow-hidden shadow-xs`}>
              <div className={`px-4 py-3 flex items-center justify-between border-b ${sec.border} ${sec.bg}`}>
                <span className={`text-sm font-bold font-sans ${sec.text}`}>{sec.name}</span>
                <span className="text-xs font-bold px-2 py-0.5 bg-white border border-slate-200 rounded-full text-slate-500">
                  {secTasks.length}
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {secTasks.length === 0 ? (
                  <div className="p-4 text-xs text-slate-400 font-sans text-center">
                    No tasks in this stage.
                  </div>
                ) : (
                  secTasks.map((t) => (
                    <div
                      key={t._id}
                      onClick={() => {
                        setSelectedTask(t);
                        setIsModalOpen(true);
                      }}
                      className="p-4 hover:bg-slate-50 transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans"
                    >
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-slate-800 hover:text-indigo-600 transition">
                          {t.title}
                        </h3>
                        {t.description && (
                          <p className="text-xs text-slate-400 line-clamp-1">
                            {t.description}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        {t.dueDate && (
                          <span className="inline-flex items-center gap-1 font-bold text-slate-400">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(t.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 font-bold text-slate-400">
                          <Clock className="w-3.5 h-3.5" />
                          {t.estimatedHours} hrs est.
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          t.priority === "Critical" ? "bg-rose-100 text-rose-700 animate-pulse" :
                          t.priority === "High" ? "bg-orange-100 text-orange-700" :
                          t.priority === "Medium" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"
                        }`}>
                          {t.priority}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-350 ml-2 hidden md:block" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <TaskDetailsModal
        isOpen={isModalOpen}
        task={selectedTask}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
        }}
        onSave={fetchMyTasks}
        users={users}
      />
    </div>
  );
}
