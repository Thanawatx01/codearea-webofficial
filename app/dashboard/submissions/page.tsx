"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import { useRouter } from "next/navigation";
import DataTable from "@/components/DataTable";
import type { DataTableColumn, DataTableHeader } from "@/components/DataTable";
import { api } from "@/lib/api";

const SubmissionIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);

// Type for the stats row
type ProblemStatRow = {
  id: string;
  problem_name: string;
  total_users: number; // คนส่งกี่คน
  solved_users: number; // ทำเสร็จแล้ว/ผ่านแล้วกี่คน
  working_users: number; // กำลังทำอยู่ (ยังไม่ผ่าน)
};

export default function SubmissionsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<ProblemStatRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // Mock function to fetch data - TODO: modify this when backend has real stats endpoint
  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // For now, using mock data because backend is empty
      setTimeout(() => {
        const mockData: ProblemStatRow[] = [
          { id: "1", problem_name: "Hello World", total_users: 120, solved_users: 105, working_users: 15 },
          { id: "2", problem_name: "Array Sum", total_users: 85, solved_users: 50, working_users: 35 },
          { id: "3", problem_name: "Binary Search", total_users: 60, solved_users: 20, working_users: 40 },
          { id: "4", problem_name: "Graph Traversal", total_users: 45, solved_users: 10, working_users: 35 },
          { id: "5", problem_name: "Dijkstra's Algorithm", total_users: 30, solved_users: 5, working_users: 25 },
        ].filter(p => p.problem_name.toLowerCase().includes(searchQuery.toLowerCase()));

        setStats(mockData);
        setTotalPages(1);
        setLoading(false);
      }, 500);

    } catch (e) {
      console.error("Error fetching stats:", e);
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูลสถิติ");
      setLoading(false);
    }
  }, [searchQuery, page]);

  useEffect(() => {
    if (isAuthorized) {
      void fetchStats();
    }
  }, [isAuthorized, fetchStats]);

  const headers: DataTableHeader[] = [
    { key: "no", label: "#", align: "center", className: "w-12" },
    { key: "problem", label: "ชื่อโจทย์" },
    { key: "total", label: "ผู้เข้าร่วมทั้งหมด", align: "center" },
    { key: "solved", label: "ผ่านแล้ว (คน)", align: "center" },
    { key: "working", label: "กำลังทำ (คน)", align: "center" },
    { key: "progress", label: "อัตราความสำเร็จ", align: "center" },
  ];

  const columns: DataTableColumn<ProblemStatRow>[] = [
    {
      key: "no",
      className: "text-center text-white/30 text-xs font-mono",
      render: (_row, index) => index + 1 + (page - 1) * 10,
    },
    {
      key: "problem",
      render: (row) => (
        <span className="text-sm font-bold text-white hover:text-primary transition-colors cursor-pointer">
          {row.problem_name}
        </span>
      ),
    },
    {
      key: "total",
      className: "text-center",
      render: (row) => (
        <span className="text-sm font-bold text-white/80">
          {row.total_users.toLocaleString()}
        </span>
      ),
    },
    {
      key: "solved",
      className: "text-center",
      render: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
          {row.solved_users.toLocaleString()}
        </span>
      ),
    },
    {
      key: "working",
      className: "text-center",
      render: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20">
          {row.working_users.toLocaleString()}
        </span>
      ),
    },
    {
      key: "progress",
      className: "text-center w-48",
      render: (row) => {
        const percent = row.total_users > 0 ? Math.round((row.solved_users / row.total_users) * 100) : 0;
        return (
          <div className="flex flex-col items-center gap-1.5 w-full max-w-[120px] mx-auto">
            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-full rounded-full ${percent >= 70 ? 'bg-emerald-400' : percent >= 40 ? 'bg-amber-400' : 'bg-red-400'}`}
                style={{ width: `${percent}%` }}
              ></div>
            </div>
            <span className="text-[10px] font-bold text-white/50">{percent}% Success</span>
          </div>
        );
      },
    },
  ];

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

  if (isAuthorized === null) {
    return (
      <div className="flex h-full w-full items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (isAuthorized === false) return null;
  return (
    <>
      <Header title="สถิติการส่งคำตอบ" icon={<SubmissionIcon />} />
      <main className="flex-1 p-6 space-y-5 overflow-y-auto w-full max-w-7xl mx-auto">
        <div className="bg-[#161622]/60 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="px-8 py-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-3">
                <span className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_15px_rgba(139,92,246,0.5)]"></span>
                ภาพรวมการทำโจทย์
              </h2>
              <p className="text-xs text-white/40 mt-1 font-medium italic">สถิติผู้เข้าร่วม จำนวนคนที่ผ่าน และผู้ที่กำลังดำเนินการในแต่ละโจทย์</p>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-white/20 group-focus-within:text-primary transition-colors">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="ค้นหาชื่อโจทย์..."
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
              rows={stats}
              rowKey={(row) => row.id}
              loading={loading}
              errorMessage={error}
              emptyMessage="ยังไม่มีข้อมูลสถิติ"
              pagination={{
                page,
                totalPages,
                onPageChange: setPage,
              }}
            />
          </div>
        </div>
      </main>
    </>
  );
}
