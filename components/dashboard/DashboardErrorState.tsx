// Dashboard Error State Component
// คอมโพเนนต์แสดงสถานะเมื่อเกิดข้อผิดพลาดในการโหลดข้อมูลหน้า Dashboard
// 1. แสดงข้อความแจ้งเตือน Error
// 2. ให้ปุ่ม "ลองอีกครั้ง" สำหรับเรียกใช้วิธีโหลดข้อมูลใหม่

type DashboardErrorStateProps = {
  message: string;
  onRetry: () => void;
};

// DashboardErrorState
// ส่วนแสดงกล่องข้อความ Error พร้อมปุ่ม Retry
// 1. แสดงผลในรูปแบบ Glassmorphism Card
// 2. ปุ่ม Retry มีเอฟเฟกต์แสงสะท้อน (Glow) เพื่อเน้นจุดสนใจ
export function DashboardErrorState({
  message,
  onRetry,
}: DashboardErrorStateProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <p className="text-sm text-red-300/95">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 rounded-2xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-[0_0_28px_rgba(139,92,246,0.35)] transition hover:bg-primary-hover"
      >
        ลองอีกครั้ง
      </button>
    </div>
  );
}
