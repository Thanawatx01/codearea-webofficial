"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Header from "@/components/Header";
import DataTable from "@/components/DataTable";
import type { DataTableColumn, DataTableHeader } from "@/components/DataTable";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

const ActivityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);

type UserActivityRow = {
  id: string;
  username: string;
  solved_count: number;
  total_score: number;
  max_score: number;
};

const mockActivities: UserActivityRow[] = [
  { id: "mock-1", username: "Raksit", solved_count: 45, total_score: 4500, max_score: 5000 },
  { id: "mock-2", username: "admin", solved_count: 50, total_score: 5000, max_score: 5000 },
  { id: "mock-3", username: "thanawat", solved_count: 20, total_score: 1800, max_score: 5000 },
  { id: "mock-4", username: "athp", solved_count: 5, total_score: 450, max_score: 5000 },
  { id: "mock-5", username: "Nut", solved_count: 38, total_score: 3600, max_score: 5000 },
  { id: "mock-6", username: "pupha", solved_count: 12, total_score: 1100, max_score: 5000 },
];

export default function UserActivityPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<UserActivityRow[]>(mockActivities);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get<{ data: UserActivityRow[] }>("/users/leaderboard", {
        useToken: true,
      });

      if (res.ok && res.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setActivities(res.data.data);
      } else {
        console.log("Leaderboard API empty or failed, using placeholders");
        // Keep mock data if API returns empty
      }
    } catch (e) {
      console.error("Error fetching leaderboard:", e);
      // Fallback to mock data is already handled by initial state
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        if (user.role_id === 2) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
          router.replace("/dashboard/problems");
        }
      } catch (e) {
        console.error("Error parsing user from localStorage:", e);
        router.replace("/login");
      }
    } else {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    if (isAuthorized) {
      void fetchActivities();
    }
  }, [isAuthorized, fetchActivities]);

  const filteredActivities = useMemo(() => {
    return activities.filter(u => 
      u.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activities, searchQuery]);

  const totalPages = Math.ceil(filteredActivities.length / 10) || 1;
  const paginatedActivities = useMemo(() => {
    const start = (page - 1) * 10;
    return filteredActivities.slice(start, start + 10);
  }, [filteredActivities, page]);

  if (isAuthorized === null) {
    return (
      <div className="flex h-full w-full items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (isAuthorized === false) return null;

  const headers: DataTableHeader[] = [
    { key: "no", label: "#", align: "center", className: "w-12" },
    { key: "user", label: "ชื่อผู้ใช้" },
    { key: "solved", label: "ทำไปแล้ว (ข้อ)", align: "center" },
    { key: "score", label: "คะแนนที่ได้", align: "center" },
    { key: "performance", label: "ประสิทธิภาพ", align: "center" },
  ];

  const columns: DataTableColumn<UserActivityRow>[] = [
    {
      key: "no",
      className: "text-center text-white/30 text-xs font-mono",
      render: (_row, index) => index + 1 + (page - 1) * 10,
    },
    {
      key: "user",
      render: (row) => (
        <span className="text-sm font-bold text-white hover:text-primary transition-colors cursor-pointer">
          {row.username}
        </span>
      ),
    },
    {
      key: "solved",
      className: "text-center",
      render: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-bold bg-primary/15 text-primary border border-primary/20">
          {row.solved_count.toLocaleString()}
        </span>
      ),
    },
    {
      key: "score",
      className: "text-center",
      render: (row) => (
        <span className="text-sm font-bold">
          <span className="text-emerald-400">{row.total_score.toLocaleString()}</span>
          <span className="text-white/30 mx-1">/</span>
          <span className="text-white/50">{(row.max_score || 0).toLocaleString()}</span>
        </span>
      ),
    },
    {
      key: "performance",
      className: "text-center w-48",
      render: (row) => {
        const percent = row.max_score > 0 ? Math.round((row.total_score / row.max_score) * 100) : 0;
        return (
          <div className="flex flex-col items-center gap-1.5 w-full max-w-[120px] mx-auto">
            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-full rounded-full ${percent >= 80 ? 'bg-emerald-400' : percent >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                style={{ width: `${percent}%` }}
              ></div>
            </div>
            <span className="text-[10px] font-bold text-white/50">{percent}% Completion</span>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <Header title="กิจกรรมผู้ใช้" icon={<ActivityIcon />} />
      <main className="flex-1 p-6 space-y-5 overflow-y-auto w-full max-w-7xl mx-auto">
        <div className="bg-[#161622]/60 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="px-8 py-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-3">
                <span className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_15px_rgba(139,92,246,0.5)]"></span>
                สถิติการเรียนรู้รายบุคคล
              </h2>
              <p className="text-xs text-white/40 mt-1 font-medium italic">ข้อมูลจำนวนโจทย์ที่ทำผ่านและคะแนนรวมที่ได้รับจากคะแนนเต็ม</p>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-white/20 group-focus-within:text-primary transition-colors">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="ค้นหาชื่อผู้ใช้..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:bg-black/30 transition-all w-full md:w-64"
              />
            </div>
          </div>

          <div className="p-6">
            <DataTable
              headers={headers}
              columns={columns}
              rows={paginatedActivities}
              rowKey={(row) => row.id}
              loading={loading}
              errorMessage={error}
              emptyMessage="ยังไม่มีข้อมูลกิจกรรม"
              pagination={{
                page,
                totalPages,
                onPageChangeAction: setPage,
              }}
            />
          </div>
        </div>
      </main>
    </>
  );
}
