"use client";

import Header from "@/components/Header";

const SubmissionIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>
);

export default function SubmissionsPage() {
  return (
    <>
      <Header title="การส่งคำตอบ" icon={<SubmissionIcon />} />
      <main className="flex-1 p-6 space-y-5 overflow-y-auto w-full max-w-7xl mx-auto">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
          <div className="px-5 py-4 border-b border-white/10 bg-white/[0.02]">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-1 h-5 bg-primary rounded-full"></span>
              ประวัติการส่งคำตอบล่าสุด
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.02] text-[10px] text-white/50 uppercase tracking-widest font-bold border-b border-white/10">
                  <th className="px-5 py-4">เวลา</th>
                  <th className="px-5 py-4">ผู้ใช้</th>
                  <th className="px-5 py-4">โจทย์</th>
                  <th className="px-5 py-4">ผลลัพธ์</th>
                  <th className="px-5 py-4">ภาษา</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { time: "2 นาทีที่แล้ว", user: "Thanawat K.", problem: "Array Sum", result: "Accepted", color: "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20", lang: "Python" },
                  { time: "5 นาทีที่แล้ว", user: "Somchai P.", problem: "Binary Search", result: "Wrong Answer", color: "text-red-400 bg-red-500/10 border border-red-500/20", lang: "C++" },
                  { time: "12 นาทีที่แล้ว", user: "Naree S.", problem: "Graph Path", result: "Time Limit", color: "text-amber-400 bg-amber-500/10 border border-amber-500/20", lang: "Java" },
                  { time: "15 นาทีที่แล้ว", user: "Wichai T.", problem: "Array Sum", result: "Accepted", color: "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20", lang: "Python" },
                  { time: "20 นาทีที่แล้ว", user: "Ploy M.", problem: "Dijkstra", result: "Runtime Error", color: "text-primary bg-primary/10 border border-primary/20", lang: "C" },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-white/[0.04] transition-colors group">
                    <td className="px-5 py-4 text-sm font-medium text-white/40">{row.time}</td>
                    <td className="px-5 py-4 text-sm font-bold text-white">{row.user}</td>
                    <td className="px-5 py-4 text-sm font-bold text-white group-hover:text-primary transition-colors cursor-pointer">{row.problem}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${row.color}`}>
                        {row.result}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-white/40 font-mono">{row.lang}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-white/5 flex justify-center bg-white/[0.01]">
            <button className="text-xs font-bold text-primary hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/10">ดูประวัติทั้งหมด</button>
          </div>
        </div>
      </main>
    </>
  );
}
