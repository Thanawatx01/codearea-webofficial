"use client";

import SubmitHiddenResultPanel from "@/components/editor/SubmitHiddenResultPanel";
import { Icon } from "@/components/icons/Icon";
import { api } from "@/lib/api";
import { streamPostSubmitAnalysis } from "@/lib/questionAnalyzeApi";
import type { FullSubmitResponse } from "@/lib/questionSubmitApi";
import {
  readLastQuestionSubmission,
  type StoredQuestionSubmission,
} from "@/lib/questionSubmissionSession";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { QuestionDetail } from "./types";

export default function QuestionSubmissionBody({ code }: { code: string }) {
  const [meta, setMeta] = useState<QuestionDetail | null>(null);
  const [loadErr, setLoadErr] = useState("");
  const [analysisText, setAnalysisText] = useState("");
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [stored, setStored] = useState<StoredQuestionSubmission | null>(null);

  useEffect(() => {
    setStored(readLastQuestionSubmission(code));
  }, [code]);

  useEffect(() => {
    const run = async () => {
      setLoadErr("");
      const useToken = Boolean(
        typeof window !== "undefined" && localStorage.getItem("token"),
      );
      const res = await api.get<QuestionDetail>(
        `/questions/${encodeURIComponent(code)}`,
        { useToken },
      );
      if (!res.ok || !res.data) {
        setMeta(null);
        setLoadErr(res.error ?? "โหลดโจทย์ไม่สำเร็จ");
        return;
      }
      setMeta(res.data);
    };
    void run();
  }, [code]);

  const submitData: FullSubmitResponse | null = stored?.result ?? null;
  const studentCode = stored?.student_code ?? "";

  const handleRequestAnalysis = async () => {
    if (!submitData || !studentCode) return;
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisText("");

    const useToken = Boolean(
      typeof window !== "undefined" && localStorage.getItem("token"),
    );
    const out = await streamPostSubmitAnalysis(
      {
        question_code: code,
        student_code: studentCode,
        submission_id: submitData.id,
        fast_mode: true,
      },
      {
        useToken,
        onChunk: (t) => setAnalysisText(t),
      },
    );

    if (!out.ok) {
      setAnalysisError(out.error);
    }
    setIsAnalyzing(false);
  };

  const backHref = `/questions/${encodeURIComponent(code)}`;

  return (
    <div className="relative z-10 min-h-screen w-full px-2 pb-16 pt-28 sm:px-3 lg:px-4">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[#07080d]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed left-1/2 top-0 -z-10 h-[480px] w-[min(900px,100vw)] -translate-x-1/2 rounded-[100%] bg-violet-600/[0.12] blur-[100px]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed right-[12%] top-[28%] -z-10 h-[320px] w-[320px] rounded-full bg-cyan-500/[0.06] blur-[90px]"
      />

      <div className="mx-auto w-full max-w-[960px]">
        <Link
          href={backHref}
          className="mb-4 inline-flex items-center gap-2 text-[13px] font-medium text-violet-300/90 transition hover:text-violet-200"
        >
          <Icon name="chevron-right" className="h-4 w-4 rotate-180" />
          กลับไปหน้าโจทย์
        </Link>

        {loadErr ? (
          <p className="mb-5 text-sm text-red-300">{loadErr}</p>
        ) : (
          <p className="mb-5 text-[12px] text-white/40">
            <span className="font-mono text-violet-300/70">{code}</span>
            {stored?.language ? (
              <>
                <span className="mx-1.5 text-white/20">·</span>
                <span className="font-mono text-white/45">{stored.language}</span>
              </>
            ) : null}
          </p>
        )}

        <div className="overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0b0c12]/90 shadow-[0_0_0_1px_rgba(139,92,246,0.08),0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-md">
          {studentCode ? (
            <div className="border-b border-white/10 bg-[#0d1117]/60 px-5 py-4">
              <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/45">
                  โค้ดที่ส่ง
                </span>
                {stored?.language ? (
                  <span className="rounded-md border border-violet-500/25 bg-violet-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-violet-200/90">
                    {stored.language}
                  </span>
                ) : null}
              </div>
              <pre className="max-h-[min(400px,45vh)] overflow-auto whitespace-pre-wrap wrap-break-word rounded-lg border border-white/10 bg-black/55 p-4 font-mono text-[12px] leading-relaxed text-zinc-100/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                {studentCode}
              </pre>
            </div>
          ) : null}

          <div className="min-h-[280px] rounded-b-xl bg-black/30">
            <SubmitHiddenResultPanel
              summaryPage
              questionCode={code}
              problemTitle={meta?.title}
              data={submitData}
              error={null}
              isSubmitting={false}
              analysisText={analysisText}
              analysisError={analysisError}
              isAnalyzing={isAnalyzing}
              onRequestAnalysis={() => void handleRequestAnalysis()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
