// src/services/api.js
import axios from "axios";

const url = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: url,
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
});

// Unwrap .data; surface clean error messages
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const data = err.response?.data;
    const message =
      data?.errors?.[0]?.msg ||
      data?.message ||
      err.message ||
      "Unexpected error";
    return Promise.reject(new Error(message));
  }
);

export const bookmarksAPI = {
  getAll: (params = {}) => api.get("/bookmarks", { params }),
  getOne: (id) => api.get(`/bookmarks/${id}`),
  create: (data) => api.post("/bookmarks", data),
  update: (id, data) => api.put(`/bookmarks/${id}`, data),
  remove: (id) => api.delete(`/bookmarks/${id}`),
  fetchTitle: (url) => api.get("/bookmarks/fetch-title", { params: { url } }),
};

export default api;