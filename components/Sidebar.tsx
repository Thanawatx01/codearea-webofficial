"use client";

import { CodeAreaLogo } from "@/components/branding/CodeAreaLogo";
import { Icon } from "@/components/icons/Icon";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MenuItem {
  label: string;
  href: string;
  iconName: string;
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
    ],
  },
  {
    title: "ระบบ",
    items: [{ label: "ผู้ใช้งาน", href: "/dashboard/users", iconName: "user" }],
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
  {
    title: "ตั้งค่าระบบ",
    items: [
      {
        label: "การตั้งค่า",
        href: "/dashboard/settings",
        iconName: "settings",
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

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-sidebar-bg border-r border-border overflow-y-auto transition-[width] duration-200 ${
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
          href="/dashboard/problems"
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
          aria-label={collapsed ? "ขยายเมนู" : "ย่อเมนู"}
        >
          {collapsed ? ">" : "<"}
        </button>
      </div>

      {/* Navigation */}
      <nav
        className={`flex-1 py-4 ${collapsed ? "px-2 space-y-4" : "px-3 space-y-6"}`}
      >
        {menuGroups.map((group) => (
          <div key={group.title}>
            {!collapsed ? (
              <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-text-light">
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
        ))}
      </nav>
    </aside>
  );
}
