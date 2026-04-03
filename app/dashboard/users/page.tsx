"use client";

import Header from "@/components/Header";
import DataTable from "@/components/DataTable";
import type { DataTableColumn, DataTableHeader } from "@/components/DataTable";
import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
import { Icon } from "@/components/icons/Icon";
import { maskEmail } from "@/lib/utils";
import Swal from "sweetalert2";

interface UserRow {
  id: string;
  display_name: string;
  email: string;
  role_id: number;
  updated_at: string;
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
  1: "ผู้ใช้ / user",
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

  // State for revealed emails
  const [revealedEmails, setRevealedEmails] = useState<Set<string>>(new Set());

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
      confirmButtonColor: "#8b5cf6",
      cancelButtonText: "ยกเลิก",
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

  const toggleEmailReveal = (userId: string) => {
    setRevealedEmails((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const handleResetPassword = async (userId: string) => {
    void Swal.fire({
      title: "รีเซ็ตรหัสผ่าน",
      text: "ระบบกำลังเตรียมส่งอีเมลรีเซ็ตรหัสผ่าน (ฟังก์ชันนี้ยังไม่เปิดใช้งานในระบบจริง)",
      icon: "info",
      confirmButtonText: "ตกลง",
      confirmButtonColor: "#8b5cf6",
      background: "#1a1c2e",
      color: "#fff",
    });
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
    { key: "role", label: "Role" },
    { key: "updated_at", label: "Latest Update" },
    { key: "actions", label: "" },
  ];

  const columns: DataTableColumn<UserRow>[] = [
    {
      key: "username",
      render: (row) => (
        <span className="font-medium text-white/90">
          {row.display_name || row.email.split("@")[0]}
        </span>
      ),
    },
    {
      key: "email",
      render: (row) => {
        const isRevealed = revealedEmails.has(row.id);
        return (
          <button
            onClick={() => toggleEmailReveal(row.id)}
            className="group flex items-center gap-2 text-text-muted hover:text-white transition-colors text-left"
            title={isRevealed ? "Hide Email" : "Click to Reveal Email"}
          >
            <Icon name={isRevealed ? "eye-off" : "eye"} className="h-3.5 w-3.5 opacity-0 group-hover:opacity-60 transition-opacity" />
            <span className={isRevealed ? "" : "font-mono tracking-tighter"}>
              {isRevealed ? row.email : maskEmail(row.email)}
            </span>
          </button>
        );
      },
    },
    {
      key: "role",
      render: (row) => (
        <div className="relative inline-block text-left" ref={activeMenuId === row.id ? menuRef : null}>
          <button
            onClick={() => setActiveMenuId(activeMenuId === row.id ? null : row.id)}
            className={`group px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all duration-200 border ${row.role_id === 2
                ? 'bg-violet-500/10 text-violet-300 border-violet-500/20 hover:bg-violet-500/20'
                : 'bg-blue-500/10 text-blue-300 border-blue-500/20 hover:bg-blue-500/20'
              }`}
          >
            {roleNames[row.role_id] || "ไม่ระบุ"}
            <Icon name="chevron-down" className={`h-3 w-3 transition-transform duration-200 ${activeMenuId === row.id ? 'rotate-180' : ''}`} />
          </button>

          {activeMenuId === row.id && (
            <div className="absolute left-0 mt-2 w-full min-w-[max(100%,160px)] max-w-[240px] rounded-xl bg-[#1a1c2e] border border-white/10 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
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
    {
      key: "updated_at",
      render: (row) => {
        const date = new Date(row.updated_at);
        return (
          <div className="flex flex-col">
            <span className="text-sm text-white/80">{date.toLocaleDateString("th-TH")}</span>
            <span className="text-[10px] text-white/30 font-medium uppercase tracking-wider">{date.toLocaleTimeString("th-TH", { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        );
      },
    },
    {
      key: "actions",
      className: "text-right",
      render: (row) => (
        <button
          onClick={() => handleResetPassword(row.id)}
          className="p-2 hover:bg-red-500/10 text-red-400/60 hover:text-red-400 rounded-xl transition-all"
          title="Reset Password"
        >
          <Icon name="gear" className="h-4.5 w-4.5" />
        </button>
      ),
    },
  ];

  return (
    <>
      <Header title="ผู้ใช้งาน" icon={<Icon name="user" className="h-5 w-5 text-primary" />} />
      <main className="flex-1 p-4 sm:p-6 space-y-8 overflow-y-auto w-full max-w-screen-2xl mx-auto">
        {/* Stats Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-2">
          <div className="bg-white/5 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/5 shadow-2xl flex items-center gap-5 sm:gap-7 group transition-all duration-300 hover:bg-white/[0.08]">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.15)] group-hover:scale-105 transition-transform flex-shrink-0">
              <Icon name="user" className="h-5 w-5 text-violet-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-bold text-white/40 uppercase tracking-widest truncate">ผู้ใช้ที่ใช้งานวันนี้</p>
              <p className="text-2xl sm:text-3xl font-black text-white mt-1 sm:mt-1.5 tabular-nums truncate">{total.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/5 shadow-2xl flex items-center gap-5 sm:gap-7 group transition-all duration-300 hover:bg-white/[0.08]">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-violet-500/10 text-violet-400 rounded-2xl flex items-center justify-center border border-violet-500/20 shadow-[0_0_20px_rgba(139,92,246,0.15)] group-hover:scale-105 transition-transform flex-shrink-0">
              <Icon name="users-group" className="h-6 w-6 text-violet-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-bold text-white/40 uppercase tracking-widest truncate">ผู้ใช้ทั้งหมดที่ลงทะเบียนแล้ว</p>
              <p className="text-2xl sm:text-3xl font-black text-white mt-1 sm:mt-1.5 tabular-nums truncate">{total.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Data Table Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              ข้อมูลผู้ใช้งาน
            </h2>
          </div>
          <div className="rounded-3xl border border-white/5 overflow-hidden bg-white/5 backdrop-blur-md shadow-2xl">
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
        </div>
      </main>
    </>
  );
}
