import type { Metadata } from "next";
import { AppShell } from "./components/AppShell";
import { PublicHome } from "./components/PublicHome";

export const metadata: Metadata = {
  title: "타로 카드 뜻과 조합 해석",
  description: "78장 타로 카드의 정·역방향 의미와 실제 조합을 근거부터 배워보세요.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return <AppShell active="home"><PublicHome /></AppShell>;
}
