import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "../../components/AppShell";
import { GuideArticle } from "../../components/GuideArticle";
import { getGuide, guides } from "../../data/guides";

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return guides.map((guide) => ({ slug: guide.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { slug } = await params; const guide = getGuide(slug); if (!guide) return { title: "가이드를 찾지 못했어요", robots: { index: false, follow: false } }; return { title: guide.title, description: guide.description, alternates: { canonical: `/guides/${guide.slug}` }, openGraph: { title: guide.title, description: guide.description, type: "article" } }; }
export default async function GuidePage({ params }: Props) { const { slug } = await params; const guide = getGuide(slug); if (!guide) notFound(); return <AppShell><GuideArticle guide={guide} /></AppShell>; }
