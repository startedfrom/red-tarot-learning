import { ArrowLeft, ArrowRight, BookOpenCheck, Lightbulb } from "lucide-react";
import Link from "next/link";
import { allCards, type TarotCard } from "../data/cards";
import { publicReadings } from "../lib/public-content";
import { FavoriteButton } from "./FavoriteButton";
import { LongFormContents } from "./LongFormContents";
import { SafetyNote } from "./SafetyNote";
import { AdSlot } from "./AdSlot";
import { TarotCardVisual } from "./TarotCardVisual";

const categoryLabels = { love: "연애", money: "재물", health: "건강" } as const;

export function CardDetail({ card }: { card: TarotCard }) {
  const cardIndex = allCards.findIndex((item) => item.id === card.id);
  const previousCard = allCards[(cardIndex - 1 + allCards.length) % allCards.length];
  const nextCard = allCards[(cardIndex + 1) % allCards.length];
  const relatedReadings = publicReadings
    .filter((reading) => reading.cards.some((item) => item.cardId === card.id))
    .slice(0, 3);

  return (
    <article className="card-article">
      <div className="detail-breadcrumb"><Link href="/">홈</Link><span aria-hidden="true">›</span><Link href="/cards">카드 사전</Link><span aria-hidden="true">›</span><strong>{card.nameKo}</strong></div>

      <header className="card-detail-hero">
        <div className="detail-visual-wrap"><TarotCardVisual card={card} size="large" priority /><span className="detail-sticker" aria-hidden="true">{card.visual.glyph}</span></div>
        <div className="detail-heading">
          <span className="eyebrow">{card.arcana === "major" ? "MAJOR ARCANA" : "MINOR ARCANA"} · {card.number}</span>
          <h1>{card.nameKo} 카드 뜻</h1>
          <p className="english-name">{card.nameEn}</p>
          <p className="card-answer">{card.coreMeaning}</p>
          <div className="verb-card"><span>핵심 동사</span><strong>{card.coreVerb}</strong></div>
          <FavoriteButton cardId={card.id} />
        </div>
      </header>

      <LongFormContents label={`${card.nameKo} 카드 설명 목차`} links={[
        { href: "#upright", label: "정방향" },
        { href: "#reversed", label: "역방향" },
        { href: "#categories", label: "분야별" },
        { href: "#symbols", label: "상징" },
        { href: "#mistakes", label: "흔한 오해" },
      ]} />

      <section className="meaning-summary article-section">
        <span className="panel-label">한 문장으로 읽기</span>
        <h2>{card.coreMeaning}</h2>
        <div className="keyword-list">{card.keywords.map((keyword) => <span key={keyword}>{keyword}</span>)}</div>
        <aside className="reading-tip"><Lightbulb aria-hidden="true" /><div><strong>명사보다 동사로 기억해요</strong><p>‘{card.nameKo}’이 나왔다면 ‘{card.coreVerb}’라는 움직임을 배열 위치의 주어에 붙여보세요.</p></div></aside>
      </section>

      <div className="orientation-grid article-section-group">
        <section className="orientation-card" id="upright"><span className="soft-pill">정방향</span><h2>{card.upright.summary}</h2><h3>잘 표현될 때</h3><ul>{card.upright.positive.map((item) => <li key={item}>{item}</li>)}</ul><h3>주의할 점</h3><ul>{card.upright.caution.map((item) => <li key={item}>{item}</li>)}</ul></section>
        <section className="orientation-card reversed-card" id="reversed"><span className="dark-pill">역방향 · {card.reversed.mode}</span><h2>{card.reversed.summary}</h2><h3>다시 볼 가능성</h3><ul>{card.reversed.positive.map((item) => <li key={item}>{item}</li>)}</ul><h3>주의할 점</h3><ul>{card.reversed.caution.map((item) => <li key={item}>{item}</li>)}</ul></section>
      </div>

      <AdSlot placement="card" />

      <section className="article-section" id="categories"><span className="panel-label">질문 분야에 맞춰 읽기</span><h2>분야별 의미</h2><div className="category-article-grid">{Object.entries(categoryLabels).map(([key, label]) => { const category = key as keyof typeof card.categories; return <section key={key}><h3>{`${label}에서 읽기`}</h3><p><strong>정방향</strong> {card.categories[category].upright}</p><p><strong>역방향</strong> {card.categories[category].reversed}</p>{category === "health" ? <SafetyNote /> : null}</section>; })}</div></section>

      <section className="article-section" id="symbols"><span className="panel-label">카드 그림의 단서</span><h2>상징으로 더 깊이 읽기</h2><div className="symbol-grid">{card.symbolism.map((item) => <section key={item.symbol}><span aria-hidden="true">✦</span><h3>{item.symbol}</h3><p>{item.meaning}</p></section>)}</div></section>

      <aside className="mistake-note" id="mistakes"><div><strong>흔한 오해</strong><p>{card.commonMistakes[0]}</p></div></aside>

      {relatedReadings.length ? <section className="article-section related-reading-list"><span className="panel-label">실제 조합에서 확인하기</span><h2>{card.nameKo}이 포함된 조합</h2>{relatedReadings.map((reading) => <Link href={`/readings/${reading.id}`} key={reading.id}><span>{reading.question}</span><strong>{reading.headline}</strong><ArrowRight aria-hidden="true" /></Link>)}</section> : null}

      <div className="card-pagination"><Link href={`/cards/${previousCard.id}`}><ArrowLeft aria-hidden="true" /><span>이전 카드 <strong>{previousCard.nameKo}</strong></span></Link><Link href="/practice/love-three-001" className="practice-promo"><BookOpenCheck aria-hidden="true" /> 배열에서 연습</Link><Link href={`/cards/${nextCard.id}`}><span>다음 카드 <strong>{nextCard.nameKo}</strong></span><ArrowRight aria-hidden="true" /></Link></div>
    </article>
  );
}
