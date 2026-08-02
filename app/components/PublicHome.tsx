import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { allCards } from "../data/cards";
import { guides } from "../data/guides";
import { publicReadings } from "../lib/public-content";
import { SiteSearch } from "./SiteSearch";
import { TarotCardVisual } from "./TarotCardVisual";
import { AdSlot } from "./AdSlot";

const heroReading = publicReadings[0];
const heroCards = heroReading.cards.map(({ cardId, orientation }) => ({
  card: allCards.find((card) => card.id === cardId)!,
  orientation,
}));
const heroSteps = heroReading.connection.split(" → ");

export function PublicHome() {
  return (
    <div className="public-home">
      <section className="search-hero" aria-labelledby="search-hero-title">
        <div className="search-hero-copy">
          <div className="search-hero-register" aria-label="서비스 규모">
            <span className="eyebrow">외우지 않는 타로 학습</span>
            <span>78장 · 연습 150개</span>
          </div>
          <h1 id="search-hero-title">
            <span>카드를 찾고,</span>
            <span>근거를 따라 읽어요.</span>
          </h1>
          <p>카드 이름이나 키워드로 뜻을 찾고, 실제 배열에서 그 뜻이 어떻게 한 문장으로 이어지는지 확인하세요.</p>
          <SiteSearch />
          <div className="search-hero-actions" aria-label="바로 시작하기">
            <Link href="/cards">78장 전체 보기 <ArrowRight aria-hidden="true" /></Link>
            <Link href={`/practice/${heroReading.id}`}>첫 연습 시작 <ArrowRight aria-hidden="true" /></Link>
          </div>
        </div>

        <aside className="search-hero-example" aria-label="세 장의 카드를 한 문장으로 연결하는 예시">
          <header>
            <span>세 장을 한 문장으로</span>
            <strong>카드 뜻 사이의 흐름을 읽어보세요</strong>
          </header>
          <div className="search-hero-flow" aria-label={heroReading.connection}>
            {heroCards.map(({ card, orientation }, index) => (
              <div className="search-hero-flow-step" key={card.id}>
                <span className="search-hero-card-number">0{index + 1}</span>
                <TarotCardVisual card={card} orientation={orientation} size="small" />
                <strong>{heroSteps[index]}</strong>
                {index < heroCards.length - 1 ? <ArrowRight className="search-hero-flow-arrow" aria-hidden="true" /> : null}
              </div>
            ))}
          </div>
          <div className="search-hero-connection">
            <span>흐름</span>
            <strong>{heroReading.connection}</strong>
            <p>{heroReading.headline}</p>
          </div>
          <Link className="search-hero-example-link" href={`/readings/${heroReading.id}`}>
            이 조합의 근거 보기 <ArrowRight aria-hidden="true" />
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
