import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "互联网的诞生 · History Field Demo",
  description: "用时间线、人物与机构关系、史料层级和争议解释，理解互联网为什么不是某一个人的发明。",
  openGraph: {
    title: "互联网的诞生 · History Field Demo",
    description: "一份为历史学习者制作的可交互研究样本。",
  },
  twitter: {
    card: "summary",
    title: "互联网的诞生 · History Field Demo",
    description: "从人物、机构、事件、史料和争议进入一段技术史。",
  },
};

export default function HistoryLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
