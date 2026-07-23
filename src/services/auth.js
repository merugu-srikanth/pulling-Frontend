import API from "./api";

export const authAPI = {
  login: (email, password) => API.post("/auth/login", { email, password }),
  me: () => API.get("/auth/me"),
  getAdmins: () => API.get("/auth/admins"),
  createAdmin: (data) => API.post("/auth/create-admin", data),
  updateAdmin: (id, data) => API.put(`/auth/admins/${id}`, data),
  deleteAdmin: (id) => API.delete(`/auth/admins/${id}`),
};
