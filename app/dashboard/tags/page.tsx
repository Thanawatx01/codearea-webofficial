"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { useRouter } from "next/navigation";
import { initialTags } from "./data";

const TagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>
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

type TagApiRow = {
  id?: string | number;
  name?: string;
  tag_name?: string;
  slug?: string;
  label?: string;
  question_count?: number;
  count?: number;
};

type TagsResponse = {
  data?: TagApiRow[];
  rows?: TagApiRow[];
  items?: TagApiRow[];
  results?: TagApiRow[];
};

export default function TagsPage() {
  const router = useRouter();
  const [tags, setTags] = useState(initialTags);
  const [newTag, setNewTag] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

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

  if (isAuthorized === null) {
    return (
      <div className="flex h-full w-full items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (isAuthorized === false) return null;

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTag.trim();
    if (trimmed && !tags.some((t) => t.name === trimmed)) {
      setTags([{ name: trimmed, questionCount: 0 }, ...tags]);
      setNewTag("");
      setIsAdding(false);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedTag("");
    setSortOrder("popular");
  };

  const hasActiveFilters = searchQuery || selectedTag || sortOrder !== "popular";

  const filteredAndSortedTags = useMemo(() => {
    let result = tags.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = selectedTag ? item.name === selectedTag : true;
      return matchesSearch && matchesTag;
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
  }, [tags, searchQuery, selectedTag, sortOrder]);

  const totalQuestions = useMemo(
    () => tags.reduce((sum, t) => sum + t.questionCount, 0),
    [tags],
  );

  return (
    <>
      <Header title="จัดการแท็ก" icon={<TagIcon />} />
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
                  ค้นหาแท็ก
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-white/20 group-focus-within:text-primary transition-colors">
                    <SearchIcon />
                  </div>
                  <input
                    type="text"
                    placeholder="พิมพ์ชื่อแท็กที่ต้องการค้นหา..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:bg-black/30 transition-all"
                  />
                </div>
              </div>

              {/* Tag Filter Dropdown */}
              <div>
                <label className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] mb-1.5">
                  แท็ก
                </label>
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 focus:bg-black/30 transition-all appearance-none cursor-pointer"
                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.3)' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
                >
                  <option value="" className="bg-[#1a1a2e] text-white">ทั้งหมด</option>
                  {tags.map((item) => (
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
                แสดง <span className="text-primary font-bold">{filteredAndSortedTags.length}</span> จาก <span className="text-white/50 font-bold">{tags.length}</span> แท็ก
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
                  {selectedTag && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[10px] font-bold rounded-full">
                      แท็ก: {selectedTag}
                      <button onClick={() => setSelectedTag("")} className="hover:text-white transition-colors"><XIcon /></button>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Tag Management Card */}
        <div className="bg-[#161622]/60 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="px-8 py-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-3">
                <span className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_15px_rgba(139,92,246,0.5)]"></span>
                รายการแท็ก (Tag List)
              </h2>
              <p className="text-xs text-white/40 mt-1 font-medium italic">จัดการและสร้างป้ายกำกับสำหรับหมวดหมู่โจทย์</p>
            </div>

            <div className="flex items-center gap-3">
              {!isAdding ? (
                <button
                  onClick={() => setIsAdding(true)}
                  className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] flex items-center gap-2 whitespace-nowrap"
                >
                  <PlusIcon />
                  สร้างแท็กใหม่
                </button>
              ) : (
                <form onSubmit={handleAddTag} className="flex items-center gap-2 animate-in slide-in-from-right-4 duration-300">
                  <input
                    autoFocus
                    type="text"
                    placeholder="ชื่อแท็ก..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
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
                    onClick={() => { setIsAdding(false); setNewTag(""); }}
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
                {filteredAndSortedTags.length > 0 ? (
                  filteredAndSortedTags.map((item) => {
                    const maxCount = Math.max(...tags.map((t) => t.questionCount), 1);
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
                            <TagIcon />
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
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full py-20 flex flex-col items-center justify-center text-white/20">
                    <TagIcon />
                    <p className="text-sm mt-4 font-bold tracking-widest uppercase">ไม่พบแท็กที่ค้นหา</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="px-8 py-4 bg-white/[0.02] border-t border-white/10">
            <p className="text-xs text-white/50 font-medium">เคล็ดลับ: ใช้แท็กที่สื่อความหมายชัดเจนเพื่อช่วยในการค้นหาโจทย์</p>
          </div>
        </div>
      </main>
    </>
  );
}
