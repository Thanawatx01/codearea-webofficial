import { buildApiUrl } from "@/lib/api";

export type CompareCodeRequest = {
  question_code?: string;
  question_id?: string;
  old_code: string;
  new_code: string;
  student_question?: string;
  model?: string;
  fast_mode?: boolean;
};

function trySafeComparePath(raw: string): string | null {
  const p = raw.trim().replace(/^\/+/, "");
  if (!p || !/^[a-zA-Z0-9/_-]+$/.test(p)) return null;
  return p;
}

export function resolveQuestionComparePath(explicit?: string): string {
  if (explicit != null) {
    const ok = trySafeComparePath(explicit);
    if (ok) return ok;
  }
  if (
    typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_QUESTION_COMPARE_PATH
  ) {
    const ok = trySafeComparePath(
      process.env.NEXT_PUBLIC_QUESTION_COMPARE_PATH,
    );
    if (ok) return ok;
  }
  return "compare";
}

/**
 * POST /api/compare — StreamingResponse text/plain
 * ค่าเริ่มต้น isAI: true → ฐาน NEXT_PUBLIC_AI_URL
 */
export async function streamQuestionCodeCompare(
  body: CompareCodeRequest,
  options: {
    useToken?: boolean;
    onChunk: (accumulatedText: string) => void;
    signal?: AbortSignal;
    isAI?: boolean;
    path?: string;
  },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const path = resolveQuestionComparePath(options.path);
  const url = buildApiUrl(path, { isAI: options.isAI ?? true });
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "text/plain, */*",
  };
  if (options.useToken !== false && typeof window !== "undefined") {
    const t = localStorage.getItem("token");
    if (t) headers.Authorization = `Bearer ${t}`;
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: options.signal,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Network error";
    return { ok: false, error: msg };
  }

  if (!res.ok) {
    const t = await res.text();
    return {
      ok: false,
      error: t.trim() || res.statusText || `HTTP ${res.status}`,
    };
  }

  if (!res.body) {
    const t = await res.text();
    options.onChunk(t);
    return { ok: true };
  }

  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let acc = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) {
      const tail = dec.decode();
      if (tail) acc += tail;
      options.onChunk(acc);
      break;
    }
    acc += dec.decode(value, { stream: true });
    options.onChunk(acc);
  }
  return { ok: true };
}
