"use client";

import { ThemedInput } from "@/components/FormControls";
import { Icon } from "@/components/icons/Icon";
import { api } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { CodeAreaLogo } from "@/components/branding/CodeAreaLogo";

interface RegisterResponse {
  token?: string;
  user?: {
    id: number;
    email: string;
    display_name: string;
    role_id: number;
  };
}

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    display_name: "",
    password: "",
    confirm_password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    if (formData.password !== formData.confirm_password) {
      setIsLoading(false);
      setErrorMessage("รหัสผ่านไม่ตรงกัน");
      return;
    }

    const res = await api.post<RegisterResponse>("/auth/register", {
      email: formData.email,
      display_name: formData.display_name,
      password: formData.password,
      role_id: 1,
    });

    if (!res.ok) {
      setIsLoading(false);
      setErrorMessage(res.error ?? "สมัครสมาชิกล้มเหลว");
      return;
    }

    if (res.data?.token && res.data.user) {
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      document.cookie = `token=${encodeURIComponent(res.data.token)}; path=/; samesite=lax`;
      document.cookie = `role_id=${res.data.user.role_id}; path=/; samesite=lax`;
      document.cookie = `display_name=${encodeURIComponent(res.data.user.display_name)}; path=/; samesite=lax`;
      setIsLoading(false);
      router.replace("/dashboard/problems");
      return;
    }

    setIsLoading(false);
    router.push("/login");
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

            <h1 className="mb-3 text-3xl font-black tracking-tighter text-white">
              เข้าร่วม CODEAREA
            </h1>
            <p className="mb-8 max-w-[280px] text-sm font-medium text-white/50">
              เริ่มต้นการเดินทางของคุณสู่การเป็นสุดยอดนักพัฒนา
            </p>

            <div className="h-1 w-12 rounded-full bg-violet-500/50" />


          </div>
        </div>

        {/* Right Side: Register Form */}
        <div className="flex w-full flex-col bg-[#11121a] p-8 sm:p-12 lg:w-1/2">
          {/* Sign In / Sign Up Toggle */}
          <div className="mb-10 flex w-fit self-center rounded-2xl bg-white/5 p-1 lg:self-end">
            <Link
              href="/login"
              className="px-6 py-2 text-xs font-bold text-white/40 transition-all hover:text-white"
            >
              เข้าสู่ระบบ
            </Link>
            <button className="rounded-xl bg-violet-600 px-6 py-2 text-xs font-bold text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all">
              สมัครสมาชิก
            </button>
          </div>

          <div className="mb-6">
            <h2 className="mb-1 text-2xl font-bold tracking-tight text-white">
              สร้างบัญชี
            </h2>
            <p className="text-sm font-medium text-white/40">
              เข้าร่วมชุมชนคอมมูนิตี้ของเรา
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <ThemedInput
                  label="อีเมล"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChangeAction={handleInputChange}
                  required
                  placeholder="dev@codearea.tech"
                  leftSlot={<Icon name="mail" className="h-4 w-4" />}
                />
              </div>

              <div className="md:col-span-2">
                <ThemedInput
                  label="ชื่อที่แสดง"
                  type="text"
                  name="display_name"
                  value={formData.display_name}
                  onChangeAction={handleInputChange}
                  required
                  placeholder="pupha"
                  leftSlot={<Icon name="user" className="h-4 w-4" />}
                />
              </div>

              <ThemedInput
                label="รหัสผ่าน"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChangeAction={handleInputChange}
                required
                minLength={8}
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

              <ThemedInput
                label="ยืนยันรหัสผ่าน"
                name="confirm_password"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirm_password}
                onChangeAction={handleInputChange}
                required
                minLength={8}
                placeholder="••••••••"
                leftSlot={<Icon name="shield-check" className="h-4 w-4" />}
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="text-white/40 transition-all hover:text-white"
                  >
                    <Icon
                      name={showConfirmPassword ? "eye-off" : "eye"}
                      className="h-4 w-4"
                    />
                  </button>
                }
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative mt-2 flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-violet-600 font-bold text-white shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-all hover:bg-violet-500 hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] disabled:opacity-50"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              ) : (
                <>
                  สร้างบัญชี
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

          <p className="mt-6 text-center text-[10px] leading-relaxed text-white/30">
            ในการสมัครสมาชิกถือว่าคุณยอมรับ{" "}
            <Link href="#" className="underline transition-all hover:text-white">
              ข้อตกลงในการให้บริการ
            </Link>{" "}
            และ{" "}
            <Link href="#" className="underline transition-all hover:text-white">
              นโยบายความเป็นส่วนตัว
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
