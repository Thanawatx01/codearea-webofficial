"use client";

import ProblemCodeExecutor from "@/components/editor/ProblemCodeExecutor";
import { Icon } from "@/components/icons/Icon";
import { api } from "@/lib/api";
import { streamQuestionCodeCompare } from "@/lib/questionCompareApi";
import {
  buildCompareOldCodeOptions,
  buildCompareOptionsFromSubmissionHistory,
  mergeCompareHistoryAndBase,
} from "@/lib/questionCompareOptions";
import {
  listQuestionSubmissions,
  type SubmissionListItem,
} from "@/lib/questionSubmitApi";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type MouseEvent,
} from "react";
import AttachedDocumentBlock from "./AttachedDocumentBlock";
import IdePanel from "./IdePanel";
import QuestionAiAssistantPanel, {
  type AiAssistantMode,
} from "./QuestionAiAssistantPanel";
import QuestionDetailToolbar from "./QuestionDetailToolbar";
import QuestionStatementSection from "./QuestionStatementSection";
import StatementPreviewModal from "./StatementPreviewModal";
import type { QuestionDetail } from "./types";
import { normalizeTag } from "./types";
import WorkspaceColResizeHandle from "./WorkspaceColResizeHandle";
import {
  fetchQuestionHint,
  humanizeHintError,
  streamTextToCallback,
  type AiMessageTone,
} from "@/lib/questionHintApi";

function useClientHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function QuestionDetailBody({ code }: { code: string }) {
  const [data, setData] = useState<QuestionDetail | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiMode, setAiMode] = useState<AiAssistantMode>("hint");
  const [editorCode, setEditorCode] = useState("");
  /** ตัวเลือกโค้ดฐานที่ผู้ใช้เลือก — ผูกกับโจทย์ปัจจุบันเพื่อไม่ต้อง sync ด้วย effect */
  const [comparePick, setComparePick] = useState<{
    questionCode: string;
    id: string;
  } | null>(null);
  const [aiMessages, setAiMessages] = useState<
    {
      role: "user" | "assistant";
      text: string;
      tone?: AiMessageTone;
    }[]
  >([]);
  const [aiDraft, setAiDraft] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [statementPreviewOpen, setStatementPreviewOpen] = useState(false);
  const clientHydrated = useClientHydrated();
  const [submissionHistoryState, setSubmissionHistoryState] = useState<{
    questionCode: string;
    items: SubmissionListItem[];
  } | null>(null);
  const workspaceRowRef = useRef<HTMLDivElement>(null);
  const [leftColPct, setLeftColPct] = useState(34);
  const [isWorkspaceWide, setIsWorkspaceWide] = useState(false);
  const colDragRef = useRef<{ startX: number; startPct: number } | null>(null);
  const aiStreamCancelRef = useRef<(() => void) | null>(null);
  const aiBusyRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)");
    const apply = () => setIsWorkspaceWide(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const onMove = (e: globalThis.MouseEvent) => {
      const d = colDragRef.current;
      const row = workspaceRowRef.current;
      if (!d || !row) return;
      const w = row.getBoundingClientRect().width;
      if (w <= 0) return;
      const dx = e.clientX - d.startX;
      const next = d.startPct + (dx / w) * 100;
      setLeftColPct(Math.min(52, Math.max(22, next)));
    };
    const onUp = () => {
      colDragRef.current = null;
      document.body.style.removeProperty("cursor");
      document.body.style.removeProperty("user-select");
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  const onColResizeStart = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      colDragRef.current = { startX: e.clientX, startPct: leftColPct };
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [leftColPct],
  );

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError("");
      const useToken = Boolean(localStorage.getItem("token"));
      const res = await api.get<QuestionDetail>(
        `/questions/${encodeURIComponent(code)}`,
        { useToken },
      );
      if (!res.ok || !res.data) {
        setData(null);
        setError(res.error ?? "โหลดโจทย์ไม่สำเร็จ");
        setLoading(false);
        return;
      }
      setData(res.data);
      setLoading(false);
    };
    void run();
  }, [code]);

  useEffect(() => {
    if (!clientHydrated || !data) return;

    const useToken = Boolean(
      typeof window !== "undefined" && localStorage.getItem("token"),
    );
    if (!useToken) return;

    let cancelled = false;
    (async () => {
      const out = await listQuestionSubmissions(
        { questionCode: code, page: 1, limit: 20 },
        { useToken },
      );
      if (cancelled) return;
      setSubmissionHistoryState({
        questionCode: code,
        items: out.ok ? out.items : [],
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [code, data, clientHydrated]);

  useEffect(() => {
    return () => {
      aiStreamCancelRef.current?.();
      aiStreamCancelRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!statementPreviewOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setStatementPreviewOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [statementPreviewOpen]);

  const tags = (data?.tags ?? []).map(normalizeTag).filter(Boolean);

  const sampleTests = useMemo(() => {
    const tc = data?.test_cases ?? [];
    const simple = tc.filter((t) => t.is_simple === true);
    if (simple.length > 0) return simple;
    return tc.slice(0, 5);
  }, [data]);

  const compareOldOptionsFull = useMemo(() => {
    if (!data) return [];
    const authed =
      typeof window !== "undefined" && Boolean(localStorage.getItem("token"));
    const submissionHistory =
      authed &&
      submissionHistoryState != null &&
      submissionHistoryState.questionCode === code
        ? submissionHistoryState.items
        : [];
    const fromList = buildCompareOptionsFromSubmissionHistory(submissionHistory);
    const base = buildCompareOldCodeOptions(
      code,
      data.user_progress,
      clientHydrated,
    );
    return mergeCompareHistoryAndBase(fromList, base);
  }, [code, data, clientHydrated, submissionHistoryState]);

  const compareOldMeta = useMemo(
    () =>
      compareOldOptionsFull.map(({ id, label }) => ({
        id,
        label,
      })),
    [compareOldOptionsFull],
  );

  const effectiveCompareOldId = useMemo(() => {
    if (compareOldOptionsFull.length === 0) return "";
    const picked =
      comparePick?.questionCode === code ? comparePick.id : null;
    if (
      picked &&
      compareOldOptionsFull.some((o) => o.id === picked)
    ) {
      return picked;
    }
    return compareOldOptionsFull[0].id;
  }, [compareOldOptionsFull, comparePick, code]);

  const selectedCompareOld =
    compareOldOptionsFull.find((o) => o.id === effectiveCompareOldId) ??
    compareOldOptionsFull[0];
  const oldCodeForCompare = selectedCompareOld?.code ?? "";

  const canSendCompare =
    compareOldOptionsFull.length > 0 &&
    Boolean(oldCodeForCompare.trim()) &&
    Boolean(editorCode.trim());

  const sendAi = useCallback(async () => {
    if (aiBusyRef.current) return;

    const t = aiDraft.trim();

    if (aiMode === "hint") {
      if (!t) return;

      aiStreamCancelRef.current?.();
      aiStreamCancelRef.current = null;

      aiBusyRef.current = true;
      setAiBusy(true);
      setAiMessages((m) => [
        ...m,
        { role: "user", text: t },
        { role: "assistant", text: "" },
      ]);
      setAiDraft("");

      const useToken = Boolean(
        typeof window !== "undefined" && localStorage.getItem("token"),
      );
      const res = await fetchQuestionHint(
        { question_code: code, student_question: t },
        { useToken },
      );

      if (!res.ok) {
        setAiMessages((m) => {
          const next = [...m];
          const last = next[next.length - 1];
          if (last?.role === "assistant") {
            next[next.length - 1] = {
              role: "assistant",
              text: res.error,
              tone: res.tone,
            };
          }
          return next;
        });
        aiBusyRef.current = false;
        setAiBusy(false);
        return;
      }

      const full = res.text;
      aiStreamCancelRef.current = streamTextToCallback(
        full,
        (slice) => {
          setAiMessages((m) => {
            const next = [...m];
            const last = next[next.length - 1];
            if (last?.role === "assistant") {
              next[next.length - 1] = {
                role: "assistant",
                text: slice,
                tone: "default",
              };
            }
            return next;
          });
        },
        {
          charsPerStep: 2,
          ms: 18,
          onComplete: () => {
            aiBusyRef.current = false;
            setAiBusy(false);
            aiStreamCancelRef.current = null;
          },
        },
      );
      return;
    }

    if (!canSendCompare) return;

    aiStreamCancelRef.current?.();
    aiStreamCancelRef.current = null;

    aiBusyRef.current = true;
    setAiBusy(true);

    const userLine =
      t ||
      "เปรียบเทียบโค้ดใน editor กับเวอร์ชันที่เลือก";

    setAiMessages((m) => [
      ...m,
      { role: "user", text: userLine },
      { role: "assistant", text: "" },
    ]);
    setAiDraft("");

    const useToken = Boolean(
      typeof window !== "undefined" && localStorage.getItem("token"),
    );

    const out = await streamQuestionCodeCompare(
      {
        question_code: code,
        old_code: oldCodeForCompare,
        new_code: editorCode,
        student_question: t || undefined,
        fast_mode: true,
      },
      {
        useToken,
        onChunk: (acc) => {
          setAiMessages((m) => {
            const next = [...m];
            const last = next[next.length - 1];
            if (last?.role === "assistant") {
              next[next.length - 1] = {
                role: "assistant",
                text: acc,
                tone: "default",
              };
            }
            return next;
          });
        },
      },
    );

    if (!out.ok) {
      setAiMessages((m) => {
        const next = [...m];
        const last = next[next.length - 1];
        if (last?.role === "assistant") {
          next[next.length - 1] = {
            role: "assistant",
            text: humanizeHintError(out.error),
            tone: "error",
          };
        }
        return next;
      });
    }

    aiBusyRef.current = false;
    setAiBusy(false);
  }, [
    aiDraft,
    code,
    aiMode,
    canSendCompare,
    oldCodeForCompare,
    editorCode,
  ]);

  return (
    <div className="relative z-10 min-h-screen w-full px-2 pb-3 pt-32 sm:px-3 lg:px-4">
      <div className="mx-auto flex w-full max-w-[1920px] flex-col gap-2 pb-10">
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-5 py-4 text-red-200">
            {error}
          </div>
        ) : data ? (
          <>
            <QuestionDetailToolbar data={data} />

            <div
              ref={workspaceRowRef}
              className="flex flex-col gap-3 xl:flex-row xl:items-start xl:gap-0"
            >
              <div
                className={`flex w-full flex-col ${isWorkspaceWide ? "shrink-0" : ""}`}
                style={
                  isWorkspaceWide
                    ? {
                        flex: `0 0 ${leftColPct}%`,
                        minWidth: 260,
                        maxWidth: "55%",
                      }
                    : undefined
                }
              >
                <IdePanel
                  header={
                    <>
                      <span className="text-xs font-bold tracking-wide text-white/85">
                        โจทย์และเอกสาร
                      </span>
                      <button
                        type="button"
                        onClick={() => setStatementPreviewOpen(true)}
                        className="ml-2 inline-flex items-center gap-1.5 rounded-lg border border-violet-500/35 bg-violet-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-violet-200/95 transition hover:border-violet-400/50 hover:bg-violet-500/15"
                      >
                        <Icon name="eye" className="h-3.5 w-3.5" />
                        ขยายดู
                      </button>
                      <span className="ml-auto truncate text-[10px] text-white/35">
                        {data.category_name ?? ""}
                      </span>
                    </>
                  }
                >
                  <div className="px-4 py-4">
                    <QuestionStatementSection data={data} tags={tags} />
                    {data.uri ? (
                      <section className="mt-8 border-t border-white/10 pt-6">
                        <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-white/55">
                          เอกสารแนบ
                        </h3>
                        <AttachedDocumentBlock
                          uri={data.uri}
                          code={data.code}
                          iframeMinHeightClass="min-h-[360px] sm:min-h-[440px] xl:min-h-[480px]"
                        />
                      </section>
                    ) : null}
                  </div>
                </IdePanel>
              </div>

              <WorkspaceColResizeHandle onMouseDown={onColResizeStart} />

              <StatementPreviewModal
                open={statementPreviewOpen}
                data={data}
                tags={tags}
                onClose={() => setStatementPreviewOpen(false)}
              />

              <IdePanel
                className="min-w-0 flex-1 xl:min-w-[min(100%,520px)]"
                header={
                  <>
                    <span className="text-xs font-bold tracking-wide text-white/80">
                      โค้ด
                    </span>
                    <span className="ml-auto text-[10px] text-white/35">
                      รันทดสอบผ่าน API
                    </span>
                  </>
                }
              >
                <div className="flex flex-col p-1">
                  <ProblemCodeExecutor
                    key={code}
                    questionCode={code}
                    sampleTests={sampleTests}
                    defaultLanguageId={63}
                    shellClassName="rounded-xl border-white/[0.09] shadow-none"
                    onCodeChange={setEditorCode}
                  />
                </div>
              </IdePanel>

              <QuestionAiAssistantPanel
                open={aiOpen}
                onOpen={() => setAiOpen(true)}
                onClose={() => setAiOpen(false)}
                messages={aiMessages}
                onClearMessages={() => {
                  aiStreamCancelRef.current?.();
                  aiStreamCancelRef.current = null;
                  aiBusyRef.current = false;
                  setAiBusy(false);
                  setAiMessages([]);
                }}
                draft={aiDraft}
                onDraftChange={setAiDraft}
                onSend={() => void sendAi()}
                sending={aiBusy}
                mode={aiMode}
                onModeChange={setAiMode}
                compareOldOptions={compareOldMeta}
                compareOldId={effectiveCompareOldId}
                onCompareOldIdChange={(id) =>
                  setComparePick({ questionCode: code, id })
                }
                canSendCompare={canSendCompare}
                compareBaselineCode={oldCodeForCompare}
              />
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
