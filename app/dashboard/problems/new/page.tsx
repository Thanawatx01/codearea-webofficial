"use client";

import Header from "@/components/Header";
import { Icon } from "@/components/icons/Icon";
import { ProblemUpsertForm } from "@/components/problems/ProblemUpsertForm";

export default function AddNewProblemPage() {
  return (
    <>
      <Header
        title="เพิ่มโจทย์ใหม่"
        icon={<Icon name="problem" className="h-5 w-5" />}
      />
      <ProblemUpsertForm />
    </>
  );
}
