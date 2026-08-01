import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { AppShell } from "../components/AppShell";
import { guides } from "../data/guides";

export const metadata: Metadata = { title: "초보자 타로 가이드", description: "정·역방향, 3장 배열, 좋은 질문 만들기를 근거부터 배우는 무료 타로 입문 가이드입니다.", alternates: { canonical: "/guides" } };
export default function GuidesPage() { return <AppShell><section className="guide-directory"><header><span className="eyebrow">START HERE</span><h1>초보자 타로 가이드</h1><p>카드 뜻을 외우기 전에 읽는 기준부터 익혀보세요.</p></header><div className="guide-directory-grid">{guides.map((guide, index) => <Link href={`/guides/${guide.slug}`} key={guide.slug}><span className="guide-number">0{index + 1}</span><strong>{guide.title}</strong><p>{guide.description}</p><ArrowRight aria-hidden="true" /></Link>)}</div></section></AppShell>; }
