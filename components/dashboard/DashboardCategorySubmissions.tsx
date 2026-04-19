// Dashboard Category Submissions Component
// คอมโพเนนต์แสดงสถิติการส่งแยกตามหมวดหมู่โจทย์
// 1. แสดงจำนวนโจทย์ในแต่ละหมวดหมู่
// 2. แสดงสถิติจำนวนที่ส่งผ่าน (Done) และยังไม่ผ่าน (Not Done)
// 3. รองรับการกรองตามวันที่ (Presets) และเลือกหมวดหมู่ที่เฉพาะเจาะจง

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { DashboardPanelHeader } from "./DashboardPanelHeader";
import type { CategoryStat } from "./types";
import {
  DashboardTableBody,
  DashboardTableContainer,
  DashboardTableHead,
  DashboardTd,
  DashboardTh,
  DashboardTr,
} from "./DashboardTable";
import { Icon } from "@/components/icons/Icon";

export function DashboardCategorySubmissions() {
  const [data, setData] = useState<CategoryStat[]>([]);
  const [loading, setLoading] = useState(false);
  const [datePreset, setDatePreset] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<
    Array<{ id: number; name: string }>
  >([]);

  // loadCategories
  // ดึงรายการหมวดหมู่ทั้งหมดสำหรับใส่ใน Select Filter
  // 1. เรียก API /question-categories พร้อมระบุ limit=100
  // 2. เก็บข้อมูลที่ได้รับลงใน state categories
  const loadCategories = useCallback(async () => {
    const res = await api.get<{ data: Array<{ id: number; name: string }> }>(
      "/question-categories?limit=100",
      { useToken: true },
    );
    if (res.ok && res.data?.data) setCategories(res.data.data);
  }, []);

  // calculateDates
  // คำนวณวันที่เริ่มต้นและสิ้นสุดตาม Preset ที่เลือก
  // 1. "last_week": ย้อนหลัง 7 วัน
  // 2. "last_month": ย้อนหลัง 1 เดือน
  // 3. "all": ไม่ระบุวันที่
  const calculateDates = useCallback((preset: string) => {
    const now = new Date();
    let start = "";
    let end = "";

    if (preset === "last_week") {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      start = d.toISOString().split("T")[0];
      end = now.toISOString().split("T")[0];
    } else if (preset === "last_month") {
      const d = new Date();
      d.setMonth(d.getMonth() - 1);
      start = d.toISOString().split("T")[0];
      end = now.toISOString().split("T")[0];
    } else if (preset === "all") {
      start = "";
      end = "";
    }

    return { start, end };
  }, []);

  // handlePresetChange
  // จัดการเมื่อมีการเปลี่ยน Preset วันที่
  // 1. อัปเดต state datePreset
  // 2. หากไม่ใช่ "custom" ให้คำนวณและอัปเดต startDate/endDate อัตโนมัติ
  const handlePresetChange = (preset: string) => {
    setDatePreset(preset);
    if (preset !== "custom") {
      const { start, end } = calculateDates(preset);
      setStartDate(start);
      setEndDate(end);
    }
  };

  // loadData
  // ดึงข้อมูลสถิติจริงจาก Backend
  // 1. เตรียม Query Parameters (วันที่, หมวดหมู่)
  // 2. เรียก API /dashboard/category-stats
  // 3. อัปเดตข้อมูลลงใน state data
  // Security: มีการส่ง useToken เพื่อยืนยันว่าเป็น Admin
  const loadData = useCallback(async () => {
    setLoading(true);
    const query = new URLSearchParams();
    if (startDate) query.append("startDate", startDate);
    if (endDate) query.append("endDate", endDate);
    if (categoryId) query.append("categoryId", categoryId);

    const res = await api.get<CategoryStat[]>(
      `/dashboard/category-stats?${query.toString()}`,
      { useToken: true },
    );
    if (res.ok && res.data) {
      setData(res.data);
    }
    setLoading(false);
  }, [startDate, endDate, categoryId]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  return (
    <section className="mt-8 rounded-3xl border border-white/[0.08] bg-white/[0.035] p-6 pb-2 shadow-[0_24px_64px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-7">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <DashboardPanelHeader
          title="สถิติการส่งตามหมวดหมู่"
          subtitle="Dashboard Category Submissions"
        />
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group min-w-[160px]">
            <Icon
              name="calendar"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-emerald-400 transition-colors"
            />
            <select
              value={datePreset}
              onChange={(e) => handlePresetChange(e.target.value)}
              className="w-full appearance-none rounded-xl border border-white/10 bg-black/20 pl-9 pr-10 py-2 text-sm text-white focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all [&>option]:bg-[#1a1a1a]"
            >
              <option value="all">ทั้งหมด (All Time)</option>
              <option value="last_week">สัปดาห์ที่แล้ว</option>
              <option value="last_month">เดือนที่แล้ว</option>
              <option value="custom">กำหนดเอง (Custom)</option>
            </select>
            <Icon
              name="chevron-down"
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-white/20 transition-transform group-focus-within:rotate-180"
            />
          </div>

          {datePreset === "custom" && (
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-1 px-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-[130px] bg-transparent px-2 py-1 text-sm text-white focus:outline-none sm:w-auto"
              />
              <span className="text-white/20">/</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-[130px] bg-transparent px-2 py-1 text-sm text-white focus:outline-none sm:w-auto"
              />
            </div>
          )}

          <div className="relative group min-w-[180px]">
            <Icon
              name="box"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-emerald-400 transition-colors"
            />
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full appearance-none rounded-xl border border-white/10 bg-black/20 pl-9 pr-10 py-2 text-sm text-white focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all [&>option]:bg-[#1a1a1a]"
            >
              <option value="">ทุกหมวดหมู่</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <Icon
              name="chevron-down"
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-white/20 transition-transform group-focus-within:rotate-180"
            />
          </div>
        </div>
      </div>
      <DashboardTableContainer>
        <DashboardTableHead>
          <DashboardTh>หมวดหมู่</DashboardTh>
          <DashboardTh className="text-right text-orange-400">
            ยังไม่เสร็จ
          </DashboardTh>
          <DashboardTh className="text-right text-emerald-400">
            เสร็จสิ้น
          </DashboardTh>
          <DashboardTh className="text-right text-white">รวมส่ง</DashboardTh>
        </DashboardTableHead>
        <DashboardTableBody className={loading ? "opacity-50" : ""}>
          {data.map((row) => (
            <DashboardTr key={row.categoryId ?? "none"}>
              <DashboardTd className="text-white/90">
                <div className="flex flex-col">
                  <span>{row.categoryName}</span>
                  {row.questionCount === 0 && (
                    <span className="text-xs text-orange-400/70">
                      ไม่มีโจทย์ในหมวดหมู่ชุดนี้
                    </span>
                  )}
                </div>
              </DashboardTd>
              {row.questionCount > 0 ? (
                <>
                  <DashboardTd className="text-right font-medium tabular-nums text-orange-300/90">
                    {row.notDoneCount.toLocaleString("th-TH")}
                  </DashboardTd>
                  <DashboardTd className="text-right font-medium tabular-nums text-emerald-300">
                    {row.doneCount.toLocaleString("th-TH")}
                  </DashboardTd>
                  <DashboardTd className="text-right font-medium tabular-nums text-white">
                    {row.total.toLocaleString("th-TH")}
                  </DashboardTd>
                </>
              ) : (
                <DashboardTd colSpan={3} className="text-right text-white/20">
                  -
                </DashboardTd>
              )}
            </DashboardTr>
          ))}
          {data.length === 0 && !loading && (
            <DashboardTr>
              <DashboardTd
                colSpan={4}
                className="py-8 text-center text-white/40"
              >
                ไม่มีข้อมูล
              </DashboardTd>
            </DashboardTr>
          )}
        </DashboardTableBody>
      </DashboardTableContainer>
    </section>
  );
}
