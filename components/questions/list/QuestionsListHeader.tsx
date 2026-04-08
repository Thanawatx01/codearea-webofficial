import { ThemedInput } from "@/components/FormControls";
import { Icon } from "@/components/icons/Icon";

export default function QuestionsListHeader({
  isLoading,
  rowsLength,
  total,
  search,
  onSearchChange,
}: {
  isLoading: boolean;
  rowsLength: number;
  total: number;
  search: string;
  onSearchChange: (value: string) => void;
}) {
  return (
    <header className="mb-10 text-center">
      <p className="mx-auto mt-2 max-w-lg text-base text-white/60 md:text-lg">
        {isLoading && rowsLength === 0
          ? "กำลังโหลดคลังโจทย์…"
          : `เรียกดูและกรองโจทย์ — พบ ${total.toLocaleString()} ชุดในคลัง`}
      </p>
      <div className="mx-auto mt-8 max-w-xl">
        <ThemedInput
          type="search"
          placeholder="ค้นหาโจทย์…"
          value={search}
          onChangeAction={(e) => onSearchChange(e.target.value)}
          className="!h-11 !border-white/10 !bg-white/5 !text-[15px] shadow-none ring-1 ring-white/10 backdrop-blur-xl focus:ring-violet-500/40"
          leftSlot={
            <Icon name="hash" className="h-3.5 w-3.5 text-violet-400/85" />
          }
        />
      </div>
    </header>
  );
}
