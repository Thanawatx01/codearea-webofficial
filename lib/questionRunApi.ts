import { api } from "@/lib/api";
import { PISTON_LANGUAGE_MAP } from "@/lib/piston";

/** สรุปหลัง sample-run (ตรงกับ backend) */
export interface SampleRunSummary {
  tests_total: number;
  tests_passed: number;
  tests_wrong_answer: number;
  tests_error: number;
  avg_run_time_ms: number;
  avg_memory_used_bytes: number;
  avg_note?: string;
  per_test_run_time_memory_note?: string;
}

/** ผลรายเทสต์หนึ่งเคส */
export interface SampleRunCaseResult {
  test_case_id: number;
  case_order: number;
  input_data: string;
  expected_output: string;
  passed: boolean;
  status: number;
  error_message: string | null;
  memory_used: number;
  output_data: string;
  run_time: number;
}

/** Body ตอบจาก POST /submissions/sample-run */
export interface SampleRunResponse {
  question_code: string;
  language: string;
  score_percent: number;
  results: SampleRunCaseResult[];
  summary: SampleRunSummary;
}

export type SimpleRunResult =
  | { ok: true; data: SampleRunResponse }
  | { ok: false; error: string; data: null };

export interface SimpleRunParams {
  sourceCode: string;
  languageId: number;
}

function isSampleRunResponse(v: unknown): v is SampleRunResponse {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  const summary = o.summary;
  if (!summary || typeof summary !== "object") return false;
  const s = summary as Record<string, unknown>;
  return (
    typeof o.question_code === "string" &&
    typeof o.language === "string" &&
    typeof o.score_percent === "number" &&
    Array.isArray(o.results) &&
    typeof s.tests_total === "number" &&
    typeof s.tests_passed === "number"
  );
}

function unwrapSampleRun(data: unknown): SampleRunResponse | null {
  if (isSampleRunResponse(data)) return data;
  if (data && typeof data === "object" && "data" in data) {
    return unwrapSampleRun((data as { data: unknown }).data);
  }
  return null;
}

/**
 * รันโค้ดตัวอย่างตามโจทย์ (เทสจากเซิร์ฟเวอร์)
 * POST /submissions/sample-run
 */
export async function simpleRunQuestion(
  questionCode: string,
  params: SimpleRunParams,
  options?: { useToken?: boolean },
): Promise<SimpleRunResult> {
  const cfg = PISTON_LANGUAGE_MAP[params.languageId];
  if (!cfg) {
    return {
      ok: false,
      error: "ไม่รองรับภาษานี้สำหรับการรันทดสอบ",
      data: null,
    };
  }

  const res = await api.post<unknown>(
    "/submissions/sample-run",
    {
      question_code: questionCode,
      code: params.sourceCode,
      language: cfg.language,
    },
    { useToken: options?.useToken ?? true },
  );

  if (!res.ok || res.data == null) {
    return {
      ok: false,
      error: res.error ?? "รันโค้ดไม่สำเร็จ",
      data: null,
    };
  }

  const parsed = unwrapSampleRun(res.data);
  if (!parsed) {
    return {
      ok: false,
      error: "รูปแบบผลลัพธ์จากเซิร์ฟเวอร์ไม่ตรงกับที่คาดไว้",
      data: null,
    };
  }

  return { ok: true, data: parsed };
}
