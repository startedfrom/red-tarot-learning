import { allCards } from "../data/cards";
import { guides } from "../data/guides";
import { publicReadings } from "./public-content";

export type SearchEntry = {
  id: string;
  kind: "card" | "guide" | "reading";
  label: string;
  description: string;
  href: string;
  searchable: string;
};

const normalize = (value: string) => value.trim().toLocaleLowerCase("ko-KR");

export const searchEntries: SearchEntry[] = [
  ...allCards.map((card) => ({
    id: card.id,
    kind: "card" as const,
    label: card.nameKo,
    description: `${card.nameEn} · ${card.coreVerb}`,
    href: `/cards/${card.id}`,
    searchable: normalize(
      [card.nameKo, card.nameEn, card.coreVerb, card.coreMeaning, ...card.keywords].join(" "),
    ),
  })),
  ...guides.map((guide) => ({
    id: guide.slug,
    kind: "guide" as const,
    label: guide.title,
    description: guide.description,
    href: `/guides/${guide.slug}`,
    searchable: normalize(
      [
        guide.title,
        guide.description,
        guide.lead,
        ...guide.sections.flatMap((section) => [
          section.heading,
          ...section.paragraphs,
          ...(section.bullets ?? []),
        ]),
      ].join(" "),
    ),
  })),
  ...publicReadings.map((reading) => ({
    id: reading.id,
    kind: "reading" as const,
    label: reading.headline,
    description: reading.question,
    href: `/readings/${reading.id}`,
    searchable: normalize(
      [
        reading.question,
        reading.headline,
        reading.connection,
        reading.fullInterpretation,
      ].join(" "),
    ),
  })),
];

export function searchContent(query: string, limit = 8) {
  const keyword = normalize(query);
  if (!keyword) return [];

  return searchEntries
    .filter((entry) => entry.searchable.includes(keyword))
    .sort((left, right) => {
      const leftStarts = normalize(left.label).startsWith(keyword) ? 1 : 0;
      const rightStarts = normalize(right.label).startsWith(keyword) ? 1 : 0;
      return rightStarts - leftStarts || left.label.localeCompare(right.label, "ko");
    })
    .slice(0, limit);
}
