"use client";

import Header from "@/components/Header";
import DataTable from "@/components/DataTable";
import type { DataTableColumn, DataTableHeader } from "@/components/DataTable";
import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
import { Icon } from "@/components/icons/Icon";
import Swal from "sweetalert2";

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);

const UsersGroupIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
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
  
  // State for dropdown on role cell
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const handleRoleChange = async (userId: string, newRoleId: number) => {
    const roleLabel = roleNames[newRoleId];
    setActiveMenuId(null);

    const result = await Swal.fire({
      title: "ยืนยันการเปลี่ยนบทบาท",
      text: `คุณต้องการเปลี่ยนบทบาทเป็น "${roleLabel}" ใช่หรือไม่?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#8b5cf6",
      background: "#1a1c2e",
      color: "#fff",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    setIsLoading(true);
    const res = await api.put(`/users/${userId}`, { role_id: newRoleId }, { useToken: true });
    if (res.ok) {
      await Swal.fire({
        icon: "success",
        title: "สำเร็จ",
        text: "เปลี่ยนบทบาทเรียบร้อยแล้ว",
        timer: 1500,
        showConfirmButton: false,
        background: "#1a1c2e",
        color: "#fff",
      });
      void fetchUsers(page);
    } else {
      setIsLoading(false);
      void Swal.fire({
        icon: "error",
        title: "ผิดพลาด",
        text: res.error ?? "ไม่สามารถเปลี่ยนบทบาทได้",
        background: "#1a1c2e",
        color: "#fff",
      });
    }
  };

  useEffect(() => {
    void fetchUsers();
    
    // Close menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const headers: DataTableHeader[] = [
    { key: "username", label: "Username" },
    { key: "email", label: "Email" },
    { key: "role", label: "roll" },
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
      render: (row) => (
        <div className="relative inline-block text-left" ref={activeMenuId === row.id ? menuRef : null}>
          <button
            onClick={() => setActiveMenuId(activeMenuId === row.id ? null : row.id)}
            className={`group px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 transition-all duration-200 border ${
              row.role_id === 2 
                ? 'bg-violet-500/10 text-violet-300 border-violet-500/30 hover:bg-violet-500/20' 
                : 'bg-blue-500/10 text-blue-300 border-blue-500/30 hover:bg-blue-500/20'
            }`}
          >
            {roleNames[row.role_id] || "ไม่ระบุ"}
            <Icon name="chevron-down" className={`h-3 w-3 transition-transform duration-200 ${activeMenuId === row.id ? 'rotate-180' : ''}`} />
          </button>
          
          {activeMenuId === row.id && (
            <div className="absolute left-0 mt-2 w-48 rounded-xl bg-[#1a1c2e] border border-white/10 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="py-1">
                <div className="px-4 py-2 text-[10px] font-bold text-white/30 uppercase tracking-widest border-b border-white/5 mb-1">
                  เลือกบทบาท
                </div>
                {Object.entries(roleNames).map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => handleRoleChange(row.id, parseInt(id))}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-white/5 flex items-center gap-3 ${row.role_id === parseInt(id) ? (parseInt(id) === 2 ? 'text-violet-400' : 'text-blue-400') : 'text-white/70'}`}
                  >
                    <div className={`w-2 h-2 rounded-full ${row.role_id === parseInt(id) ? (parseInt(id) === 2 ? 'bg-violet-400' : 'bg-blue-400') : 'bg-white/20'}`} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
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
