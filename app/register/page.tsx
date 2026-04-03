"use client";

import { ThemedInput } from "@/components/FormControls";
import { Icon } from "@/components/icons/Icon";
import { api } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
  const router = useRouter();

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
      if (res.data.user.role_id === 2) {
        router.push("/dashboard/problems");
        return;
      }
      router.push("/");
      return;
    }

    setIsLoading(false);
    router.push("/login");
  };

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10 pt-20">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/10 p-8 sm:p-12 z-10">
        <h2 className="mb-2 text-center text-3xl font-bold text-white">
          Create Account
        </h2>
        <p className="mb-10 text-center text-sm text-white/40">
          Register your CodeArea account
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <ThemedInput
            type="email"
            name="email"
            label="Email"
            value={formData.email}
            onChangeAction={handleInputChange}
            required
            placeholder="admin@codearea.app"
            className="text-white bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4"
          />

          <ThemedInput
            type="text"
            name="display_name"
            label="Display Name"
            value={formData.display_name}
            onChangeAction={handleInputChange}
            required
            placeholder="pupha"
            className="text-white bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4"
          />

          <ThemedInput
            type={showPassword ? "text" : "password"}
            name="password"
            label="Password"
            value={formData.password}
            onChangeAction={handleInputChange}
            required
            minLength={8}
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

          <ThemedInput
            type={showConfirmPassword ? "text" : "password"}
            name="confirm_password"
            label="Confirm Password"
            value={formData.confirm_password}
            onChangeAction={handleInputChange}
            required
            minLength={8}
            placeholder="••••••••"
            className="text-white bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4"
            rightSlot={
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="text-white/60 hover:text-white"
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                <Icon
                  name={showConfirmPassword ? "eye-off" : "eye"}
                  className="h-[18px] w-[18px]"
                />
              </button>
            }
          />

          <button
            type="submit"
            disabled={isLoading}
            className="flex h-14 w-full items-center justify-center rounded-2xl bg-primary font-bold text-white transition-all shadow-[0_0_25px_rgba(139,92,246,0.4)] hover:bg-primary-hover hover:shadow-[0_0_35px_rgba(139,92,246,0.6)] disabled:opacity-50"
          >
            {isLoading ? "Registering..." : "Register"}
          </button>

          {errorMessage ? (
            <p className="text-center text-sm text-red-400">{errorMessage}</p>
          ) : null}
        </form>

        <div className="mt-10 border-t border-white/5 pt-8 text-center">
          <p className="text-sm text-white/40">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-primary hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
