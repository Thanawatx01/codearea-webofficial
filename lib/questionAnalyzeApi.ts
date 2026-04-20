import { buildApiUrl } from "@/lib/api";

export type PostSubmitAnalyzeRequest = {
  question_code: string;
  student_code: string;
  submission_id?: number;
  model?: string;
  fast_mode?: boolean;
};

/**
 * POST /analyze — StreamingResponse text/plain (ข้อความวิเคราะห์หลังส่งโค้ด)
 * ค่าเริ่มต้น isAI: true → ฐาน NEXT_PUBLIC_AI_URL (fallback NEXT_PUBLIC_API_URL)
 */
export async function streamPostSubmitAnalysis(
  body: PostSubmitAnalyzeRequest,
  options: {
    useToken?: boolean;
    onChunk: (accumulatedText: string) => void;
    signal?: AbortSignal;
    /** ค่าเริ่มต้น true — ยิงไปฐาน AI; ใส่ false ถ้า /analyze อยู่ที่ API หลัก */
    isAI?: boolean;
  },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const url = buildApiUrl("/ai-tutor/analyze", { isAI: false });
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
    return { ok: false, error: t.trim() || res.statusText || `HTTP ${res.status}` };
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
