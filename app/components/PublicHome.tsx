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
        <div className="search-hero-copy">
          <div className="search-hero-register" aria-label="서비스 규모">
            <span className="eyebrow">타로 카드 도감</span>
            <span>78장 · 연습 150개</span>
          </div>
          <h1 id="search-hero-title">
            <span>카드를 찾고,</span>
            <span>근거를 따라 읽어요.</span>
          </h1>
          <p>카드 이름이나 키워드를 검색하세요. 정·역방향의 뜻부터 배열 속 역할까지 한 번에 이어집니다.</p>
          <SiteSearch />
          <div className="quick-search-links" aria-label="카드 종류 바로가기">
            <Link href="/cards">전체</Link>
            <Link href="/cards?type=major">메이저</Link>
            <Link href="/cards?type=wands">완드</Link>
            <Link href="/cards?type=cups">컵</Link>
            <Link href="/cards?type=swords">소드</Link>
            <Link href="/cards?type=pentacles">펜타클</Link>
          </div>
        </div>

        <aside className="search-hero-index" aria-label="입문자들이 먼저 찾는 카드">
          <header>
            <span>시작 카드</span>
            <strong>입문자들이 먼저 찾는 카드</strong>
          </header>
          <div className="search-hero-deck">
            {popularCards.map((card, index) => (
              <Link href={`/cards/${card.id}`} key={card.id} aria-label={`${card.nameKo} 카드 뜻 보기`}>
                <span className="search-hero-card-number">0{index + 1}</span>
                <TarotCardVisual card={card} size="small" />
                <span className="search-hero-card-name">{card.nameKo}</span>
              </Link>
            ))}
          </div>
          <Link className="search-hero-index-link" href="/cards">
            78장 전체 도감 <ArrowRight aria-hidden="true" />
          </Link>
        </aside>
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
