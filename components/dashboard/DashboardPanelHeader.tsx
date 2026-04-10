type DashboardPanelHeaderProps = {
  title: string;
  subtitle?: string;
  className?: string;
};

export function DashboardPanelHeader({
  title,
  subtitle,
  className = "",
}: DashboardPanelHeaderProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="h-6 w-1 rounded-full bg-linear-to-b from-primary to-violet-400 shadow-[0_0_12px_rgba(139,92,246,0.5)]" />
      <div>
        <h2 className="text-sm font-bold text-white">{title}</h2>
        {subtitle ? (
          <p className="text-xs text-white/40">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}
