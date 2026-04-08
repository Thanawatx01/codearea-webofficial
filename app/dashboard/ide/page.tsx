"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Icon } from "@/components/icons/Icon";
import CodeExecutor from "@/components/editor/CodeExecutor";
import { ThemedInput, ThemedSelect } from "@/components/FormControls";
import Swal from "sweetalert2";
import { api } from "@/lib/api";

export default function IDEPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");

  const [appliedType, setAppliedType] = useState<"piston" | "judge0">("piston");
  const [appliedUrl, setAppliedUrl] = useState("");

  const [draftType, setDraftType] = useState<"piston" | "judge0">("piston");
  const [draftUrl, setDraftUrl] = useState("");

  const [isTesting, setIsTesting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if user is admin
    try {
      const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setIsAdmin(user.role_id === 2);
      }
    } catch { }

    const loadConfig = async () => {
      // 1. Fetch config from global DB settings
      const res = await api.get<any>("/settings/executor");

      let activeType: "piston" | "judge0" = "piston";
      let activeUrl = "http://localhost:5000/api/executor";

      if (res.ok && res.data) {
        activeType = res.data.type || activeType;
        activeUrl = res.data.url || activeUrl;
      } else {
        // Fallback
        activeType = (process.env.NEXT_PUBLIC_EXECUTOR as "piston" | "judge0") || "piston";
        if (activeType === "piston") {
          activeUrl = process.env.NEXT_PUBLIC_PISTON_URL || "http://localhost:5000/api/executor";
        } else {
          activeUrl = process.env.NEXT_PUBLIC_JUDGE0_URL || "http://localhost:2358";
        }
      }

      setAppliedType(activeType);
      setAppliedUrl(activeUrl);
      setDraftType(activeType);
      setDraftUrl(activeUrl);

      // 2. Silently test it to paint the "Connected" UI correctly
      try {
        const testRes = await api.post(`/executor/test`, {
          executor_url: activeUrl,
          type: activeType,
        });

        if (testRes.ok) {
          setConnectionStatus("connected");
        } else {
          setConnectionStatus("disconnected");
        }
      } catch {
        setConnectionStatus("disconnected");
      }

      setIsLoaded(true);
    };

    loadConfig();
  }, []);

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as "piston" | "judge0";
    let newUrl = draftUrl;
    if (val === "piston" && (newUrl === "" || newUrl.includes("2358"))) {
      newUrl = process.env.NEXT_PUBLIC_PISTON_URL || "http://localhost:5000/api/executor";
    } else if (val === "judge0" && (newUrl === "" || newUrl.includes("5000"))) {
      newUrl = process.env.NEXT_PUBLIC_JUDGE0_URL || "http://localhost:2358";
    }
    setDraftType(val);
    setDraftUrl(newUrl);
  };

  const handleTestAndApply = async () => {
    if (!draftUrl) {
      return Swal.fire({ icon: "warning", title: "URL ไม่ถูกต้อง", text: "กรุณาระบุ URL ของ Executor", background: "#1a1c2e", color: "#fff" });
    }

    setIsTesting(true);
    const endpoint = draftUrl.replace(/\/$/, "");

    try {
      const testRes = await api.post(`/executor/test`, {
        executor_url: endpoint,
        type: draftType,
      });

      if (!testRes.ok) {
        throw new Error(`HTTP Error: ${testRes.status} ${testRes.error || ""}`);
      }

      // If test passes, Apply configuration to Backend Global Settings
      const saveRes = await api.post<{ success: boolean; message: string }>("/settings/executor", {
        type: draftType,
        url: draftUrl
      }, { useToken: true });

      if (!saveRes.ok) {
        throw new Error(`Save Failed: ${saveRes.error}`);
      }

      // Automatically sync UI config and close panel
      setAppliedType(draftType);
      setAppliedUrl(draftUrl);
      setConnectionStatus("connected");
      setIsPanelOpen(false);

      Swal.fire({
        icon: "success",
        title: "ตั้งค่าระบบสำเร็จ",
        text: `เชื่อมต่อและอัปเดตระบบเป็น ${draftType.toUpperCase()} ที่ ${endpoint} แล้ว (Global)`,
        background: "#1a1c2e",
        color: "#fff",
        timer: 2000,
        showConfirmButton: false
      });
    } catch (e: any) {
      setConnectionStatus("disconnected");
      Swal.fire({
        icon: "error",
        title: "บันทึกการตั้งค่าล้มเหลว",
        text: e.message === "Failed to fetch" ? "ไม่สามารถติดต่อ Server ได้ (CORS หรือ Network)" : e.message,
        background: "#1a1c2e",
        color: "#fff",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleRemoveConnection = async () => {
    const result = await Swal.fire({
      title: "ยืนยันการลบการเชื่อมต่อ?",
      text: "ระบบจะกลับไปใช้ค่าเริ่มต้น (Piston @ Localhost) สำหรับผู้ใช้งานทุกคน",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบการเชื่อมต่อ",
      cancelButtonText: "ยกเลิก",
      background: "#1a1c2e",
      color: "#fff",
      confirmButtonColor: "#f43f5e",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await api.delete("/settings/executor", { useToken: true });
      if (!res.ok) throw new Error(res.error || "Failed to delete");

      // Reset local state to fallback defaults
      const defaultType = (process.env.NEXT_PUBLIC_EXECUTOR as "piston" | "judge0") || "piston";
      let defaultUrl = "";
      if (defaultType === "piston") {
        defaultUrl = process.env.NEXT_PUBLIC_PISTON_URL || "http://localhost:5000/api/executor";
      } else {
        defaultUrl = process.env.NEXT_PUBLIC_JUDGE0_URL || "http://localhost:2358";
      }

      setAppliedType(defaultType);
      setAppliedUrl(defaultUrl);
      setDraftType(defaultType);
      setDraftUrl(defaultUrl);
      setConnectionStatus("connecting");
      setIsPanelOpen(false);

      Swal.fire({
        icon: "success",
        title: "ลบการเชื่อมต่อสำเร็จ",
        text: "ระบบรีเซ็ตกลับเป็นค่าเริ่มต้นแล้ว",
        background: "#1a1c2e",
        color: "#fff",
        timer: 1500,
        showConfirmButton: false
      });

      // Try to re-ping the default
      loadConfig();
    } catch (e: any) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: e.message,
        background: "#1a1c2e",
        color: "#fff",
      });
    }
  };

  const loadConfig = async () => {
    // 1. Fetch config from global DB settings
    const res = await api.get<any>("/settings/executor");

    let activeType: "piston" | "judge0" = "piston";
    let activeUrl = "http://localhost:5000/api/executor";

    if (res.ok && res.data) {
      activeType = res.data.type || activeType;
      activeUrl = res.data.url || activeUrl;
    } else {
      // Fallback
      activeType = (process.env.NEXT_PUBLIC_EXECUTOR as "piston" | "judge0") || "piston";
      if (activeType === "piston") {
        activeUrl = process.env.NEXT_PUBLIC_PISTON_URL || "http://localhost:5000/api/executor";
      } else {
        activeUrl = process.env.NEXT_PUBLIC_JUDGE0_URL || "http://localhost:2358";
      }
    }

    setAppliedType(activeType);
    setAppliedUrl(activeUrl);
    setDraftType(activeType);
    setDraftUrl(activeUrl);

    // 2. Silently test it to paint the "Connected" UI correctly
    try {
      const testRes = await api.post(`/executor/test`, {
        executor_url: activeUrl,
        type: activeType,
      });

      if (testRes.ok) {
        setConnectionStatus("connected");
      } else {
        setConnectionStatus("disconnected");
      }
    } catch {
      setConnectionStatus("disconnected");
    }

    setIsLoaded(true);
  };

  if (!isLoaded) return null;

  return (
    <>
      <Header
        title="IDE Sandbox"
        icon={<Icon name="problem" className="h-5 w-5 text-emerald-400" />}
      />
      <main className="w-full min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-4 sm:px-6 pb-12 pt-6 lg:pt-8 bg-transparent">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">

          {/* Status Header Bar */}
          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm relative overflow-hidden">

            {/* Left - Status */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Icon name="code" className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-wide text-white/90 flex items-center gap-2">
                  IDE Sandbox
                </h3>
                <div className="flex items-center gap-1.5 mt-1">
                  {connectionStatus === "connecting" && (
                    <>
                      <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                      <span className="text-xs text-white/50">กำลังเชื่อมต่อ...</span>
                    </>
                  )}
                  {connectionStatus === "connected" && (
                    <>
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      <span className="text-xs text-emerald-400 font-medium">เชื่อมต่อแล้ว ({appliedType.toUpperCase()})</span>
                    </>
                  )}
                  {connectionStatus === "disconnected" && (
                    <>
                      <div className="w-2 h-2 rounded-full bg-rose-500" />
                      <span className="text-xs text-rose-400 font-medium">ยังไม่ได้เชื่อมต่อ</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right - Edit toggle (Admins Only) */}
            {isAdmin && (
              <button
                onClick={() => setIsPanelOpen(!isPanelOpen)}
                className={`h-10 px-4 rounded-lg flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all
                   ${isPanelOpen
                    ? "bg-white/10 text-white hover:bg-white/20"
                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                  }
                 `}
              >
                <Icon name={isPanelOpen ? "settings" : "plug"} className="w-4 h-4" />
                {isPanelOpen ? "ปิดการตั้งค่า" : "เชื่อมต่อ"}
              </button>
            )}
          </div>

          {/* Admin Configuration Dropdown */}
          {isAdmin && isPanelOpen && (
            <section className="animate-in fade-in slide-in-from-top-2 duration-300 bg-black/40 backdrop-blur-3xl rounded-3xl border border-emerald-500/20 p-6 flex flex-col md:flex-row gap-6 items-start md:items-end shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] -z-10 mix-blend-screen"></div>

              <div className="flex-1 w-full space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ThemedSelect
                    label="ประเภท Engine"
                    value={draftType}
                    onChangeAction={handleTypeChange}
                    className="h-12 border-white/10 bg-white/5 focus:border-emerald-500/50"
                  >
                    <option value="piston" className="text-black">Piston Engine</option>
                    <option value="judge0" className="text-black">Judge0 Engine</option>
                  </ThemedSelect>

                  <ThemedInput
                    label="API Engine URL"
                    value={draftUrl}
                    onChangeAction={(e) => setDraftUrl(e.target.value)}
                    placeholder="http://localhost:5000/api/executor"
                    className="h-12 border-white/10 bg-white/5 focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="w-full md:w-auto pb-1 shrink-0 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleRemoveConnection}
                  className="h-12 px-5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 active:scale-95 transition-all flex items-center justify-center"
                  title="ลบการเชื่อมต่อปัจจุบัน"
                >
                  <Icon name="trash" className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleTestAndApply}
                  disabled={isTesting}
                  className="flex-1 md:w-auto h-12 px-8 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-xs font-black uppercase tracking-widest text-white hover:bg-emerald-500/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isTesting ? (
                    <Icon name="clock" className="w-4 h-4 animate-spin" />
                  ) : (
                    <Icon name="check" className="w-4 h-4" />
                  )}
                  {isTesting ? "กำลังทดสอบการเชื่อมต่อ..." : "ทดสอบและบันทึกค่า"}
                </button>
              </div>
            </section>
          )}

          {/* IDE Editor */}
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <CodeExecutor executorType={appliedType} executorUrl={appliedUrl} />
          </section>
        </div>
      </main>
    </>
  );
}
