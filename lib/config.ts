/**
 * App config — ใช้ค่าจาก .env / .env.local
 * NEXT_PUBLIC_* ใช้ได้ทั้ง client และ server
 */
export const config = {
  /** Base URL ของ API (ใส่ใน .env.local เป็น NEXT_PUBLIC_API_URL) */
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL ?? "",

  /** Base URL ของบริการ AI — ใช้เมื่อ callApi(..., { isAI: true }) ถ้าไม่ตั้งจะ fallback เป็น apiBaseUrl */
  aiApiBaseUrl: process.env.NEXT_PUBLIC_AI_URL ?? "",

  /** Request timeout (ms) */
  apiTimeout: 30_000,

  /** เปิด debug log ของ API helper */
  apiDebug: process.env.NODE_ENV === "development",
} as const;

export type AppConfig = typeof config;
