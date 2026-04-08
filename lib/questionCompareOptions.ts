import type { ProblemUserProgress } from "@/components/problems/types";
import type { SubmissionListItem } from "@/lib/questionSubmitApi";
import { readLastQuestionSubmission } from "@/lib/questionSubmissionSession";

export type CompareOldCodeOption = { id: string; label: string; code: string };

function normCode(s: string): string {
  return s.replace(/\r\n/g, "\n").trim();
}

/** จาก GET /submissions — เรียงลำดับตามที่ API ส่ง (มักใหม่สุดก่อน) */
export function buildCompareOptionsFromSubmissionHistory(
  items: SubmissionListItem[],
): CompareOldCodeOption[] {
  return items.map((s) => ({
    id: `sub:${s.id}`,
    label: formatSubmissionCompareLabel(s),
    code: s.answer,
  }));
}

function formatSubmissionCompareLabel(s: SubmissionListItem): string {
  const score =
    s.score_percent == null ? "—" : `${s.score_percent}%`;
  const lang = s.language ?? "?";
  const datePart =
    s.created_at &&
    !Number.isNaN(new Date(s.created_at).getTime())
      ? new Date(s.created_at).toLocaleString("th-TH", {
          dateStyle: "short",
          timeStyle: "short",
        })
      : "";
  return `ส่ง #${s.id} · ${lang} · ${score}${datePart ? ` · ${datePart}` : ""}`;
}

/**
 * รวมตัวเลือก: ประวัติส่งก่อน แล้วต่อด้วย progress/session ที่ยังไม่ซ้ำโค้ดกับประวัติ
 */
export function mergeCompareHistoryAndBase(
  history: CompareOldCodeOption[],
  base: CompareOldCodeOption[],
): CompareOldCodeOption[] {
  const out = [...history];
  const seen = new Set(history.map((h) => normCode(h.code)));
  for (const b of base) {
    const k = normCode(b.code);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(b);
  }
  return out;
}

/** ตัวเลือกโค้ดฐานสำหรับเปรียบเทียบ: จาก API (last_code) และจาก session หลังส่งโค้ด */
export function buildCompareOldCodeOptions(
  questionCode: string,
  userProgress: ProblemUserProgress | null | undefined,
  /** false ระหว่าง SSR / snapshot hydrate — กัน mismatch แล้วค่อยเปิดหลัง client พร้อม */
  includeSession = true,
): CompareOldCodeOption[] {
  const out: CompareOldCodeOption[] = [];
  const fromApi = userProgress?.last_code?.trim();
  if (fromApi) {
    out.push({
      id: "progress",
      label: "โค้ดจากความคืบหน้า (ล่าสุดจากเซิร์ฟเวอร์)",
      code: fromApi,
    });
  }
  if (!includeSession || typeof window === "undefined") return out;
  const stored = readLastQuestionSubmission(questionCode);
  const sessionCode = stored?.student_code?.trim();
  if (sessionCode && sessionCode !== fromApi) {
    out.push({
      id: "session",
      label: "โค้ดที่ส่งล่าสุดในเซสชันนี้",
      code: sessionCode,
    });
  }
  return out;
}
