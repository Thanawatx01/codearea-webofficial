"use client";

import { CodeEditor } from "@/components/editor/CodeEditor";
import DataTable, {
  type DataTableColumn,
  type DataTableHeader,
} from "@/components/DataTable";
import {
  ThemedAsyncSelect2,
  ThemedInput,
  ThemedSelect,
  ThemedSelect2,
  ThemedTextarea,
  type Select2Option,
} from "@/components/FormControls";
import { IconsGuideSection } from "@/components/library/IconsGuideSection";
import { LibrarySectionCard } from "@/components/library/LibrarySectionCard";
import { LibrarySidebar } from "@/components/library/LibrarySidebar";
import type { LibrarySectionItem } from "@/components/library/types";
import { api, callApi } from "@/lib/api";
import { useState } from "react";

export default function LibraryPage() {
  const [code, setCode] = useState('console.log("Hello, CodeArea!");');
  const [apiResult, setApiResult] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [demoForm, setDemoForm] = useState({
    title: "",
    category: "frontend",
    description: "",
  });
  const [clientSelect2Value, setClientSelect2Value] =
    useState<Select2Option | null>(null);
  const [serverSelect2Value, setServerSelect2Value] =
    useState<Select2Option | null>(null);
  const [tablePage, setTablePage] = useState(1);

  const handleDemoApi = async () => {
    setLoading(true);
    setApiResult("กำลังเรียก API...");
    // ตัวอย่างเรียก JSONPlaceholder (public API สำหรับทดสอบ)
    const res = await callApi<{ id: number; title: string }[]>(
      "https://jsonplaceholder.typicode.com/posts",
      { params: { _limit: "3" } },
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
      { params: { _limit: "2" } },
    );
    setLoading(false);
    if (res.ok && res.data) {
      setApiResult(JSON.stringify(res.data, null, 2));
    } else {
      setApiResult(`Error: ${res.status} - ${res.error ?? "Unknown"}`);
    }
  };

  const handleDemoFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setDemoForm((prev) => ({ ...prev, [name]: value }));
  };

  const select2ClientOptions: Select2Option[] = [
    { value: "frontend", label: "Frontend" },
    { value: "backend", label: "Backend" },
    { value: "database", label: "Database" },
    { value: "devops", label: "DevOps" },
  ];

  const loadGithubUsers = async (
    inputValue: string,
  ): Promise<Select2Option[]> => {
    const keyword = inputValue.trim() || "codearea";
    const res = await callApi<{ items?: Array<{ id: number; login: string }> }>(
      "https://api.github.com/search/users",
      { params: { q: keyword, per_page: 8 } },
    );

    if (!res.ok || !res.data?.items) {
      return [];
    }

    return res.data.items.map((item) => ({
      value: String(item.id),
      label: item.login,
    }));
  };

  const sections: LibrarySectionItem[] = [
    { id: "overview", title: "Overview" },
    { id: "icons", title: "Icons (Sprite + Use)" },
    { id: "form-controls", title: "Form Controls" },
    { id: "data-table", title: "DataTable" },
    { id: "code-editor", title: "Code Editor" },
    { id: "api-helper", title: "API Helper" },
    { id: "usage", title: "Usage Snippets" },
  ];
  const tableHeaders: DataTableHeader[] = [
    { key: "id", label: "#" },
    { key: "name", label: "ชื่อ" },
    { key: "level", label: "ระดับ" },
    { key: "tags", label: "แท็ก" },
  ];
  const tableRows = [
    {
      id: "q1",
      name: "Merge Two Sorted Vectors",
      level: "ง่าย",
      tags: ["Array", "Math"],
    },
    {
      id: "q2",
      name: "Find Kth Largest Element",
      level: "ปานกลาง",
      tags: ["Heap"],
    },
    { id: "q3", name: "Reverse a Vector", level: "ง่าย", tags: ["Array"] },
  ];
  const tableColumns: DataTableColumn<(typeof tableRows)[number]>[] = [
    { key: "id", render: (row) => row.id },
    { key: "name", render: (row) => row.name },
    { key: "level", render: (row) => row.level },
    {
      key: "tags",
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.tags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-white/10 px-2 py-0.5 text-xs text-white/70"
            >
              {tag}
            </span>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
        <LibrarySidebar sections={sections} />

        <main className="space-y-6">
          <header
            id="overview"
            className="rounded-xl bg-base-100 p-6 shadow-lg"
          >
            <h1 className="text-3xl font-bold text-base-content">Library</h1>
            <p className="mt-2 text-sm text-base-content/70">
              ศูนย์รวมตัวอย่าง component และ helper
              แยกตามหัวข้อเพื่อค้นหาได้ง่าย
            </p>
          </header>

          <IconsGuideSection id="icons" />

          <LibrarySectionCard
            id="form-controls"
            title="Form Controls"
            description="ตัวอย่าง Input / Select / Textarea และ Select2 ที่ใช้ธีมเดียวกัน"
          >
            <div className="space-y-4">
              <div className="max-w-xl space-y-4 rounded-xl bg-[#0B0B0F] p-5">
                <ThemedInput
                  label="Title"
                  name="title"
                  value={demoForm.title}
                  onChange={handleDemoFormChange}
                  placeholder="Enter title..."
                />
                <ThemedSelect
                  label="Category"
                  name="category"
                  value={demoForm.category}
                  onChange={handleDemoFormChange}
                >
                  <option value="frontend" className="text-black">
                    Frontend
                  </option>
                  <option value="backend" className="text-black">
                    Backend
                  </option>
                  <option value="database" className="text-black">
                    Database
                  </option>
                </ThemedSelect>
                <ThemedTextarea
                  label="Description"
                  name="description"
                  value={demoForm.description}
                  onChange={handleDemoFormChange}
                  placeholder="Write description..."
                />
                <ThemedSelect2
                  label="Category (Select2 - Client Filter)"
                  value={clientSelect2Value}
                  options={select2ClientOptions}
                  onChange={setClientSelect2Value}
                  placeholder="Search category..."
                />
                <ThemedAsyncSelect2
                  label="GitHub User (Select2 - Server Side)"
                  value={serverSelect2Value}
                  onChange={setServerSelect2Value}
                  loadOptions={loadGithubUsers}
                  placeholder="Type to search user..."
                />
              </div>

              <div className="space-y-2 text-sm">
                <p className="text-base-content/70">
                  ตัวอย่างโค้ด (กดเพื่อเปิด/ปิด)
                </p>

                <details className="group rounded-lg border border-base-300 bg-base-100">
                  <summary className="cursor-pointer list-none px-4 py-3 font-medium text-base-content">
                    ThemedInput
                  </summary>
                  <pre className="overflow-x-auto border-t border-base-300 bg-base-200 p-4 text-xs">
                    {`import { ThemedInput } from "@/components/FormControls";

<ThemedInput
  label="Title"
  name="title"
  value={form.title}
  onChange={handleChange}
  placeholder="Enter title..."
/>`}
                  </pre>
                </details>

                <details className="group rounded-lg border border-base-300 bg-base-100">
                  <summary className="cursor-pointer list-none px-4 py-3 font-medium text-base-content">
                    ThemedSelect
                  </summary>
                  <pre className="overflow-x-auto border-t border-base-300 bg-base-200 p-4 text-xs">
                    {`import { ThemedSelect } from "@/components/FormControls";

<ThemedSelect
  label="Category"
  name="category"
  value={form.category}
  onChange={handleChange}
>
  <option value="frontend">Frontend</option>
  <option value="backend">Backend</option>
</ThemedSelect>`}
                  </pre>
                </details>

                <details className="group rounded-lg border border-base-300 bg-base-100">
                  <summary className="cursor-pointer list-none px-4 py-3 font-medium text-base-content">
                    ThemedTextarea
                  </summary>
                  <pre className="overflow-x-auto border-t border-base-300 bg-base-200 p-4 text-xs">
                    {`import { ThemedTextarea } from "@/components/FormControls";

<ThemedTextarea
  label="Description"
  name="description"
  value={form.description}
  onChange={handleChange}
  placeholder="Write description..."
/>`}
                  </pre>
                </details>

                <details className="group rounded-lg border border-base-300 bg-base-100">
                  <summary className="cursor-pointer list-none px-4 py-3 font-medium text-base-content">
                    ThemedSelect2 (Client Filter)
                  </summary>
                  <pre className="overflow-x-auto border-t border-base-300 bg-base-200 p-4 text-xs">
                    {`import { ThemedSelect2, type Select2Option } from "@/components/FormControls";

const [value, setValue] = useState<Select2Option | null>(null);
const options: Select2Option[] = [
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
];

<ThemedSelect2
  label="Category"
  value={value}
  options={options}
  onChange={setValue}
  placeholder="Search category..."
/>`}
                  </pre>
                </details>

                <details className="group rounded-lg border border-base-300 bg-base-100">
                  <summary className="cursor-pointer list-none px-4 py-3 font-medium text-base-content">
                    ThemedAsyncSelect2 (Server Side)
                  </summary>
                  <pre className="overflow-x-auto border-t border-base-300 bg-base-200 p-4 text-xs">
                    {`import { ThemedAsyncSelect2, type Select2Option } from "@/components/FormControls";

const [value, setValue] = useState<Select2Option | null>(null);

const loadOptions = async (input: string): Promise<Select2Option[]> => {
  const res = await fetch("/api/search?q=" + encodeURIComponent(input));
  const data = await res.json();
  return data.items.map((item: { id: string; name: string }) => ({
    value: item.id,
    label: item.name,
  }));
};

<ThemedAsyncSelect2
  label="User"
  value={value}
  onChange={setValue}
  loadOptions={loadOptions}
  placeholder="Type to search..."
/>`}
                  </pre>
                </details>
              </div>
            </div>
          </LibrarySectionCard>

          <LibrarySectionCard
            id="data-table"
            title="DataTable"
            description="ตัวอย่าง DataTable กลางที่รับ headers, columns, rows และ pagination"
          >
            <div className="space-y-3">
              <DataTable
                headers={tableHeaders}
                columns={tableColumns}
                rows={tableRows}
                rowKey={(row) => row.id}
                pagination={{
                  page: tablePage,
                  totalPages: 1,
                  onPageChange: setTablePage,
                }}
              />
              <details className="rounded-lg border border-base-300 bg-base-100 text-sm">
                <summary className="cursor-pointer list-none px-4 py-3 font-medium text-base-content">
                  ตัวอย่างโค้ด DataTable
                </summary>
                <pre className="overflow-x-auto border-t border-base-300 bg-base-200 p-4 text-xs">
                  {`import DataTable, { type DataTableHeader, type DataTableColumn } from "@/components/DataTable";

const headers: DataTableHeader[] = [
  { key: "id", label: "#" },
  { key: "name", label: "ชื่อ" },
];

const columns: DataTableColumn<RowType>[] = [
  { key: "id", render: (row) => row.id },
  { key: "name", render: (row) => row.name },
];

<DataTable
  headers={headers}
  columns={columns}
  rows={rows}
  rowKey={(row) => row.id}
  loading={loading}
  errorMessage={error}
  emptyMessage="ไม่พบข้อมูล"
  pagination={{
    page,
    totalPages,
    onPageChange: setPage,
  }}
/>`}
                </pre>
              </details>
            </div>
          </LibrarySectionCard>

          <LibrarySectionCard
            id="code-editor"
            title="Code Editor"
            description="Monaco editor สำหรับเขียนโค้ดหลายภาษา"
          >
            <div className="mb-2 flex flex-wrap gap-2">
              <select
                className="select select-bordered select-sm"
                onChange={(e) =>
                  setCode(
                    e.target.value
                      ? `// ภาษา: ${e.target.value}\n${code}`
                      : code,
                  )
                }
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
          </LibrarySectionCard>

          <LibrarySectionCard
            id="api-helper"
            title="API Helper"
            description="ใช้ `callApi()` หรือ `api.get / api.post` พร้อม timeout และ error handling"
          >
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
          </LibrarySectionCard>

          <LibrarySectionCard id="usage" title="Usage Snippets">
            <div className="space-y-4 text-sm">
              <div>
                <p className="mb-1 font-medium text-base-content/70">
                  CodeEditor
                </p>
                <pre className="overflow-x-auto rounded bg-base-200 p-3">
                  {`import { CodeEditor } from "@/components/editor/CodeEditor";

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

const res = await callApi<MyType>("/path", { method: "POST", body: { x: 1 } });
const r1 = await api.get<MyType>("/path", { params: { page: "1" } });
const r2 = await api.post<MyType>("/path", { name: "test" });`}
                </pre>
              </div>
              <div>
                <p className="mb-1 font-medium text-base-content/70">Config</p>
                <pre className="overflow-x-auto rounded bg-base-200 p-3">
                  {`NEXT_PUBLIC_API_URL=https://your-api.com`}
                </pre>
              </div>
            </div>
          </LibrarySectionCard>
        </main>
      </div>
    </div>
  );
}
