"use client";

import { CodeAreaLogo } from "@/components/branding/CodeAreaLogo";
import { Icon } from "@/components/icons/Icon";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLogout } from "@/components/auth/LogoutProvider";

interface NavLink {
  label: string;
  href: string;
}

interface NavigationHeaderProps {
  links?: NavLink[];
}

export function NavigationHeader({ links = [] }: NavigationHeaderProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [avatarText, setAvatarText] = useState("U");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // ตรวจสอบ login status
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const userRaw = localStorage.getItem("user");

      if (token && userRaw) {
        try {
          // ขั้นตอนที่ 1: วิเคราะห์ข้อมูลผู้ใช้และตรวจสอบฟิลด์สำคัญ (เช่น ID)
          const user = JSON.parse(userRaw) as { id?: string | number; display_name?: string; role_id?: number; avatar_url?: string };

          if (!user.id) {
            console.warn("[NavigationHeader] User ID missing in localStorage. Forcing logout.");
            handleLogout();
            return;
          }

          // ขั้นตอนที่ 2: เติมข้อมูลสถานะ UI สำหรับผู้ใช้ที่เข้าสู่ระบบ
          const name = user.display_name?.trim() || "ผู้ใช้งาน";
          setDisplayName(name);
          setAvatarText(name.charAt(0).toUpperCase());
          setIsLoggedIn(true);
        } catch {
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    };

    checkAuth();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    // ฟังเหตุการณ์จาก storage
    window.addEventListener("storage", checkAuth);
    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // ปิด dropdown เมื่อคลิกนอก
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const { logout, isLoggingOut } = useLogout();

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    logout("/");
  };

  const defaultLinks: NavLink[] = [
    { label: "หน้าหลัก", href: "/" },
    { label: "โจทย์", href: "/questions" },
    { label: "ประเภทโจทย์", href: "/categories" },
    { label: "ตารางอันดับ", href: "/leaderboard" },
  ];

  const navLinks = links.length > 0 ? links : defaultLinks;

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 w-full transition-all duration-500 ease-in-out ${isScrolled
        ? "bg-[#05060d]/60 border-b border-white/5 backdrop-blur-3xl py-0 shadow-2xl"
        : "bg-transparent py-3"
        }`}
    >
      <div className="relative w-full max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <CodeAreaLogo
            showText
            iconClassName="h-8 w-8"
            textClassName="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-white to-white/60"
          />
        </Link>

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white transition-colors hover:bg-white/10"
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
        >
          <span className="relative h-4 w-5">
            <span
              className={`absolute left-0 top-0 h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${isMobileMenuOpen ? "top-[7px] rotate-45" : ""
                }`}
            />
            <span
              className={`absolute left-0 top-[7px] h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${isMobileMenuOpen ? "opacity-0" : "opacity-100"
                }`}
            />
            <span
              className={`absolute left-0 top-[14px] h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${isMobileMenuOpen ? "top-[7px] -rotate-45" : ""
                }`}
            />
          </span>
        </button>

        {/* Center Navigation Links */}
        <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group relative text-sm font-medium transition-all duration-300 ${isActive ? "text-blue-400" : "text-white hover:text-blue-300"
                  } after:absolute after:bottom-[-8px] after:left-1/2 after:h-0.5 after:w-full after:-translate-x-1/2 after:rounded-full after:bg-blue-400 after:shadow-[0_0_10px_rgba(96,165,250,0.9)] after:transition-transform after:duration-300 after:ease-out ${isActive
                    ? "after:scale-x-100"
                    : "after:scale-x-0 group-hover:after:scale-x-100"
                  }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-4">
          {!isLoggedIn ? (
            <>
              <Link
                href="/login"
                className="h-10 px-6 inline-flex items-center justify-center bg-white/5 border border-white/10 text-sm font-medium rounded-full hover:bg-white/10 transition-all backdrop-blur-sm text-white/80"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="h-10 px-6 inline-flex items-center justify-center bg-primary text-white text-sm font-medium rounded-full hover:bg-primary-hover transition-all shadow-[0_0_20px_rgba(139,92,246,0.4)]"
              >
                Get Started
              </Link>
            </>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer rounded-full p-1 hover:bg-white/5"
              >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-linear-to-br from-primary to-blue-400 flex items-center justify-center text-white text-sm font-semibold shadow-sm overflow-hidden relative">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-full h-full object-cover"
                      onError={() => setAvatarUrl(null)}
                    />
                  ) : (
                    avatarText
                  )}
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <p className="text-sm font-medium text-white leading-tight">
                    {displayName}
                  </p>
                </div>
                {/* Dropdown Icon */}
                <Icon
                  name="chevron"
                  className={`w-4 h-4 text-white transition-transform ml-1 ${isDropdownOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <Link
                    href="/dashboard"
                    onClick={() => setIsDropdownOpen(false)}
                    className="w-full text-left px-4 py-3 text-sm text-white/80 hover:bg-white/5 hover:text-blue-400 transition-colors flex items-center gap-2 border-b border-white/5"
                  >
                    <Icon name="stats" className="w-4 h-4" /> Dashboard
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className="w-full text-left px-4 py-3 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <Icon name="gear" className="w-4 h-4" /> Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full text-left px-4 py-3 text-sm text-white/80 hover:bg-white/5 hover:text-red-400 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {isLoggingOut ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                    ) : (
                      <Icon name="logout" className="w-4 h-4" />
                    )}
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div
        className={`md:hidden overflow-hidden border-t border-white/10 bg-[#0a0f1f]/95 backdrop-blur-md transition-all duration-300 ${isMobileMenuOpen ? "max-h-[70vh] opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-6 py-4">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={`mobile-${link.href}`}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${isActive
                  ? "bg-blue-400/15 text-blue-300"
                  : "text-white/80 hover:bg-white/5 hover:text-white"
                  }`}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="mt-2 border-t border-white/10 pt-3">
            {!isLoggedIn ? (
              <div className="flex flex-col gap-4">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="h-10 inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 text-sm font-medium text-white/90 transition-colors hover:bg-white/10"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="h-10 px-6 inline-flex items-center justify-center bg-primary text-white text-sm font-medium rounded-full hover:bg-primary-hover transition-all shadow-[0_0_20px_rgba(139,92,246,0.4)]"
                >
                  Get Started
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="px-1 text-xs text-white/50">
                  Signed in as {displayName}
                </p>
                <Link
                  href="/dashboard/settings"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="h-10 inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 text-sm font-medium text-white/90 transition-colors hover:bg-white/10"
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="h-10 rounded-full border border-red-400/30 bg-red-500/10 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoggingOut && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-300 border-t-transparent" />
                  )}
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
