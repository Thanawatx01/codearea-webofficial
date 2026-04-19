import { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3100/api";

type Question = {
  code: string;
  updated_at?: string;
};

type Category = {
  id: string | number;
  updated_at?: string;
};

/**
 * ดึงข้อมูลโจทย์ทั้งหมดเพื่อสร้าง sitemap สำหรับ dynamic routes
 */
async function fetchQuestions(): Promise<Question[]> {
  try {
    const res = await fetch(`${API_URL}/questions`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error("Sitemap: Failed to fetch questions", error);
    return [];
  }
}

/**
 * ดึงข้อมูลหมวดหมู่ทั้งหมดเพื่อสร้าง sitemap
 */
async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_URL}/question-categories`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error("Sitemap: Failed to fetch categories", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [questions, categories] = await Promise.all([
    fetchQuestions(),
    fetchCategories(),
  ]);

  // 1. Static Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/questions",
    "/categories",
    "/leaderboard",
    "/library",
    "/login",
    "/register",
    "/forgot-password",
  ].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : 0.8,
  }));

  // 2. Dynamic Questions
  const questionRoutes: MetadataRoute.Sitemap = questions.map((q) => ({
    url: `${SITE_URL}/questions/${q.code}`,
    lastModified: q.updated_at ? new Date(q.updated_at) : new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  // 3. Dynamic Categories
  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}/categories/${c.id}`,
    lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...questionRoutes, ...categoryRoutes];
}
