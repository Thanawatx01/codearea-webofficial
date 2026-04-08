"use client";

import { useState } from "react";
import CodeEditor, { type CodeEditorLanguage } from "./CodeEditor";
import { ExecutionResultView } from "./ExecutionResultView";
import { executeCode, JUDGE0_LANGUAGES, SubmissionResult } from "@/lib/judge0";
import { executeCodePiston } from "@/lib/piston";
import {
  EditorToolbarButton,
  EditorToolbarSelect,
  EditorToolbarSelectCompact,
} from "./EditorToolbarPrimitives";

type ExecutorType = "piston" | "judge0";

interface CodeExecutorProps {
  initialCode?: string;
  defaultLanguageId?: number;
  executorType?: ExecutorType;
  executorUrl?: string;
  /** ครอบ root — เช่น embedded ในแผง IDE */
  shellClassName?: string;
  /** true = editor ด้านบน, stdin/output แถบล่าง (สไตล์ LeetCode) */
  stackIoBelow?: boolean;
  ioTabLabels?: { input: string; output: string };
}

const LANGUAGE_BOILERPLATES: Record<number, string> = {
  63: `// JavaScript (Node.js) Hello World
console.log("Hello, World!");`,
  74: `// TypeScript Hello World
const message: string = "Hello, World!";
console.log(message);`,
  76: `// C++ (Clang) Hello World
#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}`,
  71: `# Python 3 Hello World
print("Hello, World!")`,
};

const FILTERED_LANGUAGES = JUDGE0_LANGUAGES;

const DEFAULT_IO_TABS = { input: "Input (stdin)", output: "Output" };

