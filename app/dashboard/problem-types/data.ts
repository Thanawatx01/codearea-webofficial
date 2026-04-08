// Initial list of problem types with question counts
export type ProblemTypeItem = {
  name: string;
  questionCount: number;
};

export const initialProblemTypes: ProblemTypeItem[] = [
  { name: "Algorithm", questionCount: 0 },
  { name: "Data Structure", questionCount: 0 },
  { name: "Mathematics", questionCount: 0 },
  { name: "String", questionCount: 0 },
  { name: "Dynamic Programming", questionCount: 0 },
  { name: "Graph", questionCount: 0 },
];
