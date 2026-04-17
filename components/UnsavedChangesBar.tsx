"use client";

import { useEffect } from "react";
import { Icon } from "@/components/icons/Icon";

type UnsavedChangesBarProps = {
  show: boolean;
  isSubmitting: boolean;
  onSaveAction: () => void;
  onCancelAction?: () => void;
  message?: string;
  saveLabel?: string;
  cancelLabel?: string;
};

export function UnsavedChangesBar({
  show,
  isSubmitting,
  onSaveAction,
  onCancelAction,
  message = "คุณมีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก",
  saveLabel = "บันทึกตอนนี้",
  cancelLabel = "ยกเลิก",
}: UnsavedChangesBarProps) {
  useEffect(() => {
    if (!show) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
      return "";
    };

    // Intercept internal link clicks
    const handleInternalNavigation = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      
      if (anchor && anchor.href && !anchor.href.startsWith("javascript:") && anchor.target !== "_blank") {
        const confirmContent = "คุณมีข้อมูลที่ยังไม่ได้บันทึก ต้องการออกจากหน้านี้ใช่หรือไม่?";
        if (!window.confirm(confirmContent)) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("click", handleInternalNavigation, { capture: true });
    
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("click", handleInternalNavigation, { capture: true });
    };
  }, [show]);

  return (
    <div
      className={`fixed bottom-8 left-1/2 z-[60] -translate-x-1/2 transition-all duration-300 w-[95vw] sm:w-[90vw] max-w-4xl ${
        show
          ? "translate-y-0 opacity-100"
          : "translate-y-12 opacity-0 pointer-events-none"
      }`}
    >
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6 border border-amber-500/30 bg-[#11131f]/95 px-6 py-4 rounded-3xl shadow-[0_20px_50px_rgba(245,158,11,0.2)] backdrop-blur-3xl">
          <div className="flex items-center gap-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-inner">
              <Icon name="clock" className="h-6 w-6 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <p className="text-sm sm:text-base font-black uppercase tracking-widest text-white/90 leading-tight">
                {message}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            {onCancelAction && (
              <button
                type="button"
                onClick={onCancelAction}
                disabled={isSubmitting}
                className="flex-1 md:flex-none h-12 px-8 rounded-2xl border border-white/5 bg-white/5 text-[11px] font-black uppercase tracking-widest text-white/60 transition-all hover:bg-white/10 hover:text-white active:scale-95 disabled:opacity-50"
              >
                {cancelLabel}
              </button>
            )}

            <button
              type="button"
              onClick={onSaveAction}
              disabled={isSubmitting}
              className="flex-1 md:flex-none h-12 px-10 rounded-2xl bg-amber-500 text-[11px] font-black uppercase tracking-widest text-black transition-all hover:bg-amber-400 hover:scale-[1.02] shadow-[0_10px_30px_rgba(245,158,11,0.3)] active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? "กำลังบันทึก..." : saveLabel}
            </button>
          </div>
        </div>
    </div>
  );
}
