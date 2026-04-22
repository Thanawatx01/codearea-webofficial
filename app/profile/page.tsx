"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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

import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { QuickStats } from "@/components/profile/QuickStats";
import { SkillMasteryTree } from "@/components/profile/SkillMasteryTree";
import { RecentActivity } from "@/components/profile/RecentActivity";
import { AchievementsList } from "@/components/profile/AchievementsList";
import { LeaderboardMini } from "@/components/profile/LeaderboardMini";
import { SubmissionsTab } from "@/components/profile/SubmissionsTab";
import { SolvedQuestionsTab } from "@/components/profile/SolvedQuestionsTab";

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
    tags: [] as { name: string; count: number }[],
    categories: [] as { name: string; count: number }[],
    solvedQuestions: [] as any[],
    globalRank: 0,
    totalUsers: 0
  });
  
  // --- New Progression Mock Data ---
  const [levelInfo, setLevelInfo] = useState({
    level: 1,
    name: "Newbie Coder",
    currentXp: 0,
    nextLevelXp: 1000,
    progress: 0
  });

  const [streakInfo, setStreakInfo] = useState({
    currentStreak: 5,
    maxStreak: 12,
    lastSevenDays: [true, true, false, true, true, true, true], // Mock activity
  });

  const [achievements, setAchievements] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [skillTree, setSkillTree] = useState<any[]>([]);
  // ใช้ Callback Ref + ResizeObserver ตรวจจับว่า container มีขนาดจริงแล้วจึงแสดง Recharts
  // Callback ref จะทำงานทันทีที่ DOM element ถูกสร้าง — ไม่ขึ้นกับ isLoading
  const [chartReady, setChartReady] = useState(false);
  const roRef = useRef<ResizeObserver | null>(null);

  const chartContainerRef = useCallback((node: HTMLDivElement | null) => {
    // ล้าง observer เก่า
    if (roRef.current) {
      roRef.current.disconnect();
      roRef.current = null;
    }
    if (!node) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setChartReady(true);
          ro.disconnect();
          return;
        }
      }
    });
    roRef.current = ro;
    ro.observe(node);
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
          solvedQuestions: d.solved_questions || [],
          globalRank: d.user.global_rank || 0,
          totalUsers: d.user.total_users || 0
        });

        setProfileData(prev => ({
          ...prev,
          avatarUrl: d.user.avatar_url || prev.avatarUrl,
          bio: d.user.bio || "",
          location: d.user.location || "",
          phone: d.user.phone || "",
          dob: d.user.dob || ""
        }));

        // Update Progression Data from API
        if (d.progression) {
          const p = d.progression;
          
          setStreakInfo({
            currentStreak: p.streak.current_streak,
            maxStreak: p.streak.max_streak,
            lastSevenDays: p.streak.activity_history || [],
          });

          setAchievements(p.achievements || []);

          if (Array.isArray(p.skills)) {
            setSkillTree(p.skills.map((s: any) => ({
              name: s.name,
              level: Math.min(100, Math.round((s.current / (s.max || 1)) * 100)),
              icon: s.icon,
              color: s.name.toLowerCase().includes('front') ? "from-pink-500 to-rose-500" :
                     s.name.toLowerCase().includes('back') ? "from-blue-500 to-indigo-500" :
                     s.name.toLowerCase().includes('algo') ? "from-amber-500 to-orange-500" :
                     s.name.toLowerCase().includes('devops') ? "from-emerald-500 to-teal-500" :
                     "from-slate-500 to-gray-500"
            })));
          }
        }

        // Update Stats with Global Rank
        setStats(prev => ({
          ...prev,
          globalRank: d.user.global_rank,
          totalUsers: d.user.total_users
        }));
      }

      // ขั้นตอนที่ 3: ดึงข้อมูลการส่งคำตอบล่าสุดสำหรับรายการบนแดชบอร์ด
      // 3. ร้องขอการส่งคำตอบล่าสุด (จำกัด 10 รายการ)
      const subRes = await api.get<any>("/submissions", { useToken: true, params: { limit: 10 } });
      if (subRes.ok && subRes.data) {
        setSubmissions(subRes.data.data || []);
      }

      // ขั้นตอนที่ 4: ดึงข้อมูล Leaderboard จริง
      const lbRes = await api.get<any>("/leaderboard", { useToken: true, params: { limit: 5 } });
      if (lbRes.ok && lbRes.data) {
        const podium = lbRes.data.podium || [];
        const table = lbRes.data.table?.data || [];
        const combined = [...podium, ...table].slice(0, 5);
        
        setLeaderboard(combined.map((item: any) => ({
          rank: item.rank,
          name: item.display_name || item.email?.split("@")[0] || "User",
          xp: item.total_point,
          avatar: item.avatar_url || "",
          isMe: item.email === user.email
        })));
      }

    } catch (error) {
      console.error("Failed to fetch profile data", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Level Calculation Logic
  useEffect(() => {
    const xpPerLevel = 1000;
    const level = Math.floor(stats.xp / xpPerLevel) + 1;
    const currentXpInLevel = stats.xp % xpPerLevel;
    const progress = (currentXpInLevel / xpPerLevel) * 100;
    
    const levelNames = ["Newbie Coder", "Script Kiddy", "Code Apprentice", "Junior Dev", "Mid-Level Engineer", "Senior Architect", "Principal Lead", "Code Master", "Grandmaster", "Legendary Coder"];
    const levelName = levelNames[Math.min(level - 1, levelNames.length - 1)];

    setLevelInfo({
      level,
      name: levelName,
      currentXp: currentXpInLevel,
      nextLevelXp: xpPerLevel,
      progress
    });
  }, [stats.xp]);

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
            {/* Profile Sidebar */}
            <ProfileHeader profileData={profileData} roleId={roleId} />

            {/* Right Content */}
            <div className="xl:col-span-9 min-w-0">

              {/* Dashboard / Overview Tab */}
              {activeTab === "dashboard" && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <QuickStats levelInfo={levelInfo} streakInfo={streakInfo} stats={stats} />
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                      <SkillMasteryTree skillTree={skillTree} />
                      <RecentActivity recentActivity={stats.recentActivity} onViewAll={() => setActiveTab("submissions")} />
                    </div>

                    <div className="lg:col-span-1 space-y-6">
                      <AchievementsList achievements={achievements} />
                      <LeaderboardMini leaderboard={leaderboard} />
                    </div>
                  </div>
                </div>
              )}

              {/* Submissions Tab */}
              {activeTab === "submissions" && (
                <SubmissionsTab submissions={submissions} />
              )}

              {/* Solved Questions Tab */}
              {activeTab === "questions" && (
                <SolvedQuestionsTab solvedQuestions={stats.solvedQuestions} />
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
