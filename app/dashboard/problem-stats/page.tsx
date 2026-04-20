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

type QuestionRow = {
  question_id?: number;
  code?: string;
  title?: string;
  difficulty?: string;
  total_unfinished?: number;
  total_finished?: number;
  total_attempt?: number;
};

export default function ProblemStatsPage() {
  const [preset, setPreset] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [rows, setRows] = useState<QuestionRow[]>([]);
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

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    const res = await api.get("/questions/report", {
      useToken: true,
      params: {
        page,
        limit: 20,
        search: search || undefined,
        difficulty: difficulty || undefined,
        start_date: toDateTimeRange(startDate, false) || undefined,
        end_date: toDateTimeRange(endDate, true) || undefined,
      },
    });

    if (!res.ok) {
      setRows([]);
      setTotalPages(1);
      setTotal(0);
      setErrorMessage(res.error ?? "โหลดรายงานคำถามไม่สำเร็จ");
      setLoading(false);
      return;
    }

    const normalized = normalizePaginated<QuestionRow>(res.data);
    setRows(normalized.rows);
    setTotalPages(normalized.pagination.totalPages || 1);
    setTotal(normalized.pagination.total || normalized.rows.length);
    setLoading(false);
  }, [page, search, difficulty, startDate, endDate]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async report load
    void loadQuestions();
  }, [loadQuestions]);

  const kpis = useMemo(() => {
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
    const successRate =
      totalAttempts > 0 ? Math.round((totalFinished / totalAttempts) * 100) : 0;
    return [
      {
        label: "จำนวนคำถาม (ทั้งหมด)",
        value: total,
        accent: "border-l-2 border-l-violet-400/60",
      },
      {
        label: "ส่งทั้งหมด",
        value: totalAttempts,
        accent: "border-l-2 border-l-cyan-400/60",
      },
      {
        label: "สำเร็จ / ไม่สำเร็จ",
        value: `${totalFinished} / ${totalUnfinished}`,
        accent: "border-l-2 border-l-emerald-400/60",
      },
      {
        label: "อัตราสำเร็จ",
        value: `${successRate}%`,
        accent: "border-l-2 border-l-amber-400/60",
      },
    ];
  }, [rows, total]);

  const headers: DataTableHeader[] = [
    { key: "index", label: "#", align: "center", className: "w-14" },
    { key: "code", label: "รหัสคำถาม", className: "w-36" },
    { key: "title", label: "ชื่อคำถาม" },
    { key: "unfinished", label: "ไม่สำเร็จ", align: "right" },
    { key: "finished", label: "สำเร็จ", align: "right" },
    { key: "total", label: "รวมส่ง", align: "right" },
  ];

  const columns: DataTableColumn<QuestionRow>[] = [
    {
      key: "index",
      className: "text-center text-white/40 text-xs tabular-nums",
      render: (_row, index) => index + 1 + (page - 1) * 20,
    },
    {
      key: "code",
      className: "font-mono text-xs text-cyan-200/90",
      render: (row) => row.code ?? "-",
    },
    {
      key: "title",
      className: "text-white/90",
      render: (row) => row.title ?? "-",
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
      key: "total",
      className: "text-right tabular-nums text-white",
      render: (row) => Number(row.total_attempt ?? 0).toLocaleString("th-TH"),
    },
  ];

  return (
    <>
      <Header title="สถิติคำถาม" icon={<Icon name="stats" className="h-5 w-5" />} />
      <main className="flex-1 space-y-6 overflow-y-auto w-full max-w-7xl mx-auto p-6">
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
            <span className="h-5 w-1 rounded-full bg-primary" />
            ตัวกรองรายงานคำถาม
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
            searchPlaceholder="ค้นหา code หรือชื่อคำถาม..."
            rightSlot={
              <div className="relative min-w-[160px]">
                <select
                  value={difficulty}
                  onChange={(e) => {
                    setDifficulty(e.target.value);
                    setPage(1);
                  }}
                  className="w-full appearance-none rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/20"
                >
                  <option value="">ทุกระดับ</option>
                  <option value="1">ง่าย</option>
                  <option value="2">ปานกลาง</option>
                  <option value="3">ยาก</option>
                </select>
              </div>
            }
          />
        </section>

        <ReportKpiCards items={kpis} />

        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
            <span className="h-5 w-1 rounded-full bg-primary" />
            รายงานการส่งตามคำถาม
          </h2>
          <DataTable
            headers={headers}
            columns={columns}
            rows={rows}
            rowKey={(row, index) => `${row.question_id ?? row.code ?? index}`}
            loading={loading}
            errorMessage={errorMessage}
            emptyMessage="ไม่มีข้อมูลคำถามตามเงื่อนไขที่เลือก"
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
