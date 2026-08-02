"use client";

import Link from "next/link";
import { AppShell } from "../components/AppShell";
import { useProgress } from "../hooks/use-progress";
import { learningSets } from "../data/learning-sets";

export default function ReviewPage() {
  const { progress, syncMessage, userId } = useProgress();
  const wrongLessons = [...progress.wrongLessonIds]
    .reverse()
    .map((id) => learningSets.find((lesson) => lesson.id === id))
    .filter((lesson): lesson is NonNullable<typeof lesson> => Boolean(lesson));

  return (
    <AppShell active="review">
      <section className="review-page">
        <header><span className="eyebrow">다시 볼 문제</span><h1>오답과 복습</h1><p>최근 헷갈린 해석부터 다시 풀어보세요. 맞힌 문제는 목록에서 자동으로 빠져요.</p></header>
        <p className="sync-message" role="status">{userId ? syncMessage : "이 기기에 저장 중 · 로그인하면 다른 기기와 동기화돼요."}</p>
        {wrongLessons.length ? (
          <ol>{wrongLessons.map((lesson) => <li key={lesson.id}><div><span>{lesson.category === "love" ? "연애" : lesson.category === "money" ? "재물" : "건강"}</span><strong>{lesson.question}</strong><p>{lesson.headline}</p></div><Link href={`/practice/${lesson.id}`}>다시 풀기</Link></li>)}</ol>
        ) : (
          <div className="empty-state"><span aria-hidden="true">✓</span><h2>지금은 복습할 오답이 없어요</h2><p>새 학습을 완료하면 놓친 문제가 여기에 모여요.</p><Link className="primary-button" href="/course">14일 코스 계속하기</Link></div>
        )}
      </section>
    </AppShell>
  );
}
