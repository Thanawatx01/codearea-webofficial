import { LayoutWrapper } from "@/components/LayoutWrapper";
import { SessionGuard } from "@/components/auth/SessionGuard";
import { LogoutProvider } from "@/components/auth/LogoutProvider";
import { SvgSprite } from "@/components/icons/SvgSprite";
import type { Metadata } from "next";
import { Inter, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-thai",
  subsets: ["thai"],
  display: "swap",
});

const appName =
  process.env.app_name ?? process.env.NEXT_PUBLIC_APP_NAME ?? "CodeArea";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const description = `${appName} คือแพลตฟอร์มฝึกทักษะการเขียนโปรแกรมแนว LeetCode สำหรับผู้เรียนและผู้เตรียมสัมภาษณ์งาน พร้อมระบบหลังบ้านสำหรับบริหารโจทย์ แท็ก ประเภท สถิติ และข้อมูลผู้ใช้งานอย่างเป็นระบบ`;
const keywords = [
  "CodeArea",
  "competitive programming",
  "coding challenge",
  "algorithm practice",
  "data structures",
  "LeetCode Thailand",
  "ฝึกเขียนโปรแกรม",
  "ฝึกอัลกอริทึม",
  "โจทย์เขียนโปรแกรม",
  "เตรียมสัมภาษณ์โปรแกรมเมอร์",
  "ระบบจัดการโจทย์",
  "online judge",
];

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: appName,
  generator: "Next.js",
  category: "technology",
  classification: "Education",
  referrer: "origin-when-cross-origin",
  keywords,
  authors: [{ name: appName }],
  creator: appName,
  publisher: appName,
  title: {
    default: `${appName} - แพลตฟอร์มฝึกทำโจทย์และระบบจัดการหลังบ้าน`,
    template: `%s | ${appName}`,
  },
  description,
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: appName,
    title: `${appName} - แพลตฟอร์มฝึกทำโจทย์และระบบจัดการหลังบ้าน`,
    description,
    locale: "th_TH",
    images: [
      {
        url: "/icon.svg",
        width: 64,
        height: 64,
        alt: `${appName} logo`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${appName} - แพลตฟอร์มฝึกทำโจทย์และระบบจัดการหลังบ้าน`,
    description,
    images: ["/icon.svg"],
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${inter.variable} ${notoSansThai.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black">
        <SvgSprite />
        <SessionGuard />
        <div className="relative min-h-screen overflow-x-hidden text-white">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.25)_0,transparent_45%)]" />
            <div className="absolute -left-24 top-[-6%] h-[280px] w-[280px] rounded-full bg-violet-700/30 blur-3xl sm:-left-28 sm:h-[340px] sm:w-[340px] lg:-left-44 lg:h-[600px] lg:w-[600px]" />
            <div className="absolute -right-20 top-[8%] h-[260px] w-[260px] rounded-full bg-blue-600/25 blur-3xl sm:-right-24 sm:h-[320px] sm:w-[320px] lg:-right-[120px] lg:h-[500px] lg:w-[500px]" />
            <div className="absolute -left-24 top-[42%] h-[280px] w-[280px] rounded-full bg-indigo-700/20 blur-3xl sm:-left-28 sm:h-[340px] sm:w-[340px] lg:-left-44 lg:h-[560px] lg:w-[560px]" />
            <div className="absolute -right-20 top-[64%] h-[260px] w-[240px] rounded-full bg-violet-700/25 blur-3xl sm:-right-24 sm:h-[320px] sm:w-[300px] lg:-right-[120px] lg:h-[500px] lg:w-[500px]" />
            <div className="absolute -left-24 bottom-[-8%] h-[280px] w-[280px] rounded-full bg-indigo-700/20 blur-3xl sm:-left-28 sm:h-[340px] sm:w-[340px] lg:-left-44 lg:h-[560px] lg:w-[560px]" />
          </div>
          <div className="relative z-10">
            <LogoutProvider>
              <LayoutWrapper>{children}</LayoutWrapper>
            </LogoutProvider>
          </div>
        </div>
      </body>
    </html>
  );
}
