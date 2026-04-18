export type ProblemTypeItem = {
  id: string | number;
  name: string;
  description: string;
  questionCount: number;
};

// Start with empty array so UI waits for API data
export const initialProblemTypes: ProblemTypeItem[] = [];
