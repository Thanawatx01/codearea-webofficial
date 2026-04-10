"use client";

import { useId } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { DashboardPanelHeader } from "./DashboardPanelHeader";
import type { PieRow } from "./types";
import { pieFillForLabel } from "./utils";

type DashboardCompletionChartProps = {
  pieRows: PieRow[];
  successfulSubmissions: number;
  unsuccessfulSubmissions: number;
};

export function DashboardCompletionChart({
  pieRows,
  successfulSubmissions,
  unsuccessfulSubmissions,
}: DashboardCompletionChartProps) {
  const uid = useId().replace(/:/g, "");
  const successId = `dashPieSuccess-${uid}`;
  const failId = `dashPieFail-${uid}`;

  return (
    <div className="flex flex-col rounded-3xl border border-white/[0.08] bg-white/[0.035] p-6 shadow-[0_24px_64px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <DashboardPanelHeader
        className="mb-1"
        title="เปรียบเทียบความสำเร็จ"
        subtitle="สัดส่วนการส่งที่สำเร็จและยังไม่สำเร็จ"
      />
      <div className="relative mt-2 flex flex-1 flex-col">
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[200px] w-[200px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/[0.06] blur-3xl"
          aria-hidden
        />
        <div className="relative h-[300px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <PieChart>
              <defs>
                <linearGradient id={successId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5eead4" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id={failId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fcd34d" />
                  <stop offset="100%" stopColor="#ea580c" />
                </linearGradient>
              </defs>
              <Pie
                data={pieRows}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="52%"
                outerRadius="78%"
                paddingAngle={3}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth={2}
                cornerRadius={4}
              >
                {pieRows.map((row) => (
                  <Cell
                    key={row.name}
                    fill={pieFillForLabel(row.name, successId, failId)}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(12,14,24,0.92)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "14px",
                  fontSize: "12px",
                  boxShadow: "0 16px 40px rgba(0,0,0,0.45)",
                }}
                labelStyle={{ color: "#e2e8f0", marginBottom: 4 }}
              />
              <Legend
                verticalAlign="bottom"
                wrapperStyle={{
                  fontSize: "12px",
                  paddingTop: "12px",
                }}
                formatter={(value) => (
                  <span className="text-white/75">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs text-emerald-200/90">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            สำเร็จ{" "}
            <strong className="tabular-nums text-emerald-100">
              {successfulSubmissions.toLocaleString("th-TH")}
            </strong>
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-1.5 text-xs text-orange-200/90">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-400 shadow-[0_0_8px_#fb923c]" />
            ไม่สำเร็จ{" "}
            <strong className="tabular-nums text-orange-100">
              {unsuccessfulSubmissions.toLocaleString("th-TH")}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
}
