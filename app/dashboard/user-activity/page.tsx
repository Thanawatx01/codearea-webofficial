"use client";

import DataTable from "@/components/DataTable";
import type { DataTableColumn, DataTableHeader } from "@/components/DataTable";
import Header from "@/components/Header";
import { ReportFilters } from "@/components/reports/ReportFilters";
import { ReportKpiCards } from "@/components/reports/ReportKpiCards";
import {
  normalizePaginated,
  presetDateRange,
  toDateTimeRange,
} from "@/components/reports/report-utils";
import { Icon } from "@/components/icons/Icon";
import { api } from "@/lib/api";
import { useCallback, useEffect, useMemo, useState } from "react";

type UserActivityRow = {
  user_id?: number;
  display_name?: string;
  email?: string;
  total_attempt?: number;
  total_unfinished?: number;
  total_finished?: number;
  avg_submit_per_question?: number;
};

export default function UserActivityPage() {
  const [rows, setRows] = useState<UserActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [preset, setPreset] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const applyPreset = useCallback((value: string) => {
    setPreset(value);
    setPage(1);
    if (value !== "custom") {
      const range = presetDateRange(value);
      setStartDate(range.startDate);
      setEndDate(range.endDate);
    }
  }, []);

  const loadUserActivity = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    const res = await api.get("/user-activities", {
      useToken: true,
      params: {
        page,
        limit: 20,
        search: search || undefined,
        start_date: toDateTimeRange(startDate, false) || undefined,
        end_date: toDateTimeRange(endDate, true) || undefined,
      },
    });
    if (res.ok) {
      const normalized = normalizePaginated<UserActivityRow>(res.data);
      setRows(normalized.rows);
      setTotalPages(normalized.pagination.totalPages || 1);
    } else {
      setRows([]);
      setTotalPages(1);
      setErrorMessage(res.error ?? "โหลดกิจกรรมผู้ใช้ไม่สำเร็จ");
    }
    setLoading(false);
  }, [page, search, startDate, endDate]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async report load
    void loadUserActivity();
  }, [loadUserActivity]);

  const kpis = useMemo(() => {
    const totalUsers = rows.length;
    const totalAttempts = rows.reduce(
      (sum, row) => sum + Number(row.total_attempt ?? 0),
      0,
    );
    const totalFinished = rows.reduce(
      (sum, row) => sum + Number(row.total_finished ?? 0),
      0,
    );
    const avg =
      totalUsers > 0
        ? rows.reduce(
            (sum, row) => sum + Number(row.avg_submit_per_question ?? 0),
            0,
          ) / totalUsers
        : 0;
    return [
      { label: "จำนวนผู้ใช้", value: totalUsers, accent: "border-l-2 border-l-violet-400/60" },
      { label: "ความพยายามรวม", value: totalAttempts, accent: "border-l-2 border-l-cyan-400/60" },
      { label: "ส่งสำเร็จรวม", value: totalFinished, accent: "border-l-2 border-l-emerald-400/60" },
      { label: "ค่าเฉลี่ยส่งต่อคำถาม", value: avg.toFixed(2), accent: "border-l-2 border-l-amber-400/60" },
    ];
  }, [rows]);

  const headers: DataTableHeader[] = [
    { key: "no", label: "#", align: "center", className: "w-14" },
    { key: "user", label: "ผู้ใช้" },
    { key: "email", label: "อีเมล" },
    { key: "attempt", label: "พยายาม", align: "right" },
    { key: "unfinished", label: "ไม่สำเร็จ", align: "right" },
    { key: "finished", label: "สำเร็จ", align: "right" },
    { key: "avg", label: "เฉลี่ย/คำถาม", align: "right" },
  ];

  const columns: DataTableColumn<UserActivityRow>[] = [
    {
      key: "no",
      className: "text-center text-white/40 text-xs tabular-nums",
      render: (_row, index) => index + 1 + (page - 1) * 20,
    },
    {
      key: "user",
      className: "font-medium text-white/90",
      render: (row) => row.display_name ?? "-",
    },
    {
      key: "email",
      className: "text-white/55",
      render: (row) => row.email ?? "-",
    },
    {
      key: "attempt",
      className: "text-right tabular-nums",
      render: (row) => Number(row.total_attempt ?? 0).toLocaleString("th-TH"),
    },
    {
      key: "unfinished",
      className: "text-right tabular-nums text-orange-300",
      render: (row) => Number(row.total_unfinished ?? 0).toLocaleString("th-TH"),
    },
    {
      key: "finished",
      className: "text-right tabular-nums text-emerald-300",
      render: (row) => Number(row.total_finished ?? 0).toLocaleString("th-TH"),
    },
    {
      key: "avg",
      className: "text-right tabular-nums",
      render: (row) => Number(row.avg_submit_per_question ?? 0).toFixed(2),
    },
  ];

  return (
    <>
      <Header title="กิจกรรมผู้ใช้" icon={<Icon name="activity" className="h-5 w-5" />} />
      <main className="flex-1 space-y-6 overflow-y-auto w-full max-w-7xl mx-auto p-6">
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
            <span className="h-5 w-1 rounded-full bg-primary" />
            ตัวกรองกิจกรรมผู้ใช้
          </div>
          <ReportFilters
            preset={preset}
            onPresetChange={applyPreset}
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={(value) => {
              setStartDate(value);
              setPage(1);
            }}
            onEndDateChange={(value) => {
              setEndDate(value);
              setPage(1);
            }}
            search={search}
            onSearchChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            searchPlaceholder="ค้นหาชื่อผู้ใช้หรืออีเมล..."
          />
        </section>

        <ReportKpiCards items={kpis} />

        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
            <span className="h-5 w-1 rounded-full bg-primary" />
            รายงานกิจกรรมผู้ใช้
          </h2>
          <DataTable
            headers={headers}
            columns={columns}
            rows={rows}
            rowKey={(row, index) => `${row.user_id ?? index}`}
            loading={loading}
            errorMessage={errorMessage}
            emptyMessage="ไม่มีข้อมูลกิจกรรมผู้ใช้"
            pagination={{
              page,
              totalPages,
              onPageChangeAction: setPage,
            }}
          />
        </section>
      </main>
    </>
  );
}
