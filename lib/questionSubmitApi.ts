import { api } from "@/lib/api";

export type HiddenSubmissionTestCase = {
  input_data?: string;
  expected_output?: string;
  actual_output?: string;
  status?: string | number;
  run_time?: number;
  memory_used?: number;
  error_message?: string | null;
};

function pickStr(v: unknown): string | undefined {
  if (v == null) return undefined;
  if (typeof v === "string") return v;
  return String(v);
}

/** รองรับทั้งแบบแบนและแบบมี test_cases ซ้อน (จาก GET/POST /submissions) */
export function normalizeHiddenSubmissionTestCase(
  raw: unknown,
): HiddenSubmissionTestCase | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const nested =
    r.test_cases && typeof r.test_cases === "object"
      ? (r.test_cases as Record<string, unknown>)
      : null;

  const input_data = pickStr(r.input_data) ?? pickStr(nested?.input_data);
  const expected_output =
    pickStr(r.expected_output) ?? pickStr(nested?.output_data);
  const actual_output =
    pickStr(r.actual_output) ?? pickStr(r.output_data);

  const run_time =
    typeof r.run_time === "number" && Number.isFinite(r.run_time)
      ? r.run_time
      : r.run_time_ms != null && Number.isFinite(Number(r.run_time_ms))
        ? Number(r.run_time_ms)
        : undefined;

  const memory_used =
    typeof r.memory_used === "number" && Number.isFinite(r.memory_used)
      ? r.memory_used
      : r.memory_used_bytes != null &&
          Number.isFinite(Number(r.memory_used_bytes))
        ? Number(r.memory_used_bytes)
        : undefined;

  const err = r.error_message;
  return {
    input_data,
    expected_output,
    actual_output,
    status: r.status as string | number | undefined,
    run_time,
    memory_used,
    error_message:
      err == null
        ? null
        : typeof err === "string"
          ? err
          : String(err),
  };
}

export type HiddenSubmitTestSummary = {
  tests_total?: number;
  tests_passed?: number;
  tests_wrong_answer?: number;
  tests_error?: number;
  tests_failed?: number;
  run_time_ms?: number;
  avg_run_time_ms?: number;
  memory_used_bytes?: number;
  avg_memory_used_bytes?: number;
};

/** 201 หลัง POST /submissions (เทสซ่อน) */
export type FullSubmitResponse = {
  id: number;
  pid?: number;
  score_percent: number;
  submission_test_cases?: HiddenSubmissionTestCase[];
  test_summary?: HiddenSubmitTestSummary;
  hidden_tests_run?: number;
};

