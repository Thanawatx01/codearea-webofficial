import {
  ThemedAsyncMultiSelect2,
  ThemedAsyncSelect2,
  ThemedInput,
  ThemedSelect,
  type Select2Option,
} from "@/components/FormControls";
import {
  loadQuestionCategoryOptionsForFilter,
  loadTagOptionsForFilter,
} from "@/lib/questionTaxonomyApi";

type ProblemsFilterFormProps = {
  category: Select2Option | null;
  search: string;
  difficulty: string;
  tag: string[];
  status: string;
  onCategoryChangeAction: (option: Select2Option | null) => void;
  onSearchChangeAction: (value: string) => void;
  onDifficultyChangeAction: (value: string) => void;
  onTagChangeAction: (value: string[]) => void;
  onStatusChangeAction: (value: string) => void;
  onSubmitAction: () => void;
};

export function ProblemsFilterForm({
  category,
  search,
  difficulty,
  tag,
  status,
  onCategoryChangeAction,
  onSearchChangeAction,
  onDifficultyChangeAction,
  onTagChangeAction,
  onStatusChangeAction,
  onSubmitAction,
}: ProblemsFilterFormProps) {
  const categoryValue = category;
  const tagValues: Select2Option[] = tag.map((t) => ({ value: t, label: t }));

  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-xl">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <ThemedAsyncSelect2
          label="หมวดหมู่"
          value={categoryValue}
          onChangeAction={(option) => onCategoryChangeAction(option)}
          loadOptions={loadQuestionCategoryOptionsForFilter}
          placeholder="ค้นหาหมวดหมู่..."
          size="sm"
        />

        <ThemedInput
          label="ชื่อ"
          type="text"
          placeholder="ค้นหาชื่อ ..."
          value={search}
          onChange={(e) => onSearchChangeAction(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSubmitAction()}
          className="h-10 rounded-lg px-3"
        />

        <ThemedSelect
          label="ระดับ"
          value={difficulty}
          onChange={(e) => onDifficultyChangeAction(e.target.value)}
          className="h-10 rounded-lg px-3"
        >
          <option value="" className="text-black">
            ทั้งหมด
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

        <ThemedAsyncMultiSelect2
          label="แท็ก"
          value={tagValues}
          onChangeAction={(options) =>
            onTagChangeAction(options.map((option) => option.value))
          }
          loadOptions={loadTagOptionsForFilter}
          placeholder="ค้นหาแท็ก..."
          size="sm"
        />

        <ThemedSelect
          label="สถานะ"
          value={status}
          onChange={(e) => onStatusChangeAction(e.target.value)}
          className="h-10 rounded-lg px-3"
        >
          <option value="" className="text-black">
            ทั้งหมด
          </option>
          <option value="1" className="text-black">
            เปิดใช้งาน
          </option>
          <option value="0" className="text-black">
            ปิดใช้งาน
          </option>
        </ThemedSelect>

        <div className="flex items-end">
          <button
            type="button"
            onClick={onSubmitAction}
            className="h-10 w-full rounded-lg bg-blue-600 px-5 text-sm font-bold text-white hover:bg-blue-700"
          >
            ค้นหา
          </button>
        </div>
      </div>
    </section>
  );
}
