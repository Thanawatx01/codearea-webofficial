"use client";

import Header from "@/components/Header";
import { Icon } from "@/components/icons/Icon";
import { ProblemUpsertForm } from "@/components/problems/ProblemUpsertForm";
import { useParams } from "next/navigation";

export default function UpdateProblemPage() {
  const params = useParams<{ code: string }>();
  const code = params?.code ? decodeURIComponent(params.code) : "";

  return (
    <>
      <Header
        title="แก้ไขโจทย์"
        icon={<Icon name="problem" className="h-5 w-5" />}
      />
      <ProblemUpsertForm code={code || undefined} />
    </>
  );
}
