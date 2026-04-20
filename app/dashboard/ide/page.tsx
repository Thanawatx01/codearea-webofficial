"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Icon } from "@/components/icons/Icon";
import CodeExecutor from "@/components/editor/CodeExecutor";
import { api } from "@/lib/api";
import Link from "next/link";

export default function IDEPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const [appliedType, setAppliedType] = useState<"piston" | "judge0">("piston");
  const [appliedUrl, setAppliedUrl] = useState("");
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
      try {
        const execRes = await api.get<any>("/settings/executor");

        let activeType: "piston" | "judge0" = "piston";
        let activeUrl = "http://localhost:3100/api/executor";

        if (execRes.ok && execRes.data) {
          activeType = execRes.data.type || activeType;
          activeUrl = execRes.data.url || activeUrl;
        }

        setAppliedType(activeType);
        setAppliedUrl(activeUrl);

        const testRes = await api.post(`/executor/test`, {
          executor_url: activeUrl.replace(/\/$/, ""),
          type: activeType,
        });

        if (testRes.ok) {
          setConnectionStatus("connected");
        } else {
          setConnectionStatus("disconnected");
        }
      } catch (err) {
        setConnectionStatus("disconnected");
      } finally {
        setIsLoaded(true);
      }
    };

    loadConfig();
  }, []);

  const isConfigLocked = connectionStatus === "disconnected";
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
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Icon name="code" className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-wide text-white/90">IDE Sandbox</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  {connectionStatus === "connecting" && (
                    <span className="text-xs text-white/50 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />กำลังเชื่อมต่อ...</span>
                  )}
                  {connectionStatus === "connected" && (
                    <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />เชื่อมต่อแล้ว ({appliedType.toUpperCase()})</span>
                  )}
                  {connectionStatus === "disconnected" && (
                    <span className="text-xs text-rose-400 font-medium flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500" />ยังไม่ได้เชื่อมต่อระบบ</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
               {/* No more local settings button needed */}
            </div>
          </div>
          {/* Configuration Setup View / Dropdown */}
          {isAdmin && isConfigLocked && (
            <section className="animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="bg-white/5 backdrop-blur-3xl rounded-3xl border border-rose-500/20 p-8 text-center">
                <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icon name="clock" className="w-8 h-8 text-rose-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Setup Required</h3>
                <p className="text-sm text-white/40 max-w-md mx-auto mb-8 leading-relaxed">
                  กรุณาตั้งค่า Executor API ในหน้าการกำหนดค่าระบบก่อนเข้าใช้งาน IDE Sandbox เพื่อให้ระบบสามารถประมวลผลโค้ดของคุณได้
                </p>
                <Link 
                  href="/dashboard/configurations"
                  className="inline-flex items-center gap-2 h-12 px-8 rounded-xl bg-white text-black text-sm font-black uppercase tracking-widest hover:bg-white/90 transition-all shadow-[0_8px_32px_rgba(255,255,255,0.15)]"
                >
                   <Icon name="settings" className="h-4 w-4" />
                   ไปที่หน้าการตั้งค่า
                </Link>
              </div>
            </section>
          )}

          {/* IDE Editor - Only show if connected */}
          {!isConfigLocked && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <CodeExecutor executorType={appliedType} executorUrl={appliedUrl} />
            </section>
          )}
        </div>
      </main>
    </>
  );
}
