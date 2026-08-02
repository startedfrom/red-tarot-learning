import type { Metadata } from "next";
import { AppShell } from "../components/AppShell";
import { CourseProgress } from "../components/CourseProgress";

export const metadata: Metadata = {
  title: "14일 타로 입문 코스",
  description: "카드 핵심 동사부터 3장 배열 해석까지 하루 7~10분씩 배우는 무료 타로 입문 코스입니다.",
  alternates: { canonical: "/course" },
};

export default function CoursePage() {
  return (
    <AppShell active="course">
      <header className="course-hero">
        <span className="eyebrow">FREE BEGINNER COURSE</span>
        <h1>14일 타로 입문 코스</h1>
        <p>외울 키워드를 늘리는 대신 질문·위치·카드 관계를 근거로 스스로 해석하는 순서를 익혀요.</p>
        <div className="course-facts" aria-label="코스 정보">
          <span><strong>14일</strong> 전체 과정</span>
          <span><strong>7~10분</strong> 하루 학습</span>
          <span><strong>무료</strong> 로그인 선택</span>
        </div>
      </header>
      <CourseProgress />
    </AppShell>
  );
}
