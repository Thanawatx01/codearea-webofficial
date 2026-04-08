/**
 * Types สำหรับ API helper
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiRequestOptions extends Omit<RequestInit, "method" | "body"> {
  method?: HttpMethod;
  body?: Record<string, unknown> | FormData | string | null;
  params?: Record<string, string | number | boolean | undefined>;
  timeout?: number;
  useToken?: boolean;
  token?: string;
  /** true = ใช้ NEXT_PUBLIC_AI_URL เป็นฐานแทน NEXT_PUBLIC_API_URL (ค่าเริ่มต้น false) */
  isAI?: boolean;
}

export interface ApiResponse<T = unknown> {
  ok: boolean;
  status: number;
  data: T | null;
  error: string | null;
  headers: Headers;
}
