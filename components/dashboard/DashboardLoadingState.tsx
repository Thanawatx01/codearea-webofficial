// Dashboard Loading State Component
// คอมโพเนนต์แสดงสถานะการโหลดข้อมูล (Skeleton/Spinner) ในหน้า Dashboard
// 1. แสดงตัวหมุน (Spinner) ที่ปรับแต่งตาม Theme
// 2. เพิ่มข้อความ "กำลังโหลด" เพื่อให้ผู้ใช้ทราบสถานะ

export function DashboardLoadingState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-28">
      {/* วงแหวนโหลดแบบเคลื่อนไหว (Animated Spinner) */}
      <div className="h-11 w-11 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      <p className="text-sm text-white/40">กำลังโหลดภาพรวม…</p>
    </div>
  );
}
