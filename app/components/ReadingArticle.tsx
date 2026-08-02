import { ArrowRight, BookOpenCheck } from "lucide-react";
import Link from "next/link";
import type { TarotCard } from "../data/cards";
import type { LearningSet } from "../data/learning-sets";
import { LongFormContents } from "./LongFormContents";
import { SafetyNote } from "./SafetyNote";
import { TarotCardVisual } from "./TarotCardVisual";
import { AdSlot } from "./AdSlot";

const categoryLabel = { love: "연애", money: "재물", health: "건강" } as const;

export function ReadingArticle({ reading, cards }: { reading: LearningSet; cards: TarotCard[] }) {
  return (
    <article className="reading-article">
      <div className="detail-breadcrumb"><Link href="/">홈</Link><span aria-hidden="true">›</span><Link href="/readings">조합 예제</Link><span aria-hidden="true">›</span><strong>{categoryLabel[reading.category]}</strong></div>
      <header className="reading-article-header"><span className="eyebrow">{categoryLabel[reading.category]} · {cards.length}장 배열</span><h1>{reading.question}</h1><p>{reading.headline}</p></header>
      {reading.category === "health" ? <SafetyNote /> : null}
      <section className={`reading-spread spread-${cards.length}`} aria-label={`${cards.length}장 배열`}>{cards.map((card, index) => <div key={`${card.id}-${index}`}><span>{reading.spread.positions[index]}</span><TarotCardVisual card={card} orientation={reading.cards[index].orientation} size="medium" /><strong>{card.nameKo}</strong><small>{reading.cards[index].orientation === "upright" ? "정방향" : "역방향"}</small></div>)}</section>
      <LongFormContents label="조합 해석 목차" links={[{ href: "#card-evidence", label: "카드별 근거" }, { href: "#position-evidence", label: "위치 해석" }, { href: "#full-reading", label: "종합 해석" }, { href: "#alternatives", label: "대안과 조건" }]} />
      <section className="article-section" id="card-evidence"><span className="panel-label">1단계</span><h2>카드별 핵심 근거</h2><div className="evidence-list">{cards.map((card, index) => <section key={card.id}><span>{index + 1}</span><div><h3>{card.nameKo} · {card.coreVerb}</h3><p>{reading.cardAnalysis[index]}</p></div></section>)}</div></section>
      <section className="article-section" id="position-evidence"><span className="panel-label">2단계</span><h2>위치에 맞춰 읽기</h2><div className="evidence-list">{reading.positionAnalysis.map((analysis, index) => <section key={reading.spread.positions[index]}><span>{index + 1}</span><div><h3>{reading.spread.positions[index]}</h3><p>{analysis}</p></div></section>)}</div></section>
      <section className="article-section reading-conclusion" id="full-reading"><span className="relationship-pill">{reading.relationship}</span><h2>{reading.headline}</h2><p className="connection-line">{reading.connection}</p><p>{reading.fullInterpretation}</p></section>
      <AdSlot placement="article" />
      <section className="article-section alternative-grid" id="alternatives"><div><span>가능한 대안</span><p>{reading.alternatives[0]}</p></div><div><span>달라지는 조건</span><p>{reading.conditions[0]}</p></div><div><span>흔한 오해</span><p>{reading.commonMistakes[0]}</p></div></section>
      <Link className="primary-button reading-practice-link" href={`/practice/${reading.id}`}><BookOpenCheck aria-hidden="true" /> 같은 조합 직접 풀기 <ArrowRight aria-hidden="true" /></Link>
    </article>
  );
}
