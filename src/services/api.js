import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "https://apiscraping-xi.vercel.app";

const API = axios.create({ baseURL: `${BASE_URL}/api` });

export const statsAPI = {
  get: () => API.get("/stats"),
};

export const jobsAPI = {
  getAll: (params) => API.get("/jobs", { params }),
  getSources: () => API.get("/jobs/sources"),
  delete: (id) => API.delete(`/jobs/${id}`),
  deleteMany: (ids) => API.delete("/jobs/bulk", { data: { ids } }),
  deleteAll: () => API.delete("/jobs/all"),
  exportExcel: (source = "") =>
    API.get("/jobs/export", { params: source ? { source } : {}, responseType: "blob" }).then((res) => {
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `jobs_${source ? source.replace(/[^a-z0-9]/gi, "_") + "_" : ""}${Date.now()}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    }),
  exportAicte: (source = "") =>
    API.get("/jobs/export/aicte", { params: source ? { source } : {}, responseType: "blob" }).then((res) => {
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `aicte_internships_${source ? source.replace(/[^a-z0-9]/gi, "_") + "_" : ""}${Date.now()}.xlsx`;
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
