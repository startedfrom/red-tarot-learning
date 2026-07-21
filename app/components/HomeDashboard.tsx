"use client";

import {
  Activity,
  ArrowRight,
  BookHeart,
  Check,
  Flame,
  Heart,
  PiggyBank,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { allCards, majorArcana, type Category } from "../data/cards";
import { getLessonCard, learningSets } from "../data/learning-sets";
import {
  defaultProgress,
  safeReadProgress,
  type LearningProgress,
} from "../lib/progress";
import { TarotCardVisual } from "./TarotCardVisual";

const dailyCard = majorArcana.find((card) => card.id === "the-lovers")!;
const firstLesson = learningSets[0];

export function HomeDashboard() {
  const [progress, setProgress] = useState<LearningProgress>(defaultProgress);
  const [storageAvailable, setStorageAvailable] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        setProgress(safeReadProgress(window.localStorage));
      } catch {
        setStorageAvailable(false);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const completedLessons = useMemo(
    () =>
      learningSets.filter((lesson) =>
        progress.completedLessonIds.includes(lesson.id),
      ),
    [progress.completedLessonIds],
  );

  const masteredCardIds = useMemo(() => {
    const cardIds = new Set(allCards.map((card) => card.id));
    return new Set(
      completedLessons
        .flatMap((lesson) => lesson.cards.map((item) => item.cardId))
        .filter((id) => cardIds.has(id)),
    );
  }, [completedLessons]);

  const confusedCards = useMemo(() => {
    const seen = new Set<string>();
    return [...progress.wrongLessonIds]
      .reverse()
      .flatMap((lessonId) => {
        const lesson = learningSets.find((item) => item.id === lessonId);
        return lesson?.cards ?? [];
      })
      .map((item) => getLessonCard(item.cardId))
      .filter((card) => {
        if (!card || seen.has(card.id)) return false;
        seen.add(card.id);
        return true;
      })
      .slice(0, 3);
  }, [progress.wrongLessonIds]);

  const favoriteCards = allCards
    .filter((card) => progress.favoriteCardIds.includes(card.id))
    .slice(0, 3);

  const continueLesson =
    learningSets.find((lesson) => lesson.id === progress.lastLessonId) ??
    firstLesson;
  const categoryProgress = (category: Category) => {
    const total = learningSets.filter((lesson) => lesson.category === category).length;
    const completed = completedLessons.filter((lesson) => lesson.category === category).length;
    return { completed, percent: Math.round((completed / total) * 100) };
  };
  const loveProgress = categoryProgress("love");
  const moneyProgress = categoryProgress("money");
  const healthProgress = categoryProgress("health");
  const masteryPercent = Math.round((masteredCardIds.size / allCards.length) * 100);

  return (
    <div className="home-dashboard">
      {!storageAvailable ? (
        <p className="storage-message" role="status">
          이 브라우저에서는 학습 기록을 저장할 수 없어요. 지금 학습은 계속할
          수 있습니다.
        </p>
      ) : null}

      <section className="home-greeting">
        <div>
          <span className="eyebrow">오늘도 한 장, 천천히!</span>
          <h1>
            오늘은 &lsquo;선택&rsquo;을
            <br /> 배워봐요.
          </h1>
          <p>78장 카드 · 연애·재물·건강 150세트를 연결해 읽어요.</p>
        </div>
        <div className="streak-chip">
          <Flame aria-hidden="true" />
          <span>
            연속 학습 <strong>{progress.streak}일</strong>
          </span>
        </div>
      </section>

      <section className="daily-study-card" aria-labelledby="daily-title">
        <div className="daily-card-visual">
          <TarotCardVisual card={dailyCard} size="large" priority />
          <span className="floating-sticker" aria-hidden="true">
            ✦
          </span>
        </div>
        <div className="daily-card-copy">
          <span className="soft-pill">오늘의 카드</span>
          <h2 id="daily-title">연인</h2>
          <p className="daily-verb">선택한다 · 관계를 맺는다</p>
          <p>
            연인은 끌림만 뜻하지 않아요. 중요한 관계 앞에서 무엇을 선택할지
            함께 살펴봐요.
          </p>
          <div className="button-row">
            <Link
              className="primary-button"
              href={`/practice/${firstLesson.id}`}
            >
              7분 학습 시작 <ArrowRight aria-hidden="true" />
            </Link>
            <Link className="secondary-button" href="/cards/the-lovers">
              카드 먼저 보기
            </Link>
          </div>
        </div>
      </section>

      <section className="home-section" aria-labelledby="garden-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">LEARNING GARDEN</span>
            <h2 id="garden-title">나의 학습 정원</h2>
          </div>
          <div className="mastery-chip">
            카드 숙련도 <strong>{masteryPercent}%</strong>
          </div>
        </div>

        <div className="subject-grid">
          <article className="subject-card subject-love">
            <div className="subject-icon">
              <Heart aria-hidden="true" />
            </div>
            <span>연애</span>
            <strong>{loveProgress.percent}%</strong>
            <div className="progress-track" aria-label={`연애 진도 ${loveProgress.percent}%`}>
              <span style={{ width: `${loveProgress.percent}%` }} />
            </div>
            <small>{loveProgress.completed}/50 세트 완료</small>
          </article>
          <Link className="subject-card subject-money" href="/practice/money-one-001">
            <div className="subject-icon">
              <PiggyBank aria-hidden="true" />
            </div>
            <span>재물</span>
            <strong>{moneyProgress.percent}%</strong>
            <div className="progress-track" aria-label={`재물 진도 ${moneyProgress.percent}%`}>
              <span style={{ width: `${moneyProgress.percent}%` }} />
            </div>
            <small>{moneyProgress.completed}/50 세트 완료</small>
          </Link>
          <Link className="subject-card subject-health" href="/practice/health-one-001">
            <div className="subject-icon">
              <Activity aria-hidden="true" />
            </div>
            <span>건강</span>
            <strong>{healthProgress.percent}%</strong>
            <div className="progress-track" aria-label={`건강 진도 ${healthProgress.percent}%`}>
              <span style={{ width: `${healthProgress.percent}%` }} />
            </div>
            <small>{healthProgress.completed}/50 세트 완료</small>
          </Link>
        </div>
      </section>

      <section className="home-section continue-section" aria-labelledby="continue-title">
        <div className="continue-icon" aria-hidden="true">
          <Sparkles />
        </div>
        <div>
          <span className="eyebrow">이어서 학습하기</span>
          <h2 id="continue-title">{continueLesson.headline}</h2>
          <p>{continueLesson.connection}</p>
        </div>
        <Link
          className="circle-link"
          href={`/practice/${continueLesson.id}`}
          aria-label="이어서 학습하기"
        >
          <ArrowRight aria-hidden="true" />
        </Link>
      </section>

      <section className="home-section" id="review" aria-labelledby="review-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">REVIEW POCKET</span>
            <h2 id="review-title">최근 헷갈린 카드</h2>
          </div>
          {confusedCards.length ? (
            <span className="count-badge">{confusedCards.length}장</span>
          ) : null}
        </div>

        {confusedCards.length ? (
          <div className="mini-card-list">
            {confusedCards.map((card) => (
              <Link key={card!.id} href={`/cards/${card!.id}`}>
                <TarotCardVisual card={card!} size="small" />
                <span>{card!.nameKo}</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-pocket">
            <span className="empty-pocket-icon" aria-hidden="true">
              <Check />
            </span>
            <div>
              <strong>아직 헷갈린 카드가 없어요!</strong>
              <p>퀴즈에서 놓친 카드는 여기에 차곡차곡 모아드릴게요.</p>
            </div>
          </div>
        )}
      </section>

      <section className="home-section favorites-section" aria-labelledby="favorite-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">MY CARD BOOK</span>
            <h2 id="favorite-title">내가 찜한 카드</h2>
          </div>
          <BookHeart aria-hidden="true" />
        </div>
        {favoriteCards.length ? (
          <div className="favorite-links">
            {favoriteCards.map((card) => (
              <Link href={`/cards/${card.id}`} key={card.id}>
                <span aria-hidden="true">{card.visual.glyph}</span>
                {card.nameKo}
              </Link>
            ))}
          </div>
        ) : (
          <p className="favorites-empty">
            카드 상세의 하트를 누르면 좋아하는 카드를 모을 수 있어요.
          </p>
        )}
      </section>
    </div>
  );
}
