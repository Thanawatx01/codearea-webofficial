"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

interface HeaderProps {
  title: string;
  icon?: React.ReactNode;
}

export default function Header({ title, icon }: HeaderProps) {
  const [displayName] = useState(() => {
    if (typeof window === "undefined") return "ผู้ใช้งาน";
    try {
      const userRaw = window.localStorage.getItem("user");
      if (!userRaw) return "ผู้ใช้งาน";
      const user = JSON.parse(userRaw) as { display_name?: string };
      const name = user.display_name?.trim();
      return name || "ผู้ใช้งาน";
    } catch {
      return "ผู้ใช้งาน";
    }
  });

  const avatarText = useMemo(() => {
    const trimmed = displayName.trim();
    return trimmed ? trimmed.charAt(0).toUpperCase() : "U";
  }, [displayName]);

  return (
    <header className="flex items-center justify-between h-16 px-6 bg-background/60 backdrop-blur-md border-b border-white/5 shrink-0 sticky top-0 z-30">
      {/* Page Title */}
      <div className="flex items-center gap-2.5">
        {icon && <span className="text-primary">{icon}</span>}
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>

      {/* Right side: notification + user */}
      <div className="flex items-center gap-4">
        {/* Divider */}
        <div className="w-px h-8 bg-white/10"></div>

        {/* User Profile */}
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
        >
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-linear-to-br from-primary to-blue-400 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
            {avatarText}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-foreground leading-tight">
              {displayName}
            </p>
            <p className="text-xs text-text-muted leading-tight">admin</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
