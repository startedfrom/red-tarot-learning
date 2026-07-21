import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";

const title = "빨강타로 — 외우지 말고 읽는 타로 학습";
const description =
  "카드 의미와 배열 위치를 연결해 스스로 타로를 해석하는 방법을 배워요.";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");

  return {
    metadataBase: new URL(`${protocol}://${host}`),
    title: {
      default: title,
      template: "%s | 빨강타로",
    },
    description,
    openGraph: {
      type: "website",
      locale: "ko_KR",
      title,
      description,
      siteName: "빨강타로",
      images: [
        {
          url: "/og.png",
          width: 1200,
          height: 630,
          alt: "빨강타로 — 외우지 말고, 읽는 법을 배우세요",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og.png"],
    },
  };
}

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
