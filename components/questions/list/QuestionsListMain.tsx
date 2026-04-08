import { Icon } from "@/components/icons/Icon";
import type { ProblemRow } from "@/components/problems/types";
import QuestionsProblemRow from "./QuestionsProblemRow";

export default function QuestionsListMain({
  errorMessage,
  showTags,
  onShowTagsChange,
  isLoading,
  rows,
  page,
  totalPages,
  onPageChange,
}: {
  errorMessage: string;
  showTags: boolean;
  onShowTagsChange: (show: boolean) => void;
  isLoading: boolean;
  rows: ProblemRow[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="min-w-0 flex-1">
      {errorMessage ? (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {errorMessage}
        </div>
      ) : null}

      <div className="mb-2 hidden rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-white/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,9rem)_4.5rem_minmax(7rem,8.5rem)] md:items-center md:gap-3 md:pr-3">
        <span>ชื่อโจทย์</span>
        <label className="flex cursor-pointer items-center gap-2 text-white/50 select-none hover:text-white/70">
          <input
            type="checkbox"
            className="rounded border-white/25 bg-black/25 text-violet-500 accent-violet-500 focus:ring-violet-500/40"
            checked={showTags}
            onChange={(e) => onShowTagsChange(e.target.checked)}
          />
          แสดงแท็ก
        </label>
        <span className="text-center">ระดับ</span>
        <div className="leading-tight">
          <span className="block">ความคืบหน้า</span>
          <span className="mt-0.5 block text-[10px] font-normal tracking-normal normal-case text-white/35">
            คะแนนเต็มจากโจทย์
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.04] px-8 py-16 text-center backdrop-blur-md">
          <Icon name="problem" className="mx-auto mb-3 h-10 w-10 text-white/20" />
          <p className="font-medium text-white/55">ไม่พบโจทย์ที่ตรงกับเงื่อนไข</p>
          <p className="mt-1 text-sm text-white/35">
            ลองค้นหาใหม่หรือเปลี่ยนตัวกรอง
          </p>
        </div>
      ) : (
        <>
          <ul className="space-y-2">
            {rows.map((row) => (
              <QuestionsProblemRow key={row.code} row={row} showTags={showTags} />
            ))}
          </ul>

          {totalPages > 1 ? (
            <nav
              className="mt-8 flex flex-wrap items-center justify-center gap-3"
              aria-label="Pagination"
            >
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => onPageChange(Math.max(1, page - 1))}
                className="rounded-lg border border-white/12 bg-white/[0.06] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white/80 backdrop-blur-sm transition hover:border-violet-400/35 hover:bg-violet-500/15 disabled:opacity-35"
              >
                ก่อนหน้า
              </button>
              <span className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs tabular-nums text-white/55 backdrop-blur-sm">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                className="rounded-lg border border-white/12 bg-white/[0.06] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white/80 backdrop-blur-sm transition hover:border-violet-400/35 hover:bg-violet-500/15 disabled:opacity-35"
              >
                ถัดไป
              </button>
            </nav>
          ) : null}
        </>
      )}
    </div>
  );
}
