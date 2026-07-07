import axios from "axios";

const API = axios.create({ baseURL: "/api" });

export const statsAPI = {
  get: () => API.get("/stats"),
};

export const jobsAPI = {
  getAll: (params) => API.get("/jobs", { params }),
  delete: (id) => API.delete(`/jobs/${id}`),
  deleteMany: (ids) => API.delete("/jobs/bulk", { data: { ids } }),
  deleteAll: () => API.delete("/jobs/all"),
  exportExcel: () =>
    API.get("/jobs/export", { responseType: "blob" }).then((res) => {
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `jobs_${Date.now()}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    }),
  exportAicte: () =>
    API.get("/jobs/export/aicte", { responseType: "blob" }).then((res) => {
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `aicte_internships_${Date.now()}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    }),
};

export const websitesAPI = {
  getAll: () => API.get("/websites"),
  add: (data) => API.post("/websites", data),
  delete: (id) => API.delete(`/websites/${id}`),
  upload: (file) => {
    const form = new FormData();
    form.append("file", file);
    return API.post("/websites/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  scrapeOne: (id) => API.post(`/scrape/${id}`),
  scrapeAll: () => API.post("/scrape/all"),
};

export const logsAPI = {
  getAll: () => API.get("/logs"),
};

export const settingsAPI = {
  get: () => API.get("/settings"),
  update: (data) => API.put("/settings", data),
};

export default API;
