"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import { initialProblemTypes, type ProblemTypeItem } from "./data";
import { api } from "@/lib/api";

const ProblemTypeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
);

const SortIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

type SortOrder = "popular" | "least" | "newest";

type CategoryApiRow = {
  id?: string | number;
  category_id?: string | number;
  name?: string;
  category_name?: string;
  title?: string;
  question_count?: number;
  count?: number;
};

type CategoriesResponse = {
  data?: CategoryApiRow[];
  rows?: CategoryApiRow[];
  items?: CategoryApiRow[];
  results?: CategoryApiRow[];
};

export default function ProblemTypesPage() {
  const [types, setTypes] = useState<ProblemTypeItem[]>(initialProblemTypes);
  const [newType, setNewType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("popular");
  const [isLoadingCounts, setIsLoadingCounts] = useState(true);

  const fetchCategoriesWithCounts = useCallback(async () => {
    setIsLoadingCounts(true);
    try {
      const res = await api.get<CategoriesResponse>("question-categories/list", {
        useToken: true,
        params: { page: 1, limit: 100 },
      });

      if (res.ok && res.data) {
        const raw = res.data.data ?? res.data.rows ?? res.data.items ?? res.data.results;
        if (Array.isArray(raw) && raw.length > 0) {
          const mapped: ProblemTypeItem[] = raw
            .filter((r) => r && typeof r === "object")
            .map((row) => {
              const name =
                String(row.name ?? row.category_name ?? row.title ?? "").trim() ||
                String(row.id ?? row.category_id ?? "").trim();
              const questionCount = Number(row.question_count ?? row.count ?? 0);
              return { name, questionCount };
            })
            .filter((item) => item.name.length > 0);

          if (mapped.length > 0) {
            setTypes(mapped);
          }
        }
      }
    } catch {
      // Keep fallback data if API fails
    }
    setIsLoadingCounts(false);
  }, []);

  useEffect(() => {
    void fetchCategoriesWithCounts();
  }, [fetchCategoriesWithCounts]);

  const handleAddType = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newType.trim();
    if (trimmed && !types.some((t) => t.name === trimmed)) {
      setTypes([{ name: trimmed, questionCount: 0 }, ...types]);
      setNewType("");
      setIsAdding(false);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedType("");
    setSortOrder("popular");
  };

  const hasActiveFilters = searchQuery || selectedType || sortOrder !== "popular";

  const filteredAndSortedTypes = useMemo(() => {
    let result = types.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType ? item.name === selectedType : true;
      return matchesSearch && matchesType;
    });

    switch (sortOrder) {
      case "popular":
        result = [...result].sort((a, b) => b.questionCount - a.questionCount);
        break;
      case "least":
        result = [...result].sort((a, b) => a.questionCount - b.questionCount);
        break;
      case "newest":
        break;
    }

    return result;
  }, [types, searchQuery, selectedType, sortOrder]);

  const totalQuestions = useMemo(
    () => types.reduce((sum, t) => sum + t.questionCount, 0),
    [types],
  );

  return (
    <>
      <Header title="จัดการประเภทโจทย์" icon={<ProblemTypeIcon />} />
      <main className="flex-1 p-6 space-y-6 overflow-y-auto w-full max-w-7xl mx-auto">
        
        {/* Filter Bar */}
        <section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col gap-4">
            {/* Filter Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-white/50">
                <FilterIcon />
                <span className="text-xs font-bold uppercase tracking-[0.15em]">ตัวกรอง</span>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="flex items-center gap-1.5 text-xs font-medium text-white/30 hover:text-red-400 transition-colors"
                >
                  <XIcon />
                  ล้างตัวกรองทั้งหมด
                </button>
              )}
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] mb-1.5">
                  ค้นหาประเภท
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-white/20 group-focus-within:text-primary transition-colors">
                    <SearchIcon />
                  </div>
                  <input
                    type="text"
                    placeholder="พิมพ์ชื่อประเภทที่ต้องการค้นหา..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:bg-black/30 transition-all"
                  />
                </div>
              </div>

              {/* Type Filter Dropdown */}
              <div>
                <label className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] mb-1.5">
                  ประเภทโจทย์
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 focus:bg-black/30 transition-all appearance-none cursor-pointer"
                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.3)' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
                >
                  <option value="" className="bg-[#1a1a2e] text-white">ทั้งหมด</option>
                  {types.map((item) => (
                    <option key={item.name} value={item.name} className="bg-[#1a1a2e] text-white">
                      {item.name} ({item.questionCount})
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] mb-1.5">
                  เรียงลำดับ
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-white/20">
                    <SortIcon />
                  </div>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 focus:bg-black/30 transition-all appearance-none cursor-pointer"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.3)' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
                  >
                    <option value="popular" className="bg-[#1a1a2e] text-white">นิยมมากสุด</option>
                    <option value="least" className="bg-[#1a1a2e] text-white">นิยมน้อยสุด</option>
                    <option value="newest" className="bg-[#1a1a2e] text-white">เพิ่มล่าสุด</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="flex items-center gap-3 pt-1">
              <span className="text-xs text-white/30 font-medium">
                แสดง <span className="text-primary font-bold">{filteredAndSortedTypes.length}</span> จาก <span className="text-white/50 font-bold">{types.length}</span> ประเภท
                <span className="text-white/20 mx-2">•</span>
                รวม <span className="text-amber-400 font-bold">{totalQuestions}</span> โจทย์
              </span>
              {hasActiveFilters && (
                <div className="flex items-center gap-2">
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold rounded-full">
                      ค้นหา: {searchQuery}
                      <button onClick={() => setSearchQuery("")} className="hover:text-white transition-colors"><XIcon /></button>
                    </span>
                  )}
                  {selectedType && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[10px] font-bold rounded-full">
                      ประเภท: {selectedType}
                      <button onClick={() => setSelectedType("")} className="hover:text-white transition-colors"><XIcon /></button>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Management Card */}
        <div className="bg-[#161622]/60 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="px-8 py-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-3">
                <span className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_15px_rgba(139,92,246,0.5)]"></span>
                รายการประเภทโจทย์ (Problem Types)
              </h2>
              <p className="text-xs text-white/40 mt-1 font-medium italic">กำหนดหมวดหมู่หลักของโจทย์ปัญหาในระบบ</p>
            </div>
            
            <div className="flex items-center gap-3">
              {!isAdding ? (
                <button 
                  onClick={() => setIsAdding(true)}
                  className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] flex items-center gap-2 whitespace-nowrap"
                >
                  <PlusIcon />
                  สร้างประเภทใหม่
                </button>
              ) : (
                <form onSubmit={handleAddType} className="flex items-center gap-2 animate-in slide-in-from-right-4 duration-300">
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="ชื่อประเภท..." 
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="bg-primary/10 border border-primary/30 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary w-32 md:w-48 transition-all"
                  />
                  <button 
                    type="submit"
                    className="p-2.5 bg-primary text-white rounded-xl hover:bg-primary-hover shadow-lg"
                  >
                    <PlusIcon />
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setIsAdding(false); setNewType(""); }}
                    className="p-2.5 bg-white/5 text-white/40 rounded-xl hover:bg-white/10"
                  >
                    ยกเลิก
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="p-8">
            {isLoadingCounts ? (
              <div className="flex flex-col items-center justify-center py-20 text-white/20">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
                <p className="text-sm font-bold tracking-widest uppercase">กำลังโหลดข้อมูล...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAndSortedTypes.length > 0 ? (
                  filteredAndSortedTypes.map((item) => {
                    const maxCount = Math.max(...types.map((t) => t.questionCount), 1);
                    const percentage = (item.questionCount / maxCount) * 100;
                    return (
                      <div 
                        key={item.name} 
                        className="group relative flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all cursor-default overflow-hidden"
                      >
                        {/* Popularity bar */}
                        <div
                          className="absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-primary/60 to-primary/20 transition-all duration-700 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-primary transition-colors border border-white/5">
                            <ProblemTypeIcon />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-white/60 group-hover:text-white transition-colors">{item.name}</span>
                            <span className="text-[11px] text-white/30 font-medium">
                              {item.questionCount} โจทย์
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-black text-primary/70 group-hover:text-primary transition-colors tabular-nums">
                            {item.questionCount}
                          </span>
                          <button className="opacity-0 group-hover:opacity-100 p-2 text-white/20 hover:text-red-400 transition-all rounded-lg hover:bg-red-400/10">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full py-20 flex flex-col items-center justify-center text-white/20">
                    <ProblemTypeIcon />
                    <p className="text-sm mt-4 font-bold tracking-widest uppercase">ไม่พบประเภทที่ค้นหา</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="px-8 py-4 bg-white/[0.02] border-t border-white/10">
            <p className="text-xs text-white/50 font-medium">เคล็ดลับ: การแยกประเภทที่ชัดเจนช่วยให้การประเมินสถิติแม่นยำขึ้น</p>
          </div>
        </div>
      </main>
    </>
  );
}
