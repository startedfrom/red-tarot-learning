"use client";

import { Check, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useProgress } from "../hooks/use-progress";
import { courseDays } from "../data/course";

export function CourseProgress() {
  const { progress } = useProgress();
  const completed = new Set(progress.completedLessonIds);
  const completedCount = courseDays.filter((day) => completed.has(day.lessonId)).length;
  const nextDay = courseDays.find((day) => !completed.has(day.lessonId)) ?? courseDays.at(-1)!;
  const percent = Math.round((completedCount / courseDays.length) * 100);

  return (
    <section className="course-progress" aria-labelledby="course-days-title">
      <div className="course-progress-summary">
        <div>
          <span className="eyebrow">14일 학습 과정</span>
          <h2 id="course-days-title">하루 7~10분씩 따라오세요</h2>
          <p>{completedCount}/14일 완료 · 다음은 {nextDay.day}일차</p>
        </div>
        <strong>{percent}%</strong>
      </div>
      <div className="progress-track" aria-label={`14일 코스 진도 ${percent}%`}>
        <span style={{ width: `${percent}%` }} />
      </div>
      <ol className="course-day-list">
        {courseDays.map((day) => {
          const done = completed.has(day.lessonId);
          return (
            <li key={day.day} className={done ? "is-complete" : ""}>
              <Link href={`/course/day/${day.day}`}>
                <span className="course-day-number">{done ? <Check aria-hidden="true" /> : day.day}</span>
                <span><small>{day.day}일차</small><strong>{day.title}</strong><p>{day.summary}</p></span>
                <ChevronRight aria-hidden="true" />
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
