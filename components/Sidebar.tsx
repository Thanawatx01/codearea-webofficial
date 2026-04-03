"use client";

import { CodeAreaLogo } from "@/components/branding/CodeAreaLogo";
import { Icon } from "@/components/icons/Icon";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface MenuItem {
  label: string;
  href: string;
  iconName: string;
  adminOnly?: boolean;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    title: "ทั่วไป",
    items: [
      {
        label: "ประเภทโจทย์",
        href: "/dashboard/problem-types",
        iconName: "problem-type",
      },
      { label: "แท็ก", href: "/dashboard/tags", iconName: "tag" },
      { label: "โจทย์", href: "/dashboard/problems", iconName: "problem" },
      { label: "IDE", href: "/dashboard/ide", iconName: "problem" },
    ],
  },
  {
    title: "ระบบ",
    items: [{ label: "การจัดการผู้ใช้งาน", href: "/dashboard/users", iconName: "user" }],
  },
  {
    title: "รายงาน",
    items: [
      {
        label: "การส่งคำตอบ",
        href: "/dashboard/submissions",
        iconName: "submission",
      },
      {
        label: "สถิติโจทย์",
        href: "/dashboard/problem-stats",
        iconName: "stats",
      },
      {
        label: "กิจกรรมผู้ใช้",
        href: "/dashboard/user-activity",
        iconName: "activity",
      },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [roleId, setRoleId] = useState<number | null>(null);

  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        setRoleId(user.role_id);
      } catch (e) {
        console.error("Error parsing user from localStorage:", e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.cookie =
      "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax";
    document.cookie =
      "role_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax";
    document.cookie =
      "display_name=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax";
    router.replace("/login");
  };

  return (
    <aside
      className={`fixed bottom-0 left-0 top-0 z-40 flex flex-col overflow-y-auto border-r border-white/10 bg-linear-to-b from-[#05060d]/95 via-[#090b16]/95 to-[#081225]/95 backdrop-blur-md transition-[width] duration-200 ${collapsed ? "w-[84px]" : "w-[260px]"
        }`}
    >
      {/* Logo */}
      <div
        className={`flex h-16 items-center border-b border-white/5 ${collapsed ? "justify-between px-2" : "justify-between px-4"
          }`}
      >
        <Link
          href="/dashboard/problems"
          className={`flex items-center hover:opacity-90 transition-opacity ${collapsed ? "justify-center pl-1" : "gap-2.5"
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
          className={`rounded-lg border border-white/10 bg-white/5 text-xs text-white/80 hover:bg-white/10 ${collapsed ? "h-6 w-6" : "h-8 w-8"
            }`}
          aria-label={collapsed ? "ขยายเมนู" : "ย่อเมนู"}
        >
          {collapsed ? ">" : "<"}
        </button>
      </div>

      {/* Navigation */}
      <nav
        className={`flex-1 py-4 ${collapsed ? "px-2 space-y-4" : "px-3 space-y-6"}`}
      >
        {menuGroups.map((group) => {
          const visibleItems = group.items.filter((item) => {
            if (item.adminOnly) {
              return roleId === 2;
            }
            return true;
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={group.title}>
              {!collapsed ? (
                <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-text-light">
                  {group.title}
                </p>
              ) : null}
              <ul className="space-y-0.5">
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        title={item.label}
                        href={item.href}
                        className={`flex items-center rounded-lg text-sm font-medium transition-all duration-150 ${collapsed
                          ? "justify-center px-2 py-2.5"
                          : "gap-3 px-3 py-2.5"
                          } ${isActive
                            ? "bg-primary/20 text-primary border border-primary/20"
                            : "text-text-muted hover:bg-white/5 hover:text-foreground"
                          }`}
                      >
                        <span
                          className={
                            isActive ? "text-primary" : "text-text-light"
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
          );
        })}
      </nav>

      <div className={`border-t border-white/10 ${collapsed ? "p-2" : "p-3"}`}>
        <button
          type="button"
          onClick={handleLogout}
          title="ออกจากระบบ"
          className={`w-full rounded-lg border border-red-500/20 bg-red-500/10 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/20 ${collapsed
            ? "flex items-center justify-center px-2 py-2.5"
            : "px-3 py-2.5 text-left"
            }`}
        >
          {collapsed ? (
            <Icon name="logout" className="h-5 w-5" />
          ) : (
            <div className="flex items-center gap-2">
              <Icon name="logout" className="h-5 w-5" />
              <span className="text-sm font-semibold text-red-400">
                ออกจากระบบ
              </span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
