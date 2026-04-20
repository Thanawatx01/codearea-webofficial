"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

// Types
interface Category {
  id: number;
  name: string;
  description: string;
}

interface Problem {
  code: string;
  title: string;
  description: string | null;
  difficulty: number;
  total_attempts?: number;
  tags: string[]; // เปลี่ยนจาก { name: string }[] เป็น string[]
}

const difficultyClass: Record<string, string> = {
  Easy: "bg-green-500/20 text-green-400 border border-green-500/30",
  Medium: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  Hard: "bg-red-500/20 text-red-400 border border-red-500/30",
};

export default function CategoryDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const useToken =
        typeof window !== "undefined" && Boolean(localStorage.getItem("token"));

      // ดึงข้อมูล category
      const catRes = await api.get<{ data: Category }>(
        `/question-categories/${id}`,
        { useToken },
      );

      if (!catRes.ok || !catRes.data?.data) {
        setError("ไม่พบหมวดหมู่นี้");
        setIsLoading(false);
        return;
      }
      setCategory(catRes.data.data);

      // ดึงโจทย์ตาม category
      const probRes = await api.get<{ data: Problem[] }>(
        `/questions`,
        { params: { category_id: id, status: "1", limit: 50 }, useToken },
      );

      if (probRes.ok && probRes.data?.data) {
        setProblems(probRes.data.data);
      }

      setIsLoading(false);
    };

    void fetchData();
  }, [id]);

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-white/40 text-sm">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error || !category) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60">{error || "ไม่พบหมวดหมู่นี้"}</p>
          <Link
            href="/categories"
            className="text-purple-400 hover:underline mt-4 block"
          >
            ← กลับไปหน้า Categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      <main className="max-w-5xl mx-auto px-6 py-20">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-white/40 text-sm mb-8">
          <Link
            href="/categories"
            className="hover:text-purple-400 transition-colors"
          >
            Categories
          </Link>
          <span>/</span>
          <span className="text-white">{category.name}</span>
        </div>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-3">
            <h1 className="text-4xl font-bold">{category.name}</h1>
          </div>
          <p className="text-white/60">{category.description}</p>
          <p className="text-white/40 text-sm mt-2">{problems.length} โจทย์</p>
        </div>

        {/* Problem List */}
        <div className="flex flex-col gap-3">
          {problems.map((problem, i) => (
            <Link
              key={problem.code}
              href={`/questions/${problem.code}`}
              className="flex flex-col p-5 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-white/10 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-white/30 text-sm w-6">{i + 1}</span>
                  <div>
                    <p className="text-sm text-white/40">{problem.code}</p>
                    <p className="font-medium group-hover:text-purple-400 transition-colors">
                      {problem.title}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-white/40 text-sm">
                    {problem.total_attempts?.toLocaleString()} คนทำ
                  </span>
                  <span
                    className={`text-xs px-3 py-1 rounded-full ${difficultyClass[problem.difficulty] ?? ""}`}
                  >
                    {problem.difficulty}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-white/50 text-sm mt-3 ml-10">
                {problem.description}
              </p>

              {/* Tags */}
              {problem.tags?.length > 0 && (
                <div className="flex gap-2 mt-2 ml-10 flex-wrap">
                  {problem.tags?.map((tag, tagIndex) => (
                    <span
                      key={`${problem.code}-${tagIndex}`}
                      className="text-xs px-2 py-1 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}

          {problems.length === 0 && (
            <p className="text-white/40 text-center py-10">
              ยังไม่มีโจทย์ในหมวดหมู่นี้
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
