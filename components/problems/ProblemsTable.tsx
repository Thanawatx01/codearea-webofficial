import DataTable, {
  type DataTableColumn,
  type DataTableHeader,
} from "@/components/DataTable";
import { Icon } from "@/components/icons/Icon";
import type { ProblemRow } from "@/components/problems/types";
import { getDifficultyStyle } from "@/components/problems/types";
import Link from "next/link";

type ProblemsTableProps = {
  rows: ProblemRow[];
  total: number;
  isLoading: boolean;
  errorMessage: string;
  page: number;
  totalPages: number;
  onPageChangeAction: (page: number) => void;
  onDeleteAction: (code: string) => void;
  onActivateAction: (code: string) => void;
};

export function ProblemsTable({
  rows,
  total,
  isLoading,
  errorMessage,
  page,
  totalPages,
  onPageChangeAction,
  onDeleteAction,
  onActivateAction,
}: ProblemsTableProps) {
  const headers: DataTableHeader[] = [
    { key: "code", label: "รหัส" },
    { key: "category_name", label: "หมวดหมู่" },
    { key: "title", label: "ชื่อโจทย์" },
    { key: "description", label: "คำอธิบาย" },
    { key: "uri", label: "URI" },
    {
      key: "difficulty",
      label: "ระดับ",
      align: "center",
      className: "text-center",
    },
    { key: "tags", label: "แท็ก", align: "center", className: "text-center" },
    {
      key: "constraints",
      label: "ข้อจำกัด",
      align: "center",
      className: "text-center",
    },
    {
      key: "time_limit",
      label: "ขีดเวลา (ms)",
      align: "center",
      className: "text-center",
    },
    {
      key: "memory_limit",
      label: "ขีดจำกัดความจำ (KB)",
      align: "center",
      className: "text-center",
    },
    {
      key: "points",
      label: "คะแนน",
      align: "center",
      className: "text-center",
    },
    {
      key: "expected_complexity",
      label: "ความซับซ้อนที่คาดการณ์",
      align: "center",
      className: "text-center",
    },
    {
      key: "status",
      label: "สถานะ",
      align: "center",
      className: "text-center",
    },
    {
      key: "actions",
      label: "จัดการ",
      align: "right",
      className: "text-right",
    },
  ];

  const columns: DataTableColumn<ProblemRow>[] = [
    {
      key: "code",
      render: (row) => <span className="font-semibold">{row.code}</span>,
    },
    {
      key: "category_name",
      render: (row) => row.category_name,
    },
    {
      key: "title",
      render: (row) => row.title,
    },
    {
      key: "description",
      render: (row) => (
        <div className="line-clamp-3 text-wrap w-30 text-sm text-white/70">
          {row.description}
        </div>
      ),
    },
    {
      key: "uri",
      render: (row) => {
        const href = row.uri;
        if (!href) return "-";
        return (
          <Link
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline hover:text-blue-600"
          >
            <Icon name="eye" className="h-4 w-4" />
          </Link>
        );
      },
    },
    {
      key: "tags",
      className: "text-center",
      render: (row) => (
        <div className="flex flex-nowrap gap-1 whitespace-nowrap">
          {row.tags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-white/10 px-2 py-0.5 text-xs text-white/70"
            >
              {tag}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: "difficulty",
      className: "text-center",
      render: (row) => {
        const difficulty = getDifficultyStyle(row.difficulty);
        return (
          <span
            className={`rounded px-2 py-1 text-xs font-bold ${difficulty.color}`}
          >
            {difficulty.label}
          </span>
        );
      },
    },
    {
      key: "constraints",
      render: (row) => row.constraints,
    },
    {
      key: "time_limit",
      render: (row) => row.time_limit,
    },
    {
      key: "memory_limit",
      render: (row) => row.memory_limit,
    },
    {
      key: "points",
      className: "text-center",
      render: (row) =>
        row.points !== null && row.points !== undefined ? row.points : "-",
    },
    {
      key: "expected_complexity",
      render: (row) => row.expected_complexity,
    },
    {
      key: "status",
      render: (row) => (
        <span
          className={`rounded px-2 py-1 text-xs font-bold ${row.status ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}
        >
          {row.status ? "เปิดใช้งาน" : "ปิดใช้งาน"}
        </span>
      ),
    },
    {
      key: "actions",
      className: "text-right",
      render: (row) => (
        <div className="inline-flex items-center gap-2">
          <Link
            href={`/dashboard/problems/update/${encodeURIComponent(row.code)}`}
            className="rounded border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-500 hover:bg-blue-500/20"
          >
            <Icon name="eye" className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() =>
              row.status ? onDeleteAction(row.code) : onActivateAction(row.code)
            }
            className={`rounded px-3 py-1.5 text-xs font-semibold ${
              row.status
                ? "border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20"
                : "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
            }`}
            aria-label={row.status ? "ปิดการใช้งาน" : "เปิดการใช้งาน"}
          >
            {row.status ? (
              <Icon name="trash" className="h-4 w-4" />
            ) : (
              <Icon name="check" className="h-4 w-4" />
            )}
          </button>
        </div>
      ),
    },
  ];

  return (
    <section className="min-w-0 rounded-xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-xl">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/dashboard/problems/new"
          className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-blue-800 px-6 text-sm font-bold text-white hover:bg-blue-900 sm:w-auto"
        >
          + สร้าง
        </Link>
        <p className="text-base font-semibold text-white text-center sm:text-right sm:text-lg">
          จำนวนข้อมูล {total} รายการ
        </p>
      </div>

      <DataTable
        headers={headers}
        columns={columns}
        rows={rows}
        rowKey={(row) => row.code}
        loading={isLoading}
        errorMessage={errorMessage}
        emptyMessage="ไม่พบข้อมูล"
        tableClassName="min-w-[1700px] w-full border-collapse"
        headerClassName="whitespace-nowrap"
        rowClassName="whitespace-nowrap"
        pagination={{
          page,
          totalPages,
          onPageChangeAction: onPageChangeAction,
        }}
      />
    </section>
  );
}
