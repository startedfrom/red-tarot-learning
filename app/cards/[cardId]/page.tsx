import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "../../components/AppShell";
import { CardDetail } from "../../components/CardDetail";
import { getCard } from "../../data/cards";

export const metadata: Metadata = {
  title: "카드 상세",
};

export default async function CardPage({
  params,
}: {
  params: Promise<{ cardId: string }>;
}) {
  const { cardId } = await params;
  const card = getCard(cardId);

  if (!card) {
    return (
      <AppShell active="cards">
        <section className="empty-state">
          <span aria-hidden="true">?</span>
          <h1>카드를 찾지 못했어요</h1>
          <p>주소가 바뀌었거나 아직 준비되지 않은 카드예요.</p>
          <Link className="primary-button" href="/cards/the-fool">
            바보 카드부터 보기
          </Link>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell active="cards">
      <CardDetail card={card} />
    </AppShell>
  );
}
