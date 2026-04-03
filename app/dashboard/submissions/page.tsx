"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { useRouter } from "next/navigation";

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
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

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
