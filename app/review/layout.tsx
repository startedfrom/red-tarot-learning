import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "오답과 복습",
  robots: { index: false, follow: false },
};

export default function ReviewLayout({ children }: { children: React.ReactNode }) {
  return children;
}
