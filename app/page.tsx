import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "./components/AppShell";
import { TarotCardVisual } from "./components/TarotCardVisual";
import { getCard } from "./data/cards";

export const metadata: Metadata = {
  title: "오늘의 학습",
};

export default function HomePage() {
  const card = getCard("the-lovers");

  return (
    <AppShell active="home">
      <section className="shell-preview">
        <div>
          <span className="eyebrow">DAY 1 · 오늘도 한 장!</span>
          <h1>
            오늘은 &lsquo;선택&rsquo;을
            <br /> 배워봐요.
          </h1>
          <p>카드 뜻을 외우기보다 연결하는 연습을 시작해요.</p>
          <Link className="primary-button" href="/practice/love-three-001">
            7분 학습 시작
          </Link>
        </div>
        {card ? <TarotCardVisual card={card} size="large" priority /> : null}
      </section>
    </AppShell>
  );
}
