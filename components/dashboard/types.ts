export type DashboardPayload = {
  test_cases_total: number;
  admins_total: number;
  questions_total: number;
  users_total: number;
  completion_comparison: {
    labels: string[];
    successful_submissions: number;
    unsuccessful_submissions: number;
    values: number[];
  };
  recent_user_activity: Array<{
    user_id: number;
    display_name: string;
    email: string;
    last_submission_at: string;
    total_attempt: number;
    total_finished: number;
    submissions_passed: number;
    submissions_not_passed: number;
  }>;
  top_questions: Array<{
    question_id: number;
    code: string;
    title: string;
    submission_count: number;
  }>;
};

export type DashboardSummaryCard = {
  label: string;
  hint: string;
  value: number;
  iconName: string;
  iconWrap: string;
  glow: string;
};

export type PieRow = { name: string; value: number };
