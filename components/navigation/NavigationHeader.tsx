"use client";

import { CodeAreaLogo } from "@/components/branding/CodeAreaLogo";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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
          const user = JSON.parse(userRaw) as { display_name?: string };
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

    // ฟังเหตุการณ์จาก storage
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setIsDropdownOpen(false);
    router.push("/");
  };

  const defaultLinks: NavLink[] = [
    { label: "Home", href: "/" },
    { label: "Questions", href: "/questions" },
    { label: "Categories", href: "/categories" },
  ];

  const navLinks = links.length > 0 ? links : defaultLinks;

  return (
    <nav className="sticky top-0 z-40 w-full bg-[#0B0B0F] border-b border-white/5 backdrop-blur-md">
      <div className="relative w-full max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <CodeAreaLogo
            showText
            iconClassName="h-8 w-8"
            textClassName="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-white to-white/60"
          />
        </Link>

        {/* Center Navigation Links */}
        <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors relative ${
                  isActive ? "text-primary" : "text-white/60 hover:text-white"
                } ${isActive ? "after:absolute after:bottom-[-8px] after:left-0 after:right-0 after:h-0.5 after:bg-primary" : ""}`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
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
                <div className="w-9 h-9 rounded-full bg-linear-to-br from-primary to-blue-400 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                  {avatarText}
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <p className="text-sm font-medium text-white leading-tight">
                    {displayName}
                  </p>
                </div>
                {/* Dropdown Icon */}
                <svg
                  className={`w-4 h-4 text-white/60 transition-transform ml-1 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <Link
                    href="/dashboard/settings"
                    className="block px-4 py-3 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors border-b border-white/5"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm text-white/80 hover:bg-white/5 hover:text-red-400 transition-colors flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
