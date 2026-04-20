export type TagItem = {
  id: string | number;
  name: string;
  questionCount: number;
};

// Start with empty array so UI waits for API data
export const initialTags: TagItem[] = [];
