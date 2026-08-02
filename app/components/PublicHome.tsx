import { ArrowRight } from "lucide-react";
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

      <AdSlot placement="home" />

      <section className="public-section home-guides" aria-labelledby="guide-title">
        <div className="section-heading">
          <div><span className="eyebrow">처음 배우는 순서</span><h2 id="guide-title">세 가지만 먼저 익혀보세요</h2></div>
          <Link href="/guides">가이드 모두 보기 <ArrowRight aria-hidden="true" /></Link>
        </div>
        <div className="home-guide-list">
          {guides.slice(0, 3).map((guide, index) => (
            <Link href={`/guides/${guide.slug}`} key={guide.slug}>
              <span className="guide-number">0{index + 1}</span>
              <strong>{guide.title}</strong>
              <p>{guide.description}</p>
              <ArrowRight aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <section className="public-section home-actions" aria-labelledby="home-actions-title">
        <div className="section-heading">
          <div><span className="eyebrow">읽기와 직접 풀기</span><h2 id="home-actions-title">배운 내용을 바로 써봐요</h2></div>
        </div>
        <div className="home-action-list">
          <Link href={`/readings/${publicReadings[0].id}`}>
            <span className="home-action-index">01</span>
            <span className="home-action-copy">
              <strong>조합 해석 한 편 읽기</strong>
              <span>{publicReadings[0].question}</span>
            </span>
            <span className="home-action-link">해석 보기 <ArrowRight aria-hidden="true" /></span>
          </Link>
          <Link href="/practice/love-three-001">
            <span className="home-action-index">02</span>
            <span className="home-action-copy">
              <strong>내 말로 먼저 풀어보기</strong>
              <span>세 장의 흐름을 적고 카드별 근거와 모범 해설을 차례로 확인하세요.</span>
            </span>
            <span className="home-action-link">첫 연습 시작 <ArrowRight aria-hidden="true" /></span>
          </Link>
        </div>
      </section>
    </div>
  );
}
