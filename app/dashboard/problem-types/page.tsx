"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [types, setTypes] = useState<ProblemTypeItem[]>(initialProblemTypes);
  const [newType, setNewType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("popular");
  const [isLoadingCounts, setIsLoadingCounts] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  const fetchCategoriesWithCounts = useCallback(async () => {
    setIsLoadingCounts(true);
    try {
      const res = await api.get<CategoriesResponse>("/question-categories", {
        useToken: true,
        params: { page: 1, limit: 100 },
      });

      if (res.ok && res.data) {
        const raw = (res.data.data ?? res.data.rows ?? res.data.items ?? res.data.results) as CategoryApiRow[];
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
            // Merge with placeholders if necessary, or just replace
            setTypes(mapped);
          }
        } else {
          // If API returns successfully but empty, we keep initial types (the placeholders)
          console.log("Categories API returned empty, keeping placeholders");
        }
      }
    } catch (e) {
      console.error("Error fetching categories:", e);
    }
    setIsLoadingCounts(false);
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      void fetchCategoriesWithCounts();
    }
  }, [isAuthorized, fetchCategoriesWithCounts]);

  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        if (user.role_id === 2) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
          router.replace("/dashboard/problems");
        }
      } catch (e) {
        console.error("Error parsing user from localStorage:", e);
        router.replace("/login");
      }
    } else {
      router.replace("/login");
    }
  }, [router]);

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

  if (isAuthorized === null) {
    return (
      <div className="flex h-full w-full items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (isAuthorized === false) return null;

  return (
    <>
      <Header title="จัดการประเภทโจทย์" icon={<ProblemTypeIcon />} />
      <main className="flex-1 p-6 space-y-6 overflow-y-auto w-full max-w-7xl mx-auto">
        {/* Top Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/5 shadow-2xl flex items-center gap-5 group transition-all duration-300 hover:bg-white/[0.08]">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 group-hover:scale-105 transition-transform">
              <ProblemTypeIcon />
            </div>
            <div>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">ประเภททั้งหมด</p>
              <p className="text-2xl font-black text-white mt-0.5">{types.length}</p>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/5 shadow-2xl flex items-center gap-5 group transition-all duration-300 hover:bg-white/[0.08]">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 group-hover:scale-105 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400 group-hover:scale-110 transition-transform"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <div>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">คำถามรวมทั้งหมด</p>
              <p className="text-2xl font-black text-white mt-0.5">{totalQuestions}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Action Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#1a1c2e]/60 backdrop-blur-2xl p-4 rounded-3xl border border-white/10 shadow-xl">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-white/20 group-focus-within:text-primary transition-colors">
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  placeholder="ค้นหาประเภทโจทย์..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:bg-black/30 transition-all w-full sm:w-64"
                />
              </div>

              <div className="flex items-center gap-2 p-1 bg-black/20 rounded-xl border border-white/5 overflow-hidden">
                <div className="px-3 py-1.5 flex items-center gap-2 border-r border-white/5">
                  <SortIcon />
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">จัดเรียง:</span>
                </div>
                <button
                  onClick={() => setSortOrder("popular")}
                  className={`px-3 py-1 text-[11px] font-bold transition-all rounded-lg ${sortOrder === "popular" ? "bg-primary text-white shadow-lg" : "text-white/40 hover:text-white/60"}`}
                >
                  ยอดนิยม
                </button>
                <button
                  onClick={() => setSortOrder("newest")}
                  className={`px-3 py-1 text-[11px] font-bold transition-all rounded-lg ${sortOrder === "newest" ? "bg-primary text-white shadow-lg" : "text-white/40 hover:text-white/60"}`}
                >
                  ใหม่ล่าสุด
                </button>
                <button
                  onClick={() => setSortOrder("least")}
                  className={`px-3 py-1 text-[11px] font-bold transition-all rounded-lg ${sortOrder === "least" ? "bg-primary text-white shadow-lg" : "text-white/40 hover:text-white/60"}`}
                >
                  น้อยสุด
                </button>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-400 hover:text-red-300 transition-colors bg-red-400/5 hover:bg-red-400/10 rounded-xl"
                >
                  <XIcon />
                  ล้างตัวกรอง
                </button>
              )}
            </div>

            <button
              onClick={() => setIsAdding(true)}
              className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary-hover hover:scale-[1.02] shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all active:scale-95"
            >
              <PlusIcon />
              เพิ่มประเภทใหม่
            </button>
          </div>

          {/* Grid of Types */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {isAdding && (
              <div className="bg-primary/20 border-2 border-dashed border-primary/40 rounded-3xl p-6 transition-all animate-in zoom-in duration-300">
                <form onSubmit={handleAddType} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                       <PlusIcon />
                      สร้างใหม่
                    </span>
                    <button type="button" onClick={() => setIsAdding(false)} className="text-white/40 hover:text-white">
                      <XIcon />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <input
                      autoFocus
                      type="text"
                      placeholder="ชื่อประเภทโจทย์..."
                      value={newType}
                      onChange={(e) => setNewType(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                    />
                    <div className="flex gap-2 pt-1">
                      <button
                        type="submit"
                        className="flex-1 py-2 bg-primary text-white text-[11px] font-bold rounded-lg hover:bg-primary-hover transition-colors"
                      >
                        เพิ่มทันที
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {filteredAndSortedTypes.map((item, idx) => (
              <div
                key={item.name}
                className={`group relative overflow-hidden bg-white/5 border border-white/5 rounded-3xl p-6 transition-all duration-300 hover:bg-white/[0.08] hover:border-white/10 hover:-translate-y-1 hover:shadow-2xl animate-in fade-in slide-in-from-bottom-4`}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all"></div>

                <div className="relative flex flex-col h-full space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-primary/30 transition-all rotate-3 group-hover:rotate-6">
                      <ProblemTypeIcon />
                    </div>
                    <div className="px-2.5 py-1 bg-white/5 border border-white/5 rounded-lg text-[10px] font-bold text-white/30 uppercase tracking-tighter">
                      ID: {idx + 1}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors truncate">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></span>
                      <p className="text-xs font-bold text-white/40 uppercase tracking-wider">
                        {item.questionCount.toLocaleString()} Problems
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between mt-auto border-t border-white/5">
                    <button className="text-[11px] font-black text-white/30 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-1.5">
                      View details
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-400/5 text-red-400/30 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredAndSortedTypes.length === 0 && !isAdding && (
            <div className="py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/5">
                <ProblemTypeIcon />
              </div>
              <p className="text-white/40 font-bold uppercase tracking-widest text-sm italic">ไม่พบประเภทที่ต้องการค้นหา</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
