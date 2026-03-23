"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { initialProblemTypes } from "./data";

const ProblemTypeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

export default function ProblemTypesPage() {
  const [types, setTypes] = useState(initialProblemTypes);
  const [newType, setNewType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddType = (e: React.FormEvent) => {
    e.preventDefault();
    if (newType.trim() && !types.includes(newType.trim())) {
      setTypes([newType.trim(), ...types]);
      setNewType("");
      setIsAdding(false);
    }
  };

  const filteredTypes = types.filter(type => 
    type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Header title="จัดการประเภทโจทย์" icon={<ProblemTypeIcon />} />
      <main className="flex-1 p-6 space-y-6 overflow-y-auto w-full max-w-7xl mx-auto">
        
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { label: "ประเภททั้งหมด", value: types.length, color: "text-primary" },
            { label: "ใช้งานบ่อยสุด", value: types[0] || "None", color: "text-amber-400" },
            { label: "เพิ่มเดือนนี้", value: "+2", color: "text-emerald-400" },
          ].map((stat, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-2xl flex items-center justify-between group hover:border-primary/30 transition-all">
              <div>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-primary group-hover:bg-primary/10 transition-all border border-white/5">
                <ProblemTypeIcon />
              </div>
            </div>
          ))}
        </div>

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
              <div className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-white/20 group-focus-within:text-primary transition-colors">
                  <SearchIcon />
                </div>
                <input 
                  type="text" 
                  placeholder="ค้นหาประเภท..." 
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTypes.length > 0 ? (
                filteredTypes.map((type) => (
                  <div 
                    key={type} 
                    className="group flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all cursor-default"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-primary transition-colors border border-white/5">
                        <ProblemTypeIcon />
                      </div>
                      <span className="text-sm font-bold text-white/60 group-hover:text-white transition-colors">{type}</span>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 p-2 text-white/20 hover:text-red-400 transition-all rounded-lg hover:bg-red-400/10">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 flex flex-col items-center justify-center text-white/20">
                  <ProblemTypeIcon />
                  <p className="text-sm mt-4 font-bold tracking-widest uppercase">ไม่พบประเภทที่ค้นหา</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="px-8 py-4 bg-white/[0.02] border-t border-white/10">
            <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.3em]">เคล็ดลับ: การแยกประเภทที่ชัดเจนช่วยให้การประเมินสถิติแม่นยำขึ้น</p>
          </div>
        </div>
      </main>
    </>
  );
}
