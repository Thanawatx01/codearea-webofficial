"use client";

import { CodeAreaLogo } from "@/components/branding/CodeAreaLogo";
import { Icon } from "@/components/icons/Icon";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLogout } from "@/components/auth/LogoutProvider";
import { useEffect, useState } from "react";

interface MenuItem {
  label: string;
  href: string;
  iconName: string;
}

interface MenuGroup {
  title?: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    title: "CORE CONSOLE",
    items: [
      { label: "Dashboard", href: "/profile", iconName: "stats" },
      { label: "Category", href: "/categories", iconName: "problem-type" },
      { label: "Question", href: "/questions", iconName: "problem" },
    ],
  },
];

interface UserSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function UserSidebar({ collapsed, onToggle }: UserSidebarProps) {
  const pathname = usePathname();
  const { logout, isLoggingOut } = useLogout();
  const [userData, setUserData] = useState({ name: "User", title: "Developer", avatarUrl: "" });

  useEffect(() => {
    try {
      const userRaw = window.localStorage.getItem("user");
      if (userRaw) {
        const user = JSON.parse(userRaw) as { display_name?: string; avatar_url?: string };
        setUserData({
          name: user.display_name?.trim() || "User",
          title: "System Architecture Specialist",
          avatarUrl: user.avatar_url || "",
        });
      }
    } catch (e) {
      console.error("Failed to parse user data", e);
    }
  }, []);

  const handleLogout = () => {
    logout("/");
  };

  return (
    <aside
      className={`fixed bottom-0 left-0 top-0 z-40 flex flex-col overflow-y-auto border-r border-white/10 bg-linear-to-b from-[#05060d]/95 via-[#090b16]/95 to-[#081225]/95 backdrop-blur-md transition-[width] duration-200 ${
        collapsed ? "w-[84px]" : "w-[260px]"
      }`}
    >
      {/* Logo */}
      <div
        className={`flex h-16 items-center border-b border-white/5 ${
          collapsed ? "justify-between px-2" : "justify-between px-4"
        }`}
      >
        <Link
          href="/"
          className={`flex items-center hover:opacity-90 transition-opacity ${
            collapsed ? "justify-center pl-1" : "gap-2.5"
          }`}
        >
          <CodeAreaLogo iconClassName="h-8 w-8" />
          {!collapsed ? (
            <span className="text-lg font-black text-white tracking-widest uppercase">
              CodeArea
            </span>
          ) : null}
        </Link>
        <button
          type="button"
          onClick={onToggle}
          className={`rounded-lg border border-white/10 bg-white/5 text-xs text-white/80 hover:bg-white/10 ${
            collapsed ? "h-6 w-6" : "h-8 w-8"
          }`}
          aria-label={collapsed ? "Expand menu" : "Collapse menu"}
        >
          {collapsed ? ">" : "<"}
        </button>
      </div>

      {/* Navigation */}
      <nav
        className={`flex-1 py-4 ${collapsed ? "px-2 space-y-4" : "px-3 space-y-6"}`}
      >
        {menuGroups.map((group, groupIndex) => (
          <div key={group.title ?? `nav-${groupIndex}`}>
            {!collapsed && group.title ? (
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/30">
                {group.title}
              </p>
            ) : null}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      title={item.label}
                      href={item.href}
                      className={`flex items-center rounded-lg text-sm font-medium transition-all duration-150 ${
                        collapsed
                          ? "justify-center px-2 py-2.5"
                          : "gap-3 px-3 py-2.5"
                      } ${
                        isActive
                          ? "bg-primary/20 text-primary border border-primary/20"
                          : "text-white/50 hover:bg-white/5 hover:text-white/80"
                      }`}
                    >
                      <span
                        className={
                          isActive ? "text-primary" : "text-white/40"
                        }
                      >
                        <Icon name={item.iconName} className="h-5 w-5" />
                      </span>
                      {!collapsed ? item.label : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className={`border-t border-white/10 ${collapsed ? "p-2 space-y-1" : "p-3 space-y-1"}`}>
        {/* Settings */}
        <Link
          href="/profile"
          className={`flex items-center rounded-lg text-sm font-medium transition-all duration-150 ${
            collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"
          } text-white/50 hover:bg-white/5 hover:text-white/80`}
        >
          <Icon name="settings" className="h-5 w-5" />
          {!collapsed && <span>Settings</span>}
        </Link>
        
        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`flex w-full items-center rounded-lg text-sm font-medium transition-all duration-150 ${
            collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"
          } text-red-400/80 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50`}
          title={isLoggingOut ? "Logging out..." : "Logout"}
        >
          <span className="text-red-400">
            {isLoggingOut ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
            ) : (
              <Icon name="logout" className="h-5 w-5" />
            )}
          </span>
          {!collapsed && <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>}
        </button>

        {/* User Card */}
        {!collapsed && (
          <div className="mt-3 pt-3 border-t border-white/5">
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-9 h-9 rounded-full bg-linear-to-br from-primary to-blue-400 flex items-center justify-center text-white text-sm font-semibold shadow-sm overflow-hidden shrink-0">
                {userData.avatarUrl ? (
                  <img src={userData.avatarUrl} alt={userData.name} className="w-full h-full object-cover" />
                ) : (
                  userData.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{userData.name}</p>
                <p className="text-[10px] text-white/30 truncate">Level 42 Architect</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
