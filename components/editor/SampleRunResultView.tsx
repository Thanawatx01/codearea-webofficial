"use client";

import type {
  SampleRunResponse,
  SampleRunCaseResult,
} from "@/lib/questionRunApi";

export type SampleExampleRow = {
  id?: number;
  input_data: string;
  output_data: string;
  case_order?: number | null;
};

function formatMem(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "—";
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(2)} MB`;
}

function findRunForExample(
  result: SampleRunResponse | null,
  sample: SampleExampleRow,
  index: number,
): SampleRunCaseResult | undefined {
  if (!result?.results?.length) return undefined;
  if (sample.id != null) {
    const byId = result.results.find((r) => r.test_case_id === sample.id);
    if (byId) return byId;
  }
  const order = sample.case_order ?? (index + 1);
  return result.results.find((r) => r.case_order === order);
}

/** เมื่อไม่มีตัวอย่างจากโจทย์ แต่มีผลรัน — แสดงรายการจาก API อย่างเดียว */
function FallbackResultCard({ row }: { row: SampleRunCaseResult }) {
  const ok = row.passed;
  return (
    <li
      className={`rounded-lg border px-3 py-2.5 text-xs ${
        ok
          ? "border-emerald-500/20 bg-emerald-500/[0.05]"
          : "border-white/10 bg-black/30"
      }`}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] uppercase text-white/45">
          เทสต์ #{row.case_order}
        </span>
        <span
          className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
            ok
              ? "bg-emerald-500/20 text-emerald-300"
              : "bg-amber-500/15 text-amber-200"
          }`}
        >
          {ok ? "ผ่าน" : "ไม่ผ่าน"}
        </span>
        <span className="ml-auto font-mono text-[10px] text-white/35">
          {row.run_time} ms · {formatMem(row.memory_used)}
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <div>
          <span className="text-[10px] font-bold uppercase text-white/35">
            Input
          </span>
          <pre className="mt-1 whitespace-pre-wrap break-words rounded-md border border-white/10 bg-black/45 p-2 font-mono text-[11px] text-white/80">
            {row.input_data ?? "—"}
          </pre>
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase text-white/35">
            คาดหวัง
          </span>
          <pre className="mt-1 whitespace-pre-wrap break-words rounded-md border border-white/10 bg-black/45 p-2 font-mono text-[11px] text-sky-200/85">
            {row.expected_output ?? "—"}
          </pre>
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase text-white/35">
            ได้จากโค้ด
          </span>
          <pre className="mt-1 whitespace-pre-wrap break-words rounded-md border border-white/10 bg-black/45 p-2 font-mono text-[11px] text-violet-100/90">
            {row.output_data === "" ? "(ว่าง)" : row.output_data ?? "—"}
          </pre>
        </div>
      </div>
    </li>
  );
}

