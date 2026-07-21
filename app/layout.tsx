import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "빨강타로 — 외우지 말고 읽는 타로 학습",
    template: "%s | 빨강타로",
  },
  description:
    "카드 의미와 배열 위치를 연결해 스스로 타로를 해석하는 방법을 배워요.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fff8f2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
