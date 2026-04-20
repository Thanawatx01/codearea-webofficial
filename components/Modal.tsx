"use client";

import { useEffect, useRef } from "react";
import { Icon } from "./icons/Icon";

type ModalProps = {
  isOpen: boolean;
  onCloseAction: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
};

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
  full: "max-w-[95vw]",
};

export function Modal({
  isOpen,
  onCloseAction,
  title,
  children,
  footer,
  size = "md",
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseAction();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onCloseAction]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onCloseAction}
      />

      {/* Modal Container */}
      <div 
        ref={modalRef}
        className={`relative w-full ${sizeClasses[size]} overflow-hidden rounded-[2rem] border border-white/10 bg-[#06070d]/95 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.7)] backdrop-blur-3xl animate-in zoom-in-95 slide-in-from-bottom-5 duration-300`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 p-5 sm:p-7">
          <h3 className="text-xl font-black tracking-tight text-white uppercase italic">
            {title || "รายละเอียด"}
          </h3>
          <button
            onClick={onCloseAction}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/20 transition-all hover:bg-white/10 hover:text-white"
          >
            <Icon name="x" className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[80vh] overflow-y-auto p-5 sm:p-8 custom-scrollbar">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-white/5 bg-white/5 p-6 sm:px-8">
            {footer}
          </div>
        )}

        {/* Decor */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/5 blur-[100px]" />
      </div>
    </div>
  );
}
