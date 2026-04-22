"use client";

import { Icon } from "@/components/icons/Icon";

interface Submission {
  id: string | number;
  created_at: string;
  language: string;
  run_time?: number;
  memory_used?: number;
  status: number;
}

interface SubmissionsTabProps {
  submissions: Submission[];
}

export function SubmissionsTab({ submissions }: SubmissionsTabProps) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">การส่งคำตอบล่าสุด</h3>
      </div>

      {submissions.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0d1117]/50">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-[10px] font-bold uppercase tracking-widest text-white/40 border-b border-white/10">
              <tr>
                <th className="px-6 py-4">วันที่</th>
                <th className="px-6 py-4">ภาษา</th>
                <th className="px-6 py-4">เวลา</th>
                <th className="px-6 py-4">หน่วยความจำ</th>
                <th className="px-6 py-4 text-right">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4 text-white/40 font-mono text-xs truncate">
                    {new Date(sub.created_at).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-white/60 bg-white/5 px-2 py-0.5 rounded border border-white/10 uppercase text-[10px]">{sub.language}</span>
                  </td>
                  <td className="px-6 py-4 text-white/60">{sub.run_time ? `${sub.run_time} ms` : "0 ms"}</td>
                  <td className="px-6 py-4 text-white/60">{sub.memory_used ? `${(sub.memory_used / 1024).toFixed(1)} KB` : "0 KB"}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {sub.status === 1 ? (
                        <span className="flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-400/10 px-2 py-0.5 rounded-full text-xs">
                          <Icon name="check-circle" className="w-3 h-3" /> ถูกต้อง
                        </span>
                      ) : sub.status === 2 ? (
                        <span className="flex items-center gap-1.5 text-red-400 font-bold bg-red-400/10 px-2 py-0.5 rounded-full text-xs">
                          <Icon name="x-circle" className="w-3 h-3" /> ผิด
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded-full text-xs">
                          <Icon name="activity" className="w-3 h-3" /> ข้อผิดพลาด
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="border border-white/10 rounded-xl p-12 text-center bg-[#0d1117]/50 mt-4">
          <Icon name="activity" className="w-12 h-12 text-white/10 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white/60 mb-2">ยังไม่มีการส่งคำตอบ</h2>
          <p className="text-sm text-white/40">เริ่มทำโจทย์เพื่อดูประวัติการส่งคำตอบของคุณที่นี่</p>
        </div>
      )}
    </div>
  );
}
