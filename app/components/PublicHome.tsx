import { ArrowRight, BookOpenCheck, Compass, Sparkles } from "lucide-react";
import Link from "next/link";
import { allCards } from "../data/cards";
import { guides } from "../data/guides";
import { publicReadings } from "../lib/public-content";
import { SiteSearch } from "./SiteSearch";
import { TarotCardVisual } from "./TarotCardVisual";
import { AdSlot } from "./AdSlot";

const popularCardIds = ["the-lovers", "death", "the-tower"];
const popularCards = popularCardIds.map((id) => allCards.find((card) => card.id === id)!);

export function PublicHome() {
  return (
    <div className="public-home">
      <section className="search-hero" aria-labelledby="search-hero-title">
        <span className="eyebrow">78 CARDS · 150 PRACTICE SETS</span>
        <h1 id="search-hero-title">어떤 카드가 궁금하세요?</h1>
        <p>외우지 말고, 카드의 동사와 배열 위치를 연결해서 읽어보세요.</p>
        <SiteSearch />
        <div className="quick-search-links" aria-label="카드 종류 바로가기">
          <Link href="/cards">전체</Link>
          <Link href="/cards?type=major">메이저</Link>
          <Link href="/cards?type=wands">완드</Link>
          <Link href="/cards?type=cups">컵</Link>
          <Link href="/cards?type=swords">소드</Link>
          <Link href="/cards?type=pentacles">펜타클</Link>
        </div>
      </section>

      <section className="public-section" aria-labelledby="popular-cards-title">
        <div className="section-heading">
          <div><span className="eyebrow">POPULAR CARDS</span><h2 id="popular-cards-title">처음엔 이 카드부터</h2></div>
          <Link href="/cards">78장 모두 보기 <ArrowRight aria-hidden="true" /></Link>
        </div>
        <div className="popular-card-grid">
          {popularCards.map((card) => (
            <Link href={`/cards/${card.id}`} key={card.id}>
              <TarotCardVisual card={card} size="small" />
              <span><strong>{card.nameKo}</strong><small>{card.coreVerb}</small></span>
            </Link>
          ))}
        </div>
      </section>

      <AdSlot placement="home" />

      <section className="public-section" aria-labelledby="guide-title">
        <div className="section-heading">
          <div><span className="eyebrow">BEGINNER GUIDES</span><h2 id="guide-title">초보자 인기 가이드</h2></div>
          <Compass aria-hidden="true" />
        </div>
        <div className="guide-preview-grid">
          {guides.map((guide, index) => (
            <Link href={`/guides/${guide.slug}`} key={guide.slug}>
              <span className="guide-number">0{index + 1}</span>
              <strong>{guide.title}</strong>
              <p>{guide.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="public-section reading-preview" aria-labelledby="reading-title">
        <div><span className="eyebrow">READING EXAMPLES</span><h2 id="reading-title">카드를 함께 읽어봐요</h2><p>{publicReadings[0].question}</p></div>
        <Link className="primary-button" href={`/readings/${publicReadings[0].id}`}>조합 해석 보기 <ArrowRight aria-hidden="true" /></Link>
      </section>

      <section className="public-section course-preview" aria-labelledby="study-title">
        <div className="course-preview-icon"><Sparkles aria-hidden="true" /></div>
        <div><span className="eyebrow">FREE PRACTICE</span><h2 id="study-title">직접 읽어보면 더 빨리 배워요</h2><p>먼저 내 말로 해석하고 카드별 근거와 모범 해설을 차례로 확인하세요.</p></div>
        <Link className="secondary-button" href="/practice/love-three-001"><BookOpenCheck aria-hidden="true" /> 첫 연습 시작</Link>
      </section>
    </div>
  );
}
