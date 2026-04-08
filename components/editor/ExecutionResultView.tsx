"use client";

import type { SubmissionResult } from "@/lib/judge0";

export function detectWrongLanguage(
  result: SubmissionResult,
  langLabel: string,
): string | null {
  const isNodeThreadError =
    result.stderr?.includes("uv_thread_create") ||
    result.stderr?.includes("node::WorkerThreadsTaskRunner");

  const isTypeScriptThreadError =
    langLabel.toLowerCase().includes("typescript") &&
    (result.compile_output?.includes("Compilation time limit exceeded") ||
      result.compile_output?.includes("uv_thread_create"));

  if (isNodeThreadError || isTypeScriptThreadError) {
    return "ARM_COMPATIBILITY_ISSUE";
  }

  const combinedOutput = [
    result.stdout,
    result.stderr,
    result.compile_output,
    result.message,
  ]
    .filter(Boolean)
    .join("\n")
    .toLowerCase();

  const lang = langLabel.toLowerCase();

  const containsAny = (patterns: string[]) =>
    patterns.some((p) => combinedOutput.includes(p.toLowerCase()));

  if (lang.includes("javascript") || lang.includes("typescript")) {
    if (isNodeThreadError) return null;

    if (
      containsAny([
        "#include",
        "std::",
        "iostream",
        "using namespace std",
      ])
    ) {
      return "It looks like you are trying to run C++ code in a JavaScript/TypeScript environment.";
    }
    if (
      containsAny(["def ", "import sys", "import os"]) &&
      combinedOutput.includes("syntaxerror")
    ) {
      return "It looks like you are trying to run Python code in a JavaScript/TypeScript environment.";
    }
  }

  if (lang.includes("python")) {
    if (containsAny(["#include", "std::", "iostream"])) {
      return "It looks like you are trying to run C++ code in a Python environment.";
    }
    if (
      containsAny(["console.log", "const ", "let ", "function "]) &&
      combinedOutput.includes("syntaxerror")
    ) {
      return "It looks like you are trying to run JavaScript/TypeScript code in a Python environment.";
    }
  }

  if (lang.includes("c++")) {
    if (containsAny(["console.log", "const ", "let ", "function "])) {
      return "It looks like you are trying to run JavaScript/TypeScript code in a C++ environment.";
    }
    if (containsAny(["def ", "import "])) {
      return "It looks like you are trying to run Python code in a C++ environment.";
    }
  }

  return null;
}

