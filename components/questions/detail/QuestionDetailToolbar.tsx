import { Icon } from "@/components/icons/Icon";
import { getDifficultyStyle } from "@/components/problems/types";
import Link from "next/link";
import type { QuestionDetail } from "./types";

export default function QuestionDetailToolbar({ data }: { data: QuestionDetail }) {
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-white/10 pb-2">
      <Link
        href="/questions"
        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-semibold text-white/70 transition hover:border-violet-500/30 hover:text-violet-200"
      >
        <Icon name="chevron-left" className="h-3.5 w-3.5" />
        โจทย์ทั้งหมด
      </Link>
      <span className="hidden text-white/20 sm:inline">|</span>
      <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[11px] text-violet-300">
        {data.code}
      </span>
      {(() => {
        const d = getDifficultyStyle(data.difficulty ?? null);
        return (
          <span
            className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${d.color}`}
          >
            {d.label}
          </span>
        );
      })()}
      {data.points != null && Number(data.points) > 0 ? (
        <span className="rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-200">
          {data.points} pts
        </span>
      ) : null}
      <h1 className="min-w-0 flex-1 truncate text-sm font-semibold text-white sm:text-base">
        {data.title}
      </h1>
    </div>
  );
}
