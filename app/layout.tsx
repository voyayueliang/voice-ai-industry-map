import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./learning.css";
import "./research/research.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Frontier Field Atlas · 前沿 AI 行业人物研究引擎",
  description: "帮助带着真实任务进入陌生 AI 领域的人，建立行业结构、发现关键人物、核验关系证据并准备访谈。",
  openGraph: {
    title: "Frontier Field Atlas · 前沿 AI 行业人物研究引擎",
    description: "从行业结构进入人物、关系、证据与访谈准备。Voice AI 是第一份已核验样本。",
  },
  twitter: {
    card: "summary",
    title: "Frontier Field Atlas",
    description: "给带着学习、研究或访谈任务进入陌生 AI 领域的人。",
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
