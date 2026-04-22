"use client";

import { Icon } from "@/components/icons/Icon";
import Link from "next/link";

interface ProfileHeaderProps {
  profileData: {
    name: string;
    avatarUrl: string;
    email: string;
    bio: string;
  };
  roleId: number;
}

export function ProfileHeader({ profileData, roleId }: ProfileHeaderProps) {
  return (
    <div className="xl:col-span-3 space-y-6">
      {/* รูปโปรไฟล์ (Avatar) */}
      <div className="relative group w-48 xl:w-[260px] max-w-full mx-auto shrink-0">
        <div className="w-full aspect-square rounded-full bg-linear-to-br from-primary/20 to-blue-500/20 text-primary flex items-center justify-center font-black border border-white/10 shadow-2xl ring-4 ring-white/5 group-hover:scale-[1.02] transition-all overflow-hidden relative">
          {profileData.avatarUrl ? (
            <img src={profileData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-6xl xl:text-8xl font-bold text-white/50">{profileData.name.charAt(0).toUpperCase()}</span>
          )}
        </div>
      </div>

      {/* ชื่อที่แสดงและบทบาท (Display Name & Role) */}
      <div className="space-y-2 text-center pt-2">
        <div className="flex flex-col items-center justify-center gap-2">
          <h1 className="text-2xl font-bold text-white leading-tight break-words">{profileData.name}</h1>

          {roleId === 2 && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-linear-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)] group/admin">
              <Icon name="shield" className="w-3.5 h-3.5 text-amber-500 group-hover/admin:scale-110 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">แอดมิน</span>
            </div>
          )}
        </div>
      </div>

      {/* อีเมล (Email) */}
      <div className="flex items-center justify-center gap-2 text-sm text-white/60">
        <Icon name="mail" className="w-4 h-4 text-white/40" />
        <a href={`mailto:${profileData.email}`} className="truncate hover:text-blue-400 hover:underline">{profileData.email}</a>
      </div>

      {/* คำแนะนำตัว (Bio) */}
      <div className="pt-2">
        <p className="text-sm text-white/80 leading-relaxed text-center break-words">
          {profileData.bio || "ยังไม่มีคำแนะนำตัว"}
        </p>
      </div>

      {/* การดำเนินการ (Actions) */}
      <div className="pt-4 space-y-3">
        <Link
          href="/profile/settings"
          className="w-full py-1.5 px-3 block text-center rounded-md bg-[#21262d] border border-white/10 text-sm font-semibold hover:bg-[#30363d] hover:border-white/20 transition-all shadow-sm text-white"
        >
          แก้ไขโปรไฟล์
        </Link>
      </div>
    </div>
  );
}
