// Dashboard Type Definitions
// รวมประเภทข้อมูล (TypeScript Interfaces) ที่ใช้ในหน้า Dashboard
// 1. DashboardPayload: ข้อมูลสรุปภาพรวมจาก API หลัก
// 2. CategoryStat: ข้อมูลสถิติตามหมวดหมู่
// 3. QuestionStat: ข้อมูลสถิติตามรายข้อ

// ประเภทข้อมูลหลักของระบบ Dashboard
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

// ข้อมูลสำหรับ Card สรุปผล
export type DashboardSummaryCard = {
  label: string;
  hint: string;
  value: number;
  iconName: string;
  iconWrap: string;
  glow: string;
};

// แถวข้อมูลสำหรับกราฟวงกลม
export type PieRow = { name: string; value: number };

// ข้อมูลสถิติตามหมวดหมู่ (Category Analysis)
export type CategoryStat = {
  categoryId: number | null;
  categoryName: string;
  questionCount: number;
  notDoneCount: number;
  doneCount: number;
  total: number;
};

// ข้อมูลสถิติตามโจทย์ (Question Analysis)
export type QuestionStat = {
  questionId: number;
  code: string;
  title: string;
  notDoneCount: number;
  doneCount: number;
  total: number;
};
