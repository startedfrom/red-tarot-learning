import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "../components/AppShell";
import { publicReadings } from "../lib/public-content";

export const metadata: Metadata = { title: "타로 조합 해석 예제 30개", description: "연애·재물·건강 3장 배열을 카드별 근거와 위치, 관계로 연결해 읽어보세요.", alternates: { canonical: "/readings" } };
const categoryLabel = { love: "연애", money: "재물", health: "건강" } as const;

export default function ReadingsPage() {
  return <AppShell active="readings"><section className="reading-directory"><header><span className="eyebrow">CURATED READINGS</span><h1>30개 조합 해석 예제</h1><p>결론만 보지 말고 카드 뜻이 한 문장으로 연결되는 근거를 확인해 보세요.</p></header><div className="reading-directory-grid">{publicReadings.map((reading) => <Link href={`/readings/${reading.id}`} key={reading.id}><span>{categoryLabel[reading.category]} · 3장</span><strong>{reading.question}</strong><p>{reading.headline}</p></Link>)}</div></section></AppShell>;
}
