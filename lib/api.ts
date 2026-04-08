import { config } from "@/lib/config";
import type { ApiRequestOptions, ApiResponse, HttpMethod } from "@/lib/api.types";

/**
 * สร้าง query string จาก params
 */
function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  }
  const q = search.toString();
  return q ? `?${q}` : "";
}

/** ถ้า env ใส่แค่ host:port ไม่มี http(s) — fetch จะถือเป็น path relative ผิดพลาด */
function normalizeApiOrigin(raw: string): string {
  const s = raw.trim().replace(/\/+$/, "");
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  return `http://${s}`;
}

function resolvedApiBase(isAI: boolean): string {
  const main = normalizeApiOrigin(config.apiBaseUrl);
  if (!isAI) return main;
  const ai = normalizeApiOrigin(config.aiApiBaseUrl);
  return ai || main;
}

/** URL เต็มสำหรับ fetch แบบ stream หรือกรณีที่ไม่ผ่าน callApi */
export function buildApiUrl(path: string, options?: { isAI?: boolean }): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = resolvedApiBase(options?.isAI ?? false);
  const pathPart = path.replace(/^\//, "");
  return base ? `${base}/${pathPart}` : pathPart;
}

/**
 * Helper เรียก API — รองรับ JSON, timeout, และ error handling
 *
 * `isAI: true` → ฐานจาก `NEXT_PUBLIC_AI_URL` (ไม่มีจะใช้ `NEXT_PUBLIC_API_URL`)
 *
 * @example
 * const res = await callApi<{ id: number }>('/questions/1');
 * if (res.ok) console.log(res.data);
 * else console.error(res.error);
 */
export async function callApi<T = unknown>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    method = "GET",
    body,
    params,
    timeout = config.apiTimeout,
    useToken = false,
    token: tokenOverride,
    isAI = false,
    headers: customHeaders = {},
    ...rest
  } = options;

  const resolvedBase = path.startsWith("http://") || path.startsWith("https://")
    ? ""
    : resolvedApiBase(isAI);

  const base = resolvedBase;
  const pathPart = path.replace(/^\//, "");
  const url = base ? `${base}/${pathPart}` : pathPart;
  const fullUrl = `${url}${params ? buildQuery(params) : ""}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...customHeaders,
  };

  if (useToken) {
    const tokenFromStorage =
      typeof window !== "undefined" ? window.localStorage.getItem("token") : null;
    const authToken = tokenOverride ?? tokenFromStorage;
    if (
      authToken &&
      !(headers as Record<string, string>).Authorization
    ) {
      (headers as Record<string, string>).Authorization = `Bearer ${authToken}`;
    }
  }

  if (body instanceof FormData) {
    delete (headers as Record<string, string>)["Content-Type"];
  }

  let bodyPayload: string | FormData | undefined;
  if (body != null && !(body instanceof FormData)) {
    bodyPayload = typeof body === "string" ? body : JSON.stringify(body);
  } else if (body instanceof FormData) {
    bodyPayload = body;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  if (config.apiDebug) {
    console.log("[callApi]", method, fullUrl, bodyPayload ?? "(no body)");
  }

  try {
    const res = await fetch(fullUrl, {
      method: method as HttpMethod,
      headers,
      body: bodyPayload,
      signal: controller.signal,
      ...rest,
    });
    clearTimeout(timeoutId);

    let data: T | null = null;
    const text = await res.text();
    if (text) {
      try {
        data = JSON.parse(text) as T;
      } catch {
        data = text as unknown as T;
      }
    }

    const result: ApiResponse<T> = {
      ok: res.ok,
      status: res.status,
      data,
      error: res.ok ? null : (data && typeof data === "object" && "message" in data ? String((data as { message: string }).message) : res.statusText) || "Request failed",
      headers: res.headers,
    };

    if (config.apiDebug && !res.ok) {
      console.warn("[callApi] error", res.status, result.error);
    }

    return result;
  } catch (err) {
    clearTimeout(timeoutId);
    const message = err instanceof Error ? err.message : "Network error";
    if (config.apiDebug) {
      console.warn("[callApi] exception", message);
    }
    return {
      ok: false,
      status: 0,
      data: null,
      error: message,
      headers: new Headers(),
    };
  }
}

/** Shortcuts */
export const api = {
  get: <T = unknown>(path: string, options?: Omit<ApiRequestOptions, "method" | "body">) =>
    callApi<T>(path, { ...options, method: "GET" }),
  post: <T = unknown>(path: string, body?: ApiRequestOptions["body"], options?: Omit<ApiRequestOptions, "method" | "body">) =>
    callApi<T>(path, { ...options, method: "POST", body }),
  put: <T = unknown>(path: string, body?: ApiRequestOptions["body"], options?: Omit<ApiRequestOptions, "method" | "body">) =>
    callApi<T>(path, { ...options, method: "PUT", body }),
  patch: <T = unknown>(path: string, body?: ApiRequestOptions["body"], options?: Omit<ApiRequestOptions, "method" | "body">) =>
    callApi<T>(path, { ...options, method: "PATCH", body }),
  delete: <T = unknown>(path: string, options?: Omit<ApiRequestOptions, "method" | "body">) =>
    callApi<T>(path, { ...options, method: "DELETE" }),
};
