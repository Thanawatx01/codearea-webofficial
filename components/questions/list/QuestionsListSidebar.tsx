import {
  ThemedAsyncSelect2,
  type Select2Option,
} from "@/components/FormControls";
import { loadQuestionCategoryOptionsPublic } from "@/lib/questionTaxonomyApi";
import { DIFF_PILLS } from "./types";

export default function QuestionsListSidebar({
  difficulty,
  onDifficultyChange,
  category,
  onCategoryChange,
  sidebarTag,
  allTags,
  onToggleTag,
  onClearTag,
}: {
  difficulty: string;
  onDifficultyChange: (value: string) => void;
  category: Select2Option | null;
  onCategoryChange: (option: Select2Option | null) => void;
  sidebarTag: Select2Option | null;
  allTags: Select2Option[];
  onToggleTag: (opt: Select2Option) => void;
  onClearTag: () => void;
}) {
  return (
    <aside className="w-full shrink-0 lg:sticky lg:top-24 lg:w-[26%] lg:min-w-[220px] lg:max-w-[280px]">
      <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 shadow-[0_8px_40px_rgba(0,0,0,0.25)] backdrop-blur-2xl md:p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/45">
          ระดับความยาก
        </p>
        <div className="flex flex-col gap-1.5">
          {DIFF_PILLS.map((p) => {
            const active = difficulty === p.value;
            return (
              <button
                key={p.value || "all"}
                type="button"
                onClick={() => onDifficultyChange(p.value)}
                className={[
                  "rounded-xl px-4 py-2 text-left text-sm font-medium transition",
                  active
                    ? "bg-linear-to-r from-violet-600 to-indigo-600 text-white shadow-[0_0_28px_rgba(139,92,246,0.32)] ring-1 ring-violet-400/25"
                    : "bg-white/[0.05] text-white/72 hover:bg-white/10 hover:text-white",
                ].join(" ")}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6 border-t border-white/10 pt-5">
          <ThemedAsyncSelect2
            label="หมวดหมู่"
            value={category}
            onChangeAction={onCategoryChange}
            loadOptionsAction={loadQuestionCategoryOptionsPublic}
            placeholder="ทุกหมวด…"
            size="sm"
            menuPortalTarget={
              typeof document !== "undefined" ? document.body : undefined
            }
          />
        </div>

        <div className="mt-6 border-t border-white/10 pt-5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
              แท็ก
            </p>
            {sidebarTag ? (
              <button
                type="button"
                onClick={onClearTag}
                className="text-xs font-medium text-violet-300 hover:text-violet-200"
              >
                ล้าง
              </button>
            ) : null}
          </div>
          <nav
            className="max-h-[min(420px,42vh)] space-y-0.5 overflow-y-auto pr-1 text-sm [scrollbar-width:thin]"
            aria-label="กรองตามแท็ก"
          >
            {allTags.length === 0 ? (
              <p className="py-2 text-xs text-white/35">กำลังโหลดแท็ก…</p>
            ) : (
              allTags.map((t) => {
                const picked = sidebarTag?.value === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => onToggleTag(t)}
                    className={[
                      "w-full rounded-md px-2 py-1.5 text-left transition",
                      picked
                        ? "bg-violet-500/25 font-medium text-violet-100"
                        : "text-white/55 hover:bg-white/5 hover:text-white/85",
                    ].join(" ")}
                  >
                    {t.label}
                  </button>
                );
              })
            )}
          </nav>
        </div>
      </div>
    </aside>
  );
}
