import type { ProblemRow } from "@/components/problems/types";

export type QuestionsListResponse = {
  data: ProblemRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
};

export const PAGE_SIZE = 15;

export const DIFF_PILLS = [
  { value: "", label: "ทั้งหมด" },
  { value: "1", label: "ง่าย" },
  { value: "2", label: "ปานกลาง" },
  { value: "3", label: "ยาก" },
] as const;
