"use client";

import { Icon } from "@/components/icons/Icon";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function UnauthorizedPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#05070f] text-white overflow-hidden relative">
      {/* Background Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg px-6">
        {/* Error Icon Wrap */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl border border-red-500/20 bg-red-500/10 backdrop-blur-md">
            <Icon name="shield-off" className="h-12 w-12 text-red-500" />
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
          ACCESS DENIED
        </h1>
        
        <p className="text-lg font-medium text-white/40 mb-10 leading-relaxed">
          ขออภัย คุณไม่มีสิทธิ์เข้าถึงหน้าแดชบอร์ด พื้นที่นี้จำกัดเฉพาะผู้ดูแลระบบเท่านั้น
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link
            href="/"
            className="group flex items-center justify-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-2xl transition-all hover:bg-white/90 active:scale-95 shadow-[0_20px_40px_-10px_rgba(255,255,255,0.2)]"
          >
            <Icon name="home" className="h-5 w-5" />
            กลับหน้าหลัก
          </Link>
          
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl transition-all hover:bg-white/10 active:scale-95"
          >
            สลับบัญชี
          </Link>
        </div>
      </div>

      {/* Decorative Grid */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
    </div>
  );
}
