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

/**
 * Helper เรียก API — รองรับ JSON, timeout, และ error handling
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
    headers: customHeaders = {},
    ...rest
  } = options;

  const base = (path.startsWith("http://") || path.startsWith("https://"))
    ? ""
    : config.apiBaseUrl.replace(/\/$/, "");
  const pathPart = path.replace(/^\//, "");
  const url = base ? `${base}/${pathPart}` : pathPart;
  const fullUrl = `${url}${params ? buildQuery(params) : ""}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...customHeaders,
  };

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
