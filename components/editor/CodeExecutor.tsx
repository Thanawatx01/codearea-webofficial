"use client";

import { useState } from "react";
import CodeEditor from "./CodeEditor";
import { executeCode, JUDGE0_LANGUAGES, SubmissionResult } from "@/lib/judge0";
import { executeCodePiston } from "@/lib/piston";

type ExecutorType = "piston" | "judge0";

interface CodeExecutorProps {
  initialCode?: string;
  defaultLanguageId?: number;
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

export default function CodeExecutor({
  initialCode,
  defaultLanguageId = 63, // Default to Node.js
}: CodeExecutorProps) {
  const [executorType] = useState<ExecutorType>(
    (process.env.NEXT_PUBLIC_EXECUTOR as ExecutorType) || "piston"
  );
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

  const detectWrongLanguage = (result: SubmissionResult) => {
    // If it's a runtime error with specific Node.js thread failure on Apple Silicon,
    // it often contains C++ symbols in the trace. Don't trigger mismatch then.
    const isNodeThreadError = result.stderr?.includes("uv_thread_create") || result.stderr?.includes("node::WorkerThreadsTaskRunner");

    // NEW: Also check for compilation errors that look like thread failures (TypeScript)
    const isTypeScriptThreadError = selectedLanguage.label.toLowerCase().includes("typescript") &&
      (result.compile_output?.includes("Compilation time limit exceeded") || result.compile_output?.includes("uv_thread_create"));

    if (isNodeThreadError || isTypeScriptThreadError) {
      return "ARM_COMPATIBILITY_ISSUE";
    }

    const combinedOutput = [
      result.stdout,
      result.stderr,
      result.compile_output,
      result.message
    ].filter(Boolean).join("\n").toLowerCase();

    const lang = selectedLanguage.label.toLowerCase();

    // Helper to check for multiple patterns
    const containsAny = (patterns: string[]) => patterns.some(p => combinedOutput.includes(p.toLowerCase()));

    // JS/TS environment checks
    if (lang.includes("javascript") || lang.includes("typescript")) {
      // Ignore if it's a known system level error trace
      if (isNodeThreadError) return null;

      if (containsAny(["#include", "std::", "iostream", "using namespace std"])) {
        return "It looks like you are trying to run C++ code in a JavaScript/TypeScript environment.";
      }
      if (containsAny(["def ", "import sys", "import os"]) && combinedOutput.includes("syntaxerror")) {
        return "It looks like you are trying to run Python code in a JavaScript/TypeScript environment.";
      }
    }

    // Python environment checks
    if (lang.includes("python")) {
      if (containsAny(["#include", "std::", "iostream"])) {
        return "It looks like you are trying to run C++ code in a Python environment.";
      }
      if (containsAny(["console.log", "const ", "let ", "function "]) && combinedOutput.includes("syntaxerror")) {
        return "It looks like you are trying to run JavaScript/TypeScript code in a Python environment.";
      }
    }

    // C++ environment checks
    if (lang.includes("c++")) {
      if (containsAny(["console.log", "const ", "let ", "function "])) {
        return "It looks like you are trying to run JavaScript/TypeScript code in a C++ environment.";
      }
      if (containsAny(["def ", "import "])) {
        return "It looks like you are trying to run Python code in a C++ environment.";
      }
    }

    return null;
  };

  const handleRun = async () => {
    setIsRunning(true);
    setError(null);
    setResult(null);
    setActiveTab("output");

    try {
      let res: SubmissionResult;
      if (executorType === "piston") {
        res = await executeCodePiston(languageId, code, stdin);
      } else {
        res = await executeCode({
          source_code: code,
          language_id: languageId,
          stdin: stdin,
        });
      }
      setResult(res);
    } catch (err: any) {
      if (err.message.includes("fetch") || err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
        setError("cannot access executor check your connection");
      } else {
        setError(err.message || "Something went wrong during execution");
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
  const getMonacoLanguage = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes("javascript")) return "javascript";
    if (l.includes("typescript")) return "typescript";
    if (l.includes("python")) return "python";
    if (l.includes("c++")) return "cpp";
    return "plaintext";
  };

  return (
    <div className="flex flex-col rounded-xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-md shadow-2xl">
      {/* Top Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/5 px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase text-white/40">Language</span>
            <select
              className="select select-xs select-bordered bg-white/5 border-white/10 text-white min-w-[180px]"
              value={languageId}
              onChange={(e) => handleLanguageChange(Number(e.target.value))}
              disabled={isRunning}
            >
              {FILTERED_LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id} className="bg-[#1e1e1e]">
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase text-white/40">Theme</span>
            <select
              className="select select-xs select-bordered bg-white/5 border-white/10 text-white"
              value={theme}
              onChange={(e) => setTheme(e.target.value as any)}
            >
              <option value="vs-dark" className="bg-[#1e1e1e]">Dark</option>
              <option value="vs" className="bg-[#1e1e1e]">Light</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="btn btn-xs btn-ghost text-white/60 hover:text-white"
            onClick={handleReset}
            disabled={isRunning}
          >
            Reset
          </button>
          <button
            className={`btn btn-sm px-6 btn-primary shadow-lg shadow-primary/20 transition-all ${isRunning ? "loading" : ""}`}
            onClick={handleRun}
            disabled={isRunning}
          >
            {isRunning ? "Running" : "Run Code"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 min-h-[500px]">
        {/* Editor Section */}
        <div className="lg:col-span-2 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col">
          <div className="flex-1 min-h-[400px]">
            <CodeEditor
              value={code}
              onChange={setCode}
              language={getMonacoLanguage(selectedLanguage.label) as any}
              height="100%"
              theme={theme}
              className="rounded-none border-none"
            />
          </div>
        </div>

        {/* Input/Output Section */}
        <div className="lg:col-span-1 flex flex-col bg-black/20">
          <div className="flex border-b border-white/10">
            <button
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                activeTab === "input" ? "bg-white/10 text-white border-b-2 border-primary" : "text-white/40 hover:text-white/60"
              }`}
              onClick={() => setActiveTab("input")}
            >
              Input (stdin)
            </button>
            <button
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                activeTab === "output" ? "bg-white/10 text-white border-b-2 border-primary" : "text-white/40 hover:text-white/60"
              }`}
              onClick={() => setActiveTab("output")}
            >
              Output
            </button>
          </div>

          <div className="flex-1 p-0 flex flex-col min-h-[300px]">
            {activeTab === "input" ? (
              <textarea
                className="w-full h-full p-4 bg-transparent font-mono text-sm text-white/80 focus:outline-none resize-none placeholder:text-white/10"
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                placeholder="Enter standard input here..."
              />
            ) : (
              <div className="flex-1 flex flex-col font-mono text-sm overflow-auto">
                <div className="flex-1 p-4 whitespace-pre-wrap">
                  {isRunning && (
                    <div className="flex flex-col gap-2">
                      <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-primary/60 text-xs italic">Executing submission...</span>
                    </div>
                  )}
                  {error && <div className="text-red-400 p-2 bg-red-400/10 rounded border border-red-400/20">{error}</div>}
                  {result && (
                    <div className="space-y-4">
                      {/* Wrong Language Suggestion / ARM Issue */}
                      {result.status.id !== 3 && detectWrongLanguage(result) && (
                        <div className={`p-3 border rounded-lg flex items-start gap-3 ${
                          detectWrongLanguage(result) === "ARM_COMPATIBILITY_ISSUE"
                            ? "bg-amber-500/10 border-amber-500/20"
                            : "bg-blue-500/10 border-blue-500/20"
                        }`}>
                          <div className={`mt-0.5 ${
                            detectWrongLanguage(result) === "ARM_COMPATIBILITY_ISSUE" ? "text-amber-400" : "text-blue-400"
                          }`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                            </svg>
                          </div>
                          <div className={`text-[11px] leading-relaxed ${
                            detectWrongLanguage(result) === "ARM_COMPATIBILITY_ISSUE" ? "text-amber-300" : "text-blue-300"
                          }`}>
                            <span className="font-bold block mb-0.5">
                              {detectWrongLanguage(result) === "ARM_COMPATIBILITY_ISSUE"
                                ? "Environment Compatibility Issue"
                                : "Tip: Language Mismatch?"}
                            </span>
                            {detectWrongLanguage(result) === "ARM_COMPATIBILITY_ISSUE"
                              ? "Node.js/TypeScript execution is currently unsupported on Apple Silicon (ARM) in this environment. Please use Python 3 or C++ instead."
                              : detectWrongLanguage(result)}
                          </div>
                        </div>
                      )}

                      {result.stdout && (
                        <div>
                          <span className="text-[10px] text-white/20 block mb-1 uppercase font-bold tracking-tighter">Stdout</span>
                          <div className="text-white/90">{result.stdout}</div>
                        </div>
                      )}
                      {result.stderr && (
                        <div className="group">
                          <span className="text-[10px] text-red-400/40 block mb-1 uppercase font-bold tracking-tighter group-hover:text-red-400/60 transition-colors">Stderr</span>
                          <div className="text-red-400/90 bg-red-400/5 p-3 rounded-lg border border-red-400/10 font-mono text-xs leading-relaxed whitespace-pre-wrap selection:bg-red-400/20">
                            {result.stderr}
                          </div>
                        </div>
                      )}
                      {result.compile_output && (
                        <div className="group">
                          <span className="text-[10px] text-yellow-400/40 block mb-1 uppercase font-bold tracking-tighter group-hover:text-yellow-400/60 transition-colors">Compilation Error</span>
                          <div className="text-yellow-400/80 bg-yellow-400/5 p-3 rounded-lg border border-yellow-400/10 font-mono text-xs leading-relaxed whitespace-pre-wrap selection:bg-yellow-400/20">
                            {result.compile_output}
                          </div>
                        </div>
                      )}
                      {result.status.id !== 3 && !result.stderr && !result.compile_output && (
                        <div className="text-red-400 border-l-2 border-red-400 pl-3 bg-red-400/5 py-2 rounded-r-lg">
                          <span className="font-bold text-xs uppercase tracking-wider">Execution Error</span>
                          <div className="text-sm mt-0.5">{result.status.description}</div>
                          {result.message && <div className="text-[11px] mt-1 text-red-400/60 font-mono italic">{result.message}</div>}
                        </div>
                      )}

                      {!result.stdout && !result.stderr && !result.compile_output && result.status.id === 3 && (
                        <div className="text-white/30 italic py-4 flex items-center gap-2">
                           <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></div>
                           Program finished with no output.
                        </div>
                      )}
                    </div>
                  )}
                  {!isRunning && !result && !error && (
                    <div className="h-full flex flex-col items-center justify-center text-white/10 py-10">
                      <svg className="w-12 h-12 mb-2 opacity-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      <span className="text-xs uppercase tracking-widest font-bold">Ready to run</span>
                    </div>
                  )}
                </div>

                {/* Status Bar */}
                {result && (
                  <div className="p-3 bg-white/5 border-t border-white/5 grid grid-cols-3 gap-1">
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase font-black text-white/20 leading-none">Status</span>
                      <span className={`text-[11px] font-bold ${result.status.id === 3 ? "text-green-400" : "text-red-400"}`}>
                        {result.status.description}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase font-black text-white/20 leading-none">Time</span>
                      <span className="text-[11px] font-mono text-white/60">{result.time || "0.000"}s</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase font-black text-white/20 leading-none">Memory</span>
                      <span className="text-[11px] font-mono text-white/60">{result.memory ? `${(result.memory / 1024).toFixed(1)}MB` : "0.0MB"}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
