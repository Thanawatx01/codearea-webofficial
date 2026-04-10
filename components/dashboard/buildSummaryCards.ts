import type { DashboardPayload, DashboardSummaryCard } from "./types";

export function buildDashboardSummaryCards(
  data: DashboardPayload,
): DashboardSummaryCard[] {
  const done = data.completion_comparison.successful_submissions;
  return [
    {
      label: "จำนวนทดสอบ",
      hint: "เคสทั้งหมดในระบบ",
      value: data.test_cases_total,
      iconName: "cpu",
      iconWrap:
        "from-cyan-500/25 to-cyan-600/5 text-cyan-300 shadow-[0_0_24px_rgba(34,211,238,0.12)]",
      glow: "shadow-[0_0_0_1px_rgba(34,211,238,0.12)]",
    },
    {
      label: "จำนวนคำถาม",
      hint: "โจทย์ที่เผยแพร่",
      value: data.questions_total,
      iconName: "hash",
      iconWrap:
        "from-indigo-500/25 to-indigo-600/5 text-indigo-300 shadow-[0_0_24px_rgba(129,140,248,0.12)]",
      glow: "shadow-[0_0_0_1px_rgba(129,140,248,0.12)]",
    },
    {
      label: "จำนวนแอดมิน",
      hint: "บัญชีผู้ดูแล",
      value: data.admins_total,
      iconName: "shield",
      iconWrap:
        "from-violet-500/25 to-violet-600/5 text-violet-300 shadow-[0_0_24px_rgba(167,139,250,0.12)]",
      glow: "shadow-[0_0_0_1px_rgba(167,139,250,0.12)]",
    },
    {
      label: "จำนวน User",
      hint: "ผู้ใช้ที่ลงทะเบียน",
      value: data.users_total,
      iconName: "users-group",
      iconWrap:
        "from-blue-500/25 to-blue-600/5 text-blue-300 shadow-[0_0_24px_rgba(96,165,250,0.12)]",
      glow: "shadow-[0_0_0_1px_rgba(96,165,250,0.12)]",
    },
    {
      label: "ทำสำเร็จแล้ว",
      hint: "การส่งที่ผ่านเกณฑ์",
      value: done,
      iconName: "check",
      iconWrap:
        "from-emerald-500/25 to-emerald-600/5 text-emerald-300 shadow-[0_0_24px_rgba(52,211,153,0.15)]",
      glow: "shadow-[0_0_0_1px_rgba(52,211,153,0.15)]",
    },
  ];
}
