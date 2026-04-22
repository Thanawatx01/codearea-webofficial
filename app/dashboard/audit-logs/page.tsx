"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Icon } from "@/components/icons/Icon";
import DataTable, { type DataTableHeader, type DataTableColumn } from "@/components/DataTable";
import { Modal } from "@/components/Modal";

type AuditLog = {
  id: number;
  user_id: string;
  action_type: string;
  action_details: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
  users?: {
    display_name: string;
    email: string;
  };
};

type AuditLogsResponse = {
  data: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
};

export default function AuditLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  
  // Filters
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedType, setSelectedType] = useState("");
  const [search, setSearch] = useState("");

  const fetchLogs = useCallback(async (targetPage = page) => {
    setIsLoading(true);
    try {
      const res = await api.get<AuditLogsResponse>("/audit", {
        useToken: true,
        params: {
          page: targetPage,
          limit,
          action_type: selectedType || undefined,
          search: search || undefined
        }
      });
      if (res.ok && res.data) {
        setLogs(res.data.data);
        setTotal(res.data.pagination.total);
        setTotalPages(res.data.pagination.total_pages);
        setPage(res.data.pagination.page);
      }
    } catch (e) {
      console.error("Error fetching audit logs:", e);
    }
    setIsLoading(false);
  }, [page, limit, selectedType, search]);

  const fetchTypes = useCallback(async () => {
    try {
      const res = await api.get<{ data: string[] }>("/audit/types", { useToken: true });
      if (res.ok && res.data) {
        setTypes(res.data.data);
      }
    } catch (e) {
      console.error("Error fetching audit types:", e);
    }
  }, []);

  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        if (user.role_id === 2) {
          setIsAuthorized(true);
          void fetchTypes();
          void fetchLogs(1);
        } else {
          setIsAuthorized(false);
          router.replace("/dashboard/problems");
        }
      } catch (e) {
        router.replace("/login");
      }
    } else {
      router.replace("/login");
    }
  }, [router, fetchTypes, fetchLogs]);

  const headers: DataTableHeader[] = [
    { key: "created_at", label: "เวลา", className: "w-48" },
    { key: "user", label: "ผู้ใช้งาน", className: "w-48" },
    { key: "action_type", label: "การกระทำ", className: "w-40" },
    { key: "action_details", label: "รายละเอียด", className: "min-w-[300px]" },
    { key: "ip_address", label: "IP Address", className: "w-32" },
  ];

  const columns: DataTableColumn<AuditLog>[] = [
    {
      key: "created_at",
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-white font-medium">{new Date(row.created_at).toLocaleDateString()}</span>
          <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest">
            {new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      )
    },
    {
      key: "user",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-black">
            {row.users?.display_name?.charAt(0) || "U"}
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-sm truncate max-w-[150px]">{row.users?.display_name || "System"}</span>
            <span className="text-white/20 text-[10px] truncate max-w-[150px]">{row.users?.email || "-"}</span>
          </div>
        </div>
      )
    },
    {
      key: "action_type",
      render: (row) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
          row.action_type.includes('CREATE') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
          row.action_type.includes('DELETE') ? 'bg-red-500/10 text-red-400 border-red-500/20' :
          row.action_type.includes('UPDATE') ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
          row.action_type.includes('REQ') ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
          'bg-white/5 text-white/40 border-white/10'
        }`}>
          {row.action_type}
        </span>
      )
    },
    {
      key: "action_details",
      render: (row) => {
        const details = typeof row.action_details === 'string' ? JSON.parse(row.action_details) : row.action_details;
        const payload = details?.payload || details;
        const summary = typeof payload === 'object' ? 
          (payload.name || payload.title || payload.id || JSON.stringify(payload).substring(0, 100)) : 
          String(payload);
        
        return (
          <div 
            onClick={() => setSelectedLog(row)}
            className="group flex items-center gap-2 max-w-[400px] cursor-pointer"
          >
            <div className="flex-1 text-[11px] text-white/60 truncate font-mono bg-black/20 px-2 py-1.5 rounded border border-white/5 group-hover:border-primary/40 group-hover:text-white transition-all">
              {summary}
            </div>
            <div className="opacity-0 group-hover:opacity-100 p-1.5 bg-primary/10 text-primary rounded-lg transition-opacity">
              <Icon name="maximize-2" className="w-3 h-3" />
            </div>
          </div>
        );
      }
    },
    {
      key: "ip_address",
      render: (row) => <span className="text-[10px] font-mono text-white/30">{row.ip_address}</span>
    }
  ];

  if (isAuthorized === null) return null;

  return (
    <>
      <Header title="Audit Logs" icon={<Icon name="history" className="w-5 h-5" />} />
      <main className="flex-1 p-6 space-y-6 overflow-y-auto w-full max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1a1c2e]/60 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center gap-4 flex-1">
            <div className="relative group w-full md:w-64">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-white/20 group-focus-within:text-primary transition-colors">
                <Icon name="search" className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="ค้นหาใน Log..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && void fetchLogs(1)}
                className="bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:bg-black/30 transition-all w-full"
              />
            </div>

            <select
              value={selectedType}
              onChange={(e) => { setSelectedType(e.target.value); void fetchLogs(1); }}
              className="bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50 transition-all w-full md:w-48 appearance-none"
            >
              <option value="">การกระทำทั้งหมด</option>
              {types.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="text-right">
            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Total Logs</p>
            <p className="text-xl font-black text-white">{total.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-xl">
          <DataTable
            headers={headers}
            columns={columns}
            rows={logs}
            rowKey={(row) => row.id}
            loading={isLoading}
            pagination={{
              page,
              totalPages,
              onPageChangeAction: (p) => void fetchLogs(p)
            }}
            tableClassName="w-full"
          />
        </div>

        <Modal
          isOpen={!!selectedLog}
          onCloseAction={() => setSelectedLog(null)}
          title="Audit Log Details"
          size="lg"
        >
          {selectedLog && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Action Type</p>
                  <p className="text-primary font-black italic">{selectedLog.action_type}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Performed By</p>
                  <p className="text-white font-bold">{selectedLog.users?.display_name || "System"}</p>
                </div>
              </div>

              <div className="bg-black/40 rounded-3xl border border-white/10 overflow-hidden">
                <div className="px-6 py-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Raw Action Details</span>
                  <span className="text-[10px] font-mono text-white/20">JSON format</span>
                </div>
                <div className="p-6 overflow-auto max-h-[400px] custom-scrollbar">
                  <pre className="text-xs font-mono text-emerald-400/90 whitespace-pre">
                    {JSON.stringify(selectedLog.action_details, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="bg-white/5 p-6 rounded-3xl border border-white/5 flex flex-col gap-4 text-xs">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Timestamp</span>
                  <span className="text-white/80">{new Date(selectedLog.created_at).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-white/40 font-bold uppercase tracking-widest text-[10px]">IP Address</span>
                  <span className="text-white/80 font-mono">{selectedLog.ip_address}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-white/40 font-bold uppercase tracking-widest text-[10px]">User Agent</span>
                  <span className="text-white/60 text-[10px] font-mono leading-relaxed bg-black/20 p-2 rounded-lg">{selectedLog.user_agent}</span>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </main>
    </>
  );
}