export default function CodeExecutor({
  initialCode,
  defaultLanguageId = 63, // Default to Node.js
  executorType,
  executorUrl,
  shellClassName = "",
  stackIoBelow = false,
  ioTabLabels = DEFAULT_IO_TABS,
}: CodeExecutorProps) {
  const [internalExecutorType] = useState<ExecutorType>(
    (process.env.NEXT_PUBLIC_EXECUTOR as ExecutorType) || "piston"
  );
  
  const currentExecutorType = executorType || internalExecutorType;

  const [languageId, setLanguageId] = useState(defaultLanguageId);
  const [theme, setTheme] = useState<"vs-dark" | "vs">("vs-dark");
  const [code, setCode] = useState(
    initialCode || LANGUAGE_BOILERPLATES[defaultLanguageId] || ""
  );
  const [stdin, setStdin] = useState("");
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"output" | "input">("output");

  const selectedLanguage =
    FILTERED_LANGUAGES.find((l) => l.id === languageId) ||
    FILTERED_LANGUAGES[0];

  const handleRun = async () => {
    setIsRunning(true);
    setError(null);
    setResult(null);
    setActiveTab("output");

    try {
      let res: SubmissionResult;
      if (currentExecutorType === "piston") {
        res = await executeCodePiston(languageId, code, stdin, executorUrl);
      } else {
        res = await executeCode({
          source_code: code,
          language_id: languageId,
          stdin: stdin,
        }, executorUrl);
      }
      setResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("fetch") || msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
        setError("cannot access executor check your connection");
      } else {
        setError(msg || "Something went wrong during execution");
      }
    } finally {
      setIsRunning(false);
    }
  };

  const handleLanguageChange = (id: number) => {
    setLanguageId(id);
    // Only update code if it's currently a boilerplate or empty
    const isCurrentBoilerplate = Object.values(LANGUAGE_BOILERPLATES).includes(code);
    if (!code || isCurrentBoilerplate) {
      setCode(LANGUAGE_BOILERPLATES[id] || "");
    }
  };

  const handleReset = () => {
    setCode(LANGUAGE_BOILERPLATES[languageId] || "");
    setResult(null);
    setError(null);
  };

  // Map Judge0 label to Monaco language
  const getMonacoLanguage = (label: string): CodeEditorLanguage => {
    const l = label.toLowerCase();
    if (l.includes("javascript")) return "javascript";
    if (l.includes("typescript")) return "typescript";
    if (l.includes("python")) return "python";
    if (l.includes("c++")) return "cpp";
    return "plaintext";
  };

  const ioTabs = ioTabLabels ?? DEFAULT_IO_TABS;

  return (
    <div
      className={[
        "flex flex-col overflow-hidden rounded-xl border border-white/10 bg-black/40 shadow-2xl backdrop-blur-md",
        shellClassName,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Top Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/5 px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase text-white/40">Language</span>
            <EditorToolbarSelect
              className="min-w-[180px]"
              value={languageId}
              onChange={(e) => handleLanguageChange(Number(e.target.value))}
              disabled={isRunning}
            >
              {FILTERED_LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id} className="bg-[#1e1e1e]">
                  {lang.label}
                </option>
              ))}
            </EditorToolbarSelect>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase text-white/40">Theme</span>
            <EditorToolbarSelectCompact
              value={theme}
              onChange={(e) => setTheme(e.target.value as "vs-dark" | "vs")}
            >
              <option value="vs-dark" className="bg-[#1e1e1e]">Dark</option>
              <option value="vs" className="bg-[#1e1e1e]">Light</option>
            </EditorToolbarSelectCompact>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5">
          <EditorToolbarButton
            variant="secondary"
            onClick={handleReset}
            disabled={isRunning}
          >
            Reset
          </EditorToolbarButton>
          <EditorToolbarButton
            variant="primary"
            className={[
              "px-6",
              isRunning ? "cursor-wait opacity-90" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={handleRun}
            disabled={isRunning}
          >
            {isRunning ? "Running" : "Run Code"}
          </EditorToolbarButton>
        </div>
      </div>

      <div
        className={
          stackIoBelow
            ? "flex min-h-0 flex-1 flex-col"
            : "grid min-h-[500px] grid-cols-1 lg:grid-cols-3"
        }
      >
        {/* Editor Section */}
        <div
          className={
            stackIoBelow
              ? "flex min-h-[200px] flex-1 flex-col border-b border-white/10"
              : "flex flex-col border-b border-white/10 lg:col-span-2 lg:border-b-0 lg:border-r"
          }
        >
          <div className={`flex-1 min-h-0 ${stackIoBelow ? "min-h-[220px]" : "min-h-[400px]"}`}>
            <CodeEditor
              value={code}
              onChange={setCode}
              language={getMonacoLanguage(selectedLanguage.label)}
              height="100%"
              theme={theme}
              className="rounded-none border-none"
            />
          </div>
        </div>

        {/* Input/Output Section */}
        <div
          className={
            stackIoBelow
              ? "flex min-h-[200px] shrink-0 flex-col bg-black/25 sm:min-h-[240px]"
              : "flex flex-col bg-black/20 lg:col-span-1"
          }
        >
          <div className="flex shrink-0 border-b border-white/10">
            <button
              type="button"
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                activeTab === "input"
                  ? "border-b-2 border-emerald-400 bg-white/10 text-white"
                  : "text-white/40 hover:text-white/60"
              }`}
              onClick={() => setActiveTab("input")}
            >
              {ioTabs.input}
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                activeTab === "output"
                  ? "border-b-2 border-emerald-400 bg-white/10 text-white"
                  : "text-white/40 hover:text-white/60"
              }`}
              onClick={() => setActiveTab("output")}
            >
              {ioTabs.output}
            </button>
          </div>

          <div className={`flex min-h-0 flex-1 flex-col p-0 ${stackIoBelow ? "min-h-[140px]" : "min-h-[300px]"}`}>
            {activeTab === "input" ? (
              <textarea
                className="w-full h-full p-4 bg-transparent font-mono text-sm text-white/80 focus:outline-none resize-none placeholder:text-white/10"
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                placeholder="Enter standard input here..."
              />
            ) : (
              <ExecutionResultView
                result={result}
                error={error}
                isRunning={isRunning}
                langLabel={selectedLanguage.label}
                emptyHint="Ready to run"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
