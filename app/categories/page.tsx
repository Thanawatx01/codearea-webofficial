"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Category {
  id: number;
  name: string;
  description: string;
  question_count: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await api.get<{ data: Category[] }>(
        "/question-categories/list",
        { useToken: true },
      );
      if (res.ok && res.data?.data) {
        setCategories(res.data.data);
      }
      setIsLoading(false);
    };
    void fetchCategories();
  }, []);

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

  return (
    <div className="min-h-screen text-white">
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold">ประเภทโจทย์</h1>
          <p className="text-white/60 text-lg">
            สำรวจโจทย์ตามหมวดหมู่และความยาก
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.id}`}
              className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all hover:bg-white/10 cursor-pointer group"
            >
              <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
                {category.name}
              </h3>
              <p className="text-white/60 text-sm mt-2">
                {category.question_count ?? 0} problems
              </p>
              {category.description && (
                <p className="text-white/40 text-xs mt-1 line-clamp-2">
                  {category.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
