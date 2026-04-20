"use client";

import { Icon } from "@/components/icons/Icon";

type ReportFiltersProps = {
  preset: string;
  onPresetChange: (value: string) => void;
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  rightSlot?: React.ReactNode;
};

export function ReportFilters({
  preset,
  onPresetChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  search,
  onSearchChange,
  searchPlaceholder = "ค้นหา...",
  rightSlot,
}: ReportFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative group min-w-[160px]">
        <Icon
          name="calendar"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40"
        />
        <select
          value={preset}
          onChange={(e) => onPresetChange(e.target.value)}
          className="w-full appearance-none rounded-xl border border-white/10 bg-black/20 pl-9 pr-10 py-2 text-sm text-white focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/20 [&>option]:bg-[#1a1a1a]"
        >
          <option value="all">ทั้งหมด (All Time)</option>
          <option value="last_week">สัปดาห์ที่แล้ว</option>
          <option value="last_month">เดือนที่แล้ว</option>
          <option value="custom">กำหนดเอง</option>
        </select>
        <Icon
          name="chevron-down"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-white/20"
        />
      </div>

      {preset === "custom" ? (
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-1 px-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-[130px] bg-transparent px-2 py-1 text-sm text-white focus:outline-none"
          />
          <span className="text-white/20">/</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-[130px] bg-transparent px-2 py-1 text-sm text-white focus:outline-none"
          />
        </div>
      ) : null}

      {onSearchChange ? (
        <div className="relative group min-w-[240px]">
          <Icon
            name="search"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40"
          />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search ?? ""}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/20 pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/20"
          />
        </div>
      ) : null}

      {rightSlot}
    </div>
  );
}
