"use client";

import { ThemedInput } from "@/components/FormControls";
import { CodeAreaLogo } from "@/components/branding/CodeAreaLogo";
import { Icon } from "@/components/icons/Icon";
import { api } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

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
    if (user.role_id === 2) {
      router.push("/dashboard/problems");
      return;
    }
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Tech Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[30px_30px] pointer-events-none mask-[radial-gradient(ellipse_at_center,black,transparent_80%)]"></div>

      <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/10 p-8 sm:p-12 relative z-10">
        <div className="flex justify-center mb-8">
          <CodeAreaLogo iconClassName="h-12 w-12" />
        </div>

        <h2 className="text-3xl font-bold text-white text-center mb-2">
          Welcome Back
        </h2>
        <p className="text-white/40 text-center text-sm mb-10">
          Log in to your CodeArea account
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <ThemedInput
            type="email"
            name="email"
            label="Email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="text-white bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4"
            placeholder="admin@codearea.app"
          />
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-widest block">
                Password
              </label>
              <Link
                href="#"
                className="text-[10px] font-bold text-primary hover:text-primary-hover uppercase tracking-widest"
              >
                Forgot?
              </Link>
            </div>
            <ThemedInput
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="••••••••"
              className="text-white bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4"
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-white/60 hover:text-white"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <Icon
                    name={showPassword ? "eye-off" : "eye"}
                    className="h-[18px] w-[18px]"
                  />
                </button>
              }
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 bg-primary text-white font-bold rounded-2xl hover:bg-primary-hover transition-all flex items-center justify-center shadow-[0_0_25px_rgba(139,92,246,0.4)] hover:shadow-[0_0_35px_rgba(139,92,246,0.6)] disabled:opacity-50"
          >
            {isLoading ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              "Log In"
            )}
          </button>
          {errorMessage ? (
            <p className="text-center text-sm text-red-400">{errorMessage}</p>
          ) : null}
        </form>

        <div className="mt-10 pt-8 border-t border-white/5 text-center">
          <p className="text-sm text-white/40">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-primary font-bold hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
