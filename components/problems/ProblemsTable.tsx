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
  onActivateAction: (code: string) => void;
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
  onActivateAction,
}: ProblemsTableProps) {
  const [selectedProblem, setSelectedProblem] = useState<ProblemRow | null>(null);

  const headers: DataTableHeader[] = [
    { key: "code", label: "ID", className: "w-16" },
    { key: "category_name", label: "Category" },
    { key: "title", label: "Title" },
    { key: "description", label: "Description", className: "min-w-[300px]" },
    { key: "difficulty", label: "Level", align: "center" },
    { key: "tags", label: "Tags" },
    { key: "status", label: "Status", align: "center" },
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
        <div className={`inline-flex h-2 w-2 rounded-full ${row.status ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"}`} />
      ),
    },
  ];

  return (
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

      <Modal
        isOpen={!!selectedProblem}
        onCloseAction={() => setSelectedProblem(null)}
        title={selectedProblem?.title || "Problem Details"}
        size="lg"
        footer={
          isAdmin && selectedProblem && (
            <div className="flex flex-wrap items-center justify-end gap-3">
              <Link
                href={`/dashboard/problems/update/${encodeURIComponent(selectedProblem.code)}`}
                className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/5 px-5 py-2 text-xs font-black text-white uppercase tracking-widest transition-all hover:bg-white/10"
              >
                <Icon name="edit" className="h-4 w-4" />
                Edit
              </Link>
              <button
                type="button"
                onClick={() => {
                  if (selectedProblem.status) {
                    onDeleteAction(selectedProblem.code);
                  } else {
                    onActivateAction(selectedProblem.code);
                  }
                  setSelectedProblem(null);
                }}
                className={`flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-black uppercase tracking-widest transition-all ${
                  selectedProblem.status
                    ? "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20"
                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                }`}
              >
                <Icon name={selectedProblem.status ? "trash" : "check"} className="h-4 w-4" />
                {selectedProblem.status ? "Disable" : "Enable"}
              </button>
            </div>
          )
        }
      >
        {selectedProblem && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-5">
              <DetailItem label="Technical ID" value={selectedProblem.code} icon="hash" />
              <DetailItem label="Category Path" value={selectedProblem.category_name} icon="problem" />
              <DetailItem label="Difficulty Level" value={getDifficultyStyle(selectedProblem.difficulty).label} icon="trending-up" badgeStyle={getDifficultyStyle(selectedProblem.difficulty).color} />
              <DetailItem label="Reward Points" value={selectedProblem.points?.toString() || "0"} icon="star" />
              <DetailItem label="Complexity" value={selectedProblem.expected_complexity} icon="cpu" />
            </div>

            <div className="space-y-5">
              <DetailItem label="Execution Time" value={`${selectedProblem.time_limit} ms`} icon="clock" />
              <DetailItem label="Memory Overhead" value={`${selectedProblem.memory_limit} KB`} icon="database" />
              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Metadata Tags</p>
                <div className="flex flex-wrap gap-2">
                  {selectedProblem.tags.map(tag => (
                    <span key={tag} className="rounded-lg border border-white/5 bg-white/5 px-2.5 py-1 text-[10px] font-bold text-white/40 uppercase tracking-tighter">
                      {tag}
                    </span>
                  ))}
                  {selectedProblem.tags.length === 0 && <span className="text-[10px] font-bold text-white/20 italic">No tags</span>}
                </div>
              </div>
              {selectedProblem.uri && (
                <div className="pt-2">
                   <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Problem Document</p>
                  <Link
                    href={selectedProblem.uri}
                    target="_blank"
                    className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2 text-[10px] font-black text-primary uppercase tracking-widest transition-all hover:bg-primary/10"
                  >
                    <Icon name="eye" className="h-3.5 w-3.5" />
                    View PDF File
                  </Link>
                </div>
              )}
            </div>

            <div className="col-span-full space-y-6 pt-4 border-t border-white/5">
              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Narrative Description</p>
                <div className="rounded-2xl border border-white/5 bg-black/20 p-5 text-sm leading-relaxed text-white/60 font-medium">
                  {selectedProblem.description}
                </div>
              </div>
              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">System Constraints</p>
                <div className="rounded-2xl border border-white/5 bg-black/40 p-5 text-sm font-mono leading-relaxed text-blue-400/70">
                  {selectedProblem.constraints || "No specific constraints recorded for this logic problem."}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}

function DetailItem({ label, value, icon, badgeStyle }: { label: string; value?: string; icon: string; badgeStyle?: string }) {
  if (!value) return null;
  return (
    <div className="group flex items-center gap-4">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/5 text-white/20 transition-all group-hover:bg-primary/10 group-hover:text-primary group-hover:scale-105">
        <Icon name={icon} className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">{label}</p>
        {badgeStyle ? (
          <span className={`inline-block mt-0.5 rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${badgeStyle}`}>
            {value}
          </span>
        ) : (
          <p className="text-sm font-bold text-white/70 group-hover:text-white transition-colors">{value}</p>
        )}
      </div>
    </div>
  );
}
