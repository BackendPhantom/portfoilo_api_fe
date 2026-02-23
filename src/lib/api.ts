/* ============================================
   Devfolio — API Client with JWT Interceptors
   ============================================ */

import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "./token";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

/* ------------------------------------------------
   JWT helpers
   ------------------------------------------------ */

/** Decode JWT payload (no verification — just reads claims). */
function decodeToken(token: string): Record<string, unknown> | null {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

/** True if the token expires within `bufferSec` seconds. */
function isTokenExpired(token: string, bufferSec = 30): boolean {
  const payload = decodeToken(token);
  if (!payload?.exp) return true;
  return Date.now() >= ((payload.exp as number) - bufferSec) * 1000;
}

/* ------------------------------------------------
   Heartbeat-based proactive refresh
   ------------------------------------------------
   A setInterval ticks every HEARTBEAT_MS and checks
   if the access token is expiring within 30 s.
   If so it refreshes.  This is more reliable than
   setTimeout because:
     - survives browser timer throttling in bg tabs
     - self-heals on transient failures (next tick retries)
     - no recursive scheduling — one interval for the session
   ------------------------------------------------ */

const HEARTBEAT_MS = 10_000; // check every 10 seconds
const EXPIRY_BUFFER_SEC = 30; // refresh 30 s before expiry
const MAX_CONSECUTIVE_FAILURES = 3;

let heartbeatId: ReturnType<typeof setInterval> | null = null;
let consecutiveFailures = 0;

async function heartbeatTick() {
  const token = getAccessToken();
  if (!token) return; // no session

  if (!isTokenExpired(token, EXPIRY_BUFFER_SEC)) return; // still fresh

  try {
    await doRefresh();
    consecutiveFailures = 0;
  } catch {
    consecutiveFailures++;
    console.warn(
      `[api] heartbeat refresh failed (${consecutiveFailures}/${MAX_CONSECUTIVE_FAILURES})`
    );
    if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
      console.error("[api] too many refresh failures — logging out");
      expireSession();
    }
  }
}

/** Start the refresh heartbeat. Safe to call multiple times. */
export function startRefreshHeartbeat() {
  stopRefreshHeartbeat();
  consecutiveFailures = 0;
  // console.log(
  //   `[api] refresh heartbeat started (every ${HEARTBEAT_MS / 1000}s)`
  // );
  // Run the first check immediately (token may already be stale)
  heartbeatTick();
  heartbeatId = setInterval(heartbeatTick, HEARTBEAT_MS);
}

/** Stop the refresh heartbeat (call on logout). */
export function stopRefreshHeartbeat() {
  if (heartbeatId !== null) {
    clearInterval(heartbeatId);
    heartbeatId = null;
  }
  consecutiveFailures = 0;
}

/* ------------------------------------------------
   Single-flight token refresh
   ------------------------------------------------
   Concurrent callers all share the same in-flight
   promise so only ONE /token/refresh/ call is made.
   ------------------------------------------------ */
let refreshPromise: Promise<string> | null = null;

function doRefresh(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refresh = getRefreshToken();
    if (!refresh) throw new Error("No refresh token");

    // console.log("[api] refreshing tokens…");
    const { data } = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
      refresh,
    });

    // Backend rotates BOTH tokens on every refresh (single-use JTI)
    const newAccess: string | undefined = data.access;
    const newRefresh: string | undefined = data.refresh;
    if (!newAccess || !newRefresh) {
      throw new Error("Refresh response missing tokens");
    }

    setTokens(newAccess, newRefresh);
    // console.log("[api] tokens refreshed ✓");

    return newAccess;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

/** Redirect to login (clears tokens + heartbeat). */
function expireSession() {
  stopRefreshHeartbeat();
  clearTokens();
  window.location.href = "/login";
}

/* ------------------------------------------------
   Request interceptor — safety net
   ------------------------------------------------
   The timer should handle most refreshes, but if a
   request fires and the token is still expired (e.g.
   timer was throttled), refresh before sending.
   ------------------------------------------------ */
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  // Skip auth header for endpoints that don't need it
  const skip = ["/auth/token/refresh", "/auth/login", "/auth/signup"];
  if (skip.some((p) => config.url?.includes(p))) return config;

  let token = getAccessToken();

  if (token && isTokenExpired(token)) {
    try {
      token = await doRefresh();
    } catch {
      expireSession();
      return Promise.reject(new axios.Cancel("Session expired"));
    }
  }

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* ------------------------------------------------
   Response interceptor — 401 safety net
   ------------------------------------------------ */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Log 403 response body for diagnostics
    if (error.response?.status === 403) {
      console.warn(
        `[api] 403 on ${originalRequest?.url}:`,
        error.response.data
      );
    }

    // Retry on 401 OR 403 (some Django configs return 403 for bad/missing JWT)
    const retryable =
      error.response?.status === 401 || error.response?.status === 403;

    if (
      retryable &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/token/refresh")
    ) {
      originalRequest._retry = true;

      try {
        const newToken = await doRefresh();
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return api(originalRequest);
      } catch {
        expireSession();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// Helper to upload files via multipart/form-data
export function createFormData(data: Record<string, unknown>): FormData {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    if (value instanceof File) {
      formData.append(key, value);
    } else if (Array.isArray(value)) {
      value.forEach((v) => formData.append(key, String(v)));
    } else {
      formData.append(key, String(value));
    }
  });
  return formData;
}

export function uploadConfig() {
  return { headers: { "Content-Type": "application/json" } };
}
