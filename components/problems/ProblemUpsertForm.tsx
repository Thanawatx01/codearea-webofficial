"use client";

import {
  ThemedAsyncMultiSelect2,
  ThemedAsyncSelect2,
  ThemedInput,
  ThemedSelect,
  ThemedTextarea,
  type Select2Option,
} from "@/components/FormControls";
import { MarkdownCodeEditor } from "@/components/editor/MarkdownCodeEditor";
import { Icon } from "@/components/icons/Icon";
import { api } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import Swal from "sweetalert2";
import {
  loadQuestionCategoryOptionsForForm,
  loadTagOptionsForForm,
} from "@/lib/questionTaxonomyApi";
import CodeEditor from "../editor/CodeEditor";

type ProblemDetailResponse = {
  category_id?: string | number | null;
  categoryId?: string | number | null;
  code: string;
  title: string;
  category_name?: string | null;
  description?: string | null;
  constraints?: string | null;
  solution?: string | null;
  uri?: string | null;
  difficulty?: string | number | null;
  expected_complexity?: string | null;
  time_limit?: number | null;
  memory_limit?: number | null;
  points?: number | null;
  status?: boolean | null;
  tags?: unknown[];
  test_cases?: {
    id?: number;
    input_data: string;
    output_data: string;
    case_order?: number | null;
    is_simple?: boolean;
    status?: boolean;
  }[];
};

type ProblemUpsertFormProps = {
  code?: string;
};

type ProblemFormState = {
  category_id: string;
  title: string;
  description: string;
  constraints: string;
  solution: string;
  difficulty: string;
  expected_complexity: string;
  time_limit: string;
  memory_limit: string;
  points: string;
  status: "1" | "0";
  tag: string[];
  test_cases: {
    id?: number;
    input_data: string;
    output_data: string;
    case_order: string;
    is_simple: boolean;
    status: boolean;
  }[];
};

const initialFormState: ProblemFormState = {
  category_id: "",
  title: "",
  description: "",
  constraints: "",
  solution: "",
  difficulty: "",
  expected_complexity: "",
  time_limit: "",
  memory_limit: "",
  points: "",
  status: "1",
  tag: [],
  test_cases: [
    {
      input_data: "",
      output_data: "",
      case_order: "1",
      is_simple: false,
      status: true,
    },
  ],
};

const expectedComplexityOptions = [
  "O(1)",
  "O(log N)",
  "O(sqrt N)",
  "O(N)",
  "O(N log N)",
  "O(N^2)",
  "O(N^3)",
  "O(2^N)",
  "O(N!)",
];

function categoryIdFromDetail(data: ProblemDetailResponse): string {
  const rawId = data.category_id ?? data.categoryId;
  if (rawId === null || rawId === undefined) return "";
  return String(rawId).trim();
}

function normalizeTagValue(item: unknown): string {
  if (item === null || item === undefined) return "";
  if (typeof item === "string" || typeof item === "number") {
    return String(item).trim();
  }
  if (typeof item === "object" && "name" in (item as object)) {
    const n = (item as { name: unknown }).name;
    if (n !== null && n !== undefined) return String(n).trim();
  }
  if (typeof item === "object" && "slug" in (item as object)) {
    const s = (item as { slug: unknown }).slug;
    if (s !== null && s !== undefined) return String(s).trim();
  }
  return "";
}

