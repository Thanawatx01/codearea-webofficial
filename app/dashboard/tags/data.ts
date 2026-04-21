export type TagItem = {
  id: string | number;
  name: string;
  questionCount: number;
  created_at?: string;
  updated_at?: string;
  created_by_name?: string;
  updated_by_name?: string;
};

// Start with empty array so UI waits for API data
export const initialTags: TagItem[] = [];
