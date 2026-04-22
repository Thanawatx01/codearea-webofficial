"use client";

import { Icon } from "@/components/icons/Icon";

interface Activity {
  id: string | number;
  status: number;
  language: string;
  created_at: string;
  questions?: {
    title: string;
  };
}

interface RecentActivityProps {
  recentActivity: Activity[];
  onViewAll: () => void;
}

export function RecentActivity({ recentActivity, onViewAll }: RecentActivityProps) {
  return (
    <div className="bg-[#0d1117] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
      <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
          <Icon name="history" className="w-4 h-4 text-blue-500" />
          กิจกรรมล่าสุด
        </h3>
        <button 
          onClick={onViewAll} 
          className="text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors"
        >
          ดูทั้งหมด
        </button>
      </div>

      <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto no-scrollbar">
        {recentActivity.length > 0 ? recentActivity.map((sub) => (
          <div key={sub.id} className="p-4 hover:bg-white/[0.01] transition-colors group flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${sub.status === 1 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-red-500/10 border-red-500/20 text-red-500"}`}>
                <Icon name={sub.status === 1 ? "check-circle" : "xmark"} className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-white text-sm truncate group-hover:text-primary transition-colors">
                  {sub.questions?.title || "Unknown Question"}
                </h4>
                <div className="flex items-center gap-x-2 text-[9px] text-white/30 uppercase font-mono tracking-widest mt-0.5">
                  <span>{sub.language}</span>
                  <span>•</span>
                  <span>{new Date(sub.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${sub.status === 1 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
              {sub.status === 1 ? "PASSED" : "FAILED"}
            </span>
          </div>
        )) : (
          <div className="p-12 text-center">
            <Icon name="activity" className="w-12 h-12 text-white/5 mx-auto mb-4" />
            <p className="text-sm text-white/30">ยังไม่มีกิจกรรมล่าสุด</p>
          </div>
        )}
      </div>
    </div>
  );
}
