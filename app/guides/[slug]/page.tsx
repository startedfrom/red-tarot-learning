import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "../../components/AppShell";
import { GuideArticle } from "../../components/GuideArticle";
import { JsonLd } from "../../components/JsonLd";
import { getGuide, guides } from "../../data/guides";
import { createArticleStructuredData } from "../../lib/structured-data";

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return guides.map((guide) => ({ slug: guide.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { slug } = await params; const guide = getGuide(slug); if (!guide) return { title: "가이드를 찾지 못했어요", robots: { index: false, follow: false } }; return { title: guide.title, description: guide.description, alternates: { canonical: `/guides/${guide.slug}` }, openGraph: { title: guide.title, description: guide.description, type: "article" } }; }
export default async function GuidePage({ params }: Props) { const { slug } = await params; const guide = getGuide(slug); if (!guide) notFound(); const structured = createArticleStructuredData({ headline: guide.title, description: guide.description, path: `/guides/${guide.slug}`, breadcrumbs: [{ name: "홈", path: "/" }, { name: "기초 가이드", path: "/guides" }, { name: guide.title, path: `/guides/${guide.slug}` }] }); return <><JsonLd data={structured.article} /><JsonLd data={structured.breadcrumb} /><AppShell><GuideArticle guide={guide} /></AppShell></>; }
