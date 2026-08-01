import { getSiteUrl } from "./site-url";

type Breadcrumb = { name: string; path: string };

export function createArticleStructuredData({
  headline,
  description,
  path,
  breadcrumbs,
}: {
  headline: string;
  description: string;
  path: string;
  breadcrumbs: Breadcrumb[];
}) {
  const base = getSiteUrl();
  return {
    article: {
      "@context": "https://schema.org",
      "@type": "Article",
      headline,
      description,
      inLanguage: "ko-KR",
      mainEntityOfPage: `${base}${path}`,
      publisher: { "@type": "Organization", name: "빨강타로" },
    },
    breadcrumb: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: `${base}${item.path}`,
      })),
    },
  };
}
