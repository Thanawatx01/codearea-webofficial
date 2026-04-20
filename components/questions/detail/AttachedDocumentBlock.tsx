export default function AttachedDocumentBlock({
  uri,
  code,
  iframeMinHeightClass = "min-h-[260px]",
}: {
  uri: string;
  code: string;
  iframeMinHeightClass?: string;
}) {
  return (
    <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-black/40">
      <iframe
        title={`เอกสาร ${code}`}
        src={uri}
        className={`w-full flex-1 border-0 bg-neutral-950 ${iframeMinHeightClass}`}
      />
      <a
        href={uri}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 border-t border-white/10 px-3 py-2 text-center text-xs font-medium text-violet-300 transition hover:bg-white/5"
      >
        เปิด PDF ในแท็บใหม่
      </a>
    </div>
  );
}
