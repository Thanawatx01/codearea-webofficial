"use client";

import { ThemedInput } from "@/components/FormControls";
import { Icon } from "@/components/icons/Icon";
import { api } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

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

    setIsLoading(false);
    router.replace("/dashboard/problems");
  };

  if (!isMounted) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#0b0c10] p-4 font-sans text-white" />
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#0b0c10] p-4 font-sans text-white">
      {/* Main Container */}
      <div className="relative flex w-full max-w-[1000px] flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#11121a] shadow-2xl lg:flex-row">
        
        {/* Left Side: Aesthetic Background */}
        <div className="relative hidden w-full lg:block lg:w-1/2">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <Image
              src="/images/login_bg.png"
              alt="Background"
              fill
              className="object-cover opacity-60 brightness-75 transition-transform duration-1000 hover:scale-105"
              priority
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#0b0c10] via-transparent to-transparent opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0b0c10]/40" />
          </div>

          <div className="relative z-10 flex h-full flex-col items-center justify-center p-12 text-center">
            {/* Branding Card */}
            <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md outline outline-1 outline-white/20 transition-all hover:bg-white/20">
              <Icon name="terminal" className="h-8 w-8 text-violet-400" />
            </div>
            
            <h1 className="mb-4 text-4xl font-black tracking-tighter text-white">
              CODEAREA
            </h1>
            <p className="mb-10 max-w-[280px] text-sm font-medium text-white/50">
              The ultimate tech command center for visionary developers.
            </p>

            <div className="h-1 w-12 rounded-full bg-violet-500/50" />

            {/* Code Snippet Card */}
            <div className="absolute bottom-10 left-10 right-10">
              <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl">
                <div className="mb-4 flex gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-red-500/50" />
                  <div className="h-2 w-2 rounded-full bg-yellow-500/50" />
                  <div className="h-2 w-2 rounded-full bg-green-500/50" />
                </div>
                <pre className="text-left font-mono text-[11px] leading-relaxed text-white/40">
                  <code className="block">
                    <span className="text-violet-400">function</span>{" "}
                    <span className="text-blue-400">deployProject</span>(id) {"{"}
                  </code>
                  <code className="block pl-4">
                    <span className="text-violet-400">const</span> nexus = Core.
                    <span className="text-yellow-300">initialize</span>(
                    <span className="text-green-400">&apos;nexus-7&apos;</span>
                    );
                  </code>
                  <code className="block pl-4">
                    nexus.<span className="text-yellow-300">push</span>
                    (CODEAREA_CONFIG);
                  </code>
                  <code className="block pl-4">
                    <span className="text-violet-400">return</span> nexus.status
                    === <span className="text-green-400">&apos;ACTIVE&apos;</span>;
                  </code>
                  <code>{"}"}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex w-full flex-col bg-[#11121a] p-8 sm:p-12 lg:w-1/2">
          {/* Sign In / Sign Up Toggle */}
          <div className="mb-10 flex w-fit self-center rounded-2xl bg-white/5 p-1 lg:self-end">
            <button className="rounded-xl bg-violet-600 px-6 py-2 text-xs font-bold text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all">
              Sign In
            </button>
            <Link
              href="/register"
              className="px-6 py-2 text-xs font-bold text-white/40 transition-all hover:text-white"
            >
              Sign Up
            </Link>
          </div>

          <div className="mb-10">
            <h2 className="mb-2 text-3xl font-bold tracking-tight text-white">
              Welcome Back
            </h2>
            <p className="text-sm font-medium text-white/40">
              Access your secure workspace
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="space-y-4">
              <ThemedInput
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChangeAction={handleInputChange}
                required
                placeholder="dev@codearea.tech"
                leftSlot={<Icon name="mail" className="h-4 w-4" />}
              />

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="px-1 text-xs font-semibold uppercase tracking-widest text-white/50">
                    Password
                  </label>
                  <Link
                    href="#"
                    className="text-[10px] font-bold uppercase tracking-widest text-violet-400 hover:text-violet-300"
                  >
                    Forgot Password?
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

            <label className="flex cursor-pointer items-center gap-3">
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-md border border-white/10 transition-all ${
                  rememberMe ? "bg-violet-600" : "bg-white/5"
                }`}
                onClick={() => setRememberMe((prev) => !prev)}
              >
                {rememberMe && <Icon name="check" className="h-3 w-3 text-white" />}
              </div>
              <input
                type="checkbox"
                className="hidden"
                checked={rememberMe}
                onChange={() => setRememberMe((prev) => !prev)}
              />
              <span className="text-xs font-medium text-white/40">
                Remember my session
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
                  Deploy Session
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
            By deploying, you agree to our{" "}
            <Link href="#" className="underline transition-all hover:text-white">
              Terms of Service
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
