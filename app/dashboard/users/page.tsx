"use client";

import Header from "@/components/Header";
import DataTable from "@/components/DataTable";
import type { DataTableColumn, DataTableHeader } from "@/components/DataTable";

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);

type UserRow = {
  id: string;
};

const headers: DataTableHeader[] = [{ key: "empty", label: "ข้อมูลผู้ใช้งาน" }];
const columns: DataTableColumn<UserRow>[] = [{ key: "empty", render: () => "-" }];

export default function UsersPage() {
  return (
    <>
      <Header title="ผู้ใช้งาน" icon={<UserIcon />} />
      <main className="flex-1 p-6 space-y-5 overflow-y-auto w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/5 shadow-2xl flex items-center gap-5">
            <div className="w-14 h-14 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <UserIcon />
            </div>
            <div>
              <p className="text-xs font-bold text-white/50 uppercase tracking-wider">ผู้ใช้ที่ใช้งานวันนี้</p>
              <p className="text-3xl font-black text-white mt-1">142</p>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/5 shadow-2xl flex items-center gap-5">
            <div className="w-14 h-14 bg-primary/20 text-primary rounded-2xl flex items-center justify-center border border-primary/30 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div>
              <p className="text-xs font-bold text-white/50 uppercase tracking-wider">ผู้ใช้ทั้งหมดลงทะเบียนแล้ว</p>
              <p className="text-3xl font-black text-white mt-1">3,890</p>
            </div>
          </div>
        </div>

        {/* Existing Users Table component */}
        <DataTable
          headers={headers}
          columns={columns}
          rows={[]}
          rowKey={(row) => row.id}
          emptyMessage="ยังไม่มีข้อมูลผู้ใช้งาน"
        />
      </main>
    </>
  );
}
