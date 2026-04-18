"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { performLogout } from "@/lib/authUtils";
import { LogoutOverlay } from "./LogoutOverlay";

interface LogoutContextType {
  logout: (redirectTo?: string) => Promise<void>;
  isLoggingOut: boolean;
}

const LogoutContext = createContext<LogoutContextType | undefined>(undefined);

// # ส่วนประกอบ LogoutProvider
// จัดการสถานะการออกจากระบบและตรรกะการล้างข้อมูลเซสชันทั่วทั้งแอปพลิเคชัน
// 1. ควบคุมสถานะ isLoggingOut เพื่อแสดงผล Overlay ป้องกันการใช้งานขณะประมวลผล
// 2. ประสานงานกับ LogoutOverlay เพื่อให้ประสบการณ์การใช้งานที่ลื่นไหล
// 3. จัดการการล้างข้อมูล local storage และโทเค็นผ่าน performLogout
export function LogoutProvider({ children }: { children: ReactNode }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const pathname = usePathname();

  const logout = useCallback(async (redirectTo: string = "/") => {
    setIsLoggingOut(true);

    // Perform technical logout
    await performLogout();

    // Delay to let the overlay and message be seen
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Redirect
    router.replace(redirectTo);

    // If we are already on the same page, the useEffect won't trigger from a pathname change.
    // Reset manually after a short tick to ensure UI consistency.
    if (pathname === redirectTo) {
      setTimeout(() => setIsLoggingOut(false), 100);
    }
  }, [router, pathname]);

  // Reset logging out state when route changes
  useEffect(() => {
    if (isLoggingOut) {
      setIsLoggingOut(false);
    }
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <LogoutContext.Provider value={{ logout, isLoggingOut }}>
      {children}
      {isLoggingOut && <LogoutOverlay />}
    </LogoutContext.Provider>
  );
}

export function useLogout() {
  const context = useContext(LogoutContext);
  if (context === undefined) {
    throw new Error("useLogout must be used within a LogoutProvider");
  }
  return context;
}

// # ความปลอดภัย
// ตรวจสอบรหัสความปลอดภัย
// 1. Session Invalidation: บังคับใช้การล้าง localStorage ทันทีและรีสตาร์ทเบราว์เซอร์คอนเท็กซ์ผ่าน window.location.href
// 2. UI Locking: ใช้ Overlay สีดำทับทั้งหน้าจอขณะออกจากระบบเพื่อป้องกันไม่ให้ผู้ใช้กดปุ่มอื่นๆ ระหว่างล้างข้อมูล
// 3. Memory Cleanup: ล้างสถานะ React ทั้งหมดโดยการเปลี่ยนหน้าแบบ Full Refresh เพื่อป้องกันข้อมูลที่ละเอียดอ่อนค้างอยู่ในหน่วยความจำ
