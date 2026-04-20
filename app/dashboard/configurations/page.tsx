"use client";

import { useEffect, useState, type ChangeEvent, type ReactNode } from "react";
import Header from "@/components/Header";
import { Icon } from "@/components/icons/Icon";
import { api } from "@/lib/api";
import Swal from "sweetalert2";
import { ThemedInput, ThemedSelect } from "@/components/FormControls";

// --- Types ---

interface ExecutorConfig {
  type: "piston" | "judge0";
  url: string;
  [key: string]: any;
}

interface AIConfig {
  url: string;
  [key: string]: any;
}

// --- Shared Section Component ---

interface ConfigCardProps {
  title: string;
  subtitle: string;
  icon: string;
  accentColor: string; // e.g., "blue", "purple", "emerald"
  children: ReactNode;
  footerLeft?: ReactNode;
  footerRight: ReactNode;
}

/**
 * A reusable, premium-styled card for configuration sections.
 */
function ConfigCard({
  title,
  subtitle,
  icon,
  accentColor,
  children,
  footerLeft,
  footerRight,
}: ConfigCardProps) {
  const colorMap: Record<string, string> = {
    blue: "text-blue-400 group-hover:text-blue-300",
    purple: "text-purple-400 group-hover:text-purple-300",
    emerald: "text-emerald-400 group-hover:text-emerald-300",
  };

  return (
    <section className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d0e14]/40 backdrop-blur-3xl transition-all duration-500 hover:border-white/20 hover:bg-[#0d0e14]/60 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      {/* Decorative Gradient Glow */}
      <div className={`absolute -right-20 -top-20 h-64 w-64 rounded-full bg-${accentColor}-500/5 blur-[100px] transition-opacity group-hover:opacity-100`} />

      {/* Header */}
      <div className="border-b border-white/5 bg-white/[0.01] px-8 py-7">
        <div className="flex items-center gap-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/5 shadow-inner transition-transform duration-500 group-hover:scale-110 ${colorMap[accentColor] || "text-white/80"}`}>
            <Icon name={icon as any} className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-[13px] font-black uppercase tracking-[0.2em] text-white/90">
              {title}
            </h2>
            <p className="mt-1 text-[11px] font-medium tracking-wide text-white/40">
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-8">
        <div className="space-y-6">
          {children}
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/5 bg-white/[0.01] px-8 py-6">
        <div className="flex gap-2.5">
          {footerLeft}
        </div>
        <div>
          {footerRight}
        </div>
      </div>
    </section>
  );
}

// --- Sub-components ---

