import type { QuestionDetail } from "./types";

export default function QuestionStatementSection({
  data,
  tags,
}: {
  data: QuestionDetail;
  tags: string[];
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
        <section>
          <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-white/40">
            ข้อจำกัด
          </h3>
          <pre className="whitespace-pre-wrap rounded-xl border border-white/10 bg-black/35 p-3 font-mono text-xs leading-relaxed text-sky-200/90">
            {data.constraints}
          </pre>
        </section>
      ) : null}
    </>
  );
}
