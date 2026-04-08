import type { Select2Option } from "@/components/FormControls";
import { api } from "@/lib/api";

function asRecordArray(data: unknown): Record<string, unknown>[] {
  if (!data || typeof data !== "object") return [];
  const o = data as Record<string, unknown>;
  const raw = o.data ?? o.rows ?? o.items ?? o.results;
  if (!Array.isArray(raw)) return [];
  return raw.filter((r) => r && typeof r === "object") as Record<string, unknown>[];
}

function pickStr(obj: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = obj[k];
    if (v !== null && v !== undefined && String(v).trim() !== "") {
      return String(v).trim();
    }
  }
  return "";
}

export function mapCategoryRowToOption(row: Record<string, unknown>): Select2Option {
  const id = pickStr(row, ["id", "category_id"]);
  const label = pickStr(row, ["name", "category_name", "title", "label"]) || id;
  const value = id || label;
  return { value, label: label || value };
}

export function mapTagRowToOption(row: Record<string, unknown>): Select2Option {
  const id = pickStr(row, ["id"]);
  const name = pickStr(row, ["name", "tag_name", "slug", "label"]);
  const value = id || name;
  const label = pickStr(row, ["name", "tag_name", "label"]) || name || id;
  return { value, label: label || value };
}

export type TaxonomyListParams = {
  page?: number;
  limit?: number;
  name?: string;
  /** "0" | "1" — omit เพื่อไม่กรองสถานะ */
  status?: string;
};

export type TaxonomyRequestOptions = {
  /** default: true — หน้า public ใช้ false ตาม Swagger list ที่ไม่บังคับล็อกอิน */
  useToken?: boolean;
};

export async function fetchQuestionCategoryOptions(
  params: TaxonomyListParams,
  requestOptions: TaxonomyRequestOptions = {},
): Promise<Select2Option[]> {
  const useToken = requestOptions.useToken ?? true;
  const res = await api.get<unknown>("question-categories/list", {
    useToken,
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 50,
      ...(params.name !== undefined && params.name !== ""
        ? { name: params.name }
        : {}),
      ...(params.status !== undefined && params.status !== ""
        ? { status: params.status }
        : {}),
    },
  });
  if (!res.ok || res.data == null) return [];
  return asRecordArray(res.data)
    .map(mapCategoryRowToOption)
    .filter((o) => o.value.length > 0);
}

export async function fetchTagOptions(
  params: TaxonomyListParams,
  requestOptions: TaxonomyRequestOptions = {},
): Promise<Select2Option[]> {
  const useToken = requestOptions.useToken ?? true;
  const res = await api.get<unknown>("tags", {
    useToken,
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 50,
      ...(params.name !== undefined && params.name !== ""
        ? { name: params.name }
        : {}),
      ...(params.status !== undefined && params.status !== ""
        ? { status: params.status }
        : {}),
    },
  });
  if (!res.ok || res.data == null) return [];
  return asRecordArray(res.data)
    .map(mapTagRowToOption)
    .filter((o) => o.value.length > 0);
}

/** Filter หน้า problems — ไม่บังคับ status */
export function loadQuestionCategoryOptionsForFilter(inputValue: string) {
  return fetchQuestionCategoryOptions({
    name: inputValue,
    page: 1,
    limit: 50,
  });
}

export function loadTagOptionsForFilter(inputValue: string) {
  return fetchTagOptions({
    name: inputValue,
    page: 1,
    limit: 50,
  });
}

/** ฟอร์มสร้าง/แก้ไข — โฟกัสรายการที่เปิดใช้งาน */
export function loadQuestionCategoryOptionsForForm(inputValue: string) {
  return fetchQuestionCategoryOptions({
    name: inputValue,
    page: 1,
    limit: 50,
    status: "1",
  });
}

export function loadTagOptionsForForm(inputValue: string) {
  return fetchTagOptions({
    name: inputValue,
    page: 1,
    limit: 50,
    status: "1",
  });
}

/** หน้า public /questions — ไม่ส่ง token */
export function loadQuestionCategoryOptionsPublic(inputValue: string) {
  return fetchQuestionCategoryOptions(
    { name: inputValue, page: 1, limit: 50, status: "1" },
    { useToken: false },
  );
}

export function loadTagOptionsPublic(inputValue: string) {
  return fetchTagOptions(
    { name: inputValue, page: 1, limit: 50, status: "1" },
    { useToken: false },
  );
}
