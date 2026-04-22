"use client";

import { Icon } from "@/components/icons/Icon";
import Link from "next/link";

interface SolvedQuestion {
  id: string | number;
  code: string;
  title: string;
  difficulty: number;
  category_name?: string;
}

interface SolvedQuestionsTabProps {
  solvedQuestions: SolvedQuestion[];
}

export function SolvedQuestionsTab({ solvedQuestions }: SolvedQuestionsTabProps) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">โจทย์ที่ทำสำเร็จ</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {solvedQuestions && solvedQuestions.length > 0 ? (
          solvedQuestions.map((q) => (
            <div key={q.id} className="group relative bg-[#0d1117] border border-white/10 rounded-2xl p-5 hover:border-orange-500/30 transition-all hover:shadow-[0_0_20px_rgba(245,158,11,0.05)] flex flex-col justify-between overflow-hidden">
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/[0.03] blur-2xl -z-10 group-hover:bg-orange-500/[0.08] transition-colors"></div>

              <div className="flex items-start justify-between mb-3">
                <span className="text-[10px] font-black font-mono text-white/30 tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/5">{q.code}</span>
                <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${q.difficulty === 1 ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                  q.difficulty === 2 ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                    "bg-red-500/10 text-red-500 border border-red-500/20"
                  }`}>
                  {q.difficulty === 1 ? "Easy" : q.difficulty === 2 ? "Medium" : "Hard"}
                </div>
              </div>

              <h4 className="text-white font-bold group-hover:text-orange-400 transition-colors mb-4 line-clamp-1">{q.title}</h4>

              <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                <div className="flex flex-col gap-0.5">
                  <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest leading-none">หมวดหมู่</p>
                  <p className="text-xs text-white/60 font-medium truncate max-w-[120px]">{q.category_name || "ทั่วไป"}</p>
                </div>
                <Link
                  href={`/questions/${q.code}`}
                  className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:bg-orange-500/10 hover:text-orange-400 border border-white/5 transition-all group/btn"
                >
                  <Icon name="problem" className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full border border-white/10 rounded-xl p-12 text-center bg-[#0d1117]/50">
            <Icon name="problem" className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white/60 mb-2">No Questions Solved Yet</h2>
            <p className="text-sm text-white/40">Challenge yourself and start solving problems to build your collection.</p>
          </div>
        )}
      </div>
    </div>
  );
}