function ExecutorSection() {
  const [executor, setExecutor] = useState<ExecutorConfig>({ type: "piston", url: "" });
  const [originalExecutor, setOriginalExecutor] = useState<ExecutorConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await api.get<ExecutorConfig>("/settings/executor", { useToken: true });
      if (res.ok && res.data) {
        setExecutor(res.data);
        setOriginalExecutor(res.data);
      }
      setLoading(false);
    }
    void load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const res = await api.post("/settings/executor", executor, { useToken: true });
    setSaving(false);
    if (res.ok) {
      setOriginalExecutor(executor);
      void Swal.fire({ icon: "success", title: "บันทึกเรียบร้อย", text: "บันทึกการตั้งค่า Executor สำเร็จ", confirmButtonColor: "#3b82f6", background: "#1a1c2e", color: "#fff" });
    } else {
      void Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด", text: res.error || "ไม่สามารถบันทึกการตั้งค่าได้", background: "#1a1c2e", color: "#fff" });
    }
  };

  const handleReset = async () => {
    const result = await Swal.fire({
      title: "คืนค่าเริ่มต้น?",
      text: "ระบบจะกลับไปใช้ค่าเริ่มต้น (Piston) สำหรับงานประมวลผลโค้ด",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "รีเซ็ต",
      cancelButtonText: "ยกเลิก",
      background: "#1a1c2e",
      color: "#fff",
      confirmButtonColor: "#f43f5e",
    });
    if (!result.isConfirmed) return;
    try {
      const res = await api.delete("/settings/executor", { useToken: true });
      if (!res.ok) throw new Error(res.error || "Failed to delete");
      setExecutor({ type: "piston", url: "http://localhost:3100/api/executor" });
      setOriginalExecutor(null);
      Swal.fire({ icon: "success", title: "รีเซ็ตสำเร็จ", background: "#1a1c2e", color: "#fff", timer: 1500, showConfirmButton: false });
    } catch (e: any) {
      Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด", text: e.message, background: "#1a1c2e", color: "#fff" });
    }
  };

  const testExecutor = async () => {
    setTesting(true);
    try {
      const res = await api.post("/executor/test", { executor_url: executor.url, type: executor.type }, { useToken: true });
      if (res.ok) {
        void Swal.fire({ icon: "success", title: "เชื่อมต่อสำเร็จ", text: "สามารถเชื่อมต่อกับ Executor API ได้ปกติ", confirmButtonColor: "#10b981", background: "#1a1c2e", color: "#fff" });
      } else {
        throw new Error(res.error || "เชื่อมต่อไม่สำเร็จ");
      }
    } catch (err: any) {
      void Swal.fire({ icon: "error", title: "การเชื่อมต่อล้มเหลว", text: err.message, background: "#1a1c2e", color: "#fff" });
    } finally { setTesting(false); }
  };

  if (loading) return null;

  return (
    <ConfigCard
      title="Executor API Configuration"
      subtitle="ตั้งค่าเซิร์ฟเวอร์สำหรับการประมวลผลโค้ด (Piston หรือ Judge0)"
      icon="ide"
      accentColor="blue"
      footerLeft={
        <>
          <button onClick={testExecutor} disabled={testing || !executor.url} className="h-11 px-5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white/80 hover:bg-white/10 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50">
            {testing ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-transparent" /> : <Icon name="activity" className="h-4 w-4" />}
            ทดสอบ
          </button>
          <button onClick={handleReset} className="h-11 px-4 rounded-xl bg-rose-500/5 border border-rose-500/10 text-rose-400 hover:bg-rose-500/10 transition-all active:scale-95" title="คืนค่าเริ่มต้น">
            <Icon name="trash" className="h-4 w-4" />
          </button>
        </>
      }
      footerRight={
        <button onClick={handleSave} disabled={saving} className="h-11 px-8 rounded-xl bg-blue-600 shadow-[0_4px_20px_rgba(37,99,235,0.3)] text-xs font-black uppercase tracking-widest text-white hover:bg-blue-500 hover:scale-[1.02] transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50">
          {saving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-transparent" /> : <Icon name="check" className="h-4 w-4" />}
          บันทึก Executor
        </button>
      }
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <ThemedSelect label="ประเภท Engine" value={executor.type} onChangeAction={(e: ChangeEvent<HTMLSelectElement>) => setExecutor({ ...executor, type: e.target.value as any })}>
          <option value="piston">Piston Engine</option>
          <option value="judge0">Judge0 Engine</option>
        </ThemedSelect>
        <ThemedInput label="API URL" value={executor.url} onChangeAction={(e: ChangeEvent<HTMLInputElement>) => setExecutor({ ...executor, url: e.target.value })} placeholder="http://localhost:3100/api/executor"
          rightSlot={
            <button onClick={() => setExecutor({ ...executor, url: "http://localhost:3100/api/executor" })} className="text-[9px] font-bold bg-white/5 border border-white/10 px-2 py-1 rounded hover:bg-white/10 transition-colors text-white/60">
              DEFAULT
            </button>
          }
        />
      </div>
      {originalExecutor && (
        <p className="flex items-center gap-2 px-1 text-[10px] font-medium text-white/30">
          <Icon name="history" className="h-3.5 w-3.5" />
          Current Database Value: <span className="text-white/50">{originalExecutor.url}</span>
        </p>
      )}
    </ConfigCard>
  );
}

function AISection() {
  const [ai, setAi] = useState<AIConfig>({ url: "" });
  const [originalAi, setOriginalAi] = useState<AIConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await api.get<AIConfig>("/settings/ai", { useToken: true });
      if (res.ok && res.data) {
        setAi(res.data);
        setOriginalAi(res.data);
      }
      setLoading(false);
    }
    void load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const res = await api.post("/settings/ai", ai, { useToken: true });
    setSaving(false);
    if (res.ok) {
      setOriginalAi(ai);
      void Swal.fire({ icon: "success", title: "บันทึกเรียบร้อย", text: "บันทึกการตั้งค่า AI Tutor URL สำเร็จ", confirmButtonColor: "#3b82f6", background: "#1a1c2e", color: "#fff" });
    } else {
      void Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด", text: res.error || "ไม่สามารถบันทึกการตั้งค่าได้", background: "#1a1c2e", color: "#fff" });
    }
  };

  const handleReset = async () => {
    const result = await Swal.fire({
      title: "คืนค่าเริ่มต้น AI Agent?",
      text: "ระบบจะลบการตั้งค่า URL ที่คุณบันทึกไว้",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "รีเซ็ต",
      cancelButtonText: "ยกเลิก",
      background: "#1a1c2e",
      color: "#fff",
      confirmButtonColor: "#f43f5e",
    });
    if (!result.isConfirmed) return;
    try {
      const res = await api.delete("/settings/ai", { useToken: true });
      if (!res.ok) throw new Error(res.error || "Failed to delete");
      setAi({ url: "http://localhost:8080" });
      setOriginalAi(null);
      Swal.fire({ icon: "success", title: "รีเซ็ตสำเร็จ", timer: 1500, background: "#1a1c2e", color: "#fff", showConfirmButton: false });
    } catch (e: any) {
      Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด", text: e.message, background: "#1a1c2e", color: "#fff" });
    }
  };

  const testAi = async () => {
    setTesting(true);
    try {
      const res = await api.post("/settings/ai/test", { url: ai.url }, { useToken: true });
      if (res.ok) {
        void Swal.fire({ icon: "success", title: "เชื่อมต่อสำเร็จ", text: "สามารถเชื่อมต่อกับ AI Tutor API ได้ปกติ", confirmButtonColor: "#10b981", background: "#1a1c2e", color: "#fff" });
      } else {
        throw new Error(res.error || "เชื่อมต่อไม่สำเร็จ");
      }
    } catch (err: any) {
      void Swal.fire({ icon: "error", title: "การเชื่อมต่อล้มเหลว", text: "ไม่สามารถเชื่อมต่อกับ AI Connector: " + err.message, background: "#1a1c2e", color: "#fff" });
    } finally { setTesting(false); }
  };

  if (loading) return null;

  return (
    <ConfigCard
      title="AI Tutor Service Connection"
      subtitle="กำหนด URL ของ AI Tutor BaaS (Python Service) เพื่อใช้ในฟีเจอร์คำใบ้ วิเคราะห์ และเปรียบเทียบโค้ด"
      icon="rocket"
      accentColor="purple"
      footerLeft={
        <div className="flex flex-wrap gap-2">
          <button onClick={testAi} disabled={testing || !ai.url} className="h-11 px-5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white/80 hover:bg-white/10 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50">
            {testing ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-transparent" /> : <Icon name="activity" className="h-4 w-4" />}
            ทดสอบการเชื่อมต่อ
          </button>
          
          {ai.url && (
            <a 
              href={ai.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="h-11 px-5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-400 hover:bg-indigo-500/20 transition-all flex items-center gap-2 active:scale-95"
            >
              <Icon name="rocket" className="h-4 w-4" />
              Open BaaS Dashboard
            </a>
          )}

          <button onClick={handleReset} className="h-11 px-4 rounded-xl bg-rose-500/5 border border-rose-500/10 text-rose-400 hover:bg-rose-500/10 transition-all active:scale-95" title="คืนค่าเริ่มต้น">
            <Icon name="trash" className="h-4 w-4" />
          </button>
        </div>
      }
      footerRight={
        <button onClick={handleSave} disabled={saving} className="h-11 px-8 rounded-xl bg-purple-600 shadow-[0_4px_20px_rgba(147,51,234,0.3)] text-xs font-black uppercase tracking-widest text-white hover:bg-purple-500 hover:scale-[1.02] transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50">
          {saving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-transparent" /> : <Icon name="check" className="h-4 w-4" />}
          บันทึก AI Tutor Config
        </button>
      }
    >
      <ThemedInput label="AI Tutor BaaS URL" value={ai.url} onChangeAction={(e: ChangeEvent<HTMLInputElement>) => setAi({ ...ai, url: e.target.value })} placeholder="http://localhost:8080"
        rightSlot={
          <button onClick={() => setAi({ url: "http://localhost:8080" })} className="text-[9px] font-bold bg-white/5 border border-white/10 px-2 py-1 rounded hover:bg-white/10 transition-colors text-white/60">
            DEFAULT (LOCAL)
          </button>
        }
      />
      {originalAi && (
        <p className="flex items-center gap-2 px-1 text-[10px] font-medium text-white/30">
          <Icon name="history" className="h-3.5 w-3.5" />
          Current Database Value: <span className="text-white/50">{originalAi.url}</span>
        </p>
      )}
    </ConfigCard>
  );
}

// --- Main Page ---

export default function ConfigurationsPage() {
  return (
    <div className="min-h-screen bg-[#05060a] bg-linear-to-b from-[#05060a] to-[#0a0c14]">
      <Header
        title="การกำหนดค่าระบบ"
        icon={<Icon name="settings" className="h-5 w-5" />}
      />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-12 sm:px-10">
        <div className="flex flex-col gap-10 pb-20">
          <ExecutorSection />
          <AISection />
          {/* Note: Internal AI and Ollama configurations have been moved to a standalone BaaS UI */}
          <div className="rounded-3xl border border-dashed border-white/5 bg-white/[0.01] p-12 text-center">
            <Icon name="rocket" className="mx-auto h-10 w-10 text-white/10 mb-4" />
            <h3 className="text-sm font-black uppercase tracking-widest text-white/40">AI Services Configured Externally</h3>
            <p className="mt-2 text-xs font-medium text-white/20">Ollama and AI Agent settings are now managed via the dedicated AI Tutor BaaS interface.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
