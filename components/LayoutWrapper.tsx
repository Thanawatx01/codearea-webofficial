"use client";

import { Footer, NavigationHeader } from "@/components/navigation";
import { usePathname } from "next/navigation";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");
  const isAuthPage = pathname === "/login" || pathname === "/register";

  return (
    <div className="flex min-h-screen flex-col">
      {!isDashboard && <NavigationHeader />}
      <main className="flex min-h-0 flex-1 flex-col">{children}</main>
      {!isDashboard && !isAuthPage && <Footer />}
    </div>
  );
}
