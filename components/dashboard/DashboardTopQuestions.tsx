import { DashboardPanelHeader } from "./DashboardPanelHeader";
import type { DashboardPayload } from "./types";

type DashboardTopQuestionsProps = {
  questions: DashboardPayload["top_questions"];
};

export function DashboardTopQuestions({
  questions,
}: DashboardTopQuestionsProps) {
  return (
    <div className="flex flex-col rounded-3xl border border-white/[0.08] bg-white/[0.035] p-6 shadow-[0_24px_64px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <DashboardPanelHeader
        className="mb-5"
        title="โจทย์ยอดนิยม 5 อันดับ"
        subtitle="เรียงจากจำนวนครั้งที่ถูกส่ง"
      />
      <ul className="flex flex-1 flex-col gap-2">
        {questions.map((q, index) => (
          <li key={q.question_id}>
            <div className="group flex items-center gap-3 rounded-2xl border border-transparent bg-white/[0.02] px-3 py-3 transition hover:border-white/[0.08] hover:bg-white/[0.04]">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary/30 to-violet-600/10 text-sm font-bold text-violet-200 ring-1 ring-white/10 transition group-hover:from-primary/40 group-hover:ring-primary/25">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white/95">
                  {q.title}
                </p>
                <p className="mt-0.5 font-mono text-[11px] text-white/40">
                  {q.code}
                </p>
              </div>
              <span className="shrink-0 rounded-lg bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold tabular-nums text-cyan-200/95 ring-1 ring-cyan-400/20">
                {q.submission_count.toLocaleString("th-TH")}{" "}
                <span className="font-normal text-cyan-200/60">ครั้ง</span>
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
