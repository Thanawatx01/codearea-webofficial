"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons/Icon";
import { useLogout } from "@/components/auth/LogoutProvider";

interface HeaderProps {
  title: string;
  icon?: React.ReactNode;
}

export default function Header({ title, icon }: HeaderProps) {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [userData, setUserData] = useState({ name: "ผู้ใช้งาน", role: "1", avatar_url: "" });

  useEffect(() => {
    try {
      const userRaw = window.localStorage.getItem("user");
      if (userRaw) {
        const user = JSON.parse(userRaw) as { display_name?: string; role_id?: number | string; avatar_url?: string };
        setUserData({
          name: user.display_name?.trim() || "ผู้ใช้งาน",
          role: String(user.role_id || "1"),
          avatar_url: user.avatar_url || ""
        });
      }
    } catch (e) {
      console.error("Failed to parse user data", e);
    }
  }, []);

  const displayName = userData.name;
  const roleId = userData.role;
  const avatarUrl = userData.avatar_url;

  const roleLabel = useMemo(() => {
    return roleId === "2" ? "Admin" : "User";
  }, [roleId]);

  const avatarText = useMemo(() => {
    const trimmed = displayName.trim();
    return trimmed ? trimmed.charAt(0).toUpperCase() : "U";
  }, [displayName]);

  const { logout, isLoggingOut } = useLogout();

  const handleLogout = useCallback(() => {
    logout("/");
  }, [logout]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-linear-to-r from-black/65 via-violet-950/35 to-blue-950/35 px-6 backdrop-blur-md">
      {/* Page Title */}
      <div className="flex items-center gap-2.5">
        {icon && <span className="text-primary">{icon}</span>}
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>

      {/* Right side: notification + user */}
      <div className="flex items-center gap-4">
        {/* Divider */}
        <div className="w-px h-8 bg-white/10"></div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex items-center gap-3 hover:bg-white/5 p-1.5 pr-3 rounded-2xl transition-all cursor-pointer group"
          >
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-linear-to-br from-primary to-blue-400 flex items-center justify-center text-white text-sm font-semibold shadow-sm group-hover:scale-105 transition-transform overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                avatarText
              )}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-foreground leading-tight group-hover:text-white transition-colors">
                {displayName}
              </p>
              <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted">{roleLabel}</span>
                <Icon name="chevron-down" className={`h-3 w-3 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-full min-w-[200px] max-w-[280px] rounded-2xl bg-[#0d101a] border border-white/10 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200 backdrop-blur-2xl">
              <div className="p-2 space-y-1">
                <div className="px-3 py-2 text-[10px] font-bold text-white/30 uppercase tracking-widest border-b border-white/5 mb-2">
                  บัญชีผู้ใช้งาน
                </div>

                <Link
                  href="/dashboard/settings"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors rounded-xl"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <Icon name="gear" className="h-4 w-4" />
                  </div>
                  <span>ตั้งค่าโปรไฟล์</span>
                </Link>

                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-colors rounded-xl text-left disabled:opacity-50"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-400/5 flex items-center justify-center">
                    {isLoggingOut ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                    ) : (
                      <Icon name="logout" className="h-4 w-4" />
                    )}
                  </div>
                  <span>{isLoggingOut ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
