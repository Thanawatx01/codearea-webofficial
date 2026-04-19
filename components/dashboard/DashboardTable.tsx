// Dashboard Table Components
// รวมคอมโพเนนต์สำหรับสร้างตารางใน Dashboard
// 1. DashboardTableContainer: ส่วนหุ้มตารางพร้อม Overflow Scroll และ Style
// 2. DashboardTableHead/Body: ส่วนหัวและส่วนเนื้อหาของตาราง
// 3. DashboardTr/Th/Td: ส่วนแถวและเซลล์ที่ปรับแต่ง Style ให้เข้ากับระบบ

import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from "react";

// DashboardTableContainer
// ส่วนหุ้มภายนอกของตาราง จัดการเรื่องความสวยงามและ Responsive
// 1. สร้าง div หุ้มที่มีขอบโค้งและ Background โปร่งแสง
// 2. รองรับ Horizontal Scroll บนมือถือ
// 3. จัดการ padding และ border ให้ดู Premium
export function DashboardTableContainer({ 
  children, 
  className = "",
  tableClassName = ""
}: { 
  children: ReactNode;
  className?: string;
  tableClassName?: string;
}) {
  return (
    <div className={`-mx-1 overflow-x-auto rounded-2xl border border-white/[0.06] bg-black/20 sm:mx-0 ${className}`}>
      <table className={`w-full text-left text-sm whitespace-nowrap ${tableClassName}`}>
        {children}
      </table>
    </div>
  );
}

// DashboardTableHead
// ส่วนหัวของตาราง (Thead)
// 1. กำหนดสไตล์ตัวอักษรเป็นตัวใหญ่ (Uppercase) และมีช่องไฟกว้าง
// 2. ให้สีพื้นหลังที่เข้มขึ้นเล็กน้อยเพื่อแยกส่วนหัวออกจากเนื้อหา
export function DashboardTableHead({ children, className = "" }: { children: ReactNode; className?: string }) {
  // สไตล์มาตรฐานสำหรับส่วนหัว
  const baseClass = "border-b border-white/[0.08] bg-white/[0.04] text-[11px] uppercase tracking-[0.12em] text-white/45";
  return (
    <thead className={className}>
      <tr className={className ? "" : baseClass}>
        {children}
      </tr>
    </thead>
  );
}

// DashboardTableBody
// ส่วนเนื้อหาของตาราง (Tbody)
export function DashboardTableBody({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <tbody className={className}>{children}</tbody>;
}

// DashboardTr
// แถวของตาราง (Table Row)
// 1. เพิ่ม Hover Effect เมื่อเอาเมาส์ไปชี้
// 2. เพิ่มเส้นขอบล่าง (Border Bottom) ยกเว้นแถวสุดท้าย
export function DashboardTr({ children, className = "", ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={`border-b border-white/[0.04] transition-colors last:border-0 hover:bg-white/[0.04] ${className}`} {...props}>
      {children}
    </tr>
  );
}

// DashboardTh
// เซลล์ส่วนหัว (Table Header Cell)
export function DashboardTh({ children, className = "", ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={`px-5 py-3.5 font-semibold ${className}`} {...props}>
      {children}
    </th>
  );
}

// DashboardTd
// เซลล์ข้อมูล (Table Data Cell)
export function DashboardTd({ children, className = "", colSpan, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={`px-5 py-3.5 ${className}`} colSpan={colSpan} {...props}>
      {children}
    </td>
  );
}
