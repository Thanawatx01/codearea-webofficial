import type { FullSubmitResponse } from "@/lib/questionSubmitApi";

export type StoredQuestionSubmission = {
  question_code: string;
  student_code: string;
  language?: string;
  result: FullSubmitResponse;
  storedAt: number;
};

function storageKey(questionCode: string) {
  return `codearea:lastSubmission:${questionCode}`;
}

export function storeLastQuestionSubmission(
  payload: Omit<StoredQuestionSubmission, "storedAt">,
): void {
  const full: StoredQuestionSubmission = {
    ...payload,
    storedAt: Date.now(),
  };
  try {
    sessionStorage.setItem(storageKey(payload.question_code), JSON.stringify(full));
  } catch {
    /* ignore quota / private mode */
  }
}

export function readLastQuestionSubmission(
  questionCode: string,
): StoredQuestionSubmission | null {
  try {
    const raw = sessionStorage.getItem(storageKey(questionCode));
    if (!raw) return null;
    const p = JSON.parse(raw) as StoredQuestionSubmission;
    if (!p?.result || typeof p.student_code !== "string") return null;
    if (p.question_code !== questionCode) return null;
    return p;
  } catch {
    return null;
  }
}

export function clearLastQuestionSubmission(questionCode: string): void {
  try {
    sessionStorage.removeItem(storageKey(questionCode));
  } catch {
    /* ignore */
  }
}
