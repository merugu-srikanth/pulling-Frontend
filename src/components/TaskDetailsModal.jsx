import { useState, useEffect } from "react";
import { X, Calendar as CalendarIcon, User, Plus, Trash2, Clock, FileText } from "lucide-react";
import { kanbanAPI } from "../services/kanban";
import toast from "react-hot-toast";

export default function TaskDetailsModal({ task: initialTask, isOpen, onClose, onSave, users }) {
  const [task, setTask] = useState({
    title: "",
    description: "",
    priority: "Medium",
    assignedTo: "",
    dueDate: "",
    estimatedHours: 0,
    actualHours: 0,
    remarks: "",
    tags: [],
  });

  const [activities, setActivities] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [activeTab, setActiveTab] = useState("details"); // details | activity

  useEffect(() => {
    if (initialTask) {
      kanbanAPI.getTaskById(initialTask._id).then((res) => {
        const t = res.data.task;
        setTask({
          ...t,
          assignedTo: t.assignedTo?._id || t.assignedTo || "",
          dueDate: t.dueDate ? new Date(t.dueDate).toISOString().split("T")[0] : "",
        });
        setActivities(res.data.activities || []);
      }).catch(err => {
        console.error(err);
        toast.error("Failed to load task details");
      });
    } else {
      setTask({
        title: "",
        description: "",
        priority: "Medium",
        assignedTo: "",
        dueDate: "",
        estimatedHours: 0,
        actualHours: 0,
        remarks: "",
        tags: [],
      });
      setActivities([]);
    }
  }, [initialTask, isOpen]);

  if (!isOpen) return null;

  const getActiveUser = () => {
    const stored = localStorage.getItem("activeUser");
    return stored ? JSON.parse(stored) : null;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!task.title.trim()) {
      toast.error("Task title is required");
      return;
    }

    const activeUser = getActiveUser();
    const payload = {
      ...task,
      updatedBy: activeUser?._id,
      assignedBy: initialTask ? task.assignedBy : activeUser?._id,
    };

    try {
      if (initialTask) {
        await kanbanAPI.updateTask(initialTask._id, payload);
        toast.success("Task updated successfully");
      } else {
        await kanbanAPI.createTask(payload);
        toast.success("Task created successfully");
      }
      onSave();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save task");
    }
  };

  const handleDelete = async () => {
    if (!initialTask) return;
    if (window.confirm("Are you sure you want to delete this task?")) {
      const activeUser = getActiveUser();
      try {
        await kanbanAPI.deleteTask(initialTask._id, activeUser?._id);
        toast.success("Task deleted");
        onSave();
        onClose();
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete task");
      }
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !task.tags.includes(newTag.trim())) {
      setTask({ ...task, tags: [...task.tags, newTag.trim()] });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTask({ ...task, tags: task.tags.filter(t => t !== tagToRemove) });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">
            {initialTask ? "Task Details" : "Create New Task"}
          </h2>
          <div className="flex items-center gap-2">
            {initialTask && (
              <button
                type="button"
                onClick={handleDelete}
                className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition"
                title="Delete Task"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        {initialTask && (
          <div className="flex px-6 border-b border-slate-100">
            <button
              onClick={() => setActiveTab("details")}
              className={`py-3 px-4 text-sm font-semibold border-b-2 transition ${
                activeTab === "details"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab("activity")}
              className={`py-3 px-4 text-sm font-semibold border-b-2 transition ${
                activeTab === "activity"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Activity Timeline
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "details" ? (
            <form onSubmit={handleSave} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="Task title..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
                  value={task.title}
                  onChange={(e) => setTask({ ...task, title: e.target.value })}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Describe the task details..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition resize-none"
                  value={task.description}
                  onChange={(e) => setTask({ ...task, description: e.target.value })}
                />
              </div>

              {/* Meta row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Priority */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Priority
                  </label>
                  <select
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500 transition"
                    value={task.priority}
                    onChange={(e) => setTask({ ...task, priority: e.target.value })}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                {/* Assigned To */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Assigned To
                  </label>
                  <select
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500 transition"
                    value={task.assignedTo}
                    onChange={(e) => setTask({ ...task, assignedTo: e.target.value })}
                  >
                    <option value="">Unassigned</option>
                    {users.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Meta row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Due Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Due Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500 transition"
                      value={task.dueDate}
                      onChange={(e) => setTask({ ...task, dueDate: e.target.value })}
                    />
                    <CalendarIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                  </div>
                </div>

                {/* Estimated Hours */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Est. Hours
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500 transition"
                      value={task.estimatedHours}
                      onChange={(e) => setTask({ ...task, estimatedHours: Number(e.target.value) })}
                    />
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                  </div>
                </div>

                {/* Actual Hours */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Actual Hours
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500 transition"
                      value={task.actualHours}
                      onChange={(e) => setTask({ ...task, actualHours: Number(e.target.value) })}
                    />
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Remarks / Notes
                </label>
                <input
                  type="text"
                  placeholder="Any final remarks..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
                  value={task.remarks}
                  onChange={(e) => setTask({ ...task, remarks: e.target.value })}
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {task.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-600"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="hover:text-rose-600 transition"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a tag..."
                    className="flex-1 px-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-sm rounded-xl transition flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition shadow-sm"
                >
                  {initialTask ? "Save Changes" : "Create Task"}
                </button>
              </div>
            </form>
          ) : (
            // Activity Timeline Tab
            <div className="space-y-4">
              {activities.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8 font-sans">No activity logged for this task yet.</p>
              ) : (
                <div className="relative border-l border-slate-200 ml-4 pl-6 space-y-5 py-2">
                  {activities.map((act) => (
                    <div key={act._id} className="relative">
                      {/* Circle indicator */}
                      <span className="absolute -left-[31px] top-1 bg-white border border-slate-300 w-4 h-4 rounded-full flex items-center justify-center">
                        <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-700 font-sans">
                            {act.updatedBy ? act.updatedBy.name : "System"}
                          </span>
                          <span className="text-[10px] text-slate-400 font-sans">
                            {new Date(act.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-800 font-medium font-sans mt-0.5">
                          {act.action}
                        </p>
                        {act.newValue && (
                          <div className="mt-1 text-xs text-slate-500 bg-slate-50 rounded-lg p-2 border border-slate-150 font-sans">
                            {act.previousValue ? (
                              <span className="line-through text-rose-500 mr-2">{act.previousValue}</span>
                            ) : null}
                            <span className="text-emerald-600 font-semibold">{act.newValue}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
