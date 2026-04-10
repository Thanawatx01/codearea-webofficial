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

const categoryIcons: Record<string, string> = {
  Arrays: "📊", "Linked Lists": "🔗", Trees: "🌳",
  Graphs: "🕸️", "Dynamic Programming": "🧠",
  Strings: "📝", Sorting: "🔢", Recursion: "🔄",
  algorithm: "⚙️", math: "🔢",
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await api.get<{ data: Category[] }>(
        "/question-categories/list",
        { useToken: true }
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
      <div className="min-h-screen bg-[#0B0B0F] text-white flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-purple-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white">
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold">Problem Categories</h1>
          <p className="text-white/60 text-lg">
            Explore problems by category and difficulty
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.id}`}
              className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all hover:bg-white/10 cursor-pointer group"
            >
              <div className="text-3xl mb-3">
                {categoryIcons[category.name] ?? "📁"}
              </div>
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
