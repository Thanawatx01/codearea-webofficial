"use client";

import DataTable from "@/components/DataTable";
import type { DataTableColumn, DataTableHeader } from "@/components/DataTable";
import Header from "@/components/Header";
import { Icon } from "@/components/icons/Icon";
import { ReportFilters } from "@/components/reports/ReportFilters";
import { ReportKpiCards } from "@/components/reports/ReportKpiCards";
import {
  normalizePaginated,
  presetDateRange,
  toDateTimeRange,
} from "@/components/reports/report-utils";
import { api } from "@/lib/api";
import { useCallback, useEffect, useMemo, useState } from "react";

type CategoryRow = {
  category_id?: number | null;
  category?: string;
  category_name?: string;
  question_count?: number;
  total_unfinished?: number;
  total_finished?: number;
  total_attempt?: number;
};

export default function CategoryStatsPage() {
  const [preset, setPreset] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const applyPreset = useCallback((value: string) => {
    setPreset(value);
    setPage(1);
    if (value !== "custom") {
      const range = presetDateRange(value);
      setStartDate(range.startDate);
      setEndDate(range.endDate);
    }
  }, []);

  const loadCategoryStats = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    const res = await api.get("/question-categories/report", {
      useToken: true,
      params: {
        page,
        limit: 20,
        name: search || undefined,
        start_date: toDateTimeRange(startDate, false) || undefined,
        end_date: toDateTimeRange(endDate, true) || undefined,
      },
    });

    if (!res.ok) {
      setRows([]);
      setTotalPages(1);
      setTotal(0);
      setErrorMessage(res.error ?? "โหลดรายงานหมวดหมู่คำถามไม่สำเร็จ");
      setLoading(false);
      return;
    }

    const normalized = normalizePaginated<CategoryRow>(res.data);
    setRows(normalized.rows);
    setTotalPages(normalized.pagination.totalPages || 1);
    setTotal(normalized.pagination.total || normalized.rows.length);
    setLoading(false);
  }, [page, search, startDate, endDate]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async report load
    void loadCategoryStats();
  }, [loadCategoryStats]);

  const kpis = useMemo(() => {
    const totalQuestions = rows.reduce(
      (sum, row) => sum + Number(row.question_count ?? 0),
      0,
    );
    const totalAttempts = rows.reduce(
      (sum, row) => sum + Number(row.total_attempt ?? 0),
      0,
    );
    const totalFinished = rows.reduce(
      (sum, row) => sum + Number(row.total_finished ?? 0),
      0,
    );
    const totalUnfinished = rows.reduce(
      (sum, row) => sum + Number(row.total_unfinished ?? 0),
      0,
    );
    return [
      {
        label: "จำนวนหมวดหมู่ (ทั้งหมด)",
        value: total,
        accent: "border-l-2 border-l-violet-400/60",
      },
      {
        label: "จำนวนคำถามรวม",
        value: totalQuestions,
        accent: "border-l-2 border-l-cyan-400/60",
      },
      {
        label: "สำเร็จ / ไม่สำเร็จ",
        value: `${totalFinished} / ${totalUnfinished}`,
        accent: "border-l-2 border-l-emerald-400/60",
      },
      {
        label: "จำนวนส่งรวม",
        value: totalAttempts,
        accent: "border-l-2 border-l-amber-400/60",
      },
    ];
  }, [rows, total]);

  const headers: DataTableHeader[] = [
    { key: "index", label: "#", align: "center", className: "w-14" },
    { key: "category", label: "หมวดหมู่คำถาม" },
    { key: "questions", label: "จำนวนคำถาม", align: "right" },
    { key: "unfinished", label: "ไม่สำเร็จ", align: "right" },
    { key: "finished", label: "สำเร็จ", align: "right" },
    { key: "attempts", label: "รวมส่ง", align: "right" },
  ];

  const columns: DataTableColumn<CategoryRow>[] = [
    {
      key: "index",
      className: "text-center text-white/40 text-xs tabular-nums",
      render: (_row, index) => index + 1 + (page - 1) * 20,
    },
    {
      key: "category",
      className: "text-white/90",
      render: (row) => row.category_name ?? row.category ?? "ไม่ระบุหมวดหมู่",
    },
    {
      key: "questions",
      className: "text-right tabular-nums text-cyan-200/90",
      render: (row) => Number(row.question_count ?? 0).toLocaleString("th-TH"),
    },
    {
      key: "unfinished",
      className: "text-right tabular-nums text-orange-300",
      render: (row) =>
        Number(row.total_unfinished ?? 0).toLocaleString("th-TH"),
    },
    {
      key: "finished",
      className: "text-right tabular-nums text-emerald-300",
      render: (row) => Number(row.total_finished ?? 0).toLocaleString("th-TH"),
    },
    {
      key: "attempts",
      className: "text-right tabular-nums text-white",
      render: (row) => Number(row.total_attempt ?? 0).toLocaleString("th-TH"),
    },
  ];

  return (
    <>
      <Header
        title="สถิติการส่งตามหมวดหมู่"
        icon={<Icon name="submission" className="h-5 w-5" />}
      />
      <main className="flex-1 space-y-6 overflow-y-auto w-full max-w-7xl mx-auto p-6">
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
            <span className="h-5 w-1 rounded-full bg-primary" />
            ตัวกรองรายงานหมวดหมู่
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
            searchPlaceholder="ค้นหาชื่อหมวดหมู่..."
          />
        </section>

        <ReportKpiCards items={kpis} />

        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
            <span className="h-5 w-1 rounded-full bg-primary" />
            รายงานการส่งตามหมวดหมู่คำถาม
          </h2>
          <DataTable
            headers={headers}
            columns={columns}
            rows={rows}
            rowKey={(row, index) =>
              `${row.category_id ?? row.category_name ?? row.category ?? index}`
            }
            loading={loading}
            errorMessage={errorMessage}
            emptyMessage="ไม่มีข้อมูลหมวดหมู่ตามเงื่อนไขที่เลือก"
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
