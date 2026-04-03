"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [collapsed, setCollapsed] = useState(false); // Consistent initial state for SSR/Client
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Only check auth after the component has mounted to prevent SSR/Hydration race conditions
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("[DashboardLayout] No token detected, redirecting to /login");
      router.replace("/login");
      setIsAuthorized(false);
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 1024px)");
    const syncCollapsed = (event: MediaQueryList | MediaQueryListEvent) => {
      if (event.matches) setCollapsed(true);
    };

    syncCollapsed(media);
    media.addEventListener("change", syncCollapsed);
    return () => media.removeEventListener("change", syncCollapsed);
  }, []);

  if (isAuthorized === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#05070f]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (isAuthorized === false) return null;

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
