import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "무임승차 방지",
  description: "팀 프로젝트 기여도 AI 분석 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
