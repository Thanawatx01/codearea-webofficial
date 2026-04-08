import type { MouseEvent } from "react";

export default function WorkspaceColResizeHandle({
  onMouseDown,
}: {
  onMouseDown: (e: MouseEvent) => void;
}) {
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="ลากปรับความกว้างแผงโจทย์"
      className="hidden shrink-0 cursor-col-resize touch-none xl:flex xl:w-2 xl:items-stretch xl:justify-center xl:py-2"
      onMouseDown={onMouseDown}
    >
      <span className="w-px flex-1 self-stretch rounded-full bg-white/15 hover:bg-violet-400/55 active:bg-violet-400/80" />
    </div>
  );
}
