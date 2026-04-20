"use client";

import { Icon } from "./icons/Icon";

interface ManagementAddCardProps {
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  nameValue: string;
  setNameValue: (v: string) => void;
  namePlaceholder: string;
  descriptionValue?: string;
  setDescriptionValue?: (v: string) => void;
  descriptionPlaceholder?: string;
  showDescription?: boolean;
}

export const ManagementAddCard = ({
  onClose,
  onSubmit,
  isSubmitting,
  nameValue,
  setNameValue,
  namePlaceholder,
  descriptionValue = "",
  setDescriptionValue,
  descriptionPlaceholder,
  showDescription = false,
}: ManagementAddCardProps) => {
  return (
    <div className="bg-primary/20 border-2 border-dashed border-primary/40 rounded-3xl p-6 transition-all animate-in zoom-in duration-300">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-2">
            <Icon name="plus" className="w-3.5 h-3.5" />
            สร้างใหม่
          </span>
          <button type="button" onClick={onClose} className="text-white/40 hover:text-white">
            <Icon name="x" className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="space-y-3">
          <input
            autoFocus
            type="text"
            placeholder={namePlaceholder}
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
          />

          {showDescription && setDescriptionValue && (
            <div className="relative group/new-desc">
              <textarea
                placeholder={descriptionPlaceholder}
                value={descriptionValue}
                onChange={(e) => setDescriptionValue(e.target.value)}
                maxLength={255}
                rows={3}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-4 pr-16 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-all resize-none"
              />
              <div className="absolute right-4 bottom-3 text-[10px] font-bold text-white/20 group-focus-within/new-desc:text-primary transition-colors">
                {descriptionValue.length}/255
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 ${showDescription ? 'py-3' : 'py-2.5'} bg-emerald-500 text-white text-xs font-bold rounded-xl hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-emerald-500/20`}
            >
              เพิ่ม
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
