"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 1024px)").matches;
  });

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
    <div className="flex min-h-screen overflow-x-hidden bg-background">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
      />
      <div
        className={`flex min-w-0 flex-1 flex-col transition-[margin-left] duration-200 ${
          collapsed ? "ml-[84px]" : "ml-[260px]"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
