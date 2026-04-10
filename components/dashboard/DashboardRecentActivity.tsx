import { Icon } from "@/components/icons/Icon";
import { DashboardPanelHeader } from "./DashboardPanelHeader";
import type { DashboardPayload } from "./types";
import { formatThaiDate, initials } from "./utils";

type DashboardRecentActivityProps = {
  rows: DashboardPayload["recent_user_activity"];
};

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
      <div className="-mx-1 overflow-x-auto rounded-2xl border border-white/[0.06] bg-black/20 sm:mx-0">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.04] text-[11px] uppercase tracking-[0.12em] text-white/45">
              <th className="px-5 py-3.5 font-semibold">ชื่อแสดง</th>
              <th className="px-5 py-3.5 font-semibold">อีเมล</th>
              <th className="px-5 py-3.5 font-semibold">ส่งล่าสุด</th>
              <th className="px-5 py-3.5 text-right font-semibold">
                ความพยายาม
              </th>
              <th className="px-5 py-3.5 text-right font-semibold">ผลลัพธ์</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.user_id}
                className="border-b border-white/[0.04] transition-colors last:border-0 hover:bg-white/[0.04]"
              >
                <td className="px-5 py-3.5">
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
                </td>
                <td className="max-w-[220px] truncate px-5 py-3.5 text-white/55">
                  {row.email}
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 text-white/65">
                  <span className="inline-flex items-center gap-1.5">
                    <Icon
                      name="clock"
                      className="h-3.5 w-3.5 text-white/30"
                    />
                    {formatThaiDate(row.last_submission_at)}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <span className="tabular-nums text-white/80">
                    {row.total_attempt.toLocaleString("th-TH")}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="inline-flex items-center justify-end gap-1.5">
                    <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold tabular-nums text-emerald-300 ring-1 ring-emerald-400/25">
                      {row.submissions_passed} ผ่าน
                    </span>
                    <span className="rounded-md bg-orange-500/12 px-2 py-0.5 text-xs font-semibold tabular-nums text-orange-300/95 ring-1 ring-orange-400/20">
                      {row.submissions_not_passed} ไม่ผ่าน
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
