import type { Metadata } from "next";

const appName =
  process.env.app_name ?? process.env.NEXT_PUBLIC_APP_NAME ?? "CodeArea";

export const metadata: Metadata = {
  title: `กระดานผู้นำ | ${appName}`,
  description: "อันดับผู้เล่นตามคะแนนรวมและจำนวนข้อที่ทำได้",
};

export default function LeaderboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
