import { request } from "./client.js";

// Mirrors hvolt-backend-v2/src/routes/authRoutes.js
export const authApi = {
  register: (name, email, password) => request("/auth/register", { method: "POST", body: { name, email, password } }),
  login: (email, password) => request("/auth/login", { method: "POST", body: { email, password } }),
  forgotPassword: (email) => request("/auth/forgot-password", { method: "POST", body: { email } }),
  resetPassword: (token, password) => request("/auth/reset-password", { method: "POST", body: { token, password } }),
  me: (token) => request("/auth/me", { token }),
};

// Mirrors .../routes/neighborhoodRoutes.js
export const neighborhoodsApi = {
  list: (params) => request("/neighborhoods", { params }),
};

// Mirrors .../routes/reportRoutes.js
export const reportsApi = {
  list: (params) => request("/reports", { params }),
  create: (payload, token) => request("/reports", { method: "POST", body: payload, token }),
  confirm: (id, token) => request(`/reports/${id}/confirm`, { method: "POST", token }),
  flag: (id, reason, token) => request(`/reports/${id}/flag`, { method: "POST", body: { reason }, token }),
  withdraw: (id, token) => request(`/reports/${id}/withdraw`, { method: "PATCH", token }),
};

// Mirrors .../routes/adminRoutes.js — every call here requires an admin token.
export const adminApi = {
  listReports: (token, params) => request("/admin/reports", { token, params }),
  updateReportStatus: (id, status, token) => request(`/admin/reports/${id}`, { method: "PATCH", body: { status }, token }),
  removeReport: (id, token) => request(`/admin/reports/${id}`, { method: "DELETE", token }),
  listUsers: (token) => request("/admin/users", { token }),
  updateUser: (id, updates, token) => request(`/admin/users/${id}`, { method: "PATCH", body: updates, token }),
  analytics: (token) => request("/admin/analytics", { token }),
};
