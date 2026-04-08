import { callApi } from "@/lib/api";

export type QuestionHintBody = {
  question_code: string;
  student_question: string;
};

export type AiMessageTone = "default" | "error";

function normalizeHintText(data: unknown): string | null {
  if (data == null) return null;
  if (typeof data === "string") return data.trim() || null;
  if (typeof data === "object") {
    const o = data as Record<string, unknown>;
    for (const key of [
      "hint",
      "message",
      "answer",
      "response",
      "data",
      "text",
    ]) {
      const v = o[key];
      if (typeof v === "string" && v.trim()) return v.trim();
    }
  }
  return null;
}

/** ไม่โชว์ HTML ดิบในแชท */
export function humanizeHintError(raw: string): string {
  const t = raw.trim();
  if (!t) return "เรียกผู้ช่วยไม่สำเร็จ";
  if (t.includes("<!DOCTYPE") || t.includes("<html")) {
    if (t.includes("Cannot POST")) {
      return "Backend ไม่มี route สำหรับ POST นี้ — ตรวจ NEXT_PUBLIC_AI_URL + path (หรือ options.path ใน fetchQuestionHint)";
    }
    return "ได้รับหน้า HTML แทนข้อความ (มักเป็น 404) — ตรวจสอบ URL ของ endpoint คำใบ้";
  }
  if (t.length > 1200) return `${t.slice(0, 1200)}…`;
  return t;
}

function trySafeHintPath(raw: string): string | null {
  const p = raw.trim().replace(/^\/+/, "");
  if (!p || !/^[a-zA-Z0-9/_-]+$/.test(p)) return null;
  return p;
}

/**
 * path ต่อท้าย AI_URL — ส่ง `explicit` ตอนเรียก fetchQuestionHint
 * ไม่ส่ง → NEXT_PUBLIC_QUESTION_HINT_PATH → hint
 */
export function resolveQuestionHintPath(explicit?: string): string {
  if (explicit != null) {
    const ok = trySafeHintPath(explicit);
    if (ok) return ok;
  }
  if (
    typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_QUESTION_HINT_PATH
  ) {
    const ok = trySafeHintPath(process.env.NEXT_PUBLIC_QUESTION_HINT_PATH);
    if (ok) return ok;
  }
  return "hint";
}

/**
 * ใช้ `callApi` + `isAI: true` → ฐาน `NEXT_PUBLIC_AI_URL` (ไม่มีจะใช้ NEXT_PUBLIC_API_URL)
 *
 * path: `options.path` หรือ `NEXT_PUBLIC_QUESTION_HINT_PATH` หรือ `hint`
 */
export async function fetchQuestionHint(
  body: QuestionHintBody,
  options: { useToken?: boolean; path?: string } = {},
): Promise<
  | { ok: true; text: string }
  | { ok: false; error: string; tone: AiMessageTone }
> {
  const path = resolveQuestionHintPath(options.path);

  const res = await callApi<unknown>(path, {
    method: "POST",
    body,
    useToken: options.useToken,
    isAI: true,
  });

  if (!res.ok) {
    const raw =
      typeof res.data === "string" && res.data.trim()
        ? res.data.trim()
        : res.error ?? "Request failed";
    return {
      ok: false,
      error: humanizeHintError(raw),
      tone: "error",
    };
  }

  const text = normalizeHintText(res.data);
  if (text == null) {
    return {
      ok: false,
      error: "ไม่มีข้อความตอบจากเซิร์ฟเวอร์",
      tone: "error",
    };
  }
  return { ok: true, text };
}

export function streamTextToCallback(
  full: string,
  onUpdate: (slice: string) => void,
  opts?: { charsPerStep?: number; ms?: number; onComplete?: () => void },
): () => void {
  let i = 0;
  let cancelled = false;
  const charsPerStep = opts?.charsPerStep ?? 2;
  const ms = opts?.ms ?? 20;
  const onComplete = opts?.onComplete;

  const step = () => {
    if (cancelled) return;
    i = Math.min(full.length, i + charsPerStep);
    onUpdate(full.slice(0, i));
    if (i < full.length) {
      window.setTimeout(step, ms);
    } else {
      onComplete?.();
    }
  };
  step();

  return () => {
    cancelled = true;
  };
}
