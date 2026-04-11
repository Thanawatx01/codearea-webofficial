"use client";

import { ThemedInput } from "@/components/FormControls";
import { Icon } from "@/components/icons/Icon";
import { api } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { CodeAreaLogo } from "@/components/branding/CodeAreaLogo";

interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    display_name: string;
    role_id: number;
  };
}

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "admin@codearea.app",
    password: "1234567890",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    // โหลดข้อมูลที่จดจำไว้
    const savedEmail = localStorage.getItem("remember_email");
    const savedChecked = localStorage.getItem("remember_me_checked") === "true";
    
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(savedChecked);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    const res = await api.post<LoginResponse>("/auth/login", {
      email: formData.email,
      password: formData.password,
    });

    if (!res.ok || !res.data?.token || !res.data.user) {
      setIsLoading(false);
      setErrorMessage(res.error ?? "Login failed");
      return;
    }

    const { token, user } = res.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    document.cookie = `token=${encodeURIComponent(token)}; path=/; samesite=lax`;
    document.cookie = `role_id=${user.role_id}; path=/; samesite=lax`;
    document.cookie = `display_name=${encodeURIComponent(user.display_name)}; path=/; samesite=lax`;

    // จัดการ Remember Me
    if (rememberMe) {
      localStorage.setItem("remember_email", formData.email);
      localStorage.setItem("remember_me_checked", "true");
    } else {
      localStorage.removeItem("remember_email");
      localStorage.removeItem("remember_me_checked");
    }

    setIsLoading(false);
    if (user.role_id === 2) {
      const params = new URLSearchParams(window.location.search);
      const from = params.get("from");
      const safeFrom =
        from &&
        from.startsWith("/dashboard") &&
        !from.includes("//") &&
        !from.includes("\\")
          ? from
          : null;
      router.replace(safeFrom ?? "/dashboard");
    } else {
      router.replace("/");
    }
  };

  if (!isMounted) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-6 pt-32 pb-12 font-sans text-white" />
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 pt-32 pb-12 font-sans text-white">
      {/* Main Container */}
      <div className="relative flex w-full max-w-[1000px] flex-col overflow-hidden rounded-[3rem] border border-white/10 bg-[#05060d]/85 shadow-2xl backdrop-blur-[80px] lg:flex-row">

        {/* Left Side: Aesthetic Background */}
        <div className="relative hidden w-full lg:block lg:w-1/2">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <Image
              src="/asset/code.jpeg"
              alt="Code Background"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover opacity-30 blur-[2px] brightness-[0.4] transition-transform duration-1000 hover:scale-110"
              priority
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-transparent to-transparent opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
          </div>

          <div className="relative z-10 flex h-full flex-col items-center justify-center p-12 text-center">
            {/* Branding Logo */}
            <div className="mb-10">
              <CodeAreaLogo iconClassName="h-16 w-16" className="" />
            </div>

            <h1 className="mb-4 text-4xl font-black tracking-tighter text-white">
              CODEAREA
            </h1>
            <p className="mb-10 max-w-[280px] text-sm font-medium text-white/50">
              The ultimate tech command center for visionary developers.
            </p>

            <div className="h-1 w-12 rounded-full bg-violet-500/50" />


          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex w-full flex-col bg-[#11121a] p-8 sm:p-12 lg:w-1/2">
          {/* Sign In / Sign Up Toggle */}
          <div className="mb-10 flex w-fit self-center rounded-2xl bg-white/5 p-1 lg:self-end">
            <button className="rounded-xl bg-violet-600 px-6 py-2 text-xs font-bold text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all">
              เข้าสู่ระบบ
            </button>
            <Link
              href="/register"
              className="px-6 py-2 text-xs font-bold text-white/40 transition-all hover:text-white"
            >
              สมัครสมาชิก
            </Link>
          </div>

          <div className="mb-10">
            <h2 className="mb-2 text-3xl font-bold tracking-tight text-white">
              ยินดีต้อนรับ
            </h2>
            <p className="text-sm font-medium text-white/40">
              เข้าสู่ระบบเพื่อใช้งาน
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="space-y-5">
              <ThemedInput
                label="อีเมล"
                type="email"
                name="email"
                value={formData.email}
                onChangeAction={handleInputChange}
                required
                placeholder="อีเมล"
                leftSlot={<Icon name="mail" className="h-4 w-4" />}
              />

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="px-1 text-xs font-semibold uppercase tracking-widest text-white/50">
                    รหัสผ่าน
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[10px] font-bold uppercase tracking-widest text-violet-400 hover:text-violet-300"
                  >
                    ลืมรหัสผ่าน?
                  </Link>
                </div>
                <ThemedInput
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChangeAction={handleInputChange}
                  required
                  placeholder="••••••••"
                  leftSlot={<Icon name="lock" className="h-4 w-4" />}
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="text-white/40 transition-all hover:text-white"
                    >
                      <Icon
                        name={showPassword ? "eye-off" : "eye"}
                        className="h-4 w-4"
                      />
                    </button>
                  }
                />
              </div>
            </div>

            <label className="flex cursor-pointer items-center group select-none">
              <div className="relative flex h-5 w-5 items-center justify-center">
                <input
                  type="checkbox"
                  className="peer hidden"
                  checked={rememberMe}
                  onChange={() => setRememberMe((prev) => !prev)}
                />
                <div className="h-full w-full rounded-md border border-white/10 bg-white/5 transition-all peer-checked:bg-violet-600 peer-checked:border-violet-500 peer-hover:bg-white/10 group-active:scale-95 shadow-[0_2px_10px_rgba(0,0,0,0.2)]"></div>
                <div className="absolute opacity-0 scale-50 transition-all peer-checked:opacity-100 peer-checked:scale-100">
                  <Icon name="check" className="h-3 w-3 text-white" />
                </div>
              </div>
              <span className="ml-3 text-[11px] font-bold uppercase tracking-wider text-white/40 group-hover:text-white/60 transition-colors">
                จดจำการเข้าสู่ระบบ
              </span>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-violet-600 font-bold text-white shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-all hover:bg-violet-500 hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] disabled:opacity-50"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              ) : (
                <>
                  เข้าสู่ระบบ
                  <Icon
                    name="arrow-right"
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  />
                </>
              )}
            </button>

            {errorMessage ? (
              <p className="text-center text-sm font-medium text-red-400">
                {errorMessage}
              </p>
            ) : null}
          </form>

          <p className="mt-12 text-center text-[10px] leading-relaxed text-white/30">
            ในการเข้าสู่ระบบถือว่าคุณยอมรับ{" "}
            <Link href="#" className="underline transition-all hover:text-white">
              ข้อตกลงและเงื่อนไข
            </Link>
            .
          </p>
        </div>

        {/* Background Accent */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-600/20 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-violet-600/10 blur-[100px]" />
      </div>
    </div>
  );
}
