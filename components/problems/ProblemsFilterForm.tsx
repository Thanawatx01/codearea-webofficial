import {
  ThemedInput,
  ThemedMultiSelect2,
  ThemedSelect,
  ThemedSelect2,
  type Select2Option,
} from "@/components/FormControls";

type ProblemsFilterFormProps = {
  categoryId: string;
  search: string;
  difficulty: string;
  tag: string[];
  status: string;
  onCategoryIdChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onDifficultyChange: (value: string) => void;
  onTagChange: (value: string[]) => void;
  onStatusChange: (value: string) => void;
  onSubmit: () => void;
};

export function ProblemsFilterForm({
  categoryId,
  search,
  difficulty,
  tag,
  status,
  onCategoryIdChange,
  onSearchChange,
  onDifficultyChange,
  onTagChange,
  onStatusChange,
  onSubmit,
}: ProblemsFilterFormProps) {
  const categoryOptions: Select2Option[] = [
    { value: "1", label: "Array" },
    { value: "2", label: "String" },
    { value: "3", label: "Graph" },
    { value: "4", label: "Dynamic Programming" },
  ];
  const tagOptions: Select2Option[] = [
    { value: "array", label: "Array" },
    { value: "math", label: "Math" },
    { value: "graph", label: "Graph" },
    { value: "dp", label: "DP" },
  ];
  const categoryValue =
    categoryOptions.find((option) => option.value === categoryId) ?? null;
  const tagValues = tagOptions.filter((option) => tag.includes(option.value));

  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-xl">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <ThemedSelect2
          label="หมวดหมู่"
          value={categoryValue}
          options={categoryOptions}
          onChange={(option) => onCategoryIdChange(option?.value ?? "")}
          placeholder="ทั้งหมด"
          size="sm"
        />

        <ThemedInput
          label="ชื่อ"
          type="text"
          placeholder="ค้นหาชื่อ ..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
          className="h-10 rounded-lg px-3"
        />

        <ThemedSelect
          label="ระดับ"
          value={difficulty}
          onChange={(e) => onDifficultyChange(e.target.value)}
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

        <ThemedMultiSelect2
          label="แท็ก"
          value={tagValues}
          options={tagOptions}
          onChange={(options) =>
            onTagChange(options.map((option) => option.value))
          }
          placeholder="ทั้งหมด"
          size="sm"
        />

        <ThemedSelect
          label="สถานะ"
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
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
            onClick={onSubmit}
            className="h-10 w-full rounded-lg bg-blue-600 px-5 text-sm font-bold text-white hover:bg-blue-700"
          >
            ค้นหา
          </button>
        </div>
      </div>
    </section>
  );
}
