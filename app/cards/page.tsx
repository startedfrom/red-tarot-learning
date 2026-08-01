import type { Metadata } from "next";
import { AppShell } from "../components/AppShell";
import { CardLibrary, type CardFilter } from "../components/CardLibrary";

export const metadata: Metadata = {
  title: "78장 카드 도감",
  description: "메이저와 마이너 78장 타로 카드를 이름, 영문명, 핵심 동사와 키워드로 찾아보세요.",
  alternates: { canonical: "/cards" },
};

const validFilters = new Set<CardFilter>(["all", "major", "wands", "cups", "swords", "pentacles"]);

export default async function CardsPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  const initialFilter = validFilters.has(type as CardFilter) ? (type as CardFilter) : "all";
  return <AppShell active="cards"><CardLibrary initialFilter={initialFilter} /></AppShell>;
}
