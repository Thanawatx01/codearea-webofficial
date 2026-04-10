export function DashboardLoadingState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-28">
      <div className="h-11 w-11 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      <p className="text-sm text-white/40">กำลังโหลดภาพรวม…</p>
    </div>
  );
}
