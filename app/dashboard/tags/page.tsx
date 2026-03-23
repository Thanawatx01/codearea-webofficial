"use client";

import { useState } from "react";
import Header from "@/components/Header";
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

export default function TagsPage() {
  const [tags, setTags] = useState(initialTags);
  const [newTag, setNewTag] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([newTag.trim(), ...tags]);
      setNewTag("");
      setIsAdding(false);
    }
  };

  const filteredTags = tags.filter(tag => 
    tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Header title="จัดการแท็ก" icon={<TagIcon />} />
      <main className="flex-1 p-6 space-y-6 overflow-y-auto w-full max-w-7xl mx-auto">
        
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { label: "แท็กทั้งหมด", value: tags.length, color: "text-primary" },
            { label: "ความนิยมสูงสุด", value: "Algorithm", color: "text-emerald-400" },
            { label: "แท็กใหม่เดือนนี้", value: "+5", color: "text-amber-400" },
          ].map((stat, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-2xl flex items-center justify-between group hover:border-primary/30 transition-all">
              <div>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-primary group-hover:bg-primary/10 transition-all border border-white/5">
                <TagIcon />
              </div>
            </div>
          ))}
        </div>

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
              <div className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-white/20 group-focus-within:text-primary transition-colors">
                  <SearchIcon />
                </div>
                <input 
                  type="text" 
                  placeholder="ค้นหาแท็ก..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary w-full md:w-64 transition-all"
                />
              </div>
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
            <div className="flex flex-wrap gap-3">
              {filteredTags.length > 0 ? (
                filteredTags.map((tag) => (
                  <div 
                    key={tag} 
                    className="group relative flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all cursor-default"
                  >
                    <span className="text-sm font-bold text-white/60 group-hover:text-white transition-colors">{tag}</span>
                    <button className="opacity-0 group-hover:opacity-100 p-1 text-white/20 hover:text-red-400 transition-all rounded-lg hover:bg-red-400/10">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>
                ))
              ) : (
                <div className="w-full py-20 flex flex-col items-center justify-center text-white/20">
                  <TagIcon />
                  <p className="text-sm mt-4 font-bold tracking-widest uppercase">ไม่พบแท็กที่ค้นหา</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="px-8 py-4 bg-white/[0.02] border-t border-white/10">
            <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.3em]">เคล็ดลับ: ใช้แท็กที่สื่อความหมายชัดเจนเพื่อช่วยในการค้นหาโจทย์</p>
          </div>
        </div>
      </main>
    </>
  );
}
