import type { ReactNode } from "react";

export default function IdePanel({
  header,
  children,
  className = "",
}: {
  header: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "flex min-h-0 flex-col overflow-visible rounded-2xl border border-white/[0.08] bg-[#0b0c10]/88 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl",
        className,
      ].join(" ")}
    >
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-white/10 bg-white/[0.03] px-3">
        {header}
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-visible">{children}</div>
    </div>
  );
}
