// Dashboard Recent Activity Component
// คอมโพเนนต์แสดงรายการกิจกรรมล่าสุดของผู้ใช้งานในระบบ
// 1. แสดงชื่อผู้ใช้พร้อมตัวอักษรย่อ (Initials)
// 2. แสดงข้อมูลการส่งล่าสุดพร้อมวันที่แบบไทย
// 3. แสดงสรุปสถิติ ผ่าน/ไม่ผ่าน ในแต่ละแถว

import { Icon } from "@/components/icons/Icon";
import { DashboardPanelHeader } from "./DashboardPanelHeader";
import {
  DashboardTableBody,
  DashboardTableContainer,
  DashboardTableHead,
  DashboardTd,
  DashboardTh,
  DashboardTr,
} from "./DashboardTable";
import type { DashboardPayload } from "./types";
import { formatThaiDate, initials } from "./utils";

type DashboardRecentActivityProps = {
  rows: DashboardPayload["recent_user_activity"];
};

// DashboardRecentActivity
// ส่วนแสดงตารางกิจกรรมล่าสุด
// 1. รับข้อมูล rows จาก DashboardPayload
// 2. ใช้ DashboardTableContainer เพื่อจัดการรูปแบบตาราง
// 3. แสดงผลข้อมูลแบบ Responsive (มี Horizontal Scroll)
export function DashboardRecentActivity({
  rows,
}: DashboardRecentActivityProps) {
  return (
    <section className="rounded-3xl border border-white/[0.08] bg-white/[0.035] p-6 pb-2 shadow-[0_24px_64px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-7">
      <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <DashboardPanelHeader
          title="กิจกรรมผู้ใช้งานล่าสุด"
          subtitle="ผู้ใช้ที่มีการส่งล่าสุดในระบบ"
        />
      </div>
      <DashboardTableContainer tableClassName="min-w-[680px]">
        <DashboardTableHead>
          <DashboardTh>ชื่อแสดง</DashboardTh>
          <DashboardTh>อีเมล</DashboardTh>
          <DashboardTh>ส่งล่าสุด</DashboardTh>
          <DashboardTh className="text-right">ความพยายาม</DashboardTh>
          <DashboardTh className="text-right">ผลลัพธ์</DashboardTh>
        </DashboardTableHead>
        <DashboardTableBody>
          {rows.map((row) => (
            <DashboardTr key={row.user_id}>
              <DashboardTd>
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-white/15 to-white/5 text-xs font-bold text-white/90 ring-1 ring-white/10"
                    title={row.display_name}
                  >
                    {initials(row.display_name)}
                  </span>
                  <span className="font-medium text-white/95">
                    {row.display_name}
                  </span>
                </div>
              </DashboardTd>
              <DashboardTd className="max-w-[220px] truncate text-white/55">
                {row.email}
              </DashboardTd>
              <DashboardTd className="text-white/65">
                <span className="inline-flex items-center gap-1.5">
                  <Icon
                    name="clock"
                    className="h-3.5 w-3.5 text-white/30"
                  />
                  {formatThaiDate(row.last_submission_at)}
                </span>
              </DashboardTd>
              <DashboardTd className="text-right">
                <span className="tabular-nums text-white/80">
                  {row.total_attempt.toLocaleString("th-TH")}
                </span>
              </DashboardTd>
              <DashboardTd className="text-right">
                <div className="inline-flex items-center justify-end gap-1.5">
                  <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold tabular-nums text-emerald-300 ring-1 ring-emerald-400/25">
                    {row.submissions_passed} ผ่าน
                  </span>
                  <span className="rounded-md bg-orange-500/12 px-2 py-0.5 text-xs font-semibold tabular-nums text-orange-300/95 ring-1 ring-orange-400/20">
                    {row.submissions_not_passed} ไม่ผ่าน
                  </span>
                </div>
              </DashboardTd>
            </DashboardTr>
          ))}
        </DashboardTableBody>
      </DashboardTableContainer>
    </section>
  );
}
