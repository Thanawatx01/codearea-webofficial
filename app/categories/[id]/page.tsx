"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

const MOCK_CATEGORIES: Record<string, { name: string; description: string; icon: string }> = {
  "1": { name: "Arrays", description: "โจทย์เกี่ยวกับ Array และการจัดการข้อมูล", icon: "📊" },
  "2": { name: "Linked Lists", description: "โจทย์เกี่ยวกับ Linked List", icon: "🔗" },
  "3": { name: "Trees", description: "โจทย์เกี่ยวกับ Binary Tree และ BST", icon: "🌳" },
  "4": { name: "Graphs", description: "โจทย์เกี่ยวกับ Graph, BFS, DFS", icon: "🕸️" },
  "5": { name: "Dynamic Programming", description: "โจทย์ที่แก้ด้วยเทคนิค DP", icon: "🧠" },
  "6": { name: "Strings", description: "โจทย์เกี่ยวกับการจัดการ String", icon: "📝" },
  "7": { name: "Sorting", description: "โจทย์เกี่ยวกับการเรียงลำดับ", icon: "🔢" },
  "8": { name: "Recursion", description: "โจทย์ที่แก้ด้วย Recursion", icon: "🔄" },
};

const MOCK_PROBLEMS_BY_CATEGORY: Record<string, {
  id: number;
  code: string;
  title: string;
  description: string;
  difficulty: string;
  totalAttempts: number;
  tags: string[];
}[]> = {
  "1": [
    { id: 1, code: "Q001", title: "Two Sum", description: "หา index ของ 2 ตัวเลขใน array ที่บวกกันแล้วได้ target", difficulty: "Easy", totalAttempts: 1240, tags: ["Array", "Hash Table"] },
    { id: 2, code: "Q002", title: "Best Time to Buy and Sell Stock", description: "หาวันที่ควรซื้อและขายหุ้นเพื่อกำไรสูงสุด", difficulty: "Easy", totalAttempts: 980, tags: ["Array", "Greedy"] },
    { id: 3, code: "Q003", title: "Maximum Subarray", description: "หา subarray ที่มีผลรวมมากที่สุด", difficulty: "Medium", totalAttempts: 750, tags: ["Array", "DP"] },
  ],
  "2": [
    { id: 4, code: "Q004", title: "Reverse Linked List", description: "กลับทิศทางของ Linked List", difficulty: "Easy", totalAttempts: 1100, tags: ["Linked List", "Recursion"] },
    { id: 5, code: "Q005", title: "Merge Two Sorted Lists", description: "รวม Linked List 2 อันที่เรียงลำดับแล้วให้เป็นอันเดียว", difficulty: "Easy", totalAttempts: 870, tags: ["Linked List"] },
  ],
  "3": [
    { id: 6, code: "Q006", title: "Maximum Depth of Binary Tree", description: "หาความลึกสูงสุดของ Binary Tree", difficulty: "Easy", totalAttempts: 950, tags: ["Tree", "DFS", "BFS"] },
    { id: 7, code: "Q007", title: "Validate Binary Search Tree", description: "ตรวจสอบว่า Binary Tree เป็น BST ที่ถูกต้องมั้ย", difficulty: "Medium", totalAttempts: 620, tags: ["Tree", "DFS"] },
  ],
  "4": [
    { id: 8, code: "Q008", title: "Number of Islands", description: "นับจำนวนเกาะใน grid 2D", difficulty: "Medium", totalAttempts: 540, tags: ["Graph", "BFS", "DFS"] },
    { id: 9, code: "Q009", title: "Course Schedule", description: "ตรวจสอบว่าสามารถเรียนครบทุกวิชาได้มั้ยโดยไม่ติด prerequisite วนซ้ำ", difficulty: "Medium", totalAttempts: 410, tags: ["Graph", "Topological Sort"] },
  ],
  "5": [
    { id: 10, code: "Q010", title: "Climbing Stairs", description: "นับจำนวนวิธีที่จะขึ้นบันได n ขั้น ครั้งละ 1 หรือ 2 ขั้น", difficulty: "Easy", totalAttempts: 1300, tags: ["DP", "Math"] },
    { id: 11, code: "Q011", title: "Longest Common Subsequence", description: "หา subsequence ที่ยาวที่สุดที่เหมือนกันใน 2 string", difficulty: "Medium", totalAttempts: 480, tags: ["DP", "String"] },
    { id: 12, code: "Q012", title: "Edit Distance", description: "หาจำนวน operation น้อยสุดในการเปลี่ยน string หนึ่งเป็นอีกอัน", difficulty: "Hard", totalAttempts: 290, tags: ["DP", "String"] },
  ],
  "6": [
    { id: 13, code: "Q013", title: "Valid Anagram", description: "ตรวจสอบว่า 2 string เป็น anagram ของกันมั้ย", difficulty: "Easy", totalAttempts: 1050, tags: ["String", "Hash Table"] },
    { id: 14, code: "Q014", title: "Longest Palindromic Substring", description: "หา substring ที่เป็น palindrome และยาวที่สุด", difficulty: "Medium", totalAttempts: 670, tags: ["String", "DP"] },
  ],
  "7": [
    { id: 15, code: "Q015", title: "Sort Colors", description: "เรียง array ที่มีแค่ 0, 1, 2 โดยไม่ใช้ sort function", difficulty: "Medium", totalAttempts: 720, tags: ["Sorting", "Two Pointers"] },
    { id: 16, code: "Q016", title: "Merge Intervals", description: "รวม interval ที่ซ้อนทับกันให้เหลือน้อยที่สุด", difficulty: "Medium", totalAttempts: 430, tags: ["Sorting", "Array"] },
  ],
  "8": [
    { id: 17, code: "Q017", title: "Fibonacci Number", description: "คำนวณหาค่า Fibonacci ที่ตำแหน่ง n", difficulty: "Easy", totalAttempts: 1500, tags: ["Recursion", "Math", "DP"] },
    { id: 18, code: "Q018", title: "Permutations", description: "หา permutation ทั้งหมดของ array ตัวเลข", difficulty: "Medium", totalAttempts: 390, tags: ["Recursion", "Backtracking"] },
  ],
};

