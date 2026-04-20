"use client";

import { useEffect, useRef } from "react";
import { Icon } from "./icons/Icon";
import { useRouter } from "next/navigation";

interface ActionMenuProps {
  viewUrl: string;
  onEdit: () => void;
  onDelete: () => void;
  entityName: string;
  isSubmitting?: boolean;
  onClose: () => void;
}

// ส่วนประกอบ ActionMenu
// เมนูดรอปดาวน์แบบลอยสำหรับการดำเนินการต่างๆ (ดู, แก้ไข, ลบ)
// เริ่มต้น -> แสดงผลเมนู -> ตั้งค่าตัวตรวจจับการคลิกด้านนอก -> แสดงปุ่มโต้ตอบ
// 1. กำหนดการดำเนินการ ดู, แก้ไข และลบ ตาม props ที่ได้รับ
// 2. ใช้ ref เพื่อตรวจจับการคลิกนอกเมนูสำหรับการปิดเมนูอัตโนมัติ
// 3. จัดการการนำทางสำหรับ 'ดูรายละเอียด' โดยใช้ Next.js router
// 4. เรียกใช้ callbacks ที่กำหนดไว้สำหรับการแก้ไขและลบ
// มีการใช้ 'use client' และโต้ตอบกับตัวตรวจจับเหตุการณ์ของ document เพื่อให้ทำงานเหมือนหน้าต่าง modal
export const ActionMenu = ({
  viewUrl,
  onEdit,
  onDelete,
  entityName,
  isSubmitting,
  onClose,
}: ActionMenuProps) => {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-full mt-2 w-48 bg-[#1a1c2e] border border-white/10 rounded-2xl shadow-2xl py-2 z-50 animate-in zoom-in-95 fade-in duration-200"
    >
      <button
        onClick={() => {
          router.push(viewUrl);
          onClose();
        }}
        className="w-full px-4 py-2 flex items-center gap-3 text-xs font-bold text-white/60 hover:text-white hover:bg-white/5 transition-colors"
      >
        <div className="w-5 h-5 flex items-center justify-center">
          <Icon name="eye" className="w-3.5 h-3.5" />
        </div>
        ดูรายละเอียด
      </button>
      <button
        onClick={() => {
          onEdit();
          onClose();
        }}
        className="w-full px-4 py-2 flex items-center gap-3 text-xs font-bold text-white/60 hover:text-white hover:bg-white/5 transition-colors"
      >
        <div className="w-5 h-5 flex items-center justify-center">
          <Icon name="edit" className="w-3.5 h-3.5" />
        </div>
        แก้ไข {entityName}
      </button>
      <div className="h-[1px] bg-white/5 mx-2 my-1"></div>
      <button
        onClick={() => {
          onDelete();
          onClose();
        }}
        disabled={isSubmitting}
        className="w-full px-4 py-2 flex items-center gap-3 text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-30"
      >
        <div className="w-5 h-5 flex items-center justify-center">
          <Icon name="trash" className="w-3.5 h-3.5" />
        </div>
        ลบ {entityName}
      </button>
    </div>
  );
};
