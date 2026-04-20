"use client";

import { CodeAreaLogo } from "@/components/branding/CodeAreaLogo";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFoundPage() {
  const router = useRouter();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.replace("/dashboard");
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0B0B0F] p-6 text-white">
      <div className="pointer-events-none absolute left-[-10%] top-[-10%] h-[50%] w-[50%] rounded-full bg-primary/20 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-purple-600/10 blur-[100px]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_at_center,black,transparent_80%)]" />

      <section className="relative z-10 w-full max-w-xl rounded-4xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur-xl">
        <CodeAreaLogo
          showText
          className="mx-auto mb-6 flex items-center justify-center gap-2"
          iconClassName="h-9 w-9"
          textClassName="bg-linear-to-r from-white to-white/60 bg-clip-text text-lg font-bold tracking-tight text-transparent"
        />
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/40">
          Error 404
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">
          ไม่พบหน้าที่ต้องการ
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-white/60">
          หน้าที่คุณกำลังหาอาจถูกลบ เปลี่ยนชื่อ หรือยังไม่มีในระบบ กรุณากลับไปยัง
          หน้าหลักหรือหน้าโจทย์
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 text-sm font-semibold text-white/90 transition-all hover:bg-white/10"
          >
            กลับหน้าหลัก
          </Link>
          <button
            type="button"
            onClick={handleGoBack}
            className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-white shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all hover:bg-primary-hover"
          >
            ย้อนกลับ
          </button>
        </div>
      </section>
    </main>
  );
}
