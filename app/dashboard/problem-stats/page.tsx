"use client";

import Header from "@/components/Header";

const StatsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
);

export default function ProblemStatsPage() {
  return (
    <>
      <Header title="สถิติโจทย์" icon={<StatsIcon />} />
      <main className="flex-1 p-6 space-y-5 overflow-y-auto w-full max-w-7xl mx-auto">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/5 p-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-1 h-5 bg-primary rounded-full"></span>
              อัตราการส่งคำตอบและผ่าน (รายเดือน)
            </h2>
            <select className="text-sm border border-white/10 rounded-xl px-4 py-2 bg-black/20 text-white focus:outline-none focus:border-primary shadow-inner appearance-none cursor-pointer">
              <option className="bg-background">มกราคม 2024</option>
              <option className="bg-background">กุมภาพันธ์ 2024</option>
              <option className="bg-background">มีนาคม 2024</option>
            </select>
          </div>
          
          <div className="h-64 border border-dashed border-white/10 rounded-2xl flex items-center justify-center bg-white/[0.02] relative overflow-hidden">
            {/* Fake chart visualization */}
            <div className="absolute inset-0 flex items-end justify-around p-4 gap-2 opacity-80 backdrop-blur-sm">
              {[40, 70, 30, 80, 50, 90, 60, 40, 85, 45, 75, 55].map((height, i) => (
                <div key={i} className="w-full flex gap-1.5 items-end justify-center h-full pb-2">
                  <div className="w-full max-w-[12px] bg-primary/60 rounded-t-sm shadow-[0_0_10px_rgba(139,92,246,0.5)]" style={{ height: `${height}%` }}></div>
                  <div className="w-full max-w-[12px] bg-emerald-400/60 rounded-t-sm shadow-[0_0_10px_rgba(52,211,153,0.5)]" style={{ height: `${height * 0.6}%` }}></div>
                </div>
              ))}
            </div>
            
            <div className="z-10 bg-background/80 backdrop-blur-md px-5 py-3 rounded-xl shadow-2xl border border-white/10 text-xs font-bold text-white flex items-center gap-3">
              <span className="text-primary"><StatsIcon /></span>
              ภาพรวมสถิติอยู่ระหว่างการเชื่อมต่อข้อมูล API
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-8 mt-8">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_10px_rgba(139,92,246,0.5)]"></div>
              <span className="text-xs font-bold text-white/50 uppercase tracking-wider">จำนวนการส่ง (Submissions)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
              <span className="text-xs font-bold text-white/50 uppercase tracking-wider">จำนวนที่ผ่าน (Accepted)</span>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
