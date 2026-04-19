// Dashboard Utilities
// ฟังก์ชันช่วยงานทั่วไป (Helper Functions) สำหรับ Dashboard Frontend
// 1. การเลือกสี Chart ตามประเภทสถานะ
// 2. การแปลงวันที่แบบไทย
// 3. การสร้างชื่อย่อ (Initials) จากชื่อเต็ม

// pieFillForLabel
// เลือก ID ของ Gradient ตามชื่อของข้อมูลในกราฟวงกลม
// 1. ตรวจสอบว่าชื่อมีคำว่า "ไม่" (เช่น ไม่ผ่าน) หรือไม่
// 2. คืนค่า URL ของ Gradient ที่ต้องการ
export function pieFillForLabel(
  name: string,
  successGradientId: string,
  failGradientId: string,
): string {
  if (name.includes("ไม่")) return `url(#${failGradientId})`;
  return `url(#${successGradientId})`;
}

// formatThaiDate
// แปลง ISO Date string ให้เป็นรูปแบบวันที่ไทย (ภาษาไทย + เวลา)
// 1. สร้าง New Date จาก ISO string
// 2. ใช้ toLocaleString พร้อม locale 'th-TH'
// 3. จัดการกรณี Error ด้วยการคืนค่าเครื่องหมาย "—"
export function formatThaiDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("th-TH", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}

// initials
// สร้างตัวอักษรย่อจากชื่อ (Display Name)
// 1. ตัดช่องว่างหัวท้าย
// 2. แยกคำด้วยช่องว่าง
// 3. ดึงตัวแรกของ 1 หรือ 2 คำแรกมาทำเป็นตัวใหญ่
export function initials(name: string) {
  const t = name.trim();
  if (!t) return "?";
  const parts = t.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0]!.charAt(0) + parts[1]!.charAt(0)).toUpperCase();
  }
  return t.charAt(0).toUpperCase();
}
