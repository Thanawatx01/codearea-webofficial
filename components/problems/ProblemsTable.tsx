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

// # ProblemsTable Component
// # ส่วนแสดงผลตารางรายการโจทย์ปัญหา พร้อมระบบค้นหา แบ่งหน้า และแสดงรายละเอียดเชิงลึก
// # Props -> DataTable -> Detail Modal -> Management Actions
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
  // # step 1: จัดการสถานะการเลือกโจทย์เพื่อแสดงใน Modal
  const [selectedProblem, setSelectedProblem] = useState<ProblemRow | null>(null);

  // # step 2: กำหนดโครงสร้างหัวตาราง (Headers)
  const headers: DataTableHeader[] = [
    { key: "code", label: "ไอดี", className: "w-16" },
    { key: "category_name", label: "หมวดหมู่" },
    { key: "title", label: "ชื่อโจทย์" },
    { key: "description", label: "คำอธิบายโจทย์", className: "min-w-[300px]" },
    { key: "difficulty", label: "ความยาก", align: "center" },
    { key: "tags", label: "แท็ก" },
    { key: "status", label: "สถานะ", align: "center" },
  ];

  // # step 3: กำหนดวิธีการแสดงผลข้อมูลในแต่ละคอลัมน์ (Columns)
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

  // # step 4: ส่วนการแสดงผลหลัก (Render)
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

      {/* # step 5: Modal แสดงรายละเอียดโจทย์เชิงลึก (Creation & Update Metadata) */}
      <Modal
        isOpen={!!selectedProblem}
        onCloseAction={() => setSelectedProblem(null)}
        title={selectedProblem?.title || "Problem Details"}
        size="md"
        footer={
          isAdmin && selectedProblem && (
            <div className="flex flex-wrap items-center justify-end gap-3">
              {/* # Security Check for Admin Management */}
              <Link
                href={`/dashboard/problems/update/${encodeURIComponent(selectedProblem.code)}`}
                className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/5 px-5 py-2 text-xs font-black text-white uppercase tracking-widest transition-all hover:bg-white/10"
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
                className={`flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-black uppercase tracking-widest transition-all ${
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
                className="flex items-center gap-2 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 px-5 py-2 text-xs font-black uppercase tracking-widest transition-all hover:bg-red-500/20"
              >
                <Icon name="trash" className="h-4 w-4" />
                ลบ
              </button>
            </div>
          )
        }
      >
        {selectedProblem && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-5">
              <DetailItem label="ไอดี" value={selectedProblem.code} icon="hash" />
              <DetailItem label="หมวดหมู่" value={selectedProblem.category_name} icon="problem" />
              <DetailItem label="ความยาก" value={getDifficultyStyle(selectedProblem.difficulty).label} icon="trending-up" badgeStyle={getDifficultyStyle(selectedProblem.difficulty).color} />
              <DetailItem label="คะแนน" value={selectedProblem.points?.toString() || "0"} icon="star" />
              <DetailItem label="ความซับซ้อน" value={selectedProblem.expected_complexity} icon="cpu" />
            </div>

            <div className="space-y-5">
              <DetailItem label="เวลาประมวลผล" value={`${selectedProblem.time_limit} ms`} icon="clock" />
              <DetailItem label="หน่วยความจำ" value={`${selectedProblem.memory_limit} KB`} icon="database" />
              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">แท็ก</p>
                <div className="flex flex-wrap gap-2">
                  {selectedProblem.tags.map(tag => (
                    <span key={tag} className="rounded-lg border border-white/5 bg-white/5 px-2.5 py-1 text-[10px] font-bold text-white/40 uppercase tracking-tighter">
                      {tag}
                    </span>
                  ))}
                  {selectedProblem.tags.length === 0 && <span className="text-[10px] font-bold text-white/20 italic">ไม่มีแท็ก</span>}
                </div>
              </div>
              {selectedProblem.uri && (
                <div className="pt-2">
                  <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">เอกสารประกอบ</p>
                  <Link
                    href={selectedProblem.uri}
                    target="_blank"
                    className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2 text-[10px] font-black text-primary uppercase tracking-widest transition-all hover:bg-primary/10"
                  >
                    <Icon name="eye" className="h-3.5 w-3.5" />
                    ดูไฟล์ PDF
                  </Link>
                </div>
              )}
            </div>

            <div className="col-span-full space-y-4 pt-4 border-t border-white/5">
              <div>
                <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">คำอธิบายโจทย์</p>
                <div className="rounded-xl border border-white/5 bg-black/20 p-4 text-xs leading-relaxed text-white/60 font-medium">
                  {selectedProblem.description}
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">ข้อจำกัดของระบบ</p>
                <div className="rounded-xl border border-white/5 bg-black/40 p-4 text-[10px] font-mono leading-relaxed text-blue-400/70">
                  {selectedProblem.constraints || "No specific constraints recorded for this logic problem."}
                </div>
              </div>

              {(selectedProblem.created_by_name || selectedProblem.updated_at) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-white/5">
                  {selectedProblem.created_by_name && (
                    <DetailItem 
                      label="สร้างโดย" 
                      value={`${selectedProblem.created_by_name}${selectedProblem.created_at ? ` (${new Date(selectedProblem.created_at).toLocaleDateString()})` : ""}`} 
                      icon="user" 
                    />
                  )}
                  {selectedProblem.updated_at && (
                    <DetailItem 
                      label="แก้ไขล่าสุด" 
                      value={`${selectedProblem.updated_by_name || selectedProblem.created_by_name} (${new Date(selectedProblem.updated_at).toLocaleDateString()} ${new Date(selectedProblem.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`} 
                      icon="calendar" 
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}

// # DetailItem Function
// # ส่วนแสดงผลข้อมูลรายแถวในรายละเอียดโจทย์ พร้อมไอคอนและป้ายกำกับ
// # Props (label, value, icon) -> Group Layout -> Icon & Content
function DetailItem({ label, value, icon, badgeStyle }: { label: string; value?: string | null; icon: string; badgeStyle?: string }) {
  // # step 1: ตรวจสอบความถูกต้องของข้อมูล
  if (!value) return null;

  // # step 2: คืนค่าผลลัพธ์การแสดงผล
  return (
    <div className="group flex items-center gap-3">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/5 text-white/20 transition-all group-hover:bg-primary/10 group-hover:text-primary">
        <Icon name={icon} className="h-4 w-4" />
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