function unwrapFullSubmit(data: unknown): FullSubmitResponse | null {
  if (!data || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  if ("data" in o && o.data && typeof o.data === "object") {
    return unwrapFullSubmit(o.data);
  }
  const idRaw = o.id;
  const id = typeof idRaw === "number" ? idRaw : Number(idRaw);
  if (!Number.isFinite(id)) return null;
  const scoreRaw = o.score_percent;
  let score = 0;
  if (scoreRaw != null && scoreRaw !== "") {
    const n = typeof scoreRaw === "number" ? scoreRaw : Number(scoreRaw);
    if (Number.isFinite(n)) score = n;
  }

  return {
    id,
    pid:
      typeof o.pid === "number"
        ? o.pid
        : o.pid != null && Number.isFinite(Number(o.pid))
          ? Number(o.pid)
          : undefined,
    score_percent: score,
    submission_test_cases: Array.isArray(o.submission_test_cases)
      ? (o.submission_test_cases as unknown[])
          .map(normalizeHiddenSubmissionTestCase)
          .filter((x): x is HiddenSubmissionTestCase => x != null)
      : [],
    test_summary:
      o.test_summary && typeof o.test_summary === "object"
        ? (o.test_summary as HiddenSubmitTestSummary)
        : undefined,
    hidden_tests_run:
      typeof o.hidden_tests_run === "number"
        ? o.hidden_tests_run
        : o.hidden_tests_run != null && Number.isFinite(Number(o.hidden_tests_run))
          ? Number(o.hidden_tests_run)
          : undefined,
  };
}

/**
 * ส่งโค้ดจริง — รันเทสซ่อน
 * POST /submissions → 201
 */
export async function submitQuestionCode(
  params: { questionCode: string; language: string; code: string },
  options?: { useToken?: boolean },
): Promise<
  { ok: true; data: FullSubmitResponse } | { ok: false; error: string }
> {
  const res = await api.post<unknown>(
    "/submissions",
    {
      question_code: params.questionCode,
      language: params.language,
      code: params.code,
    },
    { useToken: options?.useToken ?? true },
  );

  if (!res.ok || res.data == null) {
    const err =
      typeof res.data === "string" && res.data.trim()
        ? res.data.trim()
        : res.error ?? "ส่งโค้ดไม่สำเร็จ";
    return { ok: false, error: err };
  }

  const parsed = unwrapFullSubmit(res.data);
  if (!parsed) {
    return {
      ok: false,
      error: "รูปแบบผลลัพธ์จากเซิร์ฟเวอร์ไม่ตรงกับที่คาดไว้",
    };
  }
  return { ok: true, data: parsed };
}

/** แถวจาก GET /submissions?question_code=… (io_meta + data[]) */
export type SubmissionListItem = {
  id: number;
  pid?: number;
  question_id?: number;
  language?: string;
  answer: string;
  status?: number;
  run_time?: number;
  memory_used?: number;
  created_at?: string;
  score_percent: number | null;
  submission_test_cases?: HiddenSubmissionTestCase[];
  test_summary?: HiddenSubmitTestSummary;
};

function parseSubmissionListItem(raw: unknown): SubmissionListItem | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const idRaw = o.id;
  const id = typeof idRaw === "number" ? idRaw : Number(idRaw);
  if (!Number.isFinite(id)) return null;
  const answer = typeof o.answer === "string" ? o.answer : null;
  if (answer == null) return null;

  let score_percent: number | null = null;
  const scoreRaw = o.score_percent;
  if (scoreRaw != null && scoreRaw !== "") {
    const n = typeof scoreRaw === "number" ? scoreRaw : Number(scoreRaw);
    if (Number.isFinite(n)) score_percent = n;
  }

  const cases = Array.isArray(o.submission_test_cases)
    ? (o.submission_test_cases as unknown[])
        .map(normalizeHiddenSubmissionTestCase)
        .filter((x): x is HiddenSubmissionTestCase => x != null)
    : undefined;

  const test_summary =
    o.test_summary && typeof o.test_summary === "object"
      ? (o.test_summary as HiddenSubmitTestSummary)
      : undefined;

  return {
    id,
    pid:
      typeof o.pid === "number"
        ? o.pid
        : o.pid != null && Number.isFinite(Number(o.pid))
          ? Number(o.pid)
          : undefined,
    question_id:
      typeof o.question_id === "number"
        ? o.question_id
        : o.question_id != null && Number.isFinite(Number(o.question_id))
          ? Number(o.question_id)
          : undefined,
    language: typeof o.language === "string" ? o.language : undefined,
    answer,
    status:
      typeof o.status === "number"
        ? o.status
        : o.status != null && Number.isFinite(Number(o.status))
          ? Number(o.status)
          : undefined,
    run_time:
      typeof o.run_time === "number" ? o.run_time : undefined,
    memory_used:
      typeof o.memory_used === "number" ? o.memory_used : undefined,
    created_at: typeof o.created_at === "string" ? o.created_at : undefined,
    score_percent,
    submission_test_cases: cases,
    test_summary,
  };
}

function parseSubmissionsListPayload(data: unknown): SubmissionListItem[] {
  if (data == null) return [];
  const o = data as Record<string, unknown>;
  const arr = Array.isArray(o.data)
    ? o.data
    : Array.isArray(data)
      ? data
      : [];
  return arr
    .map(parseSubmissionListItem)
    .filter((x): x is SubmissionListItem => x != null);
}

/**
 * รายการ submission ที่เคยส่ง — GET /submissions
 * query: question_code (หรือ code), page, limit
 */
export async function listQuestionSubmissions(
  params: {
    questionCode: string;
    page?: number;
    limit?: number;
  },
  options?: { useToken?: boolean },
): Promise<
  | { ok: true; items: SubmissionListItem[] }
  | { ok: false; error: string }
> {
  const res = await api.get<unknown>("/submissions", {
    useToken: options?.useToken ?? true,
    params: {
      question_code: params.questionCode,
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    },
  });

  if (!res.ok) {
    const err =
      typeof res.data === "string" && res.data.trim()
        ? res.data.trim()
        : res.error ?? "โหลดรายการส่งไม่สำเร็จ";
    return { ok: false, error: err };
  }

  return { ok: true, items: parseSubmissionsListPayload(res.data) };
}
