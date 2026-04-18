"use client";

import { Icon } from "./icons/Icon";
import { ActionMenu } from "./ActionMenu";

interface ManagementCardProps {
  id: string | number;
  name: string;
  questionCount: number;
  isEditing: boolean;
  isSubmitting: boolean;
  editValue: string;
  setEditValue: (v: string) => void;
  onUpdate: (id: string | number) => Promise<void>;
  onCancelEdit: () => void;
  onStartEdit: () => void;
  onDelete: (id: string | number) => Promise<void>;
  viewUrl: string;
  unitLabel: string;
  entityName: string;
  index: number;
  openMenuId: string | number | null;
  setOpenMenuId: (id: string | number | null) => void;
  description?: string;
  editDescriptionValue?: string;
  setEditDescriptionValue?: (v: string) => void;
}

// ส่วนประกอบ ManagementCard
// คอนเทนเนอร์ที่ใช้งานซ้ำได้สำหรับรายการใน dashboard การจัดการ (แท็ก, ประเภทโจทย์)
// รับ props -> แสดงผลเลย์เอาต์ -> จัดการการสลับโหมดแก้ไข -> รวม ActionMenu เข้ามา
// 1. แสดงชื่อเอนทิตีพร้อมรองรับโหมดการแก้ไขแบบอินไลน์
// 2. จัดการการโต้ตอบผ่านคีย์บอร์ด (Enter เพื่อบันทึก, Escape เพื่อยกเลิก) ในโหมดแก้ไข
// 3. รวม ActionMenu ที่ใช้ร่วมกันสำหรับการดำเนินการรอง
// 4. แสดงสถิติของเอนทิตี (เช่น จำนวนโจทย์) และจัดการการแสดงผลแอนิเมชั่นตอนเริ่มต้น
// ช่วยให้มั่นใจว่าการออกแบบและเลย์เอาต์มีความสอดคล้องกันในทุกตารางการจัดการ
export const ManagementCard = ({
  id,
  name,
  questionCount,
  isEditing,
  isSubmitting,
  editValue,
  setEditValue,
  onUpdate,
  onCancelEdit,
  onStartEdit,
  onDelete,
  viewUrl,
  unitLabel,
  entityName,
  index,
  openMenuId,
  setOpenMenuId,
  description,
  editDescriptionValue,
  setEditDescriptionValue,
}: ManagementCardProps) => {
  const isOpen = openMenuId === id;

  return (
    <div
      className={`group relative overflow-visible bg-white/5 border border-white/5 rounded-3xl p-6 transition-all duration-300 hover:bg-white/[0.08] hover:border-white/10 hover:-translate-y-1 hover:shadow-2xl animate-in fade-in slide-in-from-bottom-4 ${isOpen ? 'z-50 ring-2 ring-primary/30 bg-white/[0.1]' : 'z-10'}`}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all"></div>

      <div className="relative flex flex-col h-full space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                <div className="flex-1 space-y-2">
                  <input
                    autoFocus
                    type="text"
                    placeholder={`ชื่อ${entityName}...`}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !setEditDescriptionValue) void onUpdate(id);
                      if (e.key === "Escape") onCancelEdit();
                    }}
                    className="w-full bg-black/40 border border-primary/50 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none"
                  />
                  {setEditDescriptionValue && (
                    <div className="relative group/desc">
                      <input
                        type="text"
                        placeholder="คำอธิบาย..."
                        value={editDescriptionValue}
                        maxLength={255}
                        onChange={(e) => setEditDescriptionValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") void onUpdate(id);
                          if (e.key === "Escape") onCancelEdit();
                        }}
                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-3 pr-16 py-2 text-sm text-white/90 focus:outline-none focus:border-primary/50 transition-colors"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/20 group-focus-within/desc:text-primary transition-colors">
                        {editDescriptionValue?.length || 0}/255
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => void onUpdate(id)}
                    disabled={isSubmitting}
                    className="p-1.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
                  >
                    <Icon name="check" className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={onCancelEdit}
                    className="p-1.5 bg-white/5 text-white/40 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <Icon name="x" className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-1 min-w-0">
                <h3 className="text-xl font-black text-white group-hover:text-primary transition-colors truncate">
                  {name}
                </h3>
                {description && (
                  <p className="text-sm text-white/40 line-clamp-2 leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="relative shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenuId(isOpen ? null : id);
              }}
              className={`w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 text-white/30 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 transition-all ${isOpen ? 'bg-white/10 text-white' : ''}`}
            >
              <Icon name="chevron-down" className="w-4 h-4" />
            </button>

            {isOpen && (
              <ActionMenu
                viewUrl={viewUrl}
                onEdit={onStartEdit}
                onDelete={() => void onDelete(id)}
                entityName={entityName}
                isSubmitting={isSubmitting}
                onClose={() => setOpenMenuId(null)}
              />
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-end">
          {!isEditing && (
            <div className="flex items-center gap-2 mt-auto">
              <Icon name="link" className="w-4 h-4 text-emerald-400" />
              <p className="text-xs font-bold text-white/60 uppercase tracking-wider">
                {questionCount.toLocaleString()} {unitLabel}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
