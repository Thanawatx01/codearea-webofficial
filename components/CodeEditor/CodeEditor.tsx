"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type CodeEditorLanguage =
  | "javascript"
  | "typescript"
  | "python"
  | "java"
  | "cpp"
  | "c"
  | "go"
  | "rust"
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
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<import("monaco-editor").editor.IStandaloneCodeEditor | null>(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    setMounted(true);
  }, []);

  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!mounted || !containerRef.current) return;

    let cancelled = false;

    async function init() {
      const monaco = await import("monaco-editor");
      if (cancelled || !containerRef.current) return;

      const editor = monaco.editor.create(containerRef.current, {
        value: value || (placeholder ?? ""),
        language,
        readOnly,
        theme,
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: "on",
        scrollBeyondLastLine: false,
        wordWrap: "on",
        automaticLayout: true,
      });

      editorRef.current = editor;

      const disposable = editor.onDidChangeModelContent(() => {
        const v = editor.getValue();
        if (v !== (placeholder ?? "")) {
          onChangeRef.current?.(v);
        }
      });

      setLoading(false);

      const dispose = () => {
        disposable.dispose();
        editor.dispose();
        editorRef.current = null;
      };

      if (cancelled) dispose();
      else cleanupRef.current = dispose;
    }

    init();
    return () => {
      cancelled = true;
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, [mounted]);

  // Sync value from parent (controlled)
  useEffect(() => {
    if (!editorRef.current || value === undefined) return;
    const editor = editorRef.current;
    if (editor.getValue() !== value) {
      editor.setValue(value);
    }
  }, [value]);

  // Update language & readOnly when props change
  useEffect(() => {
    if (!editorRef.current) return;
    const editor = editorRef.current;
    const model = editor.getModel();
    if (model) {
      const lang = language as string;
      if (model.getLanguageId() !== lang) {
        import("monaco-editor").then((m) => m.editor.setModelLanguage(model, lang));
      }
    }
    editor.updateOptions({ readOnly });
  }, [language, readOnly]);

  // Update theme when prop change
  useEffect(() => {
    if (!mounted) return;
    import("monaco-editor").then((m) => m.editor.setTheme(theme));
  }, [mounted, theme]);

  return (
    <div className={`relative overflow-hidden rounded-lg border border-base-300 bg-[#1e1e1e] ${className}`} style={{ height }}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1e1e1e] text-base-content/60 text-sm">
          กำลังโหลด editor...
        </div>
      )}
      <div ref={containerRef} className="h-full w-full" style={{ display: loading ? "none" : "block" }} />
    </div>
  );
}

export default CodeEditor;
