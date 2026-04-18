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

  // # ฟังก์ชัน Logout
  // ดำเนินการล้างเซสชันและนำทางผู้ใช้ไปยังหน้าที่กำหนด
  // 1. เริ่มสถานะการออกจากระบบเพื่อบล็อกหน้าจอ
  // 2. เรียกใช้ performLogout เพื่อล้าง localStorage และ Token
  // 3. รอ 2 วินาทีเพื่อให้ผู้ใช้เห็นข้อความยืนยัน
  // 4. บังคับโหลดหน้าใหม่ (Full Browser Navigation) เพื่อล้างสถานะ Hydration ใน React
  const logout = useCallback(async (redirectTo: string = "/") => {
    setIsLoggingOut(true);
    
    // ขั้นตอนที่ 1: ดำเนินการออกจากระบบทางเทคนิค
    await performLogout();
    
    // ขั้นตอนที่ 2: หน่วงเวลาเพื่อให้ Overlay แสดงผลได้ครบถ้วน
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // ขั้นตอนที่ 3: เปลี่ยนหน้าและล้างสถานะทั้งหมดของเบราว์เซอร์
    window.location.href = redirectTo;
    
    // ขั้นตอนที่ 4: ทำความสะอาดสถานะในกรณีฉุกเฉิน
    setTimeout(() => setIsLoggingOut(false), 500);
  }, []);

  // # การรีเซ็ตสถานะตามเส้นทาง
  // ตรวจสอบการเปลี่ยนเส้นทางเพื่อรีเซ็ตสถานะการออกจากระบบหากจำเป็น
  const pathname = usePathname();
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
