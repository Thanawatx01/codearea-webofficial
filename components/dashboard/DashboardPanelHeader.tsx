// Dashboard Panel Header Component
// ส่วนหัวของ Panel หรือ Section ต่างๆ ในหน้า Dashboard
// 1. แสดงชื่อหัวข้อ (Title) และคำอธิบายย่อย (Subtitle)
// 2. เพิ่มสไตล์ขีดตั้ง (Indicator) ด้านหน้าเพื่อความสวยงาม

type DashboardPanelHeaderProps = {
  title: string;
  subtitle?: string;
  className?: string;
};

// DashboardPanelHeader
// ส่วนจัดการแสดงผล Header
// 1. แสดงขีดสี Gradient พร้อมเงาฟุ้ง (Glow)
// 2. แสดงหัวข้อเน้นตัวหนา และคำอธิบายสีจาง
export function DashboardPanelHeader({
  title,
  subtitle,
  className = "",
}: DashboardPanelHeaderProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* ขีดตกแต่งด้านหน้าหัวข้อ */}
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
