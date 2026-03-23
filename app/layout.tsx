import { SessionGuard } from "@/components/auth/SessionGuard";
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
      <body className="min-h-full flex flex-col">
        <SvgSprite />
        <SessionGuard />
        {children}
      </body>
    </html>
  );
}
