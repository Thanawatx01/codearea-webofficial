"use client";

import { CodeEditor } from "@/components/CodeEditor";
import { api, callApi } from "@/lib/api";
import { useState } from "react";

export default function LibraryPage() {
  const [code, setCode] = useState('console.log("Hello, CodeArea!");');
  const [apiResult, setApiResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleDemoApi = async () => {
    setLoading(true);
    setApiResult("กำลังเรียก API...");
    // ตัวอย่างเรียก JSONPlaceholder (public API สำหรับทดสอบ)
    const res = await callApi<{ id: number; title: string }[]>(
      "https://jsonplaceholder.typicode.com/posts",
      { params: { _limit: "3" } }
    );
    setLoading(false);
    if (res.ok && res.data) {
      setApiResult(JSON.stringify(res.data, null, 2));
    } else {
      setApiResult(`Error: ${res.status} - ${res.error ?? "Unknown"}`);
    }
  };

  const handleDemoApiShortcut = async () => {
    setLoading(true);
    setApiResult("กำลังเรียก api.get()...");
    const res = await api.get<{ id: number; name: string }[]>(
      "https://jsonplaceholder.typicode.com/users",
      { params: { _limit: "2" } }
    );
    setLoading(false);
    if (res.ok && res.data) {
      setApiResult(JSON.stringify(res.data, null, 2));
    } else {
      setApiResult(`Error: ${res.status} - ${res.error ?? "Unknown"}`);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="mx-auto max-w-5xl space-y-10">
        <header>
          <h1 className="text-3xl font-bold text-base-content">Library</h1>
          <p className="mt-1 text-base-content/70">
            ตัวอย่างการใช้งาน helper components และ config
          </p>
        </header>

        {/* Code Editor */}
        <section className="rounded-xl bg-base-100 p-6 shadow-lg">
          <h2 className="mb-2 text-xl font-semibold text-base-content">
            CodeEditor (Monaco)
          </h2>
          <p className="mb-4 text-sm text-base-content/70">
            ใช้ Monaco Editor สำหรับเขียนโค้ด รองรับหลายภาษา และ theme
          </p>
          <div className="mb-2 flex flex-wrap gap-2">
            <select
              className="select select-bordered select-sm"
              onChange={(e) => setCode(e.target.value ? `// ภาษา: ${e.target.value}\n${code}` : code)}
            >
              <option value="">-- เปลี่ยนภาษาใน component --</option>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
            </select>
          </div>
          <CodeEditor
            value={code}
            onChange={setCode}
            language="javascript"
            height="320px"
            theme="vs-dark"
          />
          <p className="mt-2 text-xs text-base-content/60">
            ค่าปัจจุบัน (ความยาว): {code.length} ตัวอักษร
          </p>
        </section>

        {/* API Helper */}
        <section className="rounded-xl bg-base-100 p-6 shadow-lg">
          <h2 className="mb-2 text-xl font-semibold text-base-content">
            API Helper (callApi / api.get, api.post, ...)
          </h2>
          <p className="mb-4 text-sm text-base-content/70">
            ใช้ callApi() หรือ api.get / api.post สำหรับเรียก API มี timeout,
            JSON parse และ error handling
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleDemoApi}
              disabled={loading}
            >
              {loading ? "..." : "callApi() — posts"}
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleDemoApiShortcut}
              disabled={loading}
            >
              {loading ? "..." : "api.get() — users"}
            </button>
          </div>
          {apiResult && (
            <div className="mt-4">
              <p className="mb-1 text-xs font-medium text-base-content/70">
                ผลลัพธ์:
              </p>
              <pre className="max-h-64 overflow-auto rounded-lg bg-base-200 p-4 text-left text-sm">
                {apiResult}
              </pre>
            </div>
          )}
        </section>

        {/* Usage snippet */}
        <section className="rounded-xl bg-base-100 p-6 shadow-lg">
          <h2 className="mb-2 text-xl font-semibold text-base-content">
            วิธีใช้ในโปรเจค
          </h2>
          <div className="space-y-4 text-sm">
            <div>
              <p className="mb-1 font-medium text-base-content/70">
                CodeEditor
              </p>
              <pre className="overflow-x-auto rounded bg-base-200 p-3">
{`import { CodeEditor } from "@/components/CodeEditor";

<CodeEditor
  value={code}
  onChange={setCode}
  language="javascript"
  height="400px"
  theme="vs-dark"
/>`}
              </pre>
            </div>
            <div>
              <p className="mb-1 font-medium text-base-content/70">
                API Helper
              </p>
              <pre className="overflow-x-auto rounded bg-base-200 p-3">
{`import { callApi, api } from "@/lib/api";

// แบบเต็ม
const res = await callApi<MyType>("/path", { method: "POST", body: { x: 1 } });

// Shortcuts
const r1 = await api.get<MyType>("/path", { params: { page: "1" } });
const r2 = await api.post<MyType>("/path", { name: "test" });`}
              </pre>
            </div>
            <div>
              <p className="mb-1 font-medium text-base-content/70">
                Config (.env.local)
              </p>
              <pre className="overflow-x-auto rounded bg-base-200 p-3">
{`NEXT_PUBLIC_API_URL=https://your-api.com`}
              </pre>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
