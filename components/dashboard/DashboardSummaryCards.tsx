import { Icon } from "@/components/icons/Icon";
import type { DashboardSummaryCard } from "./types";

type DashboardSummaryCardsProps = {
  cards: DashboardSummaryCard[];
};

export function DashboardSummaryCards({ cards }: DashboardSummaryCardsProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`group relative overflow-hidden rounded-3xl border border-white/[0.08] bg-linear-to-br from-white/[0.07] via-white/[0.02] to-transparent p-5 backdrop-blur-md transition duration-300 hover:border-white/[0.12] hover:from-white/[0.09] ${card.glow}`}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/[0.04] blur-2xl transition group-hover:bg-white/[0.06]"
          />
          <div className="relative flex items-start justify-between gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br ${card.iconWrap}`}
            >
              <Icon name={card.iconName} className="h-5 w-5" />
            </div>
          </div>
          <p className="relative mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">
            {card.label}
          </p>
          <p className="relative mt-1 text-3xl font-bold tabular-nums tracking-tight text-white">
            {card.value.toLocaleString("th-TH")}
          </p>
          <p className="relative mt-2 text-xs text-white/35">{card.hint}</p>
        </div>
      ))}
    </section>
  );
}
