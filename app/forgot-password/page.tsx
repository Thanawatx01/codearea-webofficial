"use client";

import { ThemedInput } from "@/components/FormControls";
import { Icon } from "@/components/icons/Icon";
import { api } from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { CodeAreaLogo } from "@/components/branding/CodeAreaLogo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setMessage("");

    const res = await api.post<{ message: string }>("/auth/forgot-password", {
      email,
    });

    if (!res.ok) {
      setIsLoading(false);
      setErrorMessage(res.error ?? "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      return;
    }

    setIsLoading(false);
    setMessage(res.data?.message ?? "ดำเนินการสำเร็จ");
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

            <h1 className="mb-4 text-4xl font-black tracking-tighter text-white uppercase">
              RECOVER ACCESS
            </h1>
            <p className="mb-10 max-w-[280px] text-sm font-medium text-white/50">
              Enter your email to receive secure recovery instructions.
            </p>

            <div className="h-1 w-12 rounded-full bg-violet-500/50" />
          </div>
        </div>

        {/* Right Side: Forgot Password Form */}
        <div className="flex w-full flex-col bg-[#11121a] p-8 sm:p-12 lg:w-1/2">
          <div className="mb-10 flex w-fit self-center rounded-2xl bg-white/5 p-1 lg:self-end">
            <Link
              href="/login"
              className="px-6 py-2 text-xs font-bold text-white/40 transition-all hover:text-white"
            >
              กลับสู่หน้าเข้าสู่ระบบ
            </Link>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="mb-2 text-3xl font-bold tracking-tight text-white">
              ลืมรหัสผ่าน?
            </h2>
            <p className="text-sm font-medium text-white/40">
              ระบุอีเมลที่คุณใช้สมัครสมาชิก เพื่อรับลิงก์รีเซ็ตรหัสผ่าน
            </p>
          </div>

          {message ? (
            <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center">
              <Icon name="check" className="mx-auto mb-3 h-8 w-8 text-emerald-400" />
              <p className="text-sm font-medium text-emerald-400">{message}</p>
              <Link 
                href="/login" 
                className="mt-4 inline-block text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white underline underline-offset-4"
              >
                กลับไปที่หน้าเข้าสู่ระบบ
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
              <ThemedInput
                label="อีเมลที่สมัครสมาชิก"
                type="email"
                value={email}
                onChangeAction={(e) => setEmail(e.target.value)}
                required
                placeholder="email@example.com"
                leftSlot={<Icon name="mail" className="h-4 w-4" />}
              />

              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-violet-600 font-bold text-white shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-all hover:bg-violet-500 hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                ) : (
                  <>
                    ส่งลิงก์รีเซ็ตรหัสผ่าน
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
          )}

          <p className="mt-auto pt-10 text-center text-[10px] leading-relaxed text-white/30">
            หากคุณไม่ได้รับอีเมล กรุณาตรวจสอบในกล่องจดหมายขยะหรือลองใหม่อีกครั้ง
          </p>
        </div>

        {/* Background Accents */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-600/20 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-violet-600/10 blur-[100px]" />
      </div>
    </div>
  );
}
