export type ProblemRow = {
  code: string;
  category_name: string | null;
  title: string;
  description: string | null;
  constraints: string | null;
  solution: string | null;
  uri: string | null;
  difficulty: string | number | null;
  expected_complexity: string | null;
  time_limit: number | null;
  memory_limit: number | null;
  status: boolean;
  tags: string[];
};

export const getDifficultyStyle = (difficulty: string | number | null) => {
  const normalized = String(difficulty ?? "");
  const key = normalized.toLowerCase();
  if (key.includes("1") || difficulty === "ง่าย") {
    return {
      label: "ง่าย",
      color: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    };
  }
  if (key.includes("2") || difficulty === "ปานกลาง") {
    return {
      label: "ปานกลาง",
      color: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    };
  }
  if (key.includes("3") || difficulty === "ยาก") {
    return {
      label: "ยาก",
      color: "bg-red-500/10 text-red-400 border border-red-500/20",
    };
  }
  return {
    label: normalized || "-",
    color: "bg-white/10 text-white/70 border border-white/20",
  };
};
