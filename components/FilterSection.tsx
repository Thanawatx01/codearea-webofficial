"use client";

import { useState } from "react";

interface FilterSectionProps {
  onFilter?: (filters: { dateFrom: string; dateTo: string; search: string }) => void;
  onReset?: () => void;
}

export default function FilterSection({ onFilter, onReset }: FilterSectionProps) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");

  const handleFilter = () => {
    onFilter?.({ dateFrom, dateTo, search });
  };

  const handleReset = () => {
    setDateFrom("");
    setDateTo("");
    setSearch("");
    onReset?.();
  };

  return (
    <div className="bg-card-bg backdrop-blur-md rounded-xl border border-white/5 p-5">
      <div className="flex flex-wrap items-end gap-4">
        {/* Date From */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-muted">วันที่เริ่ม</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="h-10 px-3 rounded-lg border border-white/10 text-sm text-foreground bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all transition-all"
            style={{ colorScheme: 'dark' }}
            placeholder="วันที่ --/--"
          />
        </div>

        {/* Date To */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-muted">วันที่สิ้นสุด</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="h-10 px-3 rounded-lg border border-white/10 text-sm text-foreground bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            style={{ colorScheme: 'dark' }}
            placeholder="วันที่ --/--"
          />
        </div>

        {/* Search */}
        <div className="flex flex-col gap-1.5 flex-1 min-w-[240px]">
          <label className="text-xs font-medium text-text-muted">ค้นหา</label>
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by display name or email"
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-white/10 text-sm text-foreground bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-text-light"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleFilter}
            className="h-10 px-5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors shadow-sm shadow-primary/20 cursor-pointer"
          >
            Filter
          </button>
          <button
            onClick={handleReset}
            className="h-10 px-5 rounded-lg bg-white/5 text-text-muted text-sm font-medium border border-white/10 hover:bg-white/10 hover:text-foreground transition-all cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