export function ProblemUpsertForm({ code }: ProblemUpsertFormProps) {
  const router = useRouter();
  const isEditMode = Boolean(code);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [existingUri, setExistingUri] = useState<string>("");
  const [formData, setFormData] = useState<ProblemFormState>(initialFormState);
  const [categoryOption, setCategoryOption] = useState<Select2Option | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!code) return;
    const run = async () => {
      setIsLoading(true);
      const res = await api.get<ProblemDetailResponse>(
        `/questions/${encodeURIComponent(code)}`,
        { useToken: true },
      );

      if (!res.ok || !res.data) {
        await Swal.fire({
          icon: "error",
          title: "โหลดข้อมูลไม่สำเร็จ",
          text: res.error ?? "ไม่พบข้อมูลโจทย์",
        });
        router.push("/dashboard/problems");
        return;
      }

      const data = res.data;
      const mappedTagValues = (data.tags ?? [])
        .map((item) => normalizeTagValue(item))
        .filter(Boolean);
      const cid = categoryIdFromDetail(data);
      const mappedTestCases =
        data.test_cases?.map((item, index) => ({
          id: item.id,
          input_data: item.input_data ?? "",
          output_data: item.output_data ?? "",
          case_order:
            item.case_order === null || item.case_order === undefined
              ? String(index + 1)
              : String(item.case_order),
          is_simple: Boolean(item.is_simple),
          status: item.status !== false,
        })) ?? initialFormState.test_cases;
      setCategoryOption(
        cid
          ? {
              value: cid,
              label: (data.category_name ?? cid).toString().trim() || cid,
            }
          : null,
      );
      setFormData({
        category_id: cid,
        title: data.title ?? "",
        description: data.description ?? "",
        constraints: data.constraints ?? "",
        solution: data.solution ?? "",
        difficulty:
          data.difficulty === null || data.difficulty === undefined
            ? ""
            : String(data.difficulty),
        expected_complexity: data.expected_complexity ?? "",
        time_limit:
          data.time_limit === null || data.time_limit === undefined
            ? ""
            : String(data.time_limit),
        memory_limit:
          data.memory_limit === null || data.memory_limit === undefined
            ? ""
            : String(data.memory_limit),
        points:
          data.points === null || data.points === undefined
            ? ""
            : String(data.points),
        status: data.status === false ? "0" : "1",
        tag: mappedTagValues,
        test_cases: mappedTestCases,
      });
      setExistingUri(data.uri ?? "");
      setIsLoading(false);
    };
    void run();
  }, [code, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const tagSelections = useMemo(
    () => formData.tag.map((t) => ({ value: t, label: t })),
    [formData.tag],
  );

  const handlePickedFile = (file: File | null) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      void Swal.fire({
        icon: "warning",
        title: "รองรับเฉพาะ PDF",
        text: "กรุณาเลือกไฟล์นามสกุล .pdf เท่านั้น",
      });
      return;
    }
    setPdfFile(file);
  };

  const fileToDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(new Error("ไม่สามารถอ่านไฟล์ PDF ได้"));
      reader.readAsDataURL(file);
    });

  const addTestCase = () => {
    setFormData((prev) => ({
      ...prev,
      test_cases: [
        ...prev.test_cases,
        {
          input_data: "",
          output_data: "",
          case_order: String(prev.test_cases.length + 1),
          is_simple: false,
          status: true,
        },
      ],
    }));
  };

  const removeTestCase = (index: number) => {
    setFormData((prev) => {
      if (prev.test_cases.length <= 1) return prev;
      const next = prev.test_cases.filter((_, idx) => idx !== index);
      return {
        ...prev,
        test_cases: next.map((item, idx) => ({
          ...item,
          case_order: item.case_order || String(idx + 1),
        })),
      };
    });
  };

  const updateTestCase = (
    index: number,
    field: "input_data" | "output_data" | "case_order" | "is_simple" | "status",
    value: string | boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      test_cases: prev.test_cases.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category_id.trim() || !formData.title.trim()) {
      await Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ครบ",
        text: "กรุณาระบุ category_id และ title",
      });
      return;
    }
    if (!isEditMode && !pdfFile) {
      await Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ครบ",
        text: "กรุณาอัปโหลดไฟล์ PDF",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const uriFromFile = pdfFile ? await fileToDataUrl(pdfFile) : null;
      const jsonPayload = {
        category_id: formData.category_id.trim(),
        title: formData.title.trim(),
        description: formData.description || null,
        constraints: formData.constraints || null,
        solution: formData.solution || null,
        ...(uriFromFile ? { uri: uriFromFile } : {}),
        difficulty: formData.difficulty || null,
        expected_complexity: formData.expected_complexity || null,
        time_limit: formData.time_limit ? Number(formData.time_limit) : null,
        memory_limit: formData.memory_limit
          ? Number(formData.memory_limit)
          : null,
        points: (() => {
          const raw = formData.points.trim();
          if (!raw) return null;
          const n = Number(raw);
          return Number.isFinite(n) ? n : null;
        })(),
        status: formData.status === "1",
        tag: formData.tag,
        test_cases: formData.test_cases
          .filter((item) => item.input_data.trim() && item.output_data.trim())
          .map((item) => ({
            ...(item.id ? { id: item.id } : {}),
            input_data: item.input_data,
            output_data: item.output_data,
            case_order: item.case_order ? Number(item.case_order) : null,
            is_simple: item.is_simple,
            status: item.status,
          })),
      };
      const res = isEditMode
        ? await api.put<{ message?: string }>(
            `/questions/${encodeURIComponent(code ?? "")}`,
            jsonPayload,
            { useToken: true },
          )
        : await api.post<{ message?: string; code?: string }>(
            "/questions",
            jsonPayload,
            { useToken: true },
          );

      if (!res.ok) {
        await Swal.fire({
          icon: "error",
          title: isEditMode ? "อัปเดตไม่สำเร็จ" : "สร้างไม่สำเร็จ",
          text: res.error ?? "เกิดข้อผิดพลาดจากระบบ",
        });
        return;
      }

      await Swal.fire({
        icon: "success",
        title: isEditMode ? "อัปเดตสำเร็จ" : "สร้างสำเร็จ",
        text: res.data?.message ?? "บันทึกข้อมูลเรียบร้อย",
        timer: 1200,
        showConfirmButton: false,
      });
      router.push("/dashboard/problems");
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "บันทึกไม่สำเร็จ",
        text: error instanceof Error ? error.message : "เกิดข้อผิดพลาดจากระบบ",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="w-full flex-1 overflow-y-auto p-6">
      <Link
        href="/dashboard/problems"
        className="mb-6 inline-flex items-center text-sm font-bold text-white/50 transition-colors hover:text-white"
      >
        <Icon name="arrow-left" className="mr-2 h-4 w-4" /> กลับไปคลังโจทย์
      </Link>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
        <div className="p-8">
          {isEditMode ? (
            <div className="mb-6 rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm text-white">
              <span className="text-white/60">Code:</span>{" "}
              <span className="font-bold text-primary">{code}</span>
            </div>
          ) : null}

          {isLoading ? (
            <div className="py-14 text-center text-white/60">
              กำลังโหลดข้อมูล...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block px-1 text-xs font-semibold uppercase tracking-widest text-white/50">
                  PDF Upload <span className="ml-1 text-red-500">*</span>
                </label>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) =>
                    (e.key === "Enter" || e.key === " ") &&
                    fileInputRef.current?.click()
                  }
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingFile(true);
                  }}
                  onDragLeave={() => setIsDraggingFile(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingFile(false);
                    const file = e.dataTransfer.files?.[0] ?? null;
                    handlePickedFile(file);
                  }}
                  className={`cursor-pointer rounded-xl border border-dashed p-6 text-center transition-colors ${
                    isDraggingFile
                      ? "border-primary bg-primary/10"
                      : "border-white/20 bg-black/20 hover:border-white/40"
                  }`}
                >
                  <p className="text-sm font-semibold text-white">
                    ลากไฟล์ PDF มาวาง หรือคลิกเพื่อเลือกไฟล์
                  </p>
                  <p className="mt-1 text-xs text-white/50">
                    รองรับเฉพาะไฟล์ .pdf
                  </p>
                  {pdfFile ? (
                    <p className="mt-3 text-sm text-primary">
                      เลือกไฟล์แล้ว: {pdfFile.name}
                    </p>
                  ) : existingUri ? (
                    <p className="mt-3 text-xs text-white/60">
                      ไฟล์ปัจจุบัน: {existingUri}
                    </p>
                  ) : null}
                </div>
                <input
                  ref={fileInputRef}
                  name="pdf_file"
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={(e) =>
                    handlePickedFile(e.target.files?.[0] ?? null)
                  }
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <ThemedAsyncSelect2
                  label="CATEGORY"
                  value={categoryOption}
                  required
                  loadOptions={loadQuestionCategoryOptionsForForm}
                  onChange={(option) => {
                    setCategoryOption(option);
                    setFormData((prev) => ({
                      ...prev,
                      category_id: option?.value ?? "",
                    }));
                  }}
                  placeholder="ค้นหาเลือกหมวดหมู่..."
                  size="sm"
                />
                <ThemedInput
                  label="TITLE"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="เช่น Two Sum"
                  className="h-12 rounded-xl px-4"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <ThemedSelect
                  label="DIFFICULTY"
                  name="difficulty"
                  value={formData.difficulty}
                  required
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      difficulty: e.target.value,
                    }))
                  }
                  className="h-12 rounded-xl px-4"
                >
                  <option value="" className="text-black">
                    ไม่ระบุ
                  </option>
                  <option value="1" className="text-black">
                    ง่าย
                  </option>
                  <option value="2" className="text-black">
                    ปานกลาง
                  </option>
                  <option value="3" className="text-black">
                    ยาก
                  </option>
                </ThemedSelect>
                <ThemedSelect
                  label="EXPECTED COMPLEXITY"
                  name="expected_complexity"
                  value={formData.expected_complexity}
                  required
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      expected_complexity: e.target.value,
                    }))
                  }
                  className="h-12 rounded-xl px-4"
                >
                  <option value="" className="text-black">
                    ไม่ระบุ
                  </option>
                  {expectedComplexityOptions.map((item) => (
                    <option key={item} value={item} className="text-black">
                      {item}
                    </option>
                  ))}
                </ThemedSelect>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <ThemedInput
                  label="TIME LIMIT (MS)"
                  name="time_limit"
                  type="number"
                  value={formData.time_limit}
                  onChange={handleChange}
                  className="h-12 rounded-xl px-4"
                  required
                />
                <ThemedInput
                  label="MEMORY LIMIT (KB)"
                  name="memory_limit"
                  type="number"
                  value={formData.memory_limit}
                  onChange={handleChange}
                  className="h-12 rounded-xl px-4"
                  required
                />
                <ThemedInput
                  label="POINTS (คะแนน)"
                  name="points"
                  type="number"
                  min={0}
                  value={formData.points}
                  onChange={handleChange}
                  placeholder="เช่น 100"
                  className="h-12 rounded-xl px-4"
                />
                <ThemedSelect
                  label="STATUS"
                  name="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value as "1" | "0",
                    }))
                  }
                  className="h-12 rounded-xl px-4"
                >
                  <option value="1" className="text-black">
                    เปิดใช้งาน
                  </option>
                  <option value="0" className="text-black">
                    ปิดใช้งาน
                  </option>
                </ThemedSelect>
              </div>

              <ThemedAsyncMultiSelect2
                label="TAG"
                value={tagSelections}
                loadOptions={loadTagOptionsForForm}
                onChange={(options) =>
                  setFormData((prev) => ({
                    ...prev,
                    tag: options.map((item) => item.value),
                  }))
                }
                placeholder="ค้นหาเลือกแท็ก..."
                size="sm"
              />

              <ThemedTextarea
                label="DESCRIPTION"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="รายละเอียดโจทย์"
                rows={5}
                className="min-h-[130px] rounded-xl px-4 py-3"
              />

              <ThemedInput
                label="CONSTRAINTS"
                name="constraints"
                value={formData.constraints}
                onChange={handleChange}
                placeholder="เช่น 1 <= N <= 10^5"
                className="h-12 rounded-xl px-4"
                required
              />

              <MarkdownCodeEditor
                label="SOLUTION"
                value={formData.solution}
                onChange={(nextValue) =>
                  setFormData((prev) => ({ ...prev, solution: nextValue }))
                }
                placeholder="พิมพ์เฉลยแบบ markdown ได้ เช่น code block ด้วย ```"
                required
                minHeight={220}
              />

              <section className="space-y-4 rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">TEST CASES</h3>
                  <button
                    type="button"
                    onClick={addTestCase}
                    className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover"
                  >
                    + เพิ่ม Test Case
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.test_cases.map((testCase, index) => (
                    <div
                      key={testCase.id ?? `new-${index}`}
                      className="rounded-lg border border-white/10 bg-white/5 p-3"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-xs font-semibold text-white/70">
                          Case #{index + 1}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeTestCase(index)}
                          disabled={formData.test_cases.length <= 1}
                          className="rounded border border-red-500/30 bg-red-500/10 px-2 py-1 text-xs text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Icon name="xmark" className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <ThemedTextarea
                          label="INPUT DATA"
                          value={testCase.input_data}
                          onChange={(e) =>
                            updateTestCase(index, "input_data", e.target.value)
                          }
                          rows={3}
                          className="min-h-[90px] rounded-xl px-4 py-3"
                          required
                        />
                        <ThemedTextarea
                          label="OUTPUT DATA"
                          value={testCase.output_data}
                          onChange={(e) =>
                            updateTestCase(index, "output_data", e.target.value)
                          }
                          rows={3}
                          className="min-h-[90px] rounded-xl px-4 py-3"
                          required
                        />
                      </div>

                      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                        <ThemedInput
                          label="CASE ORDER"
                          type="number"
                          min={1}
                          value={testCase.case_order}
                          onChange={(e) =>
                            updateTestCase(index, "case_order", e.target.value)
                          }
                          className="h-10 rounded-xl px-3"
                          required
                        />
                        <ThemedSelect
                          label="IS SIMPLE"
                          value={testCase.is_simple ? "1" : "0"}
                          onChange={(e) =>
                            updateTestCase(
                              index,
                              "is_simple",
                              e.target.value === "1",
                            )
                          }
                          className="h-10 rounded-xl px-3"
                          required
                        >
                          <option value="0" className="text-black">
                            false
                          </option>
                          <option value="1" className="text-black">
                            true
                          </option>
                        </ThemedSelect>
                        <ThemedSelect
                          label="STATUS"
                          value={testCase.status ? "1" : "0"}
                          onChange={(e) =>
                            updateTestCase(
                              index,
                              "status",
                              e.target.value === "1",
                            )
                          }
                          className="h-10 rounded-xl px-3"
                          required
                        >
                          <option value="1" className="text-black">
                            active
                          </option>
                          <option value="0" className="text-black">
                            inactive
                          </option>
                        </ThemedSelect>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="mt-2 flex items-center justify-end gap-3 border-t border-white/10 pt-6">
                <button
                  type="button"
                  onClick={() => router.push("/dashboard/problems")}
                  className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white transition-all hover:bg-primary-hover disabled:opacity-70"
                >
                  {isSubmitting
                    ? "กำลังบันทึก..."
                    : isEditMode
                      ? "อัปเดตโจทย์"
                      : "สร้างโจทย์"}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