function MergedExampleCard({
  sample,
  index,
  runRow,
}: {
  sample: SampleExampleRow;
  index: number;
  runRow?: SampleRunCaseResult;
}) {
  return (
    <li className="rounded-xl border border-white/10 bg-black/35 p-3 text-xs">
      <p className="mb-2 font-mono text-[9px] uppercase tracking-wider text-white/40">
        ตัวอย่าง {sample.case_order ?? (index + 1)}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <span className="text-[11px] text-white/45">Input</span>
          <pre className="mt-1 whitespace-pre-wrap break-words rounded-lg border border-white/10 bg-black/45 p-2.5 font-mono text-[13px] leading-snug text-white/85">
            {sample.input_data ?? "—"}
          </pre>
        </div>
        <div>
          <span className="text-[11px] text-white/45">Output (คาดหวัง)</span>
          <pre className="mt-1 whitespace-pre-wrap break-words rounded-lg border border-white/10 bg-black/45 p-2.5 font-mono text-[13px] leading-snug text-emerald-200/90">
            {sample.output_data ?? "—"}
          </pre>
        </div>
      </div>

      {runRow ? (
        <div className="mt-3 border-t border-white/10 pt-3">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-200/80">
              ผลการรัน
            </span>
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                runRow.passed
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-amber-500/15 text-amber-200"
              }`}
            >
              {runRow.passed ? "ผ่าน" : "ไม่ผ่าน"}
            </span>
            <span className="ml-auto font-mono text-[10px] text-white/35">
              {runRow.run_time} ms · {formatMem(runRow.memory_used)}
            </span>
          </div>
          {runRow.error_message ? (
            <p className="mb-2 rounded border border-red-400/20 bg-red-400/5 px-2 py-1.5 font-mono text-[11px] text-red-300">
              {runRow.error_message}
            </p>
          ) : null}
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
            Output จากโค้ดของคุณ
          </span>
          <pre className="mt-1 whitespace-pre-wrap break-words rounded-lg border border-white/10 bg-black/45 p-2.5 font-mono text-[13px] leading-snug text-violet-100/90">
            {runRow.output_data === "" ? "(ว่าง)" : runRow.output_data ?? "—"}
          </pre>
        </div>
      ) : null}
    </li>
  );
}

export default function SampleRunResultView({
  data,
  error,
  isRunning,
  emptyHint,
  examples = [],
}: {
  data: SampleRunResponse | null;
  error: string | null;
  isRunning: boolean;
  examples?: SampleExampleRow[];
  emptyHint: string;
}) {
  const hasExamples = examples.length > 0;

  return (
    <div className="flex flex-col text-sm">
      <div className="shrink-0 border-b border-white/10 bg-white/[0.03] px-5 py-2.5">
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-200/90">
            ตัวอย่างจากโจทย์
          </span>
          <span className="text-[10px] leading-snug text-white/35">
            {hasExamples
              ? "หลังกดรันทดสอบ ผลของแต่ละเทสต์จะแสดงใต้ตัวอย่างข้อนั้น"
              : "โจทย์นี้ยังไม่มีตัวอย่างเทส — ถ้ามีผลรันจะแสดงด้านล่าง"}
          </span>
        </div>
      </div>

      <div className="px-5 py-4">
        {isRunning && (
          <div className="mb-4 flex flex-col gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-xs italic text-primary/70">
              กำลังรันบนเซิร์ฟเวอร์…
            </span>
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-lg border border-amber-500/25 bg-amber-500/10 p-3 text-center text-sm text-amber-100/95">
            <p>{error}</p>
            {error.includes("เข้าสู่ระบบ") && (
              <a
                href="/login"
                className="mt-2 inline-block text-sm font-semibold text-violet-300 underline-offset-2 hover:text-violet-200 hover:underline"
              >
                ไปหน้าเข้าสู่ระบบ
              </a>
            )}
          </div>
        )}
        {data && !isRunning && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-white/10 pb-3">
              <div className="flex items-baseline gap-2">
                <span className="text-[10px] font-bold uppercase text-white/35">
                  คะแนน
                </span>
                <span className="text-base font-bold tabular-nums text-white/95">
                  {data.score_percent}%
                </span>
              </div>
              <p className="text-[11px] text-white/55">
                <span className="font-mono text-emerald-300/90">
                  {data.summary.tests_passed}
                </span>
                <span>/</span>
                <span className="font-mono">{data.summary.tests_total}</span>
                <span className="text-white/40"> ผ่าน</span>
                {data.summary.tests_wrong_answer > 0 ||
                data.summary.tests_error > 0 ? (
                  <span className="text-white/35">
                    {" "}
                    · WA {data.summary.tests_wrong_answer}
                    {data.summary.tests_error > 0
                      ? ` · ผิดพลาด ${data.summary.tests_error}`
                      : ""}
                  </span>
                ) : null}
              </p>
            </div>
            {data.summary.avg_note || data.summary.per_test_run_time_memory_note ? (
              <details className="rounded-lg border border-white/[0.06] bg-black/25 px-3 py-2">
                <summary className="cursor-pointer select-none text-[10px] font-medium text-white/45">
                  หมายเหตุจากระบบ (เวลา / หน่วยความจำ)
                </summary>
                <div className="mt-2 space-y-1.5 text-[10px] leading-relaxed text-white/40">
                  {data.summary.avg_note ? <p>{data.summary.avg_note}</p> : null}
                  {data.summary.per_test_run_time_memory_note ? (
                    <p>{data.summary.per_test_run_time_memory_note}</p>
                  ) : null}
                </div>
              </details>
            ) : null}
          </div>
        )}

        {hasExamples ? (
          <ul className={`space-y-3 ${data && !isRunning ? "mt-4" : "mt-0"}`}>
            {examples.map((sample, i) => (
              <MergedExampleCard
                key={sample.id ?? i}
                sample={sample}
                index={i}
                runRow={data ? findRunForExample(data, sample, i) : undefined}
              />
            ))}
          </ul>
        ) : null}

        {!hasExamples && data && !isRunning ? (
          <ul className="mt-4 space-y-2">
            {[...data.results]
              .sort((a, b) => a.case_order - b.case_order)
              .map((row) => (
                <FallbackResultCard key={row.test_case_id} row={row} />
              ))}
          </ul>
        ) : null}

        {!isRunning && !data && !error && !hasExamples && (
          <div className="flex min-h-[8rem] flex-col items-center justify-center py-8 text-white/15">
            <svg className="mb-2 h-10 w-10 opacity-[0.12]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            <span className="text-xs font-bold uppercase tracking-widest">
              {emptyHint}
            </span>
          </div>
        )}
      </div>

      {data && !isRunning ? (
        <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-white/10 bg-white/[0.04] px-5 py-3 sm:grid-cols-4">
          <div>
            <span className="text-[9px] font-black uppercase text-white/30">
              เฉลี่ยเวลา
            </span>
            <p className="font-mono text-[11px] text-white/70">
              {data.summary.avg_run_time_ms} ms
            </p>
          </div>
          <div>
            <span className="text-[9px] font-black uppercase text-white/30">
              เฉลี่ยหน่วยความจำ
            </span>
            <p className="font-mono text-[11px] text-white/70">
              {formatMem(data.summary.avg_memory_used_bytes)}
            </p>
          </div>
          <div>
            <span className="text-[9px] font-black uppercase text-white/30">
              โจทย์
            </span>
            <p className="truncate font-mono text-[11px] text-violet-200/85">
              {data.question_code}
            </p>
          </div>
          <div>
            <span className="text-[9px] font-black uppercase text-white/30">
              ภาษา
            </span>
            <p className="font-mono text-[11px] text-white/70">
              {data.language}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
