/**
 * Types สำหรับ API helper
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiRequestOptions extends Omit<RequestInit, "method" | "body"> {
  method?: HttpMethod;
  body?: Record<string, unknown> | FormData | string | null;
  params?: Record<string, string | number | boolean | undefined>;
  timeout?: number;
}

export interface ApiResponse<T = unknown> {
  ok: boolean;
  status: number;
  data: T | null;
  error: string | null;
  headers: Headers;
}
