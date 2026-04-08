"use client";

import { useState, useEffect } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", finished: 32, unfinished: 18 },
  { month: "Feb", finished: 45, unfinished: 25 },
  { month: "Mar", finished: 55, unfinished: 20 },
  { month: "Apr", finished: 72, unfinished: 15 },
  { month: "May", finished: 88, unfinished: 10 },
];

export default function ActivityChart() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="bg-card-bg backdrop-blur-md rounded-xl border border-white/5 p-5 animate-pulse">
        <div className="mb-5">
          <div className="h-5 w-40 bg-white/10 rounded mb-2"></div>
          <div className="h-3 w-64 bg-white/10 rounded"></div>
        </div>
        <div className="w-full bg-white/5 rounded-lg" style={{ height: 320 }}></div>
      </div>
    );
  }

  return (
    <div className="bg-card-bg backdrop-blur-md rounded-xl border border-white/5 p-5">
      {/* Chart header */}
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-foreground">แนวโน้มกิจกรรมผู้ใช้</h2>
        <p className="text-xs text-text-muted mt-0.5">จำนวนโจทย์ที่ทำเสร็จและยังไม่เสร็จ (รายเดือน)</p>
      </div>

      {/* Chart */}
      <div className="w-full" style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: "#94A3B8" }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#94A3B8" }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              tickLine={false}
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1A1A2E",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                fontSize: "12px",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4)",
              }}
              itemStyle={{ color: "#FFFFFF" }}
            />
            <Legend
              wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
            />
            <Line
              type="monotone"
              dataKey="finished"
              name="ทำเสร็จ"
              stroke="#8B5CF6"
              strokeWidth={3}
              dot={{ r: 4, fill: "#8B5CF6", strokeWidth: 2, stroke: "#0B0B0F" }}
              activeDot={{ r: 6, fill: "#8B5CF6", strokeWidth: 2, stroke: "#0B0B0F" }}
            />
            <Line
              type="monotone"
              dataKey="unfinished"
              name="ยังไม่เสร็จ"
              stroke="#F97316"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#F97316", strokeWidth: 2, stroke: "#0B0B0F" }}
              activeDot={{ r: 6, fill: "#F97316", strokeWidth: 2, stroke: "#0B0B0F" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
