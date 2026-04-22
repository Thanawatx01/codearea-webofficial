"use client";

import { Icon } from "@/components/icons/Icon";

interface Achievement {
  id: string | number;
  earned: boolean;
  icon: string;
  color: string;
  name: string;
  description: string;
}

interface AchievementsListProps {
  achievements: Achievement[];
}

export function AchievementsList({ achievements }: AchievementsListProps) {
  return (
    <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-6 shadow-xl relative">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
          <Icon name="award" className="w-4 h-4 text-amber-500" />
          Achievements
        </h3>
      </div>
      <div className="grid grid-cols-5 gap-3">
        {achievements.map((ach) => (
          <div 
            key={ach.id} 
            className={`aspect-square rounded-xl flex items-center justify-center border transition-all cursor-help group/ach relative ${
              ach.earned 
                ? "bg-white/5 border-white/10 hover:border-amber-500/50 hover:bg-white/10" 
                : "bg-black/20 border-white/5 hover:border-white/10"
            }`}
          >
            <div className={`transition-all duration-300 ${ach.earned ? "scale-100" : "scale-90 grayscale opacity-20"}`}>
              <Icon name={ach.icon} className={`w-6 h-6 ${ach.earned ? ach.color : "text-white"}`} />
            </div>

            {!ach.earned && (
              <div className="absolute inset-0 flex items-center justify-center opacity-40 group-hover/ach:opacity-10 transition-opacity">
                <Icon name="lock" className="w-3 h-3 text-white/20" />
              </div>
            )}
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-40 p-3 bg-[#1c2128] border border-white/10 rounded-xl opacity-0 invisible group-hover/ach:opacity-100 group-hover/ach:visible transition-all z-[100] text-center pointer-events-none shadow-2xl backdrop-blur-md">
              <div className="flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${ach.earned ? "bg-amber-500/10" : "bg-white/5"}`}>
                  <Icon name={ach.icon} className={`w-4 h-4 ${ach.earned ? ach.color : "text-white/20"}`} />
                </div>
                <div>
                  <p className="text-[11px] font-black text-white leading-none mb-1">{ach.name}</p>
                  <p className="text-[9px] text-white/40 leading-tight px-1">{ach.description}</p>
                </div>
                <div className={`mt-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${ach.earned ? "bg-emerald-500/10 text-emerald-500" : "bg-white/5 text-white/30"}`}>
                  {ach.earned ? "UNLOCKED" : "LOCKED"}
                </div>
              </div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-[#1c2128]"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
