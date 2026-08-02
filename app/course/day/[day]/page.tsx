import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "../../../components/AppShell";
import { courseDays, getCourseDay } from "../../../data/course";

export const metadata: Metadata = {
  title: "14일 코스 학습",
  robots: { index: false, follow: false },
};

export function generateStaticParams() {
  return courseDays.map((day) => ({ day: String(day.day) }));
}

export default async function CourseDayPage({ params }: { params: Promise<{ day: string }> }) {
  const { day: rawDay } = await params;
  const day = getCourseDay(Number(rawDay));
  if (!day) notFound();

  return (
    <AppShell active="course">
      <article className="course-day-page">
        <nav className="breadcrumbs" aria-label="경로"><Link href="/course">14일 코스</Link><span>/</span><span>{day.day}일차</span></nav>
        <header>
          <span className="eyebrow">DAY {day.day} OF 14</span>
          <h1>{day.day}일차 · {day.title}</h1>
          <p>{day.summary}</p>
        </header>
        <section className="course-day-goal"><span>오늘의 목표</span><strong>{day.goal}</strong></section>
        <section className="course-checklist" aria-labelledby="checklist-title">
          <h2 id="checklist-title">오늘의 체크리스트</h2>
          <ul>{day.checklist.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
        <div className="course-day-actions">
          {day.day > 1 ? <Link className="secondary-button" href={`/course/day/${day.day - 1}`}>이전 날</Link> : <span />}
          <Link className="primary-button" href={`/practice/${day.lessonId}`}>오늘의 실전 학습 시작</Link>
          {day.day < 14 ? <Link className="secondary-button" href={`/course/day/${day.day + 1}`}>다음 날</Link> : <Link className="secondary-button" href="/review">복습하기</Link>}
        </div>
      </article>
    </AppShell>
  );
}
