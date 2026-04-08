"use client";

import QuestionSubmissionBody from "@/components/questions/detail/QuestionSubmissionBody";
import { useParams } from "next/navigation";

export default function QuestionSubmissionPage() {
  const params = useParams<{ code: string }>();
  const raw = params?.code;
  const code = typeof raw === "string" ? decodeURIComponent(raw) : "";

  if (!code) {
    return (
      <div className="relative z-10 w-full px-4 pb-20 pt-24 sm:px-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white/80">
          ไม่พบรหัสโจทย์
        </div>
      </div>
    );
  }

  return <QuestionSubmissionBody code={code} />;
}
