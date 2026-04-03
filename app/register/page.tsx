"use client";

import { ThemedInput } from "@/components/FormControls";
import { Icon } from "@/components/icons/Icon";
import { api } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

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
      setErrorMessage("Password and confirm password do not match");
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
      setErrorMessage(res.error ?? "Register failed");
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
              <Icon name="user-plus" className="h-8 w-8 text-violet-400" />
            </div>
            
            <h1 className="mb-4 text-4xl font-black tracking-tighter text-white">
              JOIN CODEAREA
            </h1>
            <p className="mb-10 max-w-[280px] text-sm font-medium text-white/50">
              Start your journey in the ultimate command center for developers.
            </p>

            <div className="h-1 w-12 rounded-full bg-violet-500/50" />

            {/* Code Snippet Card - Variation for Register */}
            <div className="absolute bottom-10 left-10 right-10">
              <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl">
                <div className="mb-4 flex gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-red-500/50" />
                  <div className="h-2 w-2 rounded-full bg-yellow-500/50" />
                  <div className="h-2 w-2 rounded-full bg-green-500/50" />
                </div>
                <pre className="text-left font-mono text-[11px] leading-relaxed text-white/40">
                  <code className="block">
                    <span className="text-violet-400">const</span> newUser = {"{"}
                  </code>
                  <code className="block pl-4">
                    username: <span className="text-green-400">&apos;dev_visionary&apos;</span>,
                  </code>
                  <code className="block pl-4">
                    role: <span className="text-green-400">&apos;DEVELOPER&apos;</span>,
                  </code>
                  <code className="block pl-4">
                    access: <span className="text-violet-400">true</span>
                  </code>
                  <code>{"}"};</code>
                  <code className="block mt-2 text-violet-300">
                    // Welcome to the future of coding.
                  </code>
                </pre>
              </div>
            </div>
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
              Sign In
            </Link>
            <button className="rounded-xl bg-violet-600 px-6 py-2 text-xs font-bold text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all">
              Sign Up
            </button>
          </div>

          <div className="mb-10">
            <h2 className="mb-2 text-3xl font-bold tracking-tight text-white">
              Create Account
            </h2>
            <p className="text-sm font-medium text-white/40">
              Join our community of developers
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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

              <ThemedInput
                label="Display Name"
                type="text"
                name="display_name"
                value={formData.display_name}
                onChangeAction={handleInputChange}
                required
                placeholder="pupha"
                leftSlot={<Icon name="user" className="h-4 w-4" />}
              />

              <ThemedInput
                label="Password"
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
                label="Confirm Password"
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
                  Initialize Account
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

          <p className="mt-8 text-center text-[10px] leading-relaxed text-white/30">
            By joining, you agree to our{" "}
            <Link href="#" className="underline transition-all hover:text-white">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="underline transition-all hover:text-white">
              Privacy Policy
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
