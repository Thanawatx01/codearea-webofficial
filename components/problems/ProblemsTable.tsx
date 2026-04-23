import DataTable, {
  type DataTableColumn,
  type DataTableHeader,
} from "@/components/DataTable";
import { Icon } from "@/components/icons/Icon";
import type { ProblemRow } from "@/components/problems/types";
import { getDifficultyStyle } from "@/components/problems/types";
import Link from "next/link";
import { useState } from "react";
import { Modal } from "@/components/Modal";

type ProblemsTableProps = {
  rows: ProblemRow[];
  total: number;
  isLoading: boolean;
  errorMessage: string;
  page: number;
  totalPages: number;
  isAdmin: boolean;
  onPageChangeAction: (page: number) => void;
  onDeleteAction: (code: string) => void;
  onToggleStatusAction: (code: string, currentStatus: boolean) => void;
};

export function ProblemsTable({
  rows,
  total,
  isLoading,
  errorMessage,
  page,
  totalPages,
  isAdmin,
  onPageChangeAction,
  onDeleteAction,
  onToggleStatusAction,
}: ProblemsTableProps) {
  const [selectedProblem, setSelectedProblem] = useState<ProblemRow | null>(null);

  const headers: DataTableHeader[] = [
    { key: "code", label: "ไอดี", className: "w-16" },
    { key: "category_name", label: "หมวดหมู่" },
    { key: "title", label: "ชื่อโจทย์" },
    { key: "description", label: "คำอธิบายโจทย์", className: "min-w-[300px]" },
    { key: "difficulty", label: "ความยาก", align: "center" },
    { key: "tags", label: "แท็ก" },
    { key: "status", label: "สถานะ", align: "center" },
  ];

  const columns: DataTableColumn<ProblemRow>[] = [
    {
      key: "code",
      render: (row) => <span className="font-mono text-xs font-bold text-white/40">{row.code}</span>,
    },
    {
      key: "category_name",
      render: (row) => (
        <span className="text-xs font-bold uppercase tracking-wider text-primary/80">
          {row.category_name || "Uncategorized"}
        </span>
      ),
    },
    {
      key: "title",
      render: (row) => <span className="font-bold text-white">{row.title}</span>,
    },
    {
      key: "description",
      render: (row) => (
        <div className="line-clamp-2 max-w-[400px] text-xs leading-relaxed text-white/40">
          {row.description}
        </div>
      ),
    },
    {
      key: "difficulty",
      className: "text-center",
      render: (row) => {
        const difficulty = getDifficultyStyle(row.difficulty);
        return (
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest ${difficulty.color}`}>
            {difficulty.label}
          </span>
        );
      },
    },
    {
      key: "tags",
      render: (row) => (
        <div className="flex flex-wrap gap-1.5">
          {row.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-md bg-white/5 border border-white/5 px-2 py-0.5 text-[10px] font-bold text-white/30 uppercase tracking-tighter">
              {tag}
            </span>
          ))}
          {row.tags.length > 3 && (
            <span className="text-[10px] font-bold text-white/20">+{row.tags.length - 3}</span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      className: "text-center",
      render: (row) => (
        <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${row.status
            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            : "bg-white/5 text-white/30 border border-white/10"
          }`}>
          {row.status ? "เปิดใช้งาน" : "ปิดใช้งาน"}
        </span>
      ),
    },
  ];

  return (
    <>
      <section className="min-w-0 rounded-xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-xl">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {isAdmin ? (
            <Link
              href="/dashboard/problems/new"
              className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-blue-800 px-6 text-sm font-bold text-white hover:bg-blue-900 sm:w-auto"
            >
              + สร้าง
            </Link>
          ) : (
            <div /> // Empty div to maintain spacing
          )}
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
          tableClassName="w-full border-collapse"
          headerClassName="whitespace-nowrap"
          onRowClickAction={(row) => setSelectedProblem(row)}
          pagination={{
            page,
            totalPages,
            onPageChangeAction: onPageChangeAction,
          }}
        />
      </section>

      <Modal
        isOpen={!!selectedProblem}
        onCloseAction={() => setSelectedProblem(null)}
        title={selectedProblem?.title}
        size="lg"
        footer={
          isAdmin && selectedProblem && (
            <div className="flex flex-wrap items-center justify-end gap-3">
              <Link
                href={`/dashboard/problems/update/${encodeURIComponent(selectedProblem.code)}`}
                className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/5 px-6 py-2.5 text-xs font-black text-white uppercase tracking-widest transition-all hover:bg-white/10"
              >
                <Icon name="edit" className="h-4 w-4" />
                แก้ไข
              </Link>
              
              <button
                type="button"
                onClick={() => {
                  onToggleStatusAction(selectedProblem.code, selectedProblem.status);
                  setSelectedProblem(null);
                }}
                className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-all ${
                  selectedProblem.status
                    ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20"
                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                }`}
              >
                <Icon name={selectedProblem.status ? "xmark" : "check"} className="h-4 w-4" />
                {selectedProblem.status ? "ปิดใช้งาน" : "เปิดใช้งาน"}
              </button>

              <button
                type="button"
                onClick={() => {
                  onDeleteAction(selectedProblem.code);
                  setSelectedProblem(null);
                }}
                className="flex items-center gap-2 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-all hover:bg-red-500/20"
              >
                <Icon name="trash" className="h-4 w-4" />
                ลบ
              </button>
            </div>
          )
        }
      >
        {selectedProblem && (
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            <div className="space-y-6">
              <DetailItem label="ไอดี" value={selectedProblem.code} icon="hash" />
              <DetailItem label="หมวดหมู่" value={selectedProblem.category_name} icon="problem" />
              <DetailItem label="ความยาก" value={getDifficultyStyle(selectedProblem.difficulty).label} icon="trending-up" badgeStyle={getDifficultyStyle(selectedProblem.difficulty).color} />
              <DetailItem label="คะแนน" value={selectedProblem.points?.toString() || "0"} icon="star" />
              <DetailItem label="ความซับซ้อน" value={selectedProblem.expected_complexity} icon="cpu" />
            </div>

            <div className="space-y-6">
              <DetailItem label="เวลาประมวลผล" value={`${selectedProblem.time_limit} ms`} icon="clock" />
              <DetailItem label="หน่วยความจำ" value={`${selectedProblem.memory_limit} KB`} icon="database" />
              <div>
                <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">แท็ก</p>
                <div className="flex flex-wrap gap-2">
                  {selectedProblem.tags.map(tag => (
                    <span key={tag} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold text-white/50 uppercase tracking-tighter hover:bg-white/10 hover:text-white transition-all cursor-default">
                      {tag}
                    </span>
                  ))}
                  {selectedProblem.tags.length === 0 && <span className="text-[10px] font-bold text-white/20 italic">ไม่มีแท็ก</span>}
                </div>
              </div>
              {selectedProblem.uri && (
                <div className="pt-2">
                  <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">เอกสารประกอบ</p>
                  <Link
                    href={selectedProblem.uri}
                    target="_blank"
                    className="group inline-flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/10 px-6 py-3 text-xs font-black text-primary uppercase tracking-widest transition-all hover:bg-primary/20 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Icon name="eye" className="h-4 w-4" />
                    ดูไฟล์ PDF
                  </Link>
                </div>
              )}
            </div>

            <div className="col-span-full space-y-8 pt-8 border-t border-white/5">
              <div>
                <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">คำอธิบายโจทย์</p>
                <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 text-[15px] leading-relaxed text-white/70 font-medium shadow-inner">
                  {selectedProblem.description || <span className="italic text-white/20">ไม่มีคำอธิบาย</span>}
                </div>
              </div>
              <div>
                <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">ข้อจำกัดของระบบ</p>
                <div className="rounded-3xl border border-white/5 bg-black/40 p-6 text-sm font-mono leading-relaxed text-blue-400/60 shadow-inner">
                  {selectedProblem.constraints || "No specific constraints recorded for this logic problem."}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

function DetailItem({ label, value, icon, badgeStyle }: { label: string; value?: string | null; icon: string; badgeStyle?: string }) {
  if (!value) return null;
  return (
    <div className="group flex items-center gap-5">
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white/5 text-white/40 transition-all group-hover:bg-primary/20 group-hover:text-primary group-hover:scale-110 group-hover:rotate-3 shadow-lg">
        <Icon name={icon} className="h-6 w-6" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-0.5">{label}</p>
        {badgeStyle ? (
          <span className={`inline-block rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest shadow-sm ${badgeStyle}`}>
            {value}
          </span>
        ) : (
          <p className="text-[15px] font-bold text-white/80 group-hover:text-white transition-colors tracking-tight">{value}</p>
        )}
      </div>
    </div>
  );
}
