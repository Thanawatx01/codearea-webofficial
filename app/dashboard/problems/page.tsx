"use client";

import Header from "@/components/Header";
import { Icon } from "@/components/icons/Icon";
import { ProblemsFilterForm } from "@/components/problems/ProblemsFilterForm";
import { ProblemsTable } from "@/components/problems/ProblemsTable";
import type { Select2Option } from "@/components/FormControls";
import type { ProblemRow } from "@/components/problems/types";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

type ProblemsListResponse = {
  data: ProblemRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
};

export default function ProblemsPage() {
  const [rows, setRows] = useState<ProblemRow[]>([]);
  const [category, setCategory] = useState<Select2Option | null>(null);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [tag, setTag] = useState<string[]>([]);
  const [status, setStatus] = useState("1");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const pageSize = 10;

  const fetchQuestions = async (targetPage = page) => {
    setIsLoading(true);
    setErrorMessage("");
    const res = await api.get<ProblemsListResponse>("/questions", {
      useToken: true,
      params: {
        category_id: category?.value || undefined,
        search: search.trim() || undefined,
        difficulty: difficulty || undefined,
        tag: tag.length > 0 ? tag.join(",") : undefined,
        limit: pageSize,
        page: targetPage,
        status: status || undefined,
      },
    });

    if (!res.ok || !res.data?.data || !res.data.pagination) {
      setRows([]);
      setTotal(0);
      setTotalPages(1);
      setErrorMessage(res.error ?? "โหลดข้อมูลโจทย์ไม่สำเร็จ");
      setIsLoading(false);
      return;
    }

    setRows(res.data.data);
    setPage(res.data.pagination.page);
    setTotal(res.data.pagination.total);
    setTotalPages(res.data.pagination.total_pages || 1);
    setIsLoading(false);
  };

  useEffect(() => {
    void fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (code: string) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "ยืนยันการลบโจทย์",
      text: `ต้องการลบโจทย์ ${code} ใช่หรือไม่`,
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;

    const res = await api.delete<{ message?: string }>(`/questions/${code}`, {
      useToken: true,
    });

    if (!res.ok) {
      await Swal.fire({
        icon: "error",
        title: "ลบไม่สำเร็จ",
        text: res.error ?? "เกิดข้อผิดพลาดจากระบบ",
      });
      return;
    }

    await Swal.fire({
      icon: "success",
      title: "ลบสำเร็จ",
      text: res.data?.message ?? `ลบโจทย์ ${code} สำเร็จ`,
      timer: 1200,
      showConfirmButton: false,
    });
    void fetchQuestions(page);
  };

  const handleActivate = async (code: string) => {
    const result = await Swal.fire({
      icon: "question",
      title: "ยืนยันการเปิดใช้งาน",
      text: `ต้องการเปิดใช้งานโจทย์ ${code} ใช่หรือไม่`,
      showCancelButton: true,
      confirmButtonText: "เปิดใช้งาน",
      cancelButtonText: "ยกเลิก",
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;

    const res = await api.put<{ message?: string }>(
      `/questions/${code}`,
      { status: true },
      { useToken: true },
    );

    if (!res.ok) {
      await Swal.fire({
        icon: "error",
        title: "เปิดใช้งานไม่สำเร็จ",
        text: res.error ?? "เกิดข้อผิดพลาดจากระบบ",
      });
      return;
    }

    await Swal.fire({
      icon: "success",
      title: "เปิดใช้งานสำเร็จ",
      text: res.data?.message ?? `เปิดใช้งานโจทย์ ${code} สำเร็จ`,
      timer: 1200,
      showConfirmButton: false,
    });
    void fetchQuestions(page);
  };

  return (
    <>
      <Header
        title="โจทย์"
        icon={<Icon name="problem" className="h-5 w-5" />}
      />
      <main className="w-full min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-6 pb-8 pt-6">
        <div className="mx-auto flex w-full max-w-[1700px] flex-col gap-5">
          <ProblemsFilterForm
            category={category}
            search={search}
            difficulty={difficulty}
            tag={tag}
            status={status}
            onCategoryChange={setCategory}
            onSearchChange={setSearch}
            onDifficultyChange={setDifficulty}
            onTagChange={setTag}
            onStatusChange={setStatus}
            onSubmit={() => void fetchQuestions(1)}
          />
          <ProblemsTable
            rows={rows}
            total={total}
            isLoading={isLoading}
            errorMessage={errorMessage}
            page={page}
            totalPages={totalPages}
            onPageChange={(nextPage) => void fetchQuestions(nextPage)}
            onDelete={(code) => void handleDelete(code)}
            onActivate={(code) => void handleActivate(code)}
          />
        </div>
      </main>
    </>
  );
}
