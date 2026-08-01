import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getCard } from "../data/cards";
import type { Guide } from "../data/guides";
import { LongFormContents } from "./LongFormContents";
import { TarotCardVisual } from "./TarotCardVisual";

export function GuideArticle({ guide }: { guide: Guide }) {
  const relatedCards = guide.relatedCardIds.map(getCard).filter(Boolean);
  return (
    <article className="guide-article">
      <div className="detail-breadcrumb"><Link href="/">홈</Link><span aria-hidden="true">›</span><Link href="/guides">기초 가이드</Link><span aria-hidden="true">›</span><strong>{guide.title}</strong></div>
      <header className="guide-article-header"><span className="eyebrow">BEGINNER GUIDE</span><h1>{guide.title}</h1><p>{guide.lead}</p></header>
      <LongFormContents label={`${guide.title} 목차`} links={guide.sections.map((section) => ({ href: `#${section.id}` as `#${string}`, label: section.heading }))} />
      {guide.sections.map((section, index) => <section className="article-section guide-section" id={section.id} key={section.id}><span className="guide-number">{String(index + 1).padStart(2, "0")}</span><h2>{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.bullets ? <ul>{section.bullets.map((item) => <li key={item}>{item}</li>)}</ul> : null}</section>)}
      <section className="article-section related-cards"><span className="panel-label">CARD BOOK</span><h2>관련 카드로 이어서 보기</h2><div>{relatedCards.map((card) => card ? <Link href={`/cards/${card.id}`} key={card.id}><TarotCardVisual card={card} size="small" /><span><strong>{card.nameKo}</strong><small>{card.coreVerb}</small></span><ArrowRight aria-hidden="true" /></Link> : null)}</div></section>
    </article>
  );
}
