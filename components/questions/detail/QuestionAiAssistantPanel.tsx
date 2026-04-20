import { Icon } from "@/components/icons/Icon";
import type { AiMessageTone } from "@/lib/questionHintApi";
import { useLayoutEffect, useRef } from "react";
import AiAssistantMarkdown from "./AiAssistantMarkdown";

export type AiAssistantMode = "hint" | "compare";

export type AiMessage = {
  role: "user" | "assistant";
  text: string;
  tone?: AiMessageTone;
};

export type CompareOldOptionMeta = { id: string; label: string };

export default function QuestionAiAssistantPanel({
  open,
  onOpen,
  onClose,
  messages,
  onClearMessages,
  draft,
  onDraftChange,
  onSend,
  sending = false,
  mode = "hint",
  isAuthenticated = true,
  onModeChange,
  compareOldOptions = [],
  compareOldId,
  onCompareOldIdChange,
  canSendCompare = false,
  compareBaselineCode = "",
}: {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  messages: AiMessage[];
  onClearMessages: () => void;
  draft: string;
  onDraftChange: (v: string) => void;
  onSend: () => void;
  sending?: boolean;
  mode?: AiAssistantMode;
  onModeChange?: (m: AiAssistantMode) => void;
  compareOldOptions?: CompareOldOptionMeta[];
  compareOldId?: string;
  onCompareOldIdChange?: (id: string) => void;
  /** โหมด compare: มีโค้ดเก่า + โค้ดใน editor */
  canSendCompare?: boolean;
  /** โค้ดจากตัวเลือกฐาน (ประวัติ / progress / session) */
  compareBaselineCode?: string;
  isAuthenticated?: boolean;
}) {
  const messagesScrollRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open) return;
    const el = messagesScrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [open, messages, sending]);

  const hintSendDisabled = sending || !draft.trim();
  const compareSendDisabled =
    sending || !canSendCompare || compareOldOptions.length === 0;
  const sendDisabled = !isAuthenticated || (mode === "hint" ? hintSendDisabled : compareSendDisabled);

  return (
    <div
      className={[
        "flex shrink-0 flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b0c10]/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl transition-[width] duration-300 ease-out xl:self-start",
        open
          ? "w-full min-h-[480px] xl:flex xl:h-[min(85dvh,900px)] xl:min-h-[min(560px,62dvh)] xl:w-[min(100%,400px)] xl:max-h-[85dvh]"
          : "h-auto w-full xl:h-auto xl:w-12 xl:min-w-12",
      ].join(" ")}
    >
      {!open ? (
        <button
          type="button"
          onClick={onOpen}
          className="flex h-11 w-full items-center justify-center gap-2 border-b border-white/10 bg-white/[0.03] px-2 text-[11px] font-bold text-violet-200/90 transition hover:bg-violet-500/10 xl:h-full xl:min-h-0 xl:w-12 xl:flex-col xl:border-b-0 xl:py-4"
        >
          <Icon name="cpu" className="h-4 w-4 shrink-0" />
          <span className="xl:[writing-mode:vertical-rl] xl:rotate-180">AI</span>
        </button>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex h-11 shrink-0 items-center justify-between border-b border-white/10 bg-white/[0.03] px-2">
            <span className="text-xs font-bold tracking-wide text-white/75">
              AI Process Assistant
            </span>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                className="rounded-md p-1.5 text-sm font-bold text-white/35 hover:bg-white/10 hover:text-white/60"
                aria-label="แชทใหม่"
                onClick={onClearMessages}
              >
                +
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-1.5 text-white/45 hover:bg-white/10 hover:text-white"
                aria-label="ปิดแผง"
              >
                <Icon name="xmark" className="h-4 w-4" />
              </button>
            </div>
          </div>

          {onModeChange ? (
            <div className="shrink-0 border-b border-white/10 px-2 py-2">
              <div className="flex rounded-lg border border-white/10 bg-black/30 p-0.5">
                <button
                  type="button"
                  onClick={() => onModeChange("hint")}
                  className={[
                    "flex-1 rounded-md py-1.5 text-[10px] font-bold uppercase tracking-wide transition",
                    mode === "hint"
                      ? "bg-violet-600/35 text-violet-100 shadow-[0_0_12px_rgba(139,92,246,0.15)]"
                      : "text-white/40 hover:text-white/65",
                  ].join(" ")}
                >
                  คำใบ้
                </button>
                <button
                  type="button"
                  onClick={() => onModeChange("compare")}
                  className={[
                    "flex-1 rounded-md py-1.5 text-[10px] font-bold uppercase tracking-wide transition",
                    mode === "compare"
                      ? "bg-sky-600/30 text-sky-100 shadow-[0_0_12px_rgba(14,165,233,0.12)]"
                      : "text-white/40 hover:text-white/65",
                  ].join(" ")}
                >
                  เปรียบเทียบ
                </button>
              </div>
              {mode === "compare" ? (
                <div className="mt-2 space-y-1">
                  {compareOldOptions.length > 0 ? (
                    <>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-white/35">
                        โค้ดฐาน (เทียบกับโค้ดใน editor)
                      </label>
                      <select
                        className="h-9 w-full cursor-pointer appearance-none rounded-lg border border-white/15 bg-[#14161f] py-0 pl-3 pr-9 text-[11px] text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none focus-visible:border-emerald-400/55 focus-visible:ring-2 focus-visible:ring-emerald-400/25 disabled:cursor-not-allowed disabled:opacity-45"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23ffffff80' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "right 0.5rem center",
                          backgroundSize: "1.25rem",
                        }}
                        value={compareOldId ?? compareOldOptions[0]?.id ?? ""}
                        onChange={(e) => onCompareOldIdChange?.(e.target.value)}
                        disabled={sending}
                      >
                        {compareOldOptions.map((o) => (
                          <option key={o.id} value={o.id} className="bg-[#1a1d26]">
                            {o.label}
                          </option>
                        ))}
                      </select>
                      <div className="mt-3 border-t border-white/10 pt-2">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-sky-400/85">
                          โค้ดฐานที่เลือก
                        </span>
                        <pre className="mt-1 max-h-[min(200px,30vh)] overflow-auto whitespace-pre-wrap wrap-break-word rounded-lg border border-white/10 bg-black/55 p-2 font-mono text-[10px] leading-snug text-zinc-200/95">
                          {compareBaselineCode.trim()
                            ? compareBaselineCode
                            : "—"}
                        </pre>
                      </div>
                    </>
                  ) : (
                    <p className="text-[10px] leading-relaxed text-amber-200/75">
                      ยังไม่มีโค้ดให้เลือก — ล็อกอินแล้วระบบจะโหลดประวัติจาก{" "}
                      <span className="font-mono text-white/70">/submissions</span>{" "}
                      หรือใช้{" "}
                      <span className="font-medium text-white/80">
                        user_progress.last_code
                      </span>{" "}
                      / ส่งโค้ดในเซสชันนี้
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          ) : null}

          <div
            ref={messagesScrollRef}
            className="flex min-h-56 flex-1 flex-col gap-3 overflow-y-auto p-3 xl:min-h-72"
          >
            {!isAuthenticated ? (
              <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                <span className="text-3xl opacity-40">🔒</span>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-white/80">Login Required</p>
                  <p className="max-w-48 text-[11px] leading-relaxed text-white/40">
                    Sign in to use the AI Process Assistant and get coding hints.
                  </p>
                </div>
                <a
                  href="/login"
                  className="rounded-lg bg-white/10 px-4 py-1.5 text-[11px] font-bold text-white transition hover:bg-white/20"
                >
                  Go to Login
                </a>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                <span className="text-3xl opacity-40" aria-hidden>
                  😎
                </span>
                <p className="max-w-56 text-xs leading-relaxed text-white/45">
                  {mode === "compare"
                    ? "Select an old version and ask Focus — System will stream code comparisons."
                    : "Ask questions about the problem — Get AI-powered hints and analysis."}
                </p>
              </div>
            ) : (
              messages.map((m, i) => {
                const isLast = i === messages.length - 1;
                const isLastAssistant = m.role === "assistant" && isLast;
                const showThinking =
                  isLastAssistant && sending && m.text.length === 0;
                const showStreamCaret =
                  mode === "compare" &&
                  isLastAssistant &&
                  sending &&
                  m.text.length > 0;
                const isErr = m.role === "assistant" && m.tone === "error";

                const bubble =
                  m.role === "user"
                    ? "max-w-[min(100%,17.5rem)] rounded-2xl rounded-br-md border border-violet-400/25 bg-linear-to-br from-violet-600/35 to-indigo-600/25 px-3.5 py-2.5 text-[13px] leading-snug text-white shadow-[0_4px_24px_rgba(139,92,246,0.12)]"
                    : isErr
                      ? "max-w-[min(100%,19rem)] rounded-2xl rounded-bl-md border border-amber-500/30 bg-amber-950/45 px-3.5 py-2.5 text-[12px] leading-snug text-amber-100/95"
                      : "max-w-[min(100%,19rem)] rounded-2xl rounded-bl-md border border-white/12 bg-zinc-900/80 px-3.5 py-2.5 text-[13px] leading-snug text-zinc-100/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]";

                return (
                  <div
                    key={i}
                    className={
                      m.role === "user"
                        ? "flex w-full justify-end pl-6"
                        : "flex w-full justify-start pr-5"
                    }
                  >
                    <div className={bubble}>
                      {m.role === "assistant" ? (
                        <div className="wrap-break-word">
                          {showThinking ? (
                            <span className="text-white/50 animate-pulse">
                              กำลังคิด…
                            </span>
                          ) : (
                            <>
                              <AiAssistantMarkdown source={m.text} />
                              {showStreamCaret ? (
                                <span
                                  className="ml-0.5 inline-block h-[0.9em] w-px translate-y-[0.08em] bg-sky-300/90 animate-pulse align-middle"
                                  aria-hidden
                                />
                              ) : null}
                            </>
                          )}
                        </div>
                      ) : (
                        <span className="whitespace-pre-wrap wrap-break-word">
                          {m.text}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="border-t border-white/10 p-2">
            <textarea
              value={draft}
              onChange={(e) => onDraftChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!sendDisabled) onSend();
                }
              }}
              placeholder={
                !isAuthenticated
                  ? "Please login to chat..."
                  : mode === "compare"
                    ? "Focus on... (Optional) · Enter to send · Shift+Enter for new line"
                    : "Ask about the problem... (Enter to send · Shift+Enter for new line)"
              }
              rows={2}
              disabled={sending || !isAuthenticated}
              className="mb-2 w-full resize-none rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-xs text-white placeholder:text-white/28 focus:border-violet-500/35 focus:outline-none focus:ring-1 focus:ring-violet-500/25 disabled:cursor-not-allowed disabled:opacity-45"
            />
            <button
              type="button"
              onClick={onSend}
              disabled={sendDisabled}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-violet-600 to-indigo-600 py-2 text-[11px] font-bold uppercase tracking-wider text-white/95 shadow-[0_0_20px_rgba(139,92,246,0.2)] transition hover:opacity-95 disabled:pointer-events-none disabled:opacity-45"
            >
              ส่ง
              <Icon name="chevron-right" className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
