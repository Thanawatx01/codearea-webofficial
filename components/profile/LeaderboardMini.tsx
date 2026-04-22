"use client";

import { Icon } from "@/components/icons/Icon";

interface LeaderboardUser {
  rank: number;
  name: string;
  avatar: string;
  xp: number;
  isMe: boolean;
}

interface LeaderboardMiniProps {
  leaderboard: LeaderboardUser[];
}

export function LeaderboardMini({ leaderboard }: LeaderboardMiniProps) {
  return (
    <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
          <Icon name="trending-up" className="w-4 h-4 text-blue-500" />
          Leaderboard
        </h3>
      </div>
      <div className="space-y-4">
        {leaderboard.map((user) => (
          <div key={user.name} className={`flex items-center justify-between p-2 rounded-xl border transition-all ${user.isMe ? "bg-primary/10 border-primary/20" : "bg-white/[0.02] border-transparent"}`}>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-black w-4 ${user.rank === 1 ? "text-amber-400" : user.rank === 2 ? "text-slate-300" : user.rank === 3 ? "text-orange-400" : "text-white/20"}`}>
                {user.rank}
              </span>
              <div className="w-6 h-6 rounded-full bg-white/10 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                {user.avatar ? (
                  <img src={user.avatar} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] font-bold text-white/40">{(user.name || "U").charAt(0).toUpperCase()}</span>
                )}
              </div>
              <span className={`text-xs font-bold ${user.isMe ? "text-primary" : "text-white/60"}`}>
                {user.name}
              </span>
            </div>
            <span className="text-[10px] font-black text-white/40">{user.xp.toLocaleString()} XP</span>
          </div>
        ))}
      </div>
      <button className="w-full mt-6 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 hover:bg-white/10 hover:text-white transition-all">
        View Full Rankings
      </button>
    </div>
  );
}
