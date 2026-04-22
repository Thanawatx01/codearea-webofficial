import type { QuestionDetail, QuestionTestCase } from "./types";
import { Icon } from "@/components/icons/Icon";

export default function QuestionStatementSection({
  data,
  tags,
  sampleTests = [],
}: {
  data: QuestionDetail;
  tags: string[];
  sampleTests?: QuestionTestCase[];
}) {
  return (
    <>
      <h2 className="mb-3 text-lg font-bold leading-snug text-white">
        {data.title}
      </h2>
      {data.description ? (
        <div className="mb-4 text-sm leading-relaxed text-white/75">
          {data.description}
        </div>
      ) : !data.uri ? (
        <p className="mb-4 text-sm text-white/40">ไม่มีคำอธิบายข้อความ</p>
      ) : (
        <p className="mb-4 text-sm text-white/45">
          รายละเอียดเพิ่มเติมอาจอยู่ในเอกสารแนบด้านล่าง
        </p>
      )}

      {tags.length > 0 ? (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <span
              key={t}
              className="rounded-md border border-white/10 bg-white/[0.06] px-2 py-0.5 text-[11px] text-white/65"
            >
              {t}
            </span>
          ))}
        </div>
      ) : null}

      <dl className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {data.expected_complexity ? (
          <div className="rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2">
            <dt className="text-[10px] font-bold uppercase tracking-wider text-white/40">
              ความซับซ้อน
            </dt>
            <dd className="mt-0.5 text-sm font-medium text-white/90">
              {data.expected_complexity}
            </dd>
          </div>
        ) : null}
        {data.time_limit != null ? (
          <div className="rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2">
            <dt className="text-[10px] font-bold uppercase tracking-wider text-white/40">
              เวลา
            </dt>
            <dd className="mt-0.5 text-sm font-medium text-white/90">
              {data.time_limit} ms
            </dd>
          </div>
        ) : null}
        {data.memory_limit != null ? (
          <div className="rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 sm:col-span-2">
            <dt className="text-[10px] font-bold uppercase tracking-wider text-white/40">
              หน่วยความจำ
            </dt>
            <dd className="mt-0.5 text-sm font-medium text-white/90">
              {data.memory_limit} KB
            </dd>
          </div>
        ) : null}
      </dl>

      {data.constraints ? (
        <section className="mb-6">
          <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-white/40">
            ข้อจำกัด
          </h3>
          <pre className="whitespace-pre-wrap rounded-xl border border-white/10 bg-black/35 p-3 font-mono text-xs leading-relaxed text-sky-200/90">
            {data.constraints}
          </pre>
        </section>
      ) : null}

      {sampleTests.length > 0 ? (
        <section className="space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-white/40">
            ตัวอย่างทดสอบ (Sample Test Cases)
          </h3>
          <div className="space-y-4">
            {sampleTests.map((test, idx) => (
              <div key={test.id ?? idx} className="rounded-xl border border-white/10 bg-black/20 overflow-hidden">
                <div className="bg-white/5 px-3 py-1.5 border-b border-white/10 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-white/40 uppercase">ตัวอย่าง {test.case_order ?? (idx + 1)}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10">
                  <div className="p-3">
                    <div className="text-[9px] font-bold text-white/20 uppercase mb-1 flex items-center gap-1">
                      <Icon name="arrow-right" className="w-2.5 h-2.5" /> Input
                    </div>
                    <pre className="font-mono text-xs text-white/80 whitespace-pre-wrap break-all bg-black/20 p-2 rounded-lg">{test.input_data || "—"}</pre>
                  </div>
                  <div className="p-3">
                    <div className="text-[9px] font-bold text-white/20 uppercase mb-1 flex items-center gap-1">
                      <Icon name="check" className="w-2.5 h-2.5" /> Output
                    </div>
                    <pre className="font-mono text-xs text-emerald-300/80 whitespace-pre-wrap break-all bg-black/20 p-2 rounded-lg">{test.output_data || "—"}</pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
