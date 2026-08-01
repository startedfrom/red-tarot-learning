import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "../../components/AppShell";
import { PracticeLesson } from "../../components/PracticeLesson";
import {
  getLearningSet,
  getLessonCard,
} from "../../data/learning-sets";
import type { TarotCard } from "../../data/cards";
import { getPublicReading } from "../../lib/public-content";

export async function generateMetadata({ params }: { params: Promise<{ setId: string }> }): Promise<Metadata> {
  const { setId } = await params;
  const lesson = getLearningSet(setId);
  const publicReading = getPublicReading(setId);
  return {
    title: lesson ? `${lesson.question} 연습` : "학습 세트를 찾지 못했어요",
    robots: { index: false, follow: true },
    alternates: publicReading ? { canonical: `/readings/${setId}` } : undefined,
  };
}

export default async function PracticePage({
  params,
}: {
  params: Promise<{ setId: string }>;
}) {
  const { setId } = await params;
  const lesson = getLearningSet(setId);
  const cards = lesson?.cards.map((item) => getLessonCard(item.cardId));
  const completeCards = cards?.every(Boolean)
    ? (cards as TarotCard[])
    : null;

  if (!lesson || !completeCards) {
    return (
      <AppShell active="practice">
        <section className="empty-state">
          <span aria-hidden="true">✦</span>
          <h1>학습 세트를 찾지 못했어요</h1>
          <p>주소가 바뀌었거나 아직 준비 중인 배열이에요.</p>
          <Link className="primary-button" href="/practice/love-three-001">
            첫 학습 시작
          </Link>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell active="practice">
      <PracticeLesson lesson={lesson} cards={completeCards} />
    </AppShell>
  );
}
