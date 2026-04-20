"use client";

import { useLayoutEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CodeEditor, { type CodeEditorLanguage } from "./CodeEditor";
import SampleRunResultView, {
  type SampleExampleRow,
} from "./SampleRunResultView";
import { JUDGE0_LANGUAGES } from "@/lib/judge0";
import {
  simpleRunQuestion,
  type SampleRunResponse,
} from "@/lib/questionRunApi";
import {
  LANGUAGE_BOILERPLATES,
  EDITOR_VIEWPORT_DETAIL,
} from "@/lib/questionEditorBoilerplates";
import { PISTON_LANGUAGE_MAP } from "@/lib/piston";
import { submitQuestionCode } from "@/lib/questionSubmitApi";
import { storeLastQuestionSubmission } from "@/lib/questionSubmissionSession";
import {
  EditorToolbarButton,
  EditorToolbarSelect,
  EditorToolbarSelectCompact,
} from "./EditorToolbarPrimitives";

const FILTERED_LANGUAGES = JUDGE0_LANGUAGES;

export default function ProblemCodeExecutor({
  questionCode,
  initialCode,
  defaultLanguageId = 63,
  shellClassName = "",
  sampleTests = [],
  onCodeChange,
}: {
  questionCode: string;
  initialCode?: string;
  defaultLanguageId?: number;
  shellClassName?: string;
  sampleTests?: SampleExampleRow[];
  /** แจ้ง parent ทุกครั้งที่โค้ดใน editor เปลี่ยน (เช่น ใช้โหมดเปรียบเทียบ AI) */
  onCodeChange?: (code: string) => void;
}) {
  const router = useRouter();
  const [languageId, setLanguageId] = useState(defaultLanguageId);
  const [theme, setTheme] = useState<"vs-dark" | "vs">("vs-dark");
  const [code, setCode] = useState(
    initialCode || LANGUAGE_BOILERPLATES[defaultLanguageId] || "",
  );
  const [result, setResult] = useState<SampleRunResponse | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useLayoutEffect(() => {
    onCodeChange?.(code);
    // ซิงก์โค้ดเริ่มต้นตอนเปิดโจทย์; การพิมพ์ต่อเนื่องส่งผ่าน onChange ของ editor
    // eslint-disable-next-line react-hooks/exhaustive-deps -- ไม่ใส่ `code` เพื่อไม่ให้ยิงซ้ำทุกตัวอักษร
  }, [questionCode, onCodeChange]);

  const selectedLanguage =
    FILTERED_LANGUAGES.find((l) => l.id === languageId) ||
    FILTERED_LANGUAGES[0];

  const isLoggedIn = () =>
    typeof window !== "undefined" && Boolean(localStorage.getItem("token"));

  const handleRun = async () => {
    if (!isLoggedIn()) {
      setError("กรุณาเข้าสู่ระบบเพื่อรันทดสอบโค้ด");
      return;
    }
    setIsRunning(true);
    setError(null);
    setResult(null);

    const run = await simpleRunQuestion(
      questionCode,
      { sourceCode: code, languageId },
      { useToken: true },
    );

    if (!run.ok) {
      setError(run.error);
      setIsRunning(false);
      return;
    }

    setResult(run.data);
    setIsRunning(false);
  };

  const handleLanguageChange = (id: number) => {
    setLanguageId(id);
    const isCurrentBoilerplate = Object.values(LANGUAGE_BOILERPLATES).includes(
      code,
    );
    if (!code || isCurrentBoilerplate) {
      const next = LANGUAGE_BOILERPLATES[id] || "";
      setCode(next);
      onCodeChange?.(next);
    }
  };

  const handleReset = () => {
    const next = LANGUAGE_BOILERPLATES[languageId] || "";
    setCode(next);
    onCodeChange?.(next);
    setResult(null);
    setError(null);
    setSubmitError(null);
  };

  const handleSubmit = async () => {
    if (!isLoggedIn()) {
      setSubmitError("กรุณาเข้าสู่ระบบเพื่อส่งโค้ด");
      return;
    }
    const cfg = PISTON_LANGUAGE_MAP[languageId];
    if (!cfg) {
      setSubmitError("ไม่รองรับภาษานี้สำหรับการส่งโค้ด");
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);

    const out = await submitQuestionCode(
      {
        questionCode,
        language: cfg.language,
        code,
      },
      { useToken: true },
    );

    if (!out.ok) {
      setSubmitError(out.error);
      setIsSubmitting(false);
      return;
    }

    storeLastQuestionSubmission({
      question_code: questionCode,
      student_code: code,
      language: cfg.language,
      result: out.data,
    });
    setIsSubmitting(false);
    router.push(`/questions/${encodeURIComponent(questionCode)}/submission`);
  };

  const getMonacoLanguage = (label: string): CodeEditorLanguage => {
    const l = label.toLowerCase();
    if (l.includes("javascript")) return "javascript";
    if (l.includes("typescript")) return "typescript";
    if (l.includes("python")) return "python";
    if (l.includes("c++")) return "cpp";
    return "plaintext";
  };

  return (
    <div
      className={[
        "flex flex-col overflow-visible rounded-xl border border-white/10 bg-[#0c0e14]/95 shadow-xl backdrop-blur-sm",
        shellClassName,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-col gap-2 border-b border-white/10 bg-white/[0.04] px-5 py-3.5">
        <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3">
          <div className="flex flex-wrap items-center gap-5">
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wide text-white/45">
                Language
              </span>
              <EditorToolbarSelect
                className="min-w-[188px]"
                value={languageId}
                onChange={(e) => handleLanguageChange(Number(e.target.value))}
                disabled={isRunning || isSubmitting}
              >
                {FILTERED_LANGUAGES.map((lang) => (
                  <option key={lang.id} value={lang.id} className="bg-[#1a1d26]">
                    {lang.label}
                  </option>
                ))}
              </EditorToolbarSelect>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wide text-white/45">
                Theme
              </span>
              <EditorToolbarSelectCompact
                value={theme}
                onChange={(e) =>
                  setTheme(e.target.value as "vs-dark" | "vs")
                }
              >
                <option value="vs-dark" className="bg-[#1a1d26]">
                  Dark
                </option>
                <option value="vs" className="bg-[#1a1d26]">
                  Light
                </option>
              </EditorToolbarSelectCompact>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-2.5">
            <EditorToolbarButton
              variant="secondary"
              onClick={handleReset}
              disabled={isRunning || isSubmitting}
            >
              รีเซ็ต
            </EditorToolbarButton>
            <EditorToolbarButton
              variant="secondary"
              className="border border-sky-500/35 bg-sky-500/10 text-sky-100 hover:bg-sky-500/18"
              onClick={() => void handleSubmit()}
              disabled={
                isRunning ||
                isSubmitting ||
                !PISTON_LANGUAGE_MAP[languageId]
              }
            >
              {isSubmitting ? "กำลังส่ง…" : "ส่งโค้ด"}
            </EditorToolbarButton>
            <EditorToolbarButton
              variant="primary"
              className={isRunning ? "cursor-wait opacity-90" : ""}
              onClick={() => void handleRun()}
              disabled={isRunning || isSubmitting}
            >
              {isRunning ? "กำลังรัน…" : "รันทดสอบ"}
            </EditorToolbarButton>
          </div>
        </div>
        {submitError ? (
          <div className="flex items-center gap-2 text-[12px] leading-snug text-amber-200/95">
            <p>{submitError}</p>
            {!isLoggedIn() && (
              <Link
                href="/login"
                className="font-semibold text-violet-300 underline-offset-2 hover:text-violet-200 hover:underline"
              >
                ไปหน้าเข้าสู่ระบบ
              </Link>
            )}
          </div>
        ) : null}
      </div>

      <div
        className="w-full shrink-0 border-b border-white/10"
        style={{ height: EDITOR_VIEWPORT_DETAIL }}
      >
        <CodeEditor
          value={code}
          onChange={(v) => {
            setCode(v);
            onCodeChange?.(v);
          }}
          language={getMonacoLanguage(selectedLanguage.label)}
          height="100%"
          theme={theme}
          className="rounded-none border-none"
        />
      </div>

      <div className="min-h-[min(380px,48svh)] rounded-b-xl bg-black/30">
        <SampleRunResultView
          data={result}
          error={error}
          isRunning={isRunning}
          examples={sampleTests}
          emptyHint="กดรันทดสอบเพื่อดูผลตัวอย่าง — กดส่งโค้ดเพื่อรันเทสต์ซ่อนแล้วไปดูสรุปผล"
        />
      </div>
    </div>
  );
}
