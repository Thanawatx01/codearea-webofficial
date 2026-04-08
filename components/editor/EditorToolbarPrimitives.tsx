import type {
  ButtonHTMLAttributes,
  SelectHTMLAttributes,
} from "react";

export function EditorToolbarSelect({
  className = "",
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative inline-flex items-center">
      <select
        className={[
          "h-9 min-w-47 cursor-pointer appearance-none rounded-lg border border-white/15 bg-[#14161f] py-0 pl-3 pr-9 text-sm text-white/90",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none transition-colors",
          "hover:border-white/25 hover:bg-[#181b26]",
          "focus-visible:border-emerald-400/55 focus-visible:ring-2 focus-visible:ring-emerald-400/25",
          "disabled:cursor-not-allowed disabled:opacity-45",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {children}
      </select>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45"
        aria-hidden
      >
        <path
          fillRule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
}

/** Theme dropdown — แคบกว่า language */
export function EditorToolbarSelectCompact({
  className = "",
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <EditorToolbarSelect
      className={["min-w-30", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}

type ToolbarButtonVariant = "primary" | "secondary";

export function EditorToolbarButton({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ToolbarButtonVariant;
}) {
  const base = [
    "inline-flex shrink-0 items-center justify-center rounded-lg text-sm font-semibold transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0e14]",
    "disabled:cursor-not-allowed disabled:opacity-45",
  ].join(" ");

  const byVariant =
    variant === "primary"
      ? "bg-emerald-500 px-5 py-2 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 active:bg-emerald-600"
      : "border border-white/18 bg-white/[0.07] px-3.5 py-2 text-white/80 hover:border-white/28 hover:bg-white/[0.12] hover:text-white active:bg-white/[0.08]";

  return (
    <button
      {...props}
      type="button"
      className={[base, byVariant, className].filter(Boolean).join(" ")}
    />
  );
}
