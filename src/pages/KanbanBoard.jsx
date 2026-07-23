import { useState, useEffect } from "react";
import { Plus, Search, Calendar, User, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { kanbanAPI } from "../services/kanban";
import TaskDetailsModal from "../components/TaskDetailsModal";
import toast from "react-hot-toast";

const COLUMNS = [
  { id: "Todo",        name: "Todo",        color: "bg-slate-100 border-slate-200 text-slate-700 font-bold", dot: "bg-slate-400" },
  { id: "In Progress", name: "In Progress", color: "bg-blue-50 border-blue-100 text-blue-700 font-bold", dot: "bg-blue-500" },
  { id: "Review",      name: "Review",      color: "bg-purple-50 border-purple-100 text-purple-700 font-bold", dot: "bg-purple-500" },
  { id: "Completed",   name: "Completed",   color: "bg-emerald-50 border-emerald-100 text-emerald-700 font-bold", dot: "bg-emerald-500" },
  { id: "Pending",     name: "Pending",     color: "bg-amber-50 border-amber-100 text-amber-700 font-bold", dot: "bg-amber-500" },
  { id: "Cancelled",   name: "Cancelled",   color: "bg-rose-50 border-rose-100 text-rose-700 font-bold", dot: "bg-rose-500" },
];

const PRIORITY_BADGES = {
  Low: "bg-slate-100 text-slate-700",
  Medium: "bg-blue-100 text-blue-700",
  High: "bg-orange-100 text-orange-700",
  Critical: "bg-rose-100 text-rose-700 animate-pulse",
};

export default function KanbanBoard() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filterUser, setFilterUser] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeUser, setActiveUser] = useState(null);

  const fetchBoardData = async () => {
    try {
      const [tasksRes, usersRes] = await Promise.all([
        kanbanAPI.getTasks(),
        kanbanAPI.getUsers(),
      ]);
      setTasks(tasksRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load Kanban board data");
    }
  };

  const getActiveUser = () => {
    const stored = localStorage.getItem("activeUser");
    return stored ? JSON.parse(stored) : null;
  };

  useEffect(() => {
    fetchBoardData();
    setActiveUser(getActiveUser());

    const handleUserChange = () => {
      setActiveUser(getActiveUser());
    };
    window.addEventListener("activeUserChanged", handleUserChange);
    return () => window.removeEventListener("activeUserChanged", handleUserChange);
  }, []);

  // Drag & Drop Handlers
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, columnId) => {
    const taskId = e.dataTransfer.getData("taskId");
    if (!taskId) return;

    try {
      const updatedBy = activeUser?._id;
      // Optimistic Update
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: columnId } : t))
      );

      await kanbanAPI.updateTaskStatus(taskId, columnId, updatedBy);
      toast.success(`Task moved to ${columnId}`);
      fetchBoardData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update task status");
      fetchBoardData(); // Rollback
    }
  };

  // Filters
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    const matchesUser = filterUser ? t.assignedTo?._id === filterUser : true;
    const matchesPriority = filterPriority ? t.priority === filterPriority : true;
    return matchesSearch && matchesUser && matchesPriority;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-sans">Kanban Board</h1>
          <p className="text-sm text-slate-500 font-medium font-sans">
            Drag and drop cards to update status and manage task progress.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedTask(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition shadow-md shadow-indigo-100 w-fit"
        >
          <Plus className="w-4 h-4" />
          Create Task
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search tasks..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition font-sans text-slate-800"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-3" />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* User Filter */}
          <div className="relative flex-1 md:flex-initial">
            <select
              className="w-full pl-9 pr-6 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-indigo-500 transition cursor-pointer appearance-none font-sans font-semibold"
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
            >
              <option value="">All Members</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </select>
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
          </div>

          {/* Priority Filter */}
          <div className="relative flex-1 md:flex-initial">
            <select
              className="w-full pl-9 pr-6 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-indigo-500 transition cursor-pointer appearance-none font-sans font-semibold"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
            <SlidersHorizontal className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Board Scroll */}
      <div className="overflow-x-auto pb-4 scrollbar-thin">
        <div className="flex gap-4 min-w-[1200px] h-[calc(100vh-280px)]">
          {COLUMNS.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
                className="flex-1 bg-slate-50/50 border border-slate-100 rounded-2xl flex flex-col max-h-full overflow-hidden p-3"
              >
                {/* Column Header */}
                <div className={`flex items-center justify-between px-3 py-2 rounded-xl mb-3 border ${col.color}`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                    <span className="text-xs uppercase tracking-wider font-bold font-sans">{col.name}</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 bg-white/80 border border-slate-200/50 rounded-full font-bold">
                    {colTasks.length}
                  </span>
                </div>

                {/* Card Container */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5 scrollbar-thin">
                  {colTasks.length === 0 ? (
                    <div className="h-28 border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-400 font-sans">
                      Drop tasks here
                    </div>
                  ) : (
                    colTasks.map((t) => (
                      <div
                        key={t._id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, t._id)}
                        onClick={() => {
                          setSelectedTask(t);
                          setIsModalOpen(true);
                        }}
                        className="bg-white border border-slate-150 rounded-xl p-3.5 shadow-xs hover:shadow-md hover:border-slate-250 transition cursor-grab active:cursor-grabbing group relative"
                      >
                        {/* Task Priority & Details */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-sans ${PRIORITY_BADGES[t.priority]}`}>
                            {t.priority}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold font-sans">
                            Est: {t.estimatedHours}h
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-xs font-bold text-slate-800 leading-snug font-sans group-hover:text-indigo-600 transition mb-1">
                          {t.title}
                        </h3>

                        {/* Description snippet */}
                        {t.description && (
                          <p className="text-[11px] text-slate-400 font-medium font-sans line-clamp-2 mb-3">
                            {t.description}
                          </p>
                        )}

                        {/* Card Footer */}
                        <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
                          {t.dueDate ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 font-sans">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {new Date(t.dueDate).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-300 font-bold font-sans">No due date</span>
                          )}

                          <div
                            className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 uppercase border border-white shadow-xs"
                            title={t.assignedTo ? t.assignedTo.name : "Unassigned"}
                          >
                            {t.assignedTo ? t.assignedTo.name.slice(0, 2) : "--"}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Modal */}
      <TaskDetailsModal
        isOpen={isModalOpen}
        task={selectedTask}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
        }}
        onSave={fetchBoardData}
        users={users}
      />
    </div>
  );
}
