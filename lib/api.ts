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

  const resolvedBase =
    path.startsWith("http://") || path.startsWith("https://")
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
      typeof window !== "undefined"
        ? window.localStorage.getItem("token")
        : null;
    const authToken = tokenOverride ?? tokenFromStorage;
    if (authToken && !(headers as Record<string, string>).Authorization) {
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
      error: res.ok ? null : formatErrorMessage(res, data),
      headers: res.headers,
    };

    if (config.apiDebug && !res.ok) {
      console.warn("[callApi] error", res.status, result.error);
    }

    return result;
  } catch (err) {
    clearTimeout(timeoutId);
    const message = formatNetworkError(err);
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

/**
 * Format error message from API response
 */
function formatErrorMessage(res: Response, data: any): string {
  // 1. ลองหา message จาก JSON response ของ backend ก่อน
  if (data && typeof data === "object" && "message" in data && data.message) {
    return String(data.message);
  }

  // 2. ถ้าไม่มี จัดการตาม HTTP Status Code
  const status = res.status;
  const statusText = res.statusText || getStandardStatusText(status);

  switch (status) {
    case 400:
      return `[400] Bad Request: ข้อมูลไม่ถูกต้อง`;
    case 401:
      return `[401] Unauthorized: เซสชันหมดอายุหรือรหัสผ่านไม่ถูกต้อง`;
    case 403:
      return `[403] Forbidden: คุณไม่มีสิทธิ์เข้าถึงส่วนนี้`;
    case 404:
      return `[404] Not Found: ไม่พบข้อมูลที่ต้องการ`;
    case 500:
      return `[500] Internal Server Error: เกิดข้อผิดพลาดที่เซิร์ฟเวอร์`;
    case 502:
      return `[502] Server Error: เซิร์ฟเวอร์ขัดข้องชั่วคราว (Bad Gateway)`;
    case 503:
      return `[503] Service Unavailable: บริการไม่พร้อมใช้งาน`;
    case 504:
      return `[504] Gateway Timeout: การเชื่อมต่อใช้เวลานานเกินไป`;
    default:
      return `ERROR ${status}: ${statusText}`;
  }
}

/**
 * Format network level errors (Fetch failure, Timeout, etc.)
 */
function formatNetworkError(err: unknown): string {
  if (err instanceof Error) {
    if (err.name === "AbortError") {
      return "Request timeout: การเชื่อมต่อใช้เวลานานเกินไป (หมดเวลา)";
    }
    
    const msg = err.message.toLowerCase();
    const isNetworkError = msg.includes("fetch") || msg.includes("network") || msg.includes("load failed");
    
    if (isNetworkError) {
      // ตรวจสอบว่า Browser มีเน็ตไหม (ถ้าทำได้)
      const isOnline = typeof window !== "undefined" ? window.navigator.onLine : true;
      
      if (!isOnline) {
        return "Offline: ไม่มีสัญญาณอินเทอร์เน็ต กรุณาตรวจสอบการเชื่อมต่อของคุณ";
      }
      
      // ถ้ามีเน็ตแต่ fetch พัง มักจะเป็นเพราะ Server ปิดอยู่ (Connection Refused) หรือ CORS พัง
      return "Server Connection Error: ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ (เซิร์ฟเวอร์อาจปิดอยู่ หรือ URL ไม่ถูกต้อง)";
    }
    
    return err.message;
  }
  return "Unknown Error: เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
}

/**
 * Fallback status texts if statusText is empty
 */
function getStandardStatusText(status: number): string {
  const map: Record<number, string> = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    500: "Internal Server Error",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
  };
  return map[status] || "Request failed";
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
