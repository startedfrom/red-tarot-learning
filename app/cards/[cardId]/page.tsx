import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "../../components/AppShell";
import { CardDetail } from "../../components/CardDetail";
import { JsonLd } from "../../components/JsonLd";
import { allCards, getCard } from "../../data/cards";
import { createArticleStructuredData } from "../../lib/structured-data";

type Props = { params: Promise<{ cardId: string }> };

export function generateStaticParams() {
  return allCards.map((card) => ({ cardId: card.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cardId } = await params;
  const card = getCard(cardId);
  if (!card) return { title: "카드를 찾지 못했어요", robots: { index: false, follow: false } };

  const title = `${card.nameKo} 카드 뜻 — 정방향·역방향·분야별 해석`;
  const description = `${card.nameKo}(${card.nameEn})의 핵심 동사 ${card.coreVerb}, 정방향과 역방향, 연애·재물·건강 의미를 근거부터 알아보세요.`;
  return { title, description, alternates: { canonical: `/cards/${card.id}` }, openGraph: { title, description, type: "article" } };
}

export default async function CardPage({ params }: Props) {
  const { cardId } = await params;
  const card = getCard(cardId);
  if (!card) notFound();
  const structured = createArticleStructuredData({
    headline: `${card.nameKo} 카드 뜻`,
    description: card.coreMeaning,
    path: `/cards/${card.id}`,
    breadcrumbs: [
      { name: "홈", path: "/" },
      { name: "카드 사전", path: "/cards" },
      { name: card.nameKo, path: `/cards/${card.id}` },
    ],
  });
  return <><JsonLd data={structured.article} /><JsonLd data={structured.breadcrumb} /><AppShell active="cards"><CardDetail card={card} /></AppShell></>;
}
