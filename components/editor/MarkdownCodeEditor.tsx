"use client";

import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
});

type MarkdownCodeEditorProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  minHeight?: number;
};

export function MarkdownCodeEditor({
  label,
  value,
  onChange,
  placeholder = "",
  required = false,
  minHeight = 180,
}: MarkdownCodeEditorProps) {
  return (
    <div className="space-y-2" data-color-mode="dark">
      <label className="block px-1 text-xs font-semibold uppercase tracking-widest text-white/50">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </label>
      <div className="overflow-hidden rounded-xl border border-white/10">
        <MDEditor
          value={value}
          onChange={(nextValue) => onChange(nextValue ?? "")}
          preview="edit"
          textareaProps={{ placeholder }}
          height={minHeight}
          visibleDragbar={false}
        />
      </div>
    </div>
  );
}
