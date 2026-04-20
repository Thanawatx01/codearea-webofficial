"use client";

import Editor, { loader } from "@monaco-editor/react";

// Fix 404 sourcemap error by using version 0.43.0 which includes min-maps
loader.config({
  paths: {
    vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs",
  },
});

export type CodeEditorLanguage =
  | "javascript"
  | "typescript"
  | "python"
  | "java"
  | "cpp"
  | "c"
  | "sql"
  | "json"
  | "plaintext";

export interface CodeEditorProps {
  /** โค้ดเริ่มต้น */
  value?: string;
  /** เรียกเมื่อเนื้อหาเปลี่ยน */
  onChange?: (value: string) => void;
  /** ภาษาสำหรับ syntax highlighting */
  language?: CodeEditorLanguage;
  /** ความสูง (เช่น "400px" หรือ "50vh") */
  height?: string;
  /** โหมดอ่านอย่างเดียว */
  readOnly?: boolean;
  /** theme: "vs" | "vs-dark" | "hc-black" */
  theme?: "vs" | "vs-dark" | "hc-black";
  /** คลาสของ container */
  className?: string;
  /** placeholder เมื่อ value ว่าง */
  placeholder?: string;
}

export function CodeEditor({
  value = "",
  onChange,
  language = "javascript",
  height = "400px",
  readOnly = false,
  theme = "vs-dark",
  className = "",
  placeholder,
}: CodeEditorProps) {
  const handleEditorChange = (value: string | undefined) => {
    onChange?.(value || "");
  };

  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-base-300 bg-[#1e1e1e] ${className}`}
      style={{ height }}
    >
      <Editor
        height="100%"
        width="100%"
        language={language}
        theme={theme}
        value={value || placeholder}
        onChange={handleEditorChange}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          wordWrap: "on",
          automaticLayout: true,
        }}
        loading={
          <div className="absolute inset-0 flex items-center justify-center bg-[#1e1e1e] text-base-content/60 text-sm">
            กำลังโหลด editor...
          </div>
        }
      />
    </div>
  );
}

export default CodeEditor;
