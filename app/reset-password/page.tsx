"use client";

import { ThemedInput } from "@/components/FormControls";
import { Icon } from "@/components/icons/Icon";
import { api } from "@/lib/api";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import { CodeAreaLogo } from "@/components/branding/CodeAreaLogo";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setErrorMessage("ไม่พบ Token สำหรับการรีเซ็ตรหัสผ่าน");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("รหัสผ่านไม่ตรงกัน");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setMessage("");

    const res = await api.post<{ message: string }>("/auth/reset-password", {
      token,
      password,
    });

    if (!res.ok) {
      setIsLoading(false);
      setErrorMessage(res.error ?? "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      return;
    }

    setIsLoading(false);
    setMessage(res.data?.message ?? "เปลี่ยนรหัสผ่านสำเร็จ");
    
    // Redirect after 3 seconds
    setTimeout(() => {
      router.push("/login");
    }, 3000);
  };

  if (message) {
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-8 text-center animate-in fade-in zoom-in duration-500">
        <Icon name="check" className="mx-auto mb-4 h-12 w-12 text-emerald-400" />
        <h3 className="mb-2 text-xl font-bold text-white">สำเร็จ!</h3>
        <p className="text-sm font-medium text-emerald-400/80">{message}</p>
        <p className="mt-6 text-[10px] uppercase tracking-widest text-white/30">
          กำลังพาคุณไปที่หน้าเข้าสู่ระบบ...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="space-y-5">
        <ThemedInput
          label="รหัสผ่านใหม่"
          type={showPassword ? "text" : "password"}
          value={password}
          onChangeAction={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          placeholder="••••••••"
          leftSlot={<Icon name="lock" className="h-4 w-4" />}
          rightSlot={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-white/40 hover:text-white"
            >
              <Icon name={showPassword ? "eye-off" : "eye"} className="h-4 w-4" />
            </button>
          }
        />

        <ThemedInput
          label="ยืนยันรหัสผ่านใหม่"
          type={showConfirmPassword ? "text" : "password"}
          value={confirmPassword}
          onChangeAction={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={6}
          placeholder="••••••••"
          leftSlot={<Icon name="shield-check" className="h-4 w-4" />}
          rightSlot={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-white/40 hover:text-white"
            >
              <Icon name={showConfirmPassword ? "eye-off" : "eye"} className="h-4 w-4" />
            </button>
          }
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || !token}
        className="group relative mt-2 flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-violet-600 font-bold text-white shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-all hover:bg-violet-500 hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] disabled:opacity-50"
      >
        {isLoading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        ) : (
          <>
            อัปเดตรหัสผ่าน
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

      {!token && !message && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-center">
           <p className="text-xs font-semibold text-amber-400">
             ลิงก์ไม่ถูกต้อง กรุณาตรวจสอบอีเมลและลองใหม่อีกครั้ง
           </p>
        </div>
      )}
    </form>
  );
}

export default function ResetPasswordPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
            <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-transparent to-transparent opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
          </div>

          <div className="relative z-10 flex h-full flex-col items-center justify-center p-12 text-center">
            <div className="mb-10">
              <CodeAreaLogo iconClassName="h-16 w-16" className="" />
            </div>

            <h1 className="mb-4 text-3xl font-black tracking-tighter text-white uppercase sm:text-4xl">
              SECURE UPDATE
            </h1>
            <p className="mb-10 max-w-[280px] text-sm font-medium text-white/50">
              Create a strong new password to protect your workspace.
            </p>

            <div className="h-1 w-12 rounded-full bg-violet-500/50" />
          </div>
        </div>

        {/* Right Side: Reset Password Form */}
        <div className="flex w-full flex-col bg-[#11121a] p-8 sm:p-12 lg:w-1/2">
          <div className="mb-10 flex flex-col gap-2">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              ตั้งรหัสผ่านใหม่
            </h2>
            <p className="text-sm font-medium text-white/40">
              กรุณาระบุรหัสผ่านใหม่ที่ต้องการใช้
            </p>
          </div>

          <Suspense fallback={<div className="h-32 w-full animate-pulse rounded-2xl bg-white/5" />}>
            <ResetPasswordForm />
          </Suspense>

          <p className="mt-12 text-center text-[10px] leading-relaxed text-white/30">
            หากคุณไม่ได้ดำเนินการนี้ กรุณาติดต่อฝ่ายสนับสนุนทันที
          </p>
        </div>

        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-600/20 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-violet-600/10 blur-[100px]" />
      </div>
    </div>
  );
}
