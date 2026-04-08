export type QuestionTestCase = {
  id?: number;
  input_data: string;
  output_data: string;
  is_simple?: boolean;
};

import type { ProblemUserProgress } from "@/components/problems/types";

export type QuestionDetail = {
  code: string;
  title: string;
  category_name?: string | null;
  description?: string | null;
  constraints?: string | null;
  difficulty?: string | number | null;
  points?: number | null;
  expected_complexity?: string | null;
  time_limit?: number | null;
  memory_limit?: number | null;
  uri?: string | null;
  tags?: unknown[];
  test_cases?: QuestionTestCase[];
  /** มีเมื่อล็อกอินและ backend ส่งความคืบหน้า */
  user_progress?: ProblemUserProgress | null;
};

export function normalizeTag(item: unknown): string {
  if (item == null) return "";
  if (typeof item === "string" || typeof item === "number") {
    return String(item).trim();
  }
  if (typeof item === "object" && item !== null && "name" in item) {
    const n = (item as { name: unknown }).name;
    if (n != null) return String(n).trim();
  }
  return "";
}