const difficultyClass: Record<string, string> = {
  Easy: "bg-green-500/20 text-green-400 border border-green-500/30",
  Medium: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  Hard: "bg-red-500/20 text-red-400 border border-red-500/30",
};

export default function CategoryDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const cat = MOCK_CATEGORIES[id];
  const problems = MOCK_PROBLEMS_BY_CATEGORY[id] ?? [];

  if (!cat) {
    return (
      <div className="min-h-screen bg-[#0B0B0F] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60">ไม่พบหมวดหมู่นี้</p>
          <Link href="/categories" className="text-purple-400 hover:underline mt-4 block">
            ← กลับไปหน้า Categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white">
      <main className="max-w-5xl mx-auto px-6 py-20">
        <div className="flex items-center gap-2 text-white/40 text-sm mb-8">
          <Link href="/categories" className="hover:text-purple-400 transition-colors">
            Categories
          </Link>
          <span>/</span>
          <span className="text-white">{cat.name}</span>
        </div>

        <div className="mb-10">
          <div className="flex items-center gap-4 mb-3">
            <span className="text-4xl">{cat.icon}</span>
            <h1 className="text-4xl font-bold">{cat.name}</h1>
          </div>
          <p className="text-white/60">{cat.description}</p>
          <p className="text-white/40 text-sm mt-2">{problems.length} โจทย์</p>
        </div>

        <div className="flex flex-col gap-3">
          {problems.map((problem, i) => (
            <Link
              key={problem.id}
              href={`/questions/${problem.code}`}
              className="flex flex-col p-5 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-white/10 transition-all group"
            >
              {/* Row 1: ลำดับ + ชื่อ + badge */}
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
                    {problem.totalAttempts.toLocaleString()} คนทำ
                  </span>
                  <span className={`text-xs px-3 py-1 rounded-full ${difficultyClass[problem.difficulty]}`}>
                    {problem.difficulty}
                  </span>
                </div>
              </div>

              {/* Row 2: Description */}
              <p className="text-white/50 text-sm mt-3 ml-10">
                {problem.description}
              </p>

              {/* Row 3: Tags */}
              <div className="flex gap-2 mt-2 ml-10 flex-wrap">
                {problem.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}

          {problems.length === 0 && (
            <p className="text-white/40 text-center py-10">ยังไม่มีโจทย์ในหมวดหมู่นี้</p>
          )}
        </div>
      </main>
    </div>
  );
}