export function ExecutionResultView({
  result,
  error,
  isRunning,
  langLabel,
  emptyHint = "Ready to run",
}: {
  result: SubmissionResult | null;
  error: string | null;
  isRunning: boolean;
  langLabel: string;
  /** ข้อความเมื่อยังไม่รัน */
  emptyHint?: string;
}) {
  const mismatch = result ? detectWrongLanguage(result, langLabel) : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col font-mono text-sm">
      <div className="min-h-0 flex-1 overflow-auto px-5 py-4">
        {isRunning && (
          <div className="flex flex-col gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-xs italic text-primary/70">
              กำลังรันบนเซิร์ฟเวอร์…
            </span>
          </div>
        )}
        {error && (
          <div className="rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-red-400">
            {error}
          </div>
        )}
        {result && (
          <div className="space-y-4">
            {result.status.id !== 3 && mismatch && (
              <div
                className={`flex items-start gap-3 rounded-lg border p-3 ${
                  mismatch === "ARM_COMPATIBILITY_ISSUE"
                    ? "border-amber-500/20 bg-amber-500/10"
                    : "border-blue-500/20 bg-blue-500/10"
                }`}
              >
                <div
                  className={`mt-0.5 ${
                    mismatch === "ARM_COMPATIBILITY_ISSUE"
                      ? "text-amber-400"
                      : "text-blue-400"
                  }`}
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div
                  className={`text-[11px] leading-relaxed ${
                    mismatch === "ARM_COMPATIBILITY_ISSUE"
                      ? "text-amber-300"
                      : "text-blue-300"
                  }`}
                >
                  <span className="mb-0.5 block font-bold">
                    {mismatch === "ARM_COMPATIBILITY_ISSUE"
                      ? "ปัญหาความเข้ากันได้ของเครื่องรัน"
                      : "คำแนะนำ: ภาษาอาจไม่ตรงกับที่เลือก?"}
                  </span>
                  {mismatch === "ARM_COMPATIBILITY_ISSUE"
                    ? "การรัน Node.js/TypeScript บนบางสภาพแวดล้อมอาจไม่พร้อม — ลอง Python หรือ C++ แทน"
                    : mismatch}
                </div>
              </div>
            )}

            {result.stdout ? (
              <div>
                <span className="mb-1 block text-[10px] font-bold uppercase tracking-tighter text-white/35">
                  Stdout
                </span>
                <div className="text-white/90">{result.stdout}</div>
              </div>
            ) : null}
            {result.stderr ? (
              <div className="group">
                <span className="mb-1 block text-[10px] font-bold uppercase tracking-tighter text-red-400/50 group-hover:text-red-400/70">
                  Stderr
                </span>
                <div className="rounded-lg border border-red-400/15 bg-red-400/5 p-3 font-mono text-xs leading-relaxed text-red-400/90 selection:bg-red-400/20">
                  {result.stderr}
                </div>
              </div>
            ) : null}
            {result.compile_output ? (
              <div className="group">
                <span className="mb-1 block text-[10px] font-bold uppercase tracking-tighter text-yellow-400/50 group-hover:text-yellow-400/70">
                  Compilation Error
                </span>
                <div className="rounded-lg border border-yellow-400/15 bg-yellow-400/5 p-3 font-mono text-xs leading-relaxed text-yellow-400/85 selection:bg-yellow-400/20">
                  {result.compile_output}
                </div>
              </div>
            ) : null}
            {result.status.id !== 3 &&
              !result.stderr &&
              !result.compile_output && (
                <div className="rounded-r-lg border-l-2 border-red-400 bg-red-400/5 py-2 pl-3 text-red-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Execution Error
                  </span>
                  <div className="mt-0.5 text-sm">
                    {result.status.description}
                  </div>
                  {result.message ? (
                    <div className="mt-1 font-mono text-[11px] italic text-red-400/65">
                      {result.message}
                    </div>
                  ) : null}
                </div>
              )}

            {!result.stdout &&
              !result.stderr &&
              !result.compile_output &&
              result.status.id === 3 && (
                <div className="flex items-center gap-2 py-4 italic text-white/35">
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                  โปรแกรมจบโดยไม่มีเอาต์พุต
                </div>
              )}
          </div>
        )}
        {!isRunning && !result && !error && (
          <div className="flex h-full min-h-[8rem] flex-col items-center justify-center text-white/15">
            <svg
              className="mb-2 h-12 w-12 opacity-[0.12]"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
            <span className="text-xs font-bold uppercase tracking-widest">
              {emptyHint}
            </span>
          </div>
        )}
      </div>

      {result ? (
        <div className="grid grid-cols-3 gap-2 border-t border-white/10 bg-white/[0.04] px-5 py-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-black uppercase leading-none text-white/30">
              Status
            </span>
            <span
              className={`text-[11px] font-bold ${
                result.status.id === 3 ? "text-green-400" : "text-red-400"
              }`}
            >
              {result.status.description}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-black uppercase leading-none text-white/30">
              Time
            </span>
            <span className="font-mono text-[11px] text-white/65">
              {result.time || "0.000"}s
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-black uppercase leading-none text-white/30">
              Memory
            </span>
            <span className="font-mono text-[11px] text-white/65">
              {result.memory
                ? `${(result.memory / 1024).toFixed(1)}MB`
                : "0.0MB"}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
