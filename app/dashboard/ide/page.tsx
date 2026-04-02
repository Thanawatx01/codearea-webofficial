"use client";

import Header from "@/components/Header";
import { Icon } from "@/components/icons/Icon";
import CodeExecutor from "@/components/editor/CodeExecutor";

export default function IDEPage() {
  return (
    <>
      <Header
        title="IDE"
        icon={<Icon name="problem" className="h-5 w-5" />}
      />
      <main className="w-full min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-6 pb-8 pt-6">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-5">
          <div className="rounded-xl border border-white/10 bg-black/20 p-6 backdrop-blur-sm">
            <h2 className="mb-4 text-xl font-bold text-white">Code Editor & Executor</h2>
            <p className="mb-6 text-sm text-white/60">
              ทดสอบและรันโค้ดของคุณด้วย Judge0 Execution Engine รองรับหลายภาษาและ Input/Output แบบ Real-time
            </p>
            <CodeExecutor />
          </div>
        </div>
      </main>
    </>
  );
}
