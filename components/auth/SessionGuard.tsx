"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { api } from "@/lib/api";

type AuthMeResponse = {
  user: {
    id: number;
    email: string;
    display_name: string;
    role_id: number;
  };
};

type AuthUser = {
  id: number;
  email: string;
  display_name: string;
  role_id: number;
};

function clearAuthStorage() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax";
  document.cookie = "role_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax";
  document.cookie = "display_name=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax";
}

export function SessionGuard() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let active = true;

    const validateSession = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      const localUserRaw = localStorage.getItem("user");
      if (!localUserRaw) return;

      let localUser: AuthUser | null = null;
      try {
        localUser = JSON.parse(localUserRaw) as AuthUser;
      } catch {
        clearAuthStorage();
        return;
      }

      const meRes = await api.get<AuthMeResponse>("/auth/me", { useToken: true });
      if (!active) return;

      // Don't force logout on transient network errors/timeouts.
      if (!meRes.ok && meRes.status !== 401 && meRes.status !== 403) {
        return;
      }

      const serverUser = meRes.data?.user;
      const isMismatch =
        meRes.status === 401 ||
        meRes.status === 403 ||
        !serverUser ||
        serverUser.id !== localUser.id ||
        serverUser.email !== localUser.email;

      if (!isMismatch) return;
      if (!active) return;

      console.warn("[SessionGuard] Session mismatch or 401 detected, clearing storage and redirecting to /login", {
        status: meRes.status,
        mismatch: isMismatch
      });

      clearAuthStorage();

      await Swal.fire({
        icon: "warning",
        title: "Session หมดอายุ",
        text: "กรุณาเข้าสู่ระบบใหม่อีกครั้ง",
        confirmButtonText: "ตกลง",
      });

      const loginHref = pathname.startsWith("/dashboard")
        ? `/login?from=${encodeURIComponent(pathname)}`
        : "/login";
      router.replace(loginHref);
    };

    validateSession();

    return () => {
      active = false;
    };
  }, [router, pathname]);

  return null;
}
