/**
 * App config — ใช้ค่าจาก .env / .env.local
 * NEXT_PUBLIC_* ใช้ได้ทั้ง client และ server
 */
export const config = {
  /** Base URL ของ API (ใส่ใน .env.local เป็น NEXT_PUBLIC_API_URL) */
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL ?? "",

  /** Request timeout (ms) */
  apiTimeout: 30_000,

  /** เปิด debug log ของ API helper */
  apiDebug: process.env.NODE_ENV === "development",
} as const;

export type AppConfig = typeof config;
