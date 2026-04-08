// Initial list of problem types with question counts
export type ProblemTypeItem = {
  id: string | number;
  name: string;
  questionCount: number;
};

export const initialProblemTypes: ProblemTypeItem[] = [
  { id: "1", name: "Algorithm", questionCount: 0 },
  { id: "2", name: "Data Structure", questionCount: 0 },
  { id: "3", name: "Mathematics", questionCount: 0 },
  { id: "4", name: "String", questionCount: 0 },
  { id: "5", name: "Dynamic Programming", questionCount: 0 },
  { id: "6", name: "Graph", questionCount: 0 },
];
