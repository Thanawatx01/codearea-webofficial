"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [collapsed, setCollapsed] = useState(false); // Consistent initial state for SSR/Client

  useEffect(() => {
    const media = window.matchMedia("(max-width: 1024px)");
    const syncCollapsed = (event: MediaQueryList | MediaQueryListEvent) => {
      if (event.matches) setCollapsed(true);
    };

    syncCollapsed(media);
    media.addEventListener("change", syncCollapsed);
    return () => media.removeEventListener("change", syncCollapsed);
  }, []);

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-[#05070f] text-white">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
      />
      <div
        className={`relative isolate flex min-h-screen min-w-0 flex-1 flex-col overflow-hidden bg-linear-to-br from-[#06080f] via-[#0a0b17] to-[#071226] transition-[margin-left] duration-200 ${
          collapsed ? "ml-[84px]" : "ml-[260px]"
        }`}
      >
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute -left-36 top-[-120px] h-[380px] w-[380px] rounded-full bg-violet-700/20 blur-3xl" />
          <div className="absolute right-[-120px] top-1/4 h-[360px] w-[360px] rounded-full bg-blue-600/20 blur-3xl" />
          <div className="absolute bottom-[-180px] left-1/3 h-[320px] w-[320px] rounded-full bg-indigo-700/15 blur-3xl" />
        </div>
        <div className="relative z-10 flex min-h-screen min-w-0 flex-1 flex-col">
        {children}
        </div>
      </div>
    </div>
  );
}
