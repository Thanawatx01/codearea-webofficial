type ReportKpiCardsProps = {
  items: Array<{
    label: string;
    value: number | string;
    accent?: string;
  }>;
};

export function ReportKpiCards({ items }: ReportKpiCardsProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className={`rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-xl backdrop-blur-md ${item.accent ?? ""}`}
        >
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/45">
            {item.label}
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-white">
            {typeof item.value === "number"
              ? item.value.toLocaleString("th-TH")
              : item.value}
          </p>
        </div>
      ))}
    </section>
  );
}
