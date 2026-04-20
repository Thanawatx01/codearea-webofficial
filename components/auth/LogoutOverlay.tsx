"use client";

import React from "react";

export function LogoutOverlay() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-black/40 backdrop-blur-2xl animate-in fade-in duration-500">
      <div className="relative flex flex-col items-center gap-4">
        {/* Spinner matched with Dashboard style */}
        <div className="h-11 w-11 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />

        {/* Text content matched with Dashboard style but specific message */}
        <div className="text-center space-y-1 relative">
          <h2 className="text-xl font-semibold text-white tracking-tight">
            กำลังออกจากระบบ...
          </h2>
          <p className="text-sm text-white/40 font-medium">
            กำลังกลับไปยังหน้าแรก
          </p>
        </div>
      </div>
    </div>
  );
}
