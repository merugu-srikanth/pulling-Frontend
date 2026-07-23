import API from "./api";

export const kanbanAPI = {
  // Users
  getUsers: () => API.get("/kanban/users"),

  // Tasks
  getTasks: (params) => API.get("/tasks", { params }),
  getTaskById: (id) => API.get(`/tasks/${id}`),
  createTask: (data) => API.post("/tasks", data),
  updateTask: (id, data) => API.put(`/tasks/${id}`, data),
  deleteTask: (id, updatedBy) => API.delete(`/tasks/${id}`, { params: { updatedBy } }),
  updateTaskStatus: (id, status, updatedBy) => API.patch(`/tasks/${id}/status`, { status, updatedBy }),
  updateTaskAssignee: (id, assignedTo, updatedBy) => API.patch(`/tasks/${id}/assign`, { assignedTo, updatedBy }),

  // Daily Reports
  createDailyReport: (data) => API.post("/daily-report", data),
  getDailyReports: () => API.get("/daily-report"),
  getDailyReportsByDate: (dateStr) => API.get(`/daily-report/${dateStr}`),

  // Dashboard / Analytics
  getTaskSummary: () => API.get("/dashboard/task-summary"),
};
