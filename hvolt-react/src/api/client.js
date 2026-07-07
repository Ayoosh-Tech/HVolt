// Thin fetch wrapper shared by every endpoint module in this folder.
// Centralizing this here means auth headers, error shapes, and the API base
// URL only ever need to be handled in one place.

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function buildQuery(params) {
  if (!params) return "";
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "");
  if (entries.length === 0) return "";
  return `?${new URLSearchParams(entries).toString()}`;
}

/**
 * @param {string} path        e.g. "/reports"
 * @param {object} [options]
 * @param {"GET"|"POST"|"PATCH"|"DELETE"} [options.method]
 * @param {object} [options.body]     JSON body
 * @param {string} [options.token]    JWT to send as a Bearer token
 * @param {object} [options.params]   query-string params
 */
export async function request(path, { method = "GET", body, token, params } = {}) {
  const url = `${API_BASE}${path}${buildQuery(params)}`;
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    const error = new Error("Could not reach the HVolt API. Is the backend running?");
    error.cause = networkErr;
    throw error;
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // No JSON body (e.g. a 204, or a non-JSON error page) — leave data as null.
  }

  if (!res.ok) {
    const error = new Error(data?.message || `Request failed (${res.status})`);
    error.status = res.status;
    error.details = data;
    throw error;
  }

  return data;
}
