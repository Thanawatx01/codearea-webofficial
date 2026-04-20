"use client";

import AiAssistantMarkdown from "@/components/questions/detail/AiAssistantMarkdown";
import { Icon } from "@/components/icons/Icon";
import type {
  FullSubmitResponse,
  HiddenSubmissionTestCase,
} from "@/lib/questionSubmitApi";
import { EditorToolbarButton } from "./EditorToolbarPrimitives";

function formatMem(bytes: number | undefined): string {
  if (bytes == null || !Number.isFinite(bytes) || bytes <= 0) return "—";
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(2)} MB`;
}

function statusLabel(s: string | number | undefined): string {
  if (s == null) return "—";
  return String(s);
}

function outputsMatch(expected: string | undefined, actual: string | undefined): boolean {
  const a = (expected ?? "").trim();
  const b = (actual ?? "").trim();
  return a.length > 0 && b.length > 0 && a === b;
}

function HiddenCaseCardMock({
  row,
  index,
}: {
  row: HiddenSubmissionTestCase;
  index: number;
}) {
  const matched = outputsMatch(row.expected_output, row.actual_output);
  return (
    <li className="rounded-xl border border-white/[0.07] bg-gradient-to-br from-[#14151f]/95 to-[#0c0d12]/95 p-4 shadow-[0_4px_24px_rgba(0,0,0,0.35)]">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold text-white/85">
          Test Case {index + 1}{" "}
          <span className="font-normal text-white/35">· เทสต์ซ่อน</span>
        </span>
        <span className="ml-auto flex items-center gap-1.5 font-mono text-[10px] text-white/40">
          {row.run_time != null ? `${row.run_time} ms` : "—"}
          <span className="text-white/20">·</span>
          {formatMem(row.memory_used)}
        </span>
      </div>
      <div className="grid gap-3 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-4">
          <span className="text-[9px] font-bold uppercase tracking-wider text-sky-400/80">
            Input
          </span>
          <pre className="mt-1.5 max-h-36 overflow-auto whitespace-pre-wrap wrap-break-word rounded-lg border border-white/[0.06] bg-black/60 p-3 font-mono text-[11px] leading-relaxed text-slate-200/92">
            {row.input_data ?? "—"}
          </pre>
        </div>
        <div className="lg:col-span-5">
          <span className="text-[9px] font-bold uppercase tracking-wider text-violet-400/80">
            Expected / Actual
          </span>
          <pre className="mt-1.5 max-h-36 overflow-auto whitespace-pre-wrap wrap-break-word rounded-lg border border-white/[0.06] bg-black/60 p-3 font-mono text-[11px] leading-relaxed text-slate-200/92">
            <span className="text-emerald-300/85">{row.expected_output ?? "—"}</span>
            {"\n"}
            <span className="text-white/25">— — —</span>
            {"\n"}
            <span className={matched ? "text-violet-200/95" : "text-amber-200/90"}>
              {row.actual_output === "" ? "(ว่าง)" : row.actual_output ?? "—"}
            </span>
          </pre>
        </div>
        <div className="flex lg:col-span-3 lg:flex-col lg:items-end lg:justify-start">
          <span className="text-[9px] font-bold uppercase tracking-wider text-white/35 lg:mb-2 lg:text-right">
            Status
          </span>
          {matched ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/35 bg-violet-500/15 px-3 py-1.5 text-[11px] font-semibold text-violet-200 shadow-[0_0_16px_rgba(139,92,246,0.15)]">
              <Icon name="check" className="h-3.5 w-3.5 text-violet-300" />
              ตรงตามคาด
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/35 bg-amber-500/12 px-3 py-1.5 text-[11px] font-semibold text-amber-200">
              <span className="text-amber-400/80">✗</span>
              {statusLabel(row.status)}
            </span>
          )}
        </div>
      </div>
      {row.error_message ? (
        <p className="mt-3 rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2 font-mono text-[11px] text-red-200/90">
          {row.error_message}
        </p>
      ) : null}
    </li>
  );
}

/** การ์ดสถิติแนว mockup (runtime / memory / score) */
function StatCard({
  label,
  value,
  sub,
  barPercent,
  barClass,
}: {
  label: string;
  value: string;
  sub?: string;
  barPercent: number;
  barClass: string;
}) {
  const w = Math.min(100, Math.max(4, barPercent));
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-transparent px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">{label}</p>
      <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-white/95">{value}</p>
      {sub ? (
        <p className="mt-1 text-[11px] font-medium text-sky-400/85">{sub}</p>
      ) : null}
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/40">
        <div
          className={`h-full rounded-full transition-all ${barClass}`}
          style={{ width: `${w}%` }}
        />
      </div>
    </div>
  );
}

export default function SubmitHiddenResultPanel({
  data,
  error,
  isSubmitting,
  analysisText,
  analysisError,
  isAnalyzing,
  onRequestAnalysis,
  questionCode,
  summaryPage = false,
  problemTitle,
}: {
  data: FullSubmitResponse | null;
  error: string | null;
  isSubmitting: boolean;
  analysisText: string;
  analysisError: string | null;
  isAnalyzing: boolean;
  onRequestAnalysis: () => void;
  questionCode: string;
  summaryPage?: boolean;
  problemTitle?: string;
}) {
  const summary = data?.test_summary;
  const cases = data?.submission_test_cases ?? [];
  const showEmpty =
    !isSubmitting && !data && !error && !analysisText && !analysisError;

  const testsTotal = summary?.tests_total ?? cases.length ?? 0;
  const testsPassed = summary?.tests_passed ?? 0;
  const passRatio =
    testsTotal > 0 ? Math.round((testsPassed / testsTotal) * 100) : 0;
  const scorePct = data?.score_percent ?? 0;
  const allClear =
    (testsTotal > 0 && testsPassed === testsTotal && scorePct >= 100) ||
    (testsTotal > 0 && testsPassed === testsTotal) ||
    scorePct >= 100;

  const runMs =
    summary?.avg_run_time_ms ??
    summary?.run_time_ms ??
    (() => {
      const times = cases.map((c) => c.run_time).filter((t): t is number => typeof t === "number");
      if (!times.length) return null;
      return Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    })();

  const memBytes = summary?.avg_memory_used_bytes ?? summary?.memory_used_bytes;

  return (
    <div
      className={`flex flex-col text-sm ${summaryPage ? "" : "border-t border-white/10"}`}
    >
      {!summaryPage ? (
        <div className="shrink-0 border-b border-white/10 bg-white/[0.03] px-5 py-2.5">
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-200/90">
              ส่งโค้ด (เทสต์ซ่อน)
            </span>
            <span className="text-[10px] leading-snug text-white/35">
              กด «ส่งโค้ด» บนหน้าโจทย์เพื่อรันเทสต์ซ่อน แล้วดูสรุปที่หน้าถัดไป
            </span>
          </div>
        </div>
      ) : null}

      <div className={summaryPage ? "px-5 pb-5 pt-6 sm:px-6" : "px-5 py-4"}>
        {summaryPage && data && !isSubmitting ? (
          <div className="mb-8 border-b border-white/[0.07] pb-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Submission Results
                </h2>
                <p className="mt-1 text-[13px] text-white/45">
                  สรุปผลการส่งโค้ด
                  {problemTitle ? (
                    <>
                      <span className="mx-2 text-white/25">·</span>
                      <span className="text-white/70">{problemTitle}</span>
                    </>
                  ) : null}
                </p>
              </div>
              <div className="flex flex-col items-start gap-2 sm:items-end">
                {allClear ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/40 bg-gradient-to-r from-violet-600/35 to-indigo-600/25 px-4 py-2 text-xs font-bold uppercase tracking-wide text-violet-100 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                    <Icon name="check" className="h-4 w-4" />
                    Success
                  </span>
                ) : scorePct > 0 ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/35 bg-amber-500/15 px-4 py-2 text-xs font-bold uppercase tracking-wide text-amber-100">
                    Partial
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-full border border-red-400/35 bg-red-500/12 px-4 py-2 text-xs font-bold uppercase tracking-wide text-red-200">
                    Failed
                  </span>
                )}
                <p className="text-right text-[11px] text-sky-400/90">
                  Status:{" "}
                  {testsTotal > 0
                    ? `${testsPassed} / ${testsTotal} tests passed`
                    : `${scorePct}% score`}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <StatCard
                label="Runtime"
                value={runMs != null ? `${runMs} ms` : "—"}
                sub={
                  testsTotal > 0
                    ? `ผ่าน ${testsPassed}/${testsTotal} เทสต์`
                    : undefined
                }
                barPercent={passRatio || scorePct}
                barClass="bg-gradient-to-r from-violet-500 to-indigo-500 shadow-[0_0_12px_rgba(139,92,246,0.4)]"
              />
              <StatCard
                label="Memory"
                value={formatMem(memBytes)}
                sub={scorePct >= 80 ? "ประหยัดหน่วยความจำดี" : undefined}
                barPercent={Math.min(100, scorePct + 15)}
                barClass="bg-gradient-to-r from-sky-500 to-cyan-400 shadow-[0_0_12px_rgba(56,189,248,0.35)]"
              />
              <StatCard
                label="คะแนน"
                value={`${scorePct}%`}
                sub={
                  data.hidden_tests_run != null
                    ? `${data.hidden_tests_run} เทสต์ซ่อน`
                    : "จากผลรวม"
                }
                barPercent={scorePct}
                barClass="bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(52,211,153,0.35)]"
              />
            </div>
          </div>
        ) : null}

        {isSubmitting ? (
          <div className="mb-4 flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
            <span className="text-xs text-violet-200/80">กำลังรันเทสต์ซ่อนบนเซิร์ฟเวอร์…</span>
          </div>
        ) : null}

        {error ? (
          <div className="mb-4 rounded-xl border border-red-400/25 bg-red-500/10 p-4 text-[13px] text-red-200">
            {error}
          </div>
        ) : null}

        {data && !isSubmitting && !summaryPage ? (
          <div className="space-y-4 border-b border-white/10 pb-4">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-[10px] font-bold uppercase text-white/35">คะแนน</span>
                <span className="text-base font-bold tabular-nums text-white/95">
                  {data.score_percent}%
                </span>
              </div>
              {data.hidden_tests_run != null ? (
                <span className="text-[11px] text-white/50">
                  เทสต์ซ่อนรัน:{" "}
                  <span className="font-mono text-sky-200/90">{data.hidden_tests_run}</span>
                </span>
              ) : null}
              <span className="text-[11px] text-white/45">
                submission{" "}
                <span className="font-mono text-violet-200/90">#{data.id}</span>
                {data.pid != null ? (
                  <>
                    {" "}
                    · pid <span className="font-mono">{data.pid}</span>
                  </>
                ) : null}
              </span>
            </div>
            {summary ? (
              <div className="rounded-lg border border-white/[0.06] bg-black/25 px-3 py-2.5">
                <p className="mb-2 text-[10px] font-bold uppercase text-white/40">สรุป (test_summary)</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {summary.tests_total != null ? (
                    <div>
                      <span className="text-[9px] text-white/35">tests_total</span>
                      <p className="font-mono text-[11px] text-white/80">{summary.tests_total}</p>
                    </div>
                  ) : null}
                  {summary.tests_passed != null ? (
                    <div>
                      <span className="text-[9px] text-white/35">tests_passed</span>
                      <p className="font-mono text-[11px] text-emerald-200/90">{summary.tests_passed}</p>
                    </div>
                  ) : null}
                  {summary.tests_wrong_answer != null ? (
                    <div>
                      <span className="text-[9px] text-white/35">tests_wrong_answer</span>
                      <p className="font-mono text-[11px] text-amber-200/90">
                        {summary.tests_wrong_answer}
                      </p>
                    </div>
                  ) : null}
                  {summary.tests_error != null ? (
                    <div>
                      <span className="text-[9px] text-white/35">tests_error</span>
                      <p className="font-mono text-[11px] text-red-300/90">{summary.tests_error}</p>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {data && !isSubmitting && summaryPage && cases.length > 0 ? (
          <div className="mb-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-white/90">Test Case Breakdown</h3>
              <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 py-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-400/90">
                  Passed {testsPassed}
                </span>
                <span className="text-white/25">·</span>
                <span className="text-[10px] font-bold uppercase text-white/50">
                  Total {testsTotal || cases.length}
                </span>
              </div>
            </div>
            <ul className="space-y-3">
              {cases.map((row, i) => (
                <HiddenCaseCardMock key={i} row={row} index={i} />
              ))}
            </ul>
          </div>
        ) : null}

        {data && !isSubmitting && summaryPage && cases.length === 0 ? (
          <div className="mb-6 rounded-xl border border-white/[0.06] bg-black/20 px-4 py-6 text-center text-[12px] text-white/40">
            ไม่มีรายการเทสต์รายขั้นจากเซิร์ฟเวอร์ — ดูสรุปด้านบน
            {data.id ? (
              <span className="mt-1 block font-mono text-[11px] text-white/25">
                submission #{data.id}
              </span>
            ) : null}
          </div>
        ) : null}

        {data && !isSubmitting && !summaryPage && cases.length > 0 ? (
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase text-white/40">รายเทสต์</p>
            <ul className="space-y-2">
              {cases.map((row, i) => (
                <HiddenCaseCardMock key={i} row={row} index={i} />
              ))}
            </ul>
          </div>
        ) : null}

        {data && !isSubmitting ? (
          <div className="mt-6 rounded-2xl border border-violet-500/25 bg-gradient-to-br from-violet-500/[0.08] to-transparent p-4 sm:p-5">
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <span className="text-[11px] font-bold uppercase tracking-wide text-violet-200/90">
                AI analysis
              </span>
              <EditorToolbarButton
                variant="secondary"
                className="!py-1.5 !px-3 !text-[11px] border-violet-400/35 bg-violet-500/15 text-violet-50 hover:bg-violet-500/25"
                disabled={isAnalyzing}
                onClick={onRequestAnalysis}
              >
                {isAnalyzing ? "กำลังวิเคราะห์…" : "ให้ AI ช่วยวิเคราะห์"}
              </EditorToolbarButton>
            </div>
            {analysisError ? (
              <p className="rounded-lg border border-red-400/25 bg-red-500/10 px-3 py-2 text-[12px] text-red-200">
                {analysisError}
              </p>
            ) : null}
            {analysisText ? (
              <div className="mt-3 rounded-xl border border-white/[0.08] bg-black/45 p-4 text-[13px] leading-relaxed">
                <AiAssistantMarkdown source={analysisText} />
              </div>
            ) : !analysisError && !isAnalyzing ? (
              <p className="text-[11px] text-white/35">
                สตรีมจาก POST /analyze (text/plain) — ฐาน AI (isAI)
              </p>
            ) : null}
          </div>
        ) : null}

        {showEmpty ? (
          <div className="flex min-h-[4rem] flex-col items-center justify-center py-10 text-white/30">
            <span className="text-center text-[12px] font-medium leading-relaxed">
              {summaryPage
                ? "ยังไม่มีผลในหน้านี้ — กลับไปหน้าโจทย์แล้วกด «ส่งโค้ด» ระบบจะพามาสรุปผลที่นี่"
                : "ยังไม่มีผลส่งโค้ด — กด «ส่งโค้ด» บนหน้าโจทย์เพื่อรันเทสต์ซ่อน"}
            </span>
            <span className="mt-2 font-mono text-[10px] text-white/20">{questionCode}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
