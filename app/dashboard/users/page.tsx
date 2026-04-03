"use client";

import Header from "@/components/Header";
import DataTable from "@/components/DataTable";
import type { DataTableColumn, DataTableHeader } from "@/components/DataTable";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);

const UsersGroupIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);

interface UserRow {
  id: string;
  display_name: string;
  email: string;
  role_id: number;
}

interface UserListResponse {
  data: UserRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

const roleNames: Record<number, string> = {
  1: "นักศึกษา / student",
  2: "แอดมิน / admin",
};

export default function UsersPage() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchUsers = async (targetPage = page) => {
    setIsLoading(true);
    setErrorMessage("");
    const res = await api.get<UserListResponse>("/users", {
      useToken: true,
      params: {
        limit: 10,
        page: targetPage,
      },
    });

    if (!res.ok || !res.data?.data) {
      setRows([]);
      setTotal(0);
      setTotalPages(1);
      setErrorMessage(res.error ?? "โหลดข้อมูลผู้ใช้งานไม่สำเร็จ");
      setIsLoading(false);
      return;
    }

    setRows(res.data.data);
    setPage(res.data.pagination.page);
    setTotal(res.data.pagination.total);
    setTotalPages(res.data.pagination.total_pages || 1);
    setIsLoading(false);
  };

  useEffect(() => {
    void fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const headers: DataTableHeader[] = [
    { key: "username", label: "Username" },
    { key: "email", label: "Email" },
    { key: "role", label: "role" },
  ];

  const columns: DataTableColumn<UserRow>[] = [
    {
      key: "username",
      render: (row) => row.display_name || row.email.split("@")[0],
    },
    {
      key: "email",
      render: (row) => row.email,
    },
    {
      key: "role",
      render: (row) => roleNames[row.role_id] || "ไม่ระบุ",
    },
  ];

  return (
    <>
      <Header title="ผู้ใช้งาน" icon={<UserIcon />} />
      <main className="flex-1 p-6 space-y-8 overflow-y-auto w-full max-w-[1700px] mx-auto">
        {/* Stats Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/5 shadow-2xl flex items-center gap-7 group transition-all duration-300 hover:bg-white/[0.08]">
            <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.15)] group-hover:scale-105 transition-transform">
              <UserIcon />
            </div>
            <div>
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest">ผู้ใช้ที่ใช้งานวันนี้</p>
              <p className="text-3xl font-black text-white mt-1.5 tabular-nums">{total.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/5 shadow-2xl flex items-center gap-7 group transition-all duration-300 hover:bg-white/[0.08]">
            <div className="w-16 h-16 bg-violet-500/10 text-violet-400 rounded-2xl flex items-center justify-center border border-violet-500/20 shadow-[0_0_20px_rgba(139,92,246,0.15)] group-hover:scale-105 transition-transform">
              <UsersGroupIcon />
            </div>
            <div>
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest">ผู้ใช้ทั้งหมดที่ลงทะเบียนแล้ว</p>
              <p className="text-3xl font-black text-white mt-1.5 tabular-nums">{total.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Data Table Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 px-1">
            ข้อมูลผู้ใช้งาน
          </h2>
          <DataTable
            headers={headers}
            columns={columns}
            rows={rows}
            rowKey={(row) => row.id}
            loading={isLoading}
            errorMessage={errorMessage}
            emptyMessage="ยังไม่มีข้อมูลผู้ใช้งาน"
            pagination={{
              page,
              totalPages,
              onPageChange: (nextPage) => void fetchUsers(nextPage),
            }}
          />
        </div>
      </main>
    </>
  );
}
