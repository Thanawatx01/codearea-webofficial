"use client";

import { Icon } from "@/components/icons/Icon";

interface QuickStatsProps {
  levelInfo: {
    level: number;
    name: string;
    currentXp: number;
    nextLevelXp: number;
    progress: number;
  };
  streakInfo: {
    currentStreak: number;
    lastSevenDays: boolean[];
  };
  stats: {
    passedCount: number;
    totalSubmissions: number;
    accuracy: number;
    globalRank: number;
    totalUsers: number;
  };
}

export function QuickStats({ levelInfo, streakInfo, stats }: QuickStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* XP & Level Card */}
      <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-4 shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/10 blur-2xl -z-10 group-hover:bg-orange-500/20 transition-all"></div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
            <Icon name="zap" className="w-4 h-4 text-orange-500" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">เลเวล {levelInfo.level}</span>
        </div>
        <p className="text-xl font-black text-white truncate">{levelInfo.name}</p>
        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-white/30">
            <span>{levelInfo.currentXp} XP</span>
            <span>{levelInfo.nextLevelXp} XP</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-linear-to-r from-orange-500 to-amber-400 transition-all duration-1000 ease-out" 
              style={{ width: `${levelInfo.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Streak Card */}
      <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-4 shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/10 blur-2xl -z-10 group-hover:bg-red-500/20 transition-all"></div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20">
            <Icon name="fire" className="w-4 h-4 text-red-500 animate-pulse" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">ทำต่อเนื่อง</span>
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-black text-white">{streakInfo.currentStreak}</p>
          <p className="text-xs font-bold text-white/40">วัน</p>
        </div>
        <div className="flex gap-1 mt-4">
          {streakInfo.lastSevenDays.map((active, i) => (
            <div 
              key={i} 
              className={`h-2 flex-1 rounded-full ${active ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" : "bg-white/5"}`}
              title={`Day ${i+1}: ${active ? 'Active' : 'Inactive'}`}
            />
          ))}
        </div>
      </div>

      {/* Problems Solved Card */}
      <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-4 shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 blur-2xl -z-10 group-hover:bg-emerald-500/20 transition-all"></div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <Icon name="check-circle" className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">โจทย์ที่ผ่าน</span>
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-black text-white">{stats.passedCount}</p>
          <p className="text-xs font-bold text-white/40">/ {stats.totalSubmissions}</p>
        </div>
        <p className="text-[10px] font-bold text-emerald-500/60 mt-4 uppercase tracking-widest">ความถูกต้อง {stats.accuracy}%</p>
      </div>

      {/* Ranking Card */}
      <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-4 shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 blur-2xl -z-10 group-hover:bg-blue-500/20 transition-all"></div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Icon name="trophy" className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">อันดับโลก</span>
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-black text-white">#{stats.globalRank || stats.totalUsers}</p>
          <p className="text-xs font-bold text-white/40">จาก {stats.totalUsers || 0}</p>
        </div>
        <p className="text-[10px] font-bold text-blue-500/60 mt-4 uppercase tracking-widest">
          {(stats.globalRank / (stats.totalUsers || 1)) <= 0.1 ? 'TOP 10% DEVELOPERS' : 'GLOBAL DEVELOPER'}
        </p>
      </div>
    </div>
  );
}
