"use client";

import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookOpenCheck,
  Heart,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  majorArcana,
  type Category,
  type TarotCard,
} from "../data/cards";
import {
  safeReadProgress,
  safeWriteProgress,
  toggleFavorite,
} from "../lib/progress";
import { SafetyNote } from "./SafetyNote";
import { TarotCardVisual } from "./TarotCardVisual";

const tabs = ["핵심 의미", "정·역방향", "분야별", "상징"] as const;
const categories: { id: Category; label: string }[] = [
  { id: "love", label: "연애" },
  { id: "money", label: "재물" },
  { id: "health", label: "건강" },
];

export function CardDetail({ card }: { card: TarotCard }) {
  const [activeTab, setActiveTab] = useState(0);
  const [category, setCategory] = useState<Category>("love");
  const [favorite, setFavorite] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const cardIndex = majorArcana.findIndex((item) => item.id === card.id);
  const previousCard =
    majorArcana[(cardIndex - 1 + majorArcana.length) % majorArcana.length];
  const nextCard = majorArcana[(cardIndex + 1) % majorArcana.length];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const progress = safeReadProgress(window.localStorage);
        setFavorite(progress.favoriteCardIds.includes(card.id));
      } catch {
        setSaveMessage("이 브라우저에서는 즐겨찾기를 저장할 수 없어요.");
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [card.id]);

  function handleFavorite() {
    let storage: Storage | undefined;
    try {
      storage = window.localStorage;
    } catch {
      setSaveMessage("이 브라우저에서는 즐겨찾기를 저장할 수 없어요.");
      return;
    }

    const current = safeReadProgress(storage);
    const next = toggleFavorite(current, card.id);
    const saved = safeWriteProgress(storage, next);
    setFavorite(next.favoriteCardIds.includes(card.id));
    setSaveMessage(saved ? "즐겨찾기를 업데이트했어요." : "즐겨찾기를 저장하지 못했어요.");
  }

  function handleTabKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    let nextIndex = activeTab;

    if (event.key === "ArrowRight") nextIndex = (activeTab + 1) % tabs.length;
    else if (event.key === "ArrowLeft")
      nextIndex = (activeTab - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = tabs.length - 1;
    else return;

    event.preventDefault();
    setActiveTab(nextIndex);
    tabRefs.current[nextIndex]?.focus();
  }

  return (
    <article className="card-detail">
      <div className="detail-breadcrumb">
        <Link href="/">홈</Link>
        <span aria-hidden="true">›</span>
        <span>메이저 아르카나</span>
        <span aria-hidden="true">›</span>
        <strong>{card.nameKo}</strong>
      </div>

      <div className="card-detail-hero">
        <div className="detail-visual-wrap">
          <TarotCardVisual card={card} size="large" priority />
          <span className="detail-sticker" aria-hidden="true">
            {card.visual.glyph}
          </span>
        </div>
        <div className="detail-heading">
          <span className="eyebrow">MAJOR ARCANA · {card.number}</span>
          <h1>{card.nameKo}</h1>
          <p className="english-name">{card.nameEn}</p>
          <div className="verb-card">
            <span>이 카드의 중심 동사</span>
            <strong>{card.coreVerb}</strong>
          </div>
          <button
            className={`favorite-button ${favorite ? "is-favorite" : ""}`}
            type="button"
            onClick={handleFavorite}
            aria-pressed={favorite}
          >
            <Heart aria-hidden="true" />
            {favorite ? "찜한 카드" : "카드 찜하기"}
          </button>
          <p className="save-message" role="status" aria-live="polite">
            {saveMessage}
          </p>
        </div>
      </div>

      <section className="detail-learning-card">
        <div className="detail-tabs" role="tablist" aria-label="카드 해설">
          {tabs.map((tab, index) => (
            <button
              key={tab}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              type="button"
              role="tab"
              id={`card-tab-${index}`}
              aria-controls={`card-panel-${index}`}
              aria-selected={activeTab === index}
              tabIndex={activeTab === index ? 0 : -1}
              onClick={() => setActiveTab(index)}
              onKeyDown={handleTabKeyDown}
            >
              {tab}
            </button>
          ))}
        </div>

        <div
          className="detail-panel"
          role="tabpanel"
          id={`card-panel-${activeTab}`}
          aria-labelledby={`card-tab-${activeTab}`}
          tabIndex={0}
        >
          {activeTab === 0 ? (
            <div className="meaning-layout">
              <div>
                <span className="panel-label">한 문장으로 읽기</span>
                <h2>{card.coreMeaning}</h2>
                <div className="keyword-list">
                  {card.keywords.map((keyword) => (
                    <span key={keyword}>{keyword}</span>
                  ))}
                </div>
              </div>
              <aside className="reading-tip">
                <Lightbulb aria-hidden="true" />
                <div>
                  <strong>명사보다 동사로 기억해요</strong>
                  <p>
                    &lsquo;{card.nameKo}&rsquo;이 나왔다면 먼저 &lsquo;
                    {card.coreVerb}&rsquo;라는 움직임을 배열 위치의 주어에
                    붙여보세요.
                  </p>
                </div>
              </aside>
            </div>
          ) : null}

          {activeTab === 1 ? (
            <div className="orientation-grid">
              <section className="orientation-card">
                <div className="orientation-title">
                  <TarotCardVisual card={card} size="small" />
                  <div>
                    <span className="soft-pill">정방향</span>
                    <h2>{card.upright.summary}</h2>
                  </div>
                </div>
                <h3>잘 표현될 때</h3>
                <ul>
                  {card.upright.positive.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <h3>주의할 점</h3>
                <ul>
                  {card.upright.caution.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
              <section className="orientation-card reversed-card">
                <div className="orientation-title">
                  <TarotCardVisual
                    card={card}
                    orientation="reversed"
                    size="small"
                  />
                  <div>
                    <span className="dark-pill">역방향 · {card.reversed.mode}</span>
                    <h2>{card.reversed.summary}</h2>
                  </div>
                </div>
                <h3>다시 볼 가능성</h3>
                <ul>
                  {card.reversed.positive.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <h3>주의할 점</h3>
                <ul>
                  {card.reversed.caution.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            </div>
          ) : null}

          {activeTab === 2 ? (
            <div>
              <div className="category-switch" aria-label="해석 분야">
                {categories.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={category === item.id ? "is-active" : ""}
                    onClick={() => setCategory(item.id)}
                    aria-pressed={category === item.id}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="category-meaning-grid">
                <section>
                  <span className="soft-pill">정방향</span>
                  <h2>{card.categories[category].upright}</h2>
                </section>
                <section>
                  <span className="dark-pill">역방향</span>
                  <h2>{card.categories[category].reversed}</h2>
                </section>
              </div>
              {category === "health" ? <SafetyNote /> : null}
            </div>
          ) : null}

          {activeTab === 3 ? (
            <div className="symbol-layout">
              <div className="symbol-grid">
                {card.symbolism.map((item) => (
                  <section key={item.symbol}>
                    <span aria-hidden="true">✦</span>
                    <h2>{item.symbol}</h2>
                    <p>{item.meaning}</p>
                  </section>
                ))}
              </div>
              <aside className="mistake-note">
                <Bookmark aria-hidden="true" />
                <div>
                  <strong>흔한 오해</strong>
                  <p>{card.commonMistakes[0]}</p>
                </div>
              </aside>
            </div>
          ) : null}
        </div>
      </section>

      <div className="card-pagination">
        <Link href={`/cards/${previousCard.id}`}>
          <ArrowLeft aria-hidden="true" />
          <span>
            이전 카드 <strong>{previousCard.nameKo}</strong>
          </span>
        </Link>
        <Link href={`/practice/love-three-001`} className="practice-promo">
          <BookOpenCheck aria-hidden="true" />
          배열에서 연습
        </Link>
        <Link href={`/cards/${nextCard.id}`}>
          <span>
            다음 카드 <strong>{nextCard.nameKo}</strong>
          </span>
          <ArrowRight aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
