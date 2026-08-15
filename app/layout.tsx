import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./learning.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Voice AI 行业人物图谱",
  description: "沿六层行业路径理解 Voice AI，再进入人物生态位、技术路线、关系证据与研究档案。",
  openGraph: {
    title: "Voice AI 行业人物图谱",
    description: "沿六层行业路径理解 Voice AI，再进入人物生态位、技术路线、关系证据与研究档案。",
  },
  twitter: {
    card: "summary",
    title: "Voice AI 行业人物图谱",
    description: "一张为初入行者制作的 Voice AI 行业与人物学习地图。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
