import { api } from "./api";

/**
 * Clear all authentication-related data from the browser.
 * For maximum security, we clear both localStorage and sessionStorage,
 * and remove auth cookies.
 */
export function clearAuthSession() {
  if (typeof window === "undefined") return;

  // 1. Clear Local Storage (Targeted)
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  // Optionally clear everything for maximum security if requested
  // localStorage.clear();
  
  // 2. Clear Session Storage
  sessionStorage.clear();

  // 3. Clear Cookies
  const cookiesToClear = ["token", "role_id", "display_name"];
  for (const cookieName of cookiesToClear) {
    document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax`;
  }
}

/**
 * Perform a full logout: Notify backend, clear local data.
 */
export async function performLogout() {
  try {
    // Notify backend to invalidate session if server-side tracking exists
    // We use a timeout to ensure the UI doesn't hang if the network is sluggish
    await api.post("/auth/logout", {}, { useToken: true, timeout: 5000 });
  } catch (err) {
    console.warn("[AuthUtils] Backend logout notification failed/timed out", err);
  } finally {
    clearAuthSession();
  }
}
