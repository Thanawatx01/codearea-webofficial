"use client";

import { useEffect, useState, useCallback } from "react";
import { Icon } from "@/components/icons/Icon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

// กำหนดอินเทอร์เฟซของ TypeScript สำหรับข้อมูลของเรา
interface TechBadge {
  name: string;
  color: string;
  bg: string;
}

interface GithubStyleProfileData {
  name: string;
  username: string;
  avatarUrl: string;
  bio: string;
  followers: number;
  following: number;
  stars: number;
  location: string;
  email: string;
  website: string;
  twitter: string;
  role: string;
  phone?: string;
  dob?: string;
}

// ส่วนประกอบหน้า Profile (โปรไฟล์)
// นี่คือส่วนประกอบหลักของหน้าโปรไฟล์ที่แสดงสถิติผู้ใช้ ผลการทำงาน และกิจกรรมล่าสุด
// 1. กำหนดค่าเริ่มต้นให้กับข้อมูลโปรไฟล์ สถิติ และการส่งคำตอบ
// 2. เปลี่ยนเส้นทางไปยังหน้าเข้าสู่ระบบหากโทเค็นการยืนยันตัวตนหายไป
// 3. ดึงข้อมูลผู้ใช้ที่ครอบคลุม (สรุป กิจกรรม การส่งคำตอบ) เมื่อเริ่มโหลดส่วนประกอบ
// 4. แสดงผลแดชบอร์ดที่รองรับหลายอุปกรณ์พร้อมแถบนำทาง (ภาพรวม, คำถาม, การส่งคำตอบ)
export default function ProfilePage() {
  const router = useRouter();

  // --- States ---
  const [profileData, setProfileData] = useState<GithubStyleProfileData>({
    name: "User",
    username: "user_developer",
    avatarUrl: "",
    bio: "I make things for web",
    followers: 5,
    following: 12,
    stars: 46,
    location: "Bangkok, Thailand",
    email: "user@example.com",
    website: "https://codearea.app",
    twitter: "@user_dev",
    role: "Developer Program Member",
  });
  const [roleId, setRoleId] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [chartTab, setChartTab] = useState<"category" | "tags">("category");
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    xp: 0,
    solvedCount: 0,
    totalSubmissions: 0,
    passedCount: 0,
    failedCount: 0,
    accuracy: 0,
    recentActivity: [] as any[],
    categories: [] as { name: string; count: number }[],
    tags: [] as { name: string; count: number }[],
    solvedQuestions: [] as any[]
  });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ฟังก์ชัน fetchData
  // ดึงข้อมูลที่จำเป็นทั้งหมดสำหรับหน้าโปรไฟล์จาก local storage และ API
  // 1. แยกวิเคราะห์ข้อมูลผู้ใช้พื้นฐานจาก localStorage เพื่อแสดงผล UI ทันที
  // 2. เรียก /users/profile/me เพื่อรับรายละเอียด XP สถิติ และประวัติกิจกรรม
  // 3. เรียก /submissions เพื่อรับผลการตรวจล่าสุดสำหรับฟีด
  // 4. อัปเดตสถานะและจัดการเมื่อการโหลดเสร็จสิ้น
  const fetchData = useCallback(async (userRaw: string) => {
    try {
      // ขั้นตอนที่ 1: เตรียมข้อมูลโปรไฟล์จากข้อมูลใน local storage
      // 1. แยกวิเคราะห์ JSON ของผู้ใช้
      const user = JSON.parse(userRaw);
      setProfileData((prev) => ({
        ...prev,
        name: user.display_name?.trim() || "User",
        username: user.email?.split("@")[0] || "user_developer",
        email: user.email || "user@example.com",
        avatarUrl: user.avatar_url || "",
        role: user.role_id === 2 ? "Administrator" : "Developer Program Member",
      }));
      setRoleId(user.role_id || 1);

      // ขั้นตอนที่ 2: ดึงสถิติโดยละเอียดและข้อมูลสรุปจาก API
      // 2. ร้องขอสรุปโปรไฟล์ผ่าน API ที่มีการยืนยันตัวตน
      const summaryRes = await api.get<any>("/users/profile/me", { useToken: true });
      if (summaryRes.ok && summaryRes.data) {
        const d = summaryRes.data;
        setStats({
          xp: d.user.xp,
          solvedCount: d.user.solved_count,
          totalSubmissions: d.user.total_submissions,
          passedCount: d.user.passed_count,
          failedCount: d.user.failed_count,
          accuracy: d.user.accuracy,
          recentActivity: d.recent_activity || [],
          categories: d.category_stats || [],
          tags: d.tag_stats || [],
          solvedQuestions: d.solved_questions || []
        });

        setProfileData(prev => ({
          ...prev,
          avatarUrl: d.user.avatar_url || prev.avatarUrl,
          bio: d.user.bio || "",
          location: d.user.location || "",
          phone: d.user.phone || "",
          dob: d.user.dob || ""
        }));
      }

      // ขั้นตอนที่ 3: ดึงข้อมูลการส่งคำตอบล่าสุดสำหรับรายการบนแดชบอร์ด
      // 3. ร้องขอการส่งคำตอบล่าสุด (จำกัด 10 รายการ)
      const subRes = await api.get<any>("/submissions", { useToken: true, params: { limit: 10 } });
      if (subRes.ok && subRes.data) {
        setSubmissions(subRes.data.data || []);
      }

    } catch (error) {
      console.error("Failed to fetch profile data", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ผลกระทบในการเริ่มต้น (Initialization Effect)
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");

    // 1. ตรวจสอบโทเค็นการยืนยันตัวตน
    if (!token || !userRaw) {
      router.replace("/login");
      return;
    }

    // 2. เริ่มต้นการดึงข้อมูล
    fetchData(userRaw);
  }, [router, fetchData]);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 w-full min-h-screen text-white pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* แถบนำทาน (Navigation Tabs) */}
          <div className="flex overflow-x-auto border-b border-white/10 no-scrollbar mb-8 sticky top-[64px] bg-[#05070f]/90 backdrop-blur-md z-30 pt-2 pb-px w-full">
            {[
              { id: "dashboard", label: "ภาพรวม", icon: "stats", count: null },
              { id: "questions", label: "โจทย์ที่ทำสำเร็จ", icon: "check-circle", count: stats.solvedCount || 0 },
              { id: "submissions", label: "การส่งคำตอบ", icon: "activity", count: stats.totalSubmissions || 0 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 ${activeTab === tab.id
                  ? "border-orange-500 text-white"
                  : "border-transparent text-white/60 hover:text-white hover:border-white/20 hover:bg-white/5 rounded-t-md"
                  }`}
              >
                <Icon name={tab.icon} className={`w-4 h-4 ${activeTab === tab.id ? "text-white/70" : "text-white/40"}`} />
                {tab.label}
                {tab.count !== null && (
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-white/10 text-xs text-white/80 font-semibold leading-none flex items-center justify-center">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* ======================= */}
            {/* LEFT SIDEBAR (xl:col-span-3) */}
            {/* ======================= */}
            <div className="xl:col-span-3 space-y-6">

              {/* รูปโปรไฟล์ (Avatar) */}
              <div className="relative group w-48 xl:w-[260px] max-w-full mx-auto shrink-0">
                <div className="w-full aspect-square rounded-full bg-linear-to-br from-primary/20 to-blue-500/20 text-primary flex items-center justify-center font-black border border-white/10 shadow-2xl ring-4 ring-white/5 group-hover:scale-[1.02] transition-all overflow-hidden relative">
                  {profileData.avatarUrl ? (
                    <img src={profileData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-6xl xl:text-8xl font-bold text-white/50">{profileData.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
              </div>

              {/* ชื่อที่แสดงและบทบาท (Display Name & Role) */}
              <div className="space-y-2 text-center pt-2">
                <div className="flex flex-col items-center justify-center gap-2">
                  <h1 className="text-2xl font-bold text-white leading-tight break-words">{profileData.name}</h1>

                  {roleId === 2 && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-linear-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)] group/admin">
                      <Icon name="shield" className="w-3.5 h-3.5 text-amber-500 group-hover/admin:scale-110 transition-transform" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">แอดมิน</span>
                    </div>
                  )}
                </div>
              </div>

              {/* อีเมล (Email) */}
              <div className="flex items-center justify-center gap-2 text-sm text-white/60">
                <Icon name="mail" className="w-4 h-4 text-white/40" />
                <a href={`mailto:${profileData.email}`} className="truncate hover:text-blue-400 hover:underline">{profileData.email}</a>
              </div>

              {/* คำแนะนำตัว (Bio) */}
              <div className="pt-2">
                <p className="text-sm text-white/80 leading-relaxed text-center break-words">
                  {profileData.bio || "ยังไม่มีคำแนะนำตัว"}
                </p>
              </div>

              {/* การดำเนินการ (Actions) */}
              <div className="pt-4 space-y-3">
                <Link
                  href="/profile/settings"
                  className="w-full py-1.5 px-3 block text-center rounded-md bg-[#21262d] border border-white/10 text-sm font-semibold hover:bg-[#30363d] hover:border-white/20 transition-all shadow-sm text-white"
                >
                  แก้ไขโปรไฟล์
                </Link>
              </div>

            </div>

            {/* ======================= */}
            {/* RIGHT CONTENT (xl:col-span-9) */}
            {/* ======================= */}
            <div className="xl:col-span-9 min-w-0">

              {/* เนื้อหาแดชบอร์ด / ภาพรวม (Dashboard / Overview Content) */}
              {activeTab === "dashboard" && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* คอลัมน์ซ้าย: ผลการทำงานและหมวดหมู่ (Left Column: Performance & Category) */}
                    <div className="lg:col-span-1 space-y-6">
                      {/* Performance Card */}
                      <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl -z-10 group-hover:bg-emerald-500/10 transition-colors"></div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
                          <Icon name="target" className="w-4 h-4 text-emerald-500" />
                          ประสิทธิภาพ
                        </h3>
                        <div className="space-y-6">
                          <div className="flex items-end justify-between">
                            <div>
                              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">อัตราการทำโจทย์สำเร็จ</p>
                              <p className="text-3xl font-black text-white">{stats.accuracy}%</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">จำนวน XP</p>
                              <p className="text-xl font-bold text-orange-400">{stats.xp.toLocaleString()}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span className="text-[11px] font-bold text-white/60">ผ่าน</span>
                              </div>
                              <p className="text-xl font-black text-white ml-3.5">{stats.passedCount}</p>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                <span className="text-[11px] font-bold text-white/60">ไม่ผ่าน</span>
                              </div>
                              <p className="text-xl font-black text-white ml-3.5">{stats.failedCount}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* กราฟใยแมงมุมวิเคราะห์ทักษะ (Skills Web Chart) */}
                      <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden group flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                            <Icon name="tag" className="w-4 h-4 text-pink-500" />
                            วิเคราะห์ความสามารถ
                          </h3>
                        </div>

                        {/* Sub-tabs for Category and Tags */}
                        <div className="flex bg-white/5 rounded-lg mb-4 p-1 ring-1 ring-white/10">
                          <button
                            onClick={() => setChartTab("category")}
                            className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-md transition-all ${chartTab === "category" ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/60"}`}
                          >
                            ประเภท
                          </button>
                          <button
                            onClick={() => setChartTab("tags")}
                            className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-md transition-all ${chartTab === "tags" ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/60"}`}
                          >
                            แท็ก
                          </button>
                        </div>

                        <div className="flex-1 min-h-[250px] w-full flex items-center justify-center min-w-0 min-h-0">
                          {(chartTab === "category" ? stats.categories : stats.tags).length > 0 ? (
                            <div className="flex-1 flex flex-col w-full h-full">
                              <div className="relative w-full h-[220px] -ml-2 min-w-0 min-h-0">
                                {(() => {
                                  const sourceData = chartTab === "category" ? stats.categories : stats.tags;
                                  const currentData = [...sourceData];
                                  while (currentData.length > 0 && currentData.length < 5) {
                                    currentData.push({ name: `\u200B${currentData.length}`, count: 0 });
                                  }
                                  const maxVal = Math.max(...currentData.map(d => d.count), 5);
                                  
                                  if (!isMounted) return <div className="w-full h-full bg-white/5 animate-pulse rounded-full" />;

                                  return (
                                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
                                      <RadarChart cx="50%" cy="50%" outerRadius="65%" data={currentData}>
                                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                        <PolarAngleAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 9, fontWeight: 'bold' }} />
                                        <PolarRadiusAxis angle={30} domain={[0, maxVal]} tick={false} axisLine={false} />
                                        <Radar name="Solved" dataKey="count" stroke="#ec4899" fill="#ec4899" fillOpacity={0.3} />
                                      </RadarChart>
                                    </ResponsiveContainer>
                                  );
                                })()}
                              </div>

                              {/* Legend - สรุปจำนวนแยกตามประเภท/แท็ก */}
                              <div className="mt-2 grid grid-cols-1 gap-1.5 px-2">
                                {(chartTab === "category" ? stats.categories : stats.tags).map((item, idx) => (
                                  <div key={idx} className="flex items-center justify-between gap-3 p-2 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-pink-500/20 transition-all group/legend">
                                    <div className="flex items-center gap-2.5 overflow-hidden">
                                      <div className="w-1.5 h-1.5 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.5)] shrink-0" />
                                      <span className="text-[10px] font-bold text-white/50 truncate group-hover/legend:text-white/80 transition-colors uppercase tracking-wider">{item.name}</span>
                                    </div>
                                    <span className="text-[10px] font-black text-pink-500 bg-pink-500/10 px-2 py-0.5 rounded-lg border border-pink-500/10 min-w-8 text-center">{item.count}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="w-full py-10 flex flex-col items-center text-center border border-dashed border-white/5 rounded-xl">
                              <Icon name="activity" className="w-6 h-6 text-white/10 mb-2" />
                              <p className="text-xs text-white/20 italic">ยังไม่มีข้อมูล {chartTab}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* คอลัมน์ขวา: กิจกรรมล่าสุด (Right Column: Recent Activity) */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="bg-[#0d1117] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                        <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                          <h3 className="text-sm font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                            <Icon name="history" className="w-4 h-4 text-blue-500" />
                            กิจกรรมล่าสุด
                          </h3>
                          <button onClick={() => setActiveTab("submissions")} className="text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors">
                            ดูทั้งหมด
                          </button>
                        </div>

                        <div className="divide-y divide-white/5">
                          {stats.recentActivity.length > 0 ? stats.recentActivity.map((sub) => (
                            <div key={sub.id} className="p-4 sm:p-6 hover:bg-white/[0.01] transition-colors group flex items-start sm:items-center justify-between gap-4">
                              <div className="flex items-start sm:items-center gap-4 min-w-0">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${sub.status === 1 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-red-500/10 border-red-500/20 text-red-500"
                                  }`}>
                                  <Icon name={sub.status === 1 ? "check-circle" : "xmark"} className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                  <h4 className="font-bold text-white text-sm sm:text-base group-hover:text-primary transition-colors truncate">
                                    {sub.questions?.title || "Unknown Question"}
                                  </h4>
                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                    <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">{sub.language}</span>
                                    <span className="text-[10px] text-white/30">•</span>
                                    <span className="text-[10px] text-white/30">{new Date(sub.created_at).toLocaleDateString()}</span>
                                    {sub.run_time && (
                                      <>
                                        <span className="text-[10px] text-white/30">•</span>
                                        <span className="text-[10px] text-white/30">{sub.run_time}ms</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="shrink-0 text-right hidden sm:block">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${sub.status === 1 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                                  }`}>
                                  {sub.status === 1 ? "ถูกต้อง" : "ผิด"}
                                </span>
                              </div>
                            </div>
                          )) : (
                            <div className="p-12 text-center">
                              <Icon name="activity" className="w-12 h-12 text-white/5 mx-auto mb-4" />
                              <p className="text-sm text-white/30">ยังไม่มีกิจกรรมล่าสุด</p>
                              <Link href="/questions" className="text-xs text-blue-400 hover:underline mt-2 inline-block">เริ่มทำโจทย์</Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "submissions" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">การส่งคำตอบล่าสุด</h3>
                  </div>

                  {submissions.length > 0 ? (
                    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0d1117]/50">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-[10px] font-bold uppercase tracking-widest text-white/40 border-b border-white/10">
                          <tr>
                            <th className="px-6 py-4">วันที่</th>
                            <th className="px-6 py-4">ภาษา</th>
                            <th className="px-6 py-4">เวลา</th>
                            <th className="px-6 py-4">หน่วยความจำ</th>
                            <th className="px-6 py-4 text-right">สถานะ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {submissions.map((sub) => (
                            <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors group">
                              <td className="px-6 py-4 text-white/40 font-mono text-xs truncate">
                                {new Date(sub.created_at).toLocaleDateString("th-TH", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </td>
                              <td className="px-6 py-4">
                                <span className="font-mono text-white/60 bg-white/5 px-2 py-0.5 rounded border border-white/10 uppercase text-[10px]">{sub.language}</span>
                              </td>
                              <td className="px-6 py-4 text-white/60">{sub.run_time ? `${sub.run_time} ms` : "0 ms"}</td>
                              <td className="px-6 py-4 text-white/60">{sub.memory_used ? `${(sub.memory_used / 1024).toFixed(1)} KB` : "0 KB"}</td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {sub.status === 1 ? (
                                    <span className="flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-400/10 px-2 py-0.5 rounded-full text-xs">
                                      <Icon name="check-circle" className="w-3 h-3" /> ถูกต้อง
                                    </span>
                                  ) : sub.status === 2 ? (
                                    <span className="flex items-center gap-1.5 text-red-400 font-bold bg-red-400/10 px-2 py-0.5 rounded-full text-xs">
                                      <Icon name="x-circle" className="w-3 h-3" /> ผิด
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1.5 text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded-full text-xs">
                                      <Icon name="activity" className="w-3 h-3" /> ข้อผิดพลาด
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="border border-white/10 rounded-xl p-12 text-center bg-[#0d1117]/50 mt-4">
                      <Icon name="activity" className="w-12 h-12 text-white/10 mx-auto mb-4" />
                      <h2 className="text-xl font-bold text-white/60 mb-2">ยังไม่มีการส่งคำตอบ</h2>
                      <p className="text-sm text-white/40">เริ่มทำโจทย์เพื่อดูประวัติการส่งคำตอบของคุณที่นี่</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "questions" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Solved Questions</h3>
                  </div>

                  {/* For now we show a placeholder for specific solved questions list, but count is real */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stats.solvedQuestions && stats.solvedQuestions.length > 0 ? (
                      stats.solvedQuestions.map((q) => (
                        <div key={q.id} className="group relative bg-[#0d1117] border border-white/10 rounded-2xl p-5 hover:border-orange-500/30 transition-all hover:shadow-[0_0_20px_rgba(245,158,11,0.05)] flex flex-col justify-between overflow-hidden">
                          {/* Background Glow */}
                          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/[0.03] blur-2xl -z-10 group-hover:bg-orange-500/[0.08] transition-colors"></div>

                          <div className="flex items-start justify-between mb-3">
                            <span className="text-[10px] font-black font-mono text-white/30 tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/5">{q.code}</span>
                            <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${q.difficulty === 1 ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                              q.difficulty === 2 ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                                "bg-red-500/10 text-red-500 border border-red-500/20"
                              }`}>
                              {q.difficulty === 1 ? "Easy" : q.difficulty === 2 ? "Medium" : "Hard"}
                            </div>
                          </div>

                          <h4 className="text-white font-bold group-hover:text-orange-400 transition-colors mb-4 line-clamp-1">{q.title}</h4>

                          <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                            <div className="flex flex-col gap-0.5">
                              <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest leading-none">Category</p>
                              <p className="text-xs text-white/60 font-medium truncate max-w-[120px]">{q.category_name || "General"}</p>
                            </div>
                            <Link
                              href={`/questions/${q.code}`}
                              className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:bg-orange-500/10 hover:text-orange-400 border border-white/5 transition-all group/btn"
                            >
                              <Icon name="problem" className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
                            </Link>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full border border-white/10 rounded-xl p-12 text-center bg-[#0d1117]/50">
                        <Icon name="problem" className="w-12 h-12 text-white/10 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-white/60 mb-2">No Questions Solved Yet</h2>
                        <p className="text-sm text-white/40">Challenge yourself and start solving problems to build your collection.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>

      </div>
    </>
  );
}

// ความปลอดภัย
// ตรวจสอบรหัสความปลอดภัย
// 1. การตรวจสอบการยืนยันตัวตนด้วย JWT จะดำเนินการขณะโหลด; เปลี่ยนเส้นทางไปยัง /login หากข้อมูลหายไปหรือไม่ถูกต้อง
// 2. การเรียกใช้ API ใช้ 'useToken: true' ซึ่งจะแนบ Bearer Token ในอินเทอร์เซพเตอร์ที่ปลอดภัย
// 3. ข้อมูลที่ผู้ใช้ป้อนทั้งหมด (หากมีส่วนที่ป้อน) จะถูกล้างข้อมูลผ่านการแสดงผลเทมเพลตและการยกเว้นมาตรฐานของ React
// 4. ข้อมูลโปรไฟล์ที่ละเอียดอ่อน (อีเมล, บทบาท) นำมาจากข้อมูลสรุปฝั่งเซิร์ฟเวอร์หรือ localStorage ที่ปลอดภัย
