import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/icons/Icon";
import AttachedDocumentBlock from "./AttachedDocumentBlock";
import QuestionStatementSection from "./QuestionStatementSection";
import type { QuestionDetail, QuestionTestCase } from "./types";
 
export default function StatementPreviewModal({
  open,
  data,
  tags,
  sampleTests,
  onClose,
}: {
  open: boolean;
  data: QuestionDetail;
  tags: string[];
  sampleTests?: QuestionTestCase[];
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!open || !mounted) return null;
 
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-3 backdrop-blur-md sm:p-6 animate-in fade-in duration-300"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="statement-preview-title"
        className="flex max-h-[min(92dvh,900px)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#0b0c10] shadow-[0_0_60px_rgba(0,0,0,0.55)] animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-white/[0.04] px-4 py-3">
          <h2
            id="statement-preview-title"
            className="min-w-0 flex-1 truncate text-sm font-bold text-white"
          >
            {data.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-white/50 transition hover:bg-white/10 hover:text-white"
            aria-label="ปิดหน้าต่างขยาย"
          >
            <Icon name="xmark" className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
          <QuestionStatementSection data={data} tags={tags} sampleTests={sampleTests} />
          {data.uri ? (
            <section className="mt-8 border-t border-white/10 pt-6">
              <h3 className="mb-3 text-sm font-bold text-white/75">เอกสารแนบ</h3>
              <AttachedDocumentBlock
                uri={data.uri}
                code={data.code}
                iframeMinHeightClass="min-h-[72vh]"
              />
            </section>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
}
