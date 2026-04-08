import type { ProblemRow } from "@/components/problems/types";
import { getDifficultyStyle } from "@/components/problems/types";
import Link from "next/link";

export default function QuestionsProblemRow({
  row,
  showTags,
}: {
  row: ProblemRow;
  showTags: boolean;
}) {
  const diff = getDifficultyStyle(row.difficulty);
  const pts = Number(row.points) || 0;
  const prog = row.user_progress;
  const pct = prog ? Math.min(100, Math.max(0, prog.score_percent)) : null;
  const barClass =
    pct === 100
      ? "bg-linear-to-r from-emerald-500 to-teal-400"
      : "bg-linear-to-r from-violet-500 via-violet-400 to-fuchsia-400";

  return (
    <li>
      <Link
        href={`/questions/${encodeURIComponent(row.code)}`}
        className="group block rounded-xl border border-white/10 bg-white/[0.05] shadow-[0_4px_24px_rgba(0,0,0,0.15)] backdrop-blur-md transition hover:border-violet-400/35 hover:bg-white/[0.09] hover:shadow-[0_8px_36px_rgba(139,92,246,0.12)]"
      >
        <div className="flex flex-col gap-2.5 p-3.5 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,9rem)_4.5rem_minmax(7rem,8.5rem)] md:items-center md:gap-3 md:px-4 md:py-2.5">
          <div className="min-w-0">
            <p className="line-clamp-2 font-semibold text-white group-hover:text-violet-100">
              {row.title}
            </p>
            <p className="mt-1 font-mono text-xs text-white/40">{row.code}</p>
          </div>
          <div className="min-w-0 text-xs md:text-[13px]">
            {showTags && row.tags.length > 0 ? (
              <span className="line-clamp-2 text-white/50">
                {row.tags.slice(0, 4).join(" · ")}
                {row.tags.length > 4 ? ` +${row.tags.length - 4}` : ""}
              </span>
            ) : showTags ? (
              <span className="text-white/30">—</span>
            ) : (
              <span className="text-white/30">ปิดแสดงแท็ก</span>
            )}
          </div>
          <div className="flex justify-start md:justify-center">
            <span
              className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ${diff.color}`}
            >
              {diff.label}
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            {prog && pct !== null ? (
              <>
                <div className="h-2 w-full max-w-[7rem] overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full transition-[width] ${barClass}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[11px] tabular-nums text-white/70">
                  {pct}% ผ่าน · {prog.tests_passed}/{prog.tests_total} เทส
                </span>
              </>
            ) : (
              <span className="text-[11px] text-white/30">—</span>
            )}
            {pts > 0 ? (
              <span className="text-[11px] tabular-nums text-white/45">
                คะแนนเต็ม {pts} pts
              </span>
            ) : (
              <span className="text-[11px] text-white/30">ไม่ระบุคะแนน</span>
            )}
          </div>
        </div>
      </Link>
    </li>
  );
}
