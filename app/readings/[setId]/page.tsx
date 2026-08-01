import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "../../components/AppShell";
import { JsonLd } from "../../components/JsonLd";
import { ReadingArticle } from "../../components/ReadingArticle";
import type { TarotCard } from "../../data/cards";
import { getLessonCard } from "../../data/learning-sets";
import { getPublicReading, PUBLIC_READING_IDS } from "../../lib/public-content";
import { createArticleStructuredData } from "../../lib/structured-data";

type Props = { params: Promise<{ setId: string }> };
export function generateStaticParams() { return PUBLIC_READING_IDS.map((setId) => ({ setId })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { setId } = await params; const reading = getPublicReading(setId); if (!reading) return { title: "조합을 찾지 못했어요", robots: { index: false, follow: false } }; return { title: `${reading.headline} — 타로 3장 조합 해석`, description: reading.fullInterpretation, alternates: { canonical: `/readings/${reading.id}` }, openGraph: { title: reading.headline, description: reading.fullInterpretation, type: "article" } }; }
export default async function ReadingPage({ params }: Props) { const { setId } = await params; const reading = getPublicReading(setId); if (!reading) notFound(); const cards = reading.cards.map((item) => getLessonCard(item.cardId)); if (!cards.every(Boolean)) notFound(); const structured = createArticleStructuredData({ headline: reading.headline, description: reading.fullInterpretation, path: `/readings/${reading.id}`, breadcrumbs: [{ name: "홈", path: "/" }, { name: "조합 예제", path: "/readings" }, { name: reading.headline, path: `/readings/${reading.id}` }] }); return <><JsonLd data={structured.article} /><JsonLd data={structured.breadcrumb} /><AppShell active="readings"><ReadingArticle reading={reading} cards={cards as TarotCard[]} /></AppShell></>; }
