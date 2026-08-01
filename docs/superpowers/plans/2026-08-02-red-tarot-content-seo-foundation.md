# Red Tarot Content & SEO Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the current learning MVP into a polished public content service with a search-first home, indexable card and reading pages, three launch-quality beginner guides, trustworthy information pages, and complete technical SEO.

**Architecture:** Keep tarot cards, learning sets, and guides as typed static source data so public content renders even when user services are unavailable. Add small server-rendered article components and isolate browser-only search and favorite state in focused client components. Expose only an explicit curated reading registry to search engines and keep interactive practice pages out of the index.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5.9, vinext/Cloudflare Workers, Node test runner with `tsx`, CSS, localStorage progress.

---

## Scope boundary

This is the first independently deployable slice of the approved public-service design. It covers the search-content foundation: public home, card articles, 30 curated reading articles, three foundational guides, trust pages, internal navigation, metadata, sitemap, robots, 404 behavior, accessibility, and regression tests.

The following approved systems are separate implementation units and are not changed by this plan: the complete 14-day course, Supabase authentication and cross-device progress synchronization, the remaining nine launch guides, AdSense/CMP/GA4 activation, custom-domain purchase, and production OAuth credentials. The site remains functional with the current local progress store throughout this slice.

## File structure

### New files

- `app/data/guides.ts` — typed, reviewed beginner-guide content.
- `app/lib/public-content.ts` — the sole registry for readings allowed into public search surfaces.
- `app/lib/search.ts` — pure search-index construction and query matching.
- `app/lib/site-url.ts` — canonical production origin resolution.
- `app/lib/structured-data.ts` — Article and breadcrumb JSON-LD builders.
- `app/components/SiteSearch.tsx` — interactive search input and results only.
- `app/components/PublicHome.tsx` — search-first public homepage composition.
- `app/components/FavoriteButton.tsx` — browser-only favorite persistence extracted from card content.
- `app/components/LongFormContents.tsx` — accessible in-page article navigation.
- `app/components/ReadingArticle.tsx` — server-rendered reading explanation.
- `app/components/GuideArticle.tsx` — server-rendered guide explanation.
- `app/components/InfoPage.tsx` — shared layout for trust pages.
- `app/components/JsonLd.tsx` — safe serialization for trusted structured data.
- `app/me/page.tsx` — existing local learning dashboard moved off the public landing page.
- `app/readings/page.tsx` — curated reading directory.
- `app/readings/[setId]/page.tsx` — public reading article route.
- `app/guides/page.tsx` — beginner-guide directory.
- `app/guides/[slug]/page.tsx` — public guide route.
- `app/not-found.tsx` — real 404 recovery view.
- `app/sitemap.ts` — indexable URL inventory.
- `app/robots.ts` — crawler policy and sitemap discovery.
- `app/(info)/about/page.tsx` — service purpose and editorial identity.
- `app/(info)/editorial-policy/page.tsx` — content creation and safety rules.
- `app/(info)/privacy/page.tsx` — accurate phase-one privacy disclosure.
- `app/(info)/terms/page.tsx` — free-service usage terms.
- `app/(info)/disclaimer/page.tsx` — educational-use and safety limits.
- `app/(info)/contact/page.tsx` — operational contact instructions.
- `tests/public-content.test.ts` — guide and curated-reading registry checks.
- `tests/search.test.ts` — deterministic Korean/English search checks.
- `tests/seo.test.ts` — sitemap and robots checks.

### Modified files

- `app/page.tsx` — render the new public homepage.
- `app/components/AppShell.tsx` — public-content navigation and `/me` entry.
- `app/components/CardLibrary.tsx` — accept URL-selected card filters.
- `app/cards/page.tsx` — validate the `type` query and pass the initial card filter.
- `app/components/CardDetail.tsx` — change hidden tabs into a long-form server article.
- `app/cards/[cardId]/page.tsx` — dynamic metadata, static params, and real 404 behavior.
- `app/practice/[setId]/page.tsx` — prevent duplicate practice pages from indexing.
- `app/globals.css` — public home, article, search, guide, reading, trust, and responsive styles.
- `tests/content.test.ts` — guide data and curated-reading invariants.
- `tests/rendered-html.test.mjs` — public routes, visible article content, metadata, and 404 assertions.

## Task 1: Add reviewed guide data and the curated-reading registry

**Files:**
- Create: `app/data/guides.ts`
- Create: `app/lib/public-content.ts`
- Create: `tests/public-content.test.ts`
- Modify: `tests/content.test.ts`

- [ ] **Step 1: Write the failing public-content tests**

Create `tests/public-content.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { guides, getGuide } from "../app/data/guides";
import {
  PUBLIC_READING_IDS,
  getPublicReading,
  publicReadings,
} from "../app/lib/public-content";

test("ships three reviewed beginner guides in the foundation slice", () => {
  assert.equal(guides.length, 3);
  assert.equal(new Set(guides.map((guide) => guide.slug)).size, 3);

  for (const guide of guides) {
    assert.ok(guide.title.length >= 8);
    assert.ok(guide.description.length >= 30);
    assert.ok(guide.lead.length >= 40);
    assert.ok(guide.sections.length >= 3);
    assert.equal(getGuide(guide.slug)?.slug, guide.slug);

    for (const section of guide.sections) {
      assert.ok(section.id && section.heading);
      assert.ok(section.paragraphs.length >= 1);
      assert.ok(section.paragraphs.every((paragraph) => paragraph.length >= 25));
    }
  }
});

test("publishes exactly thirty explicit reading examples", () => {
  assert.equal(PUBLIC_READING_IDS.length, 30);
  assert.equal(publicReadings.length, 30);
  assert.equal(new Set(PUBLIC_READING_IDS).size, 30);

  for (const reading of publicReadings) {
    assert.equal(getPublicReading(reading.id)?.id, reading.id);
    assert.ok(reading.headline && reading.fullInterpretation);
    assert.ok(reading.cardAnalysis.length === reading.cards.length);
    assert.ok(reading.positionAnalysis.length === reading.cards.length);
  }
});

test("does not publish an unreviewed reading id", () => {
  assert.equal(getPublicReading("love-five-015"), undefined);
  assert.equal(getPublicReading("not-a-reading"), undefined);
});
```

- [ ] **Step 2: Run the new test and verify the missing-module failure**

Run:

```bash
npx tsx --test tests/public-content.test.ts
```

Expected: FAIL because `app/data/guides.ts` and `app/lib/public-content.ts` do not exist.

- [ ] **Step 3: Create the typed guide data with exact launch copy**

Create `app/data/guides.ts`:

```ts
export type GuideSection = {
  id: string;
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type Guide = {
  slug: string;
  title: string;
  description: string;
  lead: string;
  sections: GuideSection[];
  relatedCardIds: string[];
};

export const guides: Guide[] = [
  {
    slug: "upright-and-reversed",
    title: "타로 정방향과 역방향을 읽는 법",
    description:
      "역방향을 무조건 나쁜 뜻으로 외우지 않고 차단, 지연, 내면화, 과잉, 결핍으로 구분하는 초보자 가이드입니다.",
    lead:
      "정방향은 카드의 에너지가 비교적 직접 드러나는 상태이고, 역방향은 그 에너지가 사라진 것이 아니라 표현 방식이 달라진 상태입니다. 두 방향을 좋음과 나쁨으로만 나누면 실제 상황을 놓치기 쉽습니다.",
    relatedCardIds: ["the-hanged-man", "the-moon", "temperance"],
    sections: [
      {
        id: "start-with-the-verb",
        heading: "먼저 카드의 중심 동사를 찾기",
        paragraphs: [
          "카드 이름이나 키워드를 길게 외우기 전에 카드가 어떤 움직임을 만드는지 한 개의 동사로 줄입니다. 연인은 선택하고, 전차는 밀고 나가며, 은둔자는 거리를 두고 살핍니다.",
          "정방향과 역방향은 이 동사가 상황에서 얼마나 자연스럽게 작동하는지 살피는 방식으로 비교하면 기억하기 쉽습니다.",
        ],
      },
      {
        id: "five-modes",
        heading: "역방향을 다섯 가지 방식으로 점검하기",
        paragraphs: [
          "역방향은 차단, 지연, 내면화, 과잉, 결핍 중 어느 방식에 가까운지 살펴봅니다. 전차 역방향이라면 추진력이 없는 것뿐 아니라 방향 없이 과하게 밀어붙이는 상태일 수도 있습니다.",
        ],
        bullets: [
          "차단: 하고 싶지만 움직이지 못함",
          "지연: 필요한 과정이 늦어짐",
          "내면화: 겉보다 마음속에서 일어남",
          "과잉: 카드의 힘을 지나치게 사용함",
          "결핍: 필요한 자원이나 표현이 부족함",
        ],
      },
      {
        id: "use-context",
        heading: "질문과 배열 위치로 최종 뜻을 좁히기",
        paragraphs: [
          "같은 역방향도 질문과 위치에 따라 달라집니다. 상대의 태도에 나온 카드와 내가 할 일에 나온 카드는 주어가 다르므로 같은 문장을 반복하면 안 됩니다.",
          "방향을 해석한 뒤에는 반드시 질문 분야, 배열 위치, 주변 카드와 연결해 가장 자연스러운 한 문장으로 정리합니다.",
        ],
      },
    ],
  },
  {
    slug: "three-card-spread",
    title: "타로 3장 배열을 한 문장으로 연결하는 법",
    description:
      "세 장의 뜻을 따로 나열하지 않고 위치와 카드 관계를 이용해 하나의 흐름으로 해석하는 방법을 설명합니다.",
    lead:
      "3장 배열의 핵심은 카드 세 개를 각각 설명하는 것이 아니라 앞 카드가 만든 상황이 가운데를 거쳐 마지막에서 어떻게 바뀌는지 연결하는 것입니다.",
    relatedCardIds: ["the-lovers", "two-of-swords", "eight-of-cups"],
    sections: [
      {
        id: "name-the-positions",
        heading: "세 위치의 주어와 역할을 먼저 정하기",
        paragraphs: [
          "카드를 펼치기 전에 현재·장애물·조언처럼 각 위치가 무엇을 말하는지 적습니다. 위치가 없으면 카드 뜻은 많아지고 해석의 기준은 흐려집니다.",
          "각 카드의 중심 동사를 위치의 주어에 붙이면 첫 문장이 만들어집니다. 예를 들어 상대의 태도 위치라면 상대가 선택한다, 미룬다, 거리를 둔다처럼 읽습니다.",
        ],
      },
      {
        id: "find-the-relationship",
        heading: "카드 사이의 관계를 한 가지로 분류하기",
        paragraphs: [
          "세 장이 서로 강화하는지, 충돌하는지, 원인과 결과인지, 문제와 해결인지, 겉과 속인지 먼저 고릅니다. 관계 이름을 하나 붙이면 카드 사이에 필요한 접속사가 보입니다.",
        ],
        bullets: [
          "강화: 같은 방향의 힘이 커짐",
          "충돌: 서로 다른 욕구나 속도가 맞섬",
          "원인과 결과: 앞의 선택이 뒤의 흐름을 만듦",
          "문제와 해결: 막힘 뒤에 조정 방법이 나옴",
          "겉과 속: 보이는 태도와 실제 마음이 다름",
        ],
      },
      {
        id: "write-one-sentence",
        heading: "결론보다 흐름을 말하는 한 문장 쓰기",
        paragraphs: [
          "첫 카드의 상황, 가운데 카드의 변화, 마지막 카드의 방향을 순서대로 연결합니다. 반드시 된다거나 끝난다고 단정하기보다 현재 조건이 이어질 때 나타날 가능성을 표현합니다.",
          "완성한 문장에는 카드 이름이 없어도 됩니다. 대신 선택, 지연, 조정처럼 카드에서 꺼낸 근거 동사가 남아 있어야 합니다.",
        ],
      },
    ],
  },
  {
    slug: "asking-good-questions",
    title: "해석이 선명해지는 타로 질문 만드는 법",
    description:
      "예언을 요구하는 질문을 현재 상황, 선택, 행동을 살피는 질문으로 바꾸는 초보자용 질문 작성 가이드입니다.",
    lead:
      "좋은 질문은 정답을 맞히게 하는 문장이 아니라 카드가 어떤 관점과 행동을 살펴야 하는지 알려주는 문장입니다. 질문이 구체적일수록 카드의 많은 뜻 중 필요한 뜻을 고르기 쉬워집니다.",
    relatedCardIds: ["justice", "the-hermit", "the-magician"],
    sections: [
      {
        id: "avoid-fixed-outcomes",
        heading: "결과를 확정하는 질문 피하기",
        paragraphs: [
          "언제 반드시 연락이 오는지, 무조건 합격하는지처럼 하나의 결과만 요구하면 카드의 조건과 대안을 읽기 어렵습니다. 타로를 사실 확인이나 보장의 도구로 사용하지 않습니다.",
          "대신 현재 흐름에 영향을 주는 요인과 내가 확인할 행동을 묻습니다. 질문을 바꾸면 해석이 더 구체적이고 실제 선택에 도움이 됩니다.",
        ],
      },
      {
        id: "use-a-subject-and-timeframe",
        heading: "주어와 살펴볼 기간을 분명히 하기",
        paragraphs: [
          "우리 관계처럼 주어가 넓은 표현보다 내가 이 관계에서 확인할 점처럼 누가 무엇을 살피는지 적습니다. 기간은 현실적으로 행동을 관찰할 수 있는 범위로 정합니다.",
          "기간을 정해도 미래를 확정하는 것은 아닙니다. 지금의 조건이 이어질 때 어느 방향이 강한지 살피는 기준으로만 사용합니다.",
        ],
      },
      {
        id: "question-patterns",
        heading: "초보자가 바로 쓸 수 있는 질문 틀",
        paragraphs: [
          "아래 질문 틀은 연애, 재물, 건강 등 분야가 달라도 주어와 행동을 바꿔 사용할 수 있습니다. 건강 문제는 진단이나 치료 판단 대신 자기관리와 도움을 구할 시점을 성찰하는 범위로 제한합니다.",
        ],
        bullets: [
          "현재 상황에서 내가 놓치고 있는 점은 무엇인가?",
          "이 선택을 진행할 때 도움이 되는 태도는 무엇인가?",
          "관계를 더 분명히 이해하려면 무엇을 확인해야 하는가?",
          "지금 반복되는 패턴을 바꾸기 위한 첫 행동은 무엇인가?",
        ],
      },
    ],
  },
];

export function getGuide(slug: string) {
  return guides.find((guide) => guide.slug === slug);
}
```

- [ ] **Step 4: Create the explicit curated-reading registry**

Create `app/lib/public-content.ts`:

```ts
import { getLearningSet } from "../data/learning-sets";

export const PUBLIC_READING_IDS = [
  "love-three-001",
  "love-three-002",
  "love-three-003",
  "love-three-004",
  "love-three-005",
  "love-three-006",
  "love-three-007",
  "love-three-008",
  "love-three-009",
  "love-three-010",
  "money-three-001",
  "money-three-002",
  "money-three-003",
  "money-three-004",
  "money-three-005",
  "money-three-006",
  "money-three-007",
  "money-three-008",
  "money-three-009",
  "money-three-010",
  "health-three-001",
  "health-three-002",
  "health-three-003",
  "health-three-004",
  "health-three-005",
  "health-three-006",
  "health-three-007",
  "health-three-008",
  "health-three-009",
  "health-three-010",
] as const;

const publicReadingIds = new Set<string>(PUBLIC_READING_IDS);

function requireReading(id: string) {
  const reading = getLearningSet(id);
  if (!reading) throw new Error(`Missing curated reading: ${id}`);
  return reading;
}

export const publicReadings = PUBLIC_READING_IDS.map(requireReading);

export function getPublicReading(id: string) {
  return publicReadingIds.has(id) ? getLearningSet(id) : undefined;
}
```

- [ ] **Step 5: Extend the existing content checks**

Append to `tests/content.test.ts`:

```ts
import { guides } from "../app/data/guides";
import { publicReadings } from "../app/lib/public-content";

test("public guides and readings reference known cards", () => {
  const knownIds = new Set(allCards.map((card) => card.id));

  for (const guide of guides) {
    for (const cardId of guide.relatedCardIds) assert.ok(knownIds.has(cardId));
  }

  for (const reading of publicReadings) {
    for (const item of reading.cards) assert.ok(knownIds.has(item.cardId));
  }
});
```

Move the two new imports to the import block at the top of the file after applying the snippet.

- [ ] **Step 6: Run the focused content tests**

Run:

```bash
npx tsx --test tests/public-content.test.ts tests/content.test.ts
```

Expected: 9 tests PASS.

- [ ] **Step 7: Commit the content registry**

```bash
git add app/data/guides.ts app/lib/public-content.ts tests/public-content.test.ts tests/content.test.ts
git commit -m "feat: add curated public tarot content"
```

## Task 2: Add deterministic site search and a search-first homepage

**Files:**
- Create: `app/lib/search.ts`
- Create: `app/components/SiteSearch.tsx`
- Create: `app/components/PublicHome.tsx`
- Create: `app/me/page.tsx`
- Create: `tests/search.test.ts`
- Modify: `app/page.tsx`
- Modify: `app/components/AppShell.tsx`
- Modify: `tests/rendered-html.test.mjs`

- [ ] **Step 1: Write the failing search tests**

Create `tests/search.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { searchContent, searchEntries } from "../app/lib/search";

test("builds entries for cards, guides, and curated readings", () => {
  assert.equal(searchEntries.filter((entry) => entry.kind === "card").length, 78);
  assert.equal(searchEntries.filter((entry) => entry.kind === "guide").length, 3);
  assert.equal(searchEntries.filter((entry) => entry.kind === "reading").length, 30);
});

test("finds Korean card names and English card names", () => {
  assert.equal(searchContent("연인")[0]?.href, "/cards/the-lovers");
  assert.equal(searchContent("the lovers")[0]?.href, "/cards/the-lovers");
});

test("finds guide concepts and reading questions", () => {
  assert.equal(searchContent("역방향")[0]?.href, "/guides/upright-and-reversed");
  assert.ok(searchContent("관계의 현재 흐름").some((entry) => entry.kind === "reading"));
});

test("returns an empty array for blank or unrelated queries", () => {
  assert.deepEqual(searchContent("   "), []);
  assert.deepEqual(searchContent("존재하지않는검색어"), []);
});
```

- [ ] **Step 2: Run the search test and verify it fails**

Run:

```bash
npx tsx --test tests/search.test.ts
```

Expected: FAIL because `app/lib/search.ts` does not exist.

- [ ] **Step 3: Implement the pure search index**

Create `app/lib/search.ts`:

```ts
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
```

- [ ] **Step 4: Run the search tests and verify they pass**

Run:

```bash
npx tsx --test tests/search.test.ts
```

Expected: 4 tests PASS.

- [ ] **Step 5: Create the focused client-side search component**

Create `app/components/SiteSearch.tsx`:

```tsx
"use client";

import { ArrowRight, BookOpenText, Layers3, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { searchContent } from "../lib/search";

const labels = { card: "카드", guide: "가이드", reading: "조합" } as const;
const icons = { card: Search, guide: BookOpenText, reading: Layers3 } as const;

export function SiteSearch() {
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchContent(query), [query]);
  const hasQuery = query.trim().length > 0;

  return (
    <div className="site-search">
      <label className="site-search-input" htmlFor="site-search-query">
        <Search aria-hidden="true" />
        <span className="sr-only">카드와 타로 가이드 검색</span>
        <input
          id="site-search-query"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="카드 이름·키워드·궁금한 해석 검색"
          autoComplete="off"
        />
      </label>

      {hasQuery ? (
        <div className="site-search-results" aria-live="polite">
          {results.length ? (
            results.map((result) => {
              const Icon = icons[result.kind];
              return (
                <Link href={result.href} key={`${result.kind}-${result.id}`}>
                  <span className="search-result-icon"><Icon aria-hidden="true" /></span>
                  <span>
                    <small>{labels[result.kind]}</small>
                    <strong>{result.label}</strong>
                    <span>{result.description}</span>
                  </span>
                  <ArrowRight aria-hidden="true" />
                </Link>
              );
            })
          ) : (
            <div className="site-search-empty" role="status">
              <strong>일치하는 내용을 찾지 못했어요.</strong>
              <span>카드 이름을 짧게 쓰거나 ‘역방향’, ‘3장 배열’처럼 검색해 보세요.</span>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 6: Create the public homepage composition**

Create `app/components/PublicHome.tsx`:

```tsx
import { ArrowRight, BookOpenCheck, Compass, Sparkles } from "lucide-react";
import Link from "next/link";
import { allCards } from "../data/cards";
import { guides } from "../data/guides";
import { publicReadings } from "../lib/public-content";
import { SiteSearch } from "./SiteSearch";
import { TarotCardVisual } from "./TarotCardVisual";

const popularCardIds = ["the-lovers", "death", "the-tower"];
const popularCards = popularCardIds.map((id) => allCards.find((card) => card.id === id)!);

export function PublicHome() {
  return (
    <div className="public-home">
      <section className="search-hero" aria-labelledby="search-hero-title">
        <span className="eyebrow">78 CARDS · 150 PRACTICE SETS</span>
        <h1 id="search-hero-title">어떤 카드가 궁금하세요?</h1>
        <p>외우지 말고, 카드의 동사와 배열 위치를 연결해서 읽어보세요.</p>
        <SiteSearch />
        <div className="quick-search-links" aria-label="카드 종류 바로가기">
          <Link href="/cards">전체</Link>
          <Link href="/cards?type=major">메이저</Link>
          <Link href="/cards?type=wands">완드</Link>
          <Link href="/cards?type=cups">컵</Link>
          <Link href="/cards?type=swords">소드</Link>
          <Link href="/cards?type=pentacles">펜타클</Link>
        </div>
      </section>

      <section className="public-section" aria-labelledby="popular-cards-title">
        <div className="section-heading">
          <div><span className="eyebrow">POPULAR CARDS</span><h2 id="popular-cards-title">처음엔 이 카드부터</h2></div>
          <Link href="/cards">78장 모두 보기 <ArrowRight aria-hidden="true" /></Link>
        </div>
        <div className="popular-card-grid">
          {popularCards.map((card) => (
            <Link href={`/cards/${card.id}`} key={card.id}>
              <TarotCardVisual card={card} size="small" />
              <span><strong>{card.nameKo}</strong><small>{card.coreVerb}</small></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="public-section" aria-labelledby="guide-title">
        <div className="section-heading">
          <div><span className="eyebrow">BEGINNER GUIDES</span><h2 id="guide-title">초보자 인기 가이드</h2></div>
          <Compass aria-hidden="true" />
        </div>
        <div className="guide-preview-grid">
          {guides.map((guide, index) => (
            <Link href={`/guides/${guide.slug}`} key={guide.slug}>
              <span className="guide-number">0{index + 1}</span>
              <strong>{guide.title}</strong>
              <p>{guide.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="public-section reading-preview" aria-labelledby="reading-title">
        <div><span className="eyebrow">READING EXAMPLES</span><h2 id="reading-title">카드를 함께 읽어봐요</h2><p>{publicReadings[0].question}</p></div>
        <Link className="primary-button" href={`/readings/${publicReadings[0].id}`}>조합 해석 보기 <ArrowRight aria-hidden="true" /></Link>
      </section>

      <section className="public-section course-preview" aria-labelledby="study-title">
        <div className="course-preview-icon"><Sparkles aria-hidden="true" /></div>
        <div><span className="eyebrow">FREE PRACTICE</span><h2 id="study-title">직접 읽어보면 더 빨리 배워요</h2><p>먼저 내 말로 해석하고 카드별 근거와 모범 해설을 차례로 확인하세요.</p></div>
        <Link className="secondary-button" href="/practice/love-three-001"><BookOpenCheck aria-hidden="true" /> 첫 연습 시작</Link>
      </section>
    </div>
  );
}
```

- [ ] **Step 7: Replace the homepage and preserve the existing dashboard at `/me`**

Replace `app/page.tsx` with:

```tsx
import type { Metadata } from "next";
import { AppShell } from "./components/AppShell";
import { PublicHome } from "./components/PublicHome";

export const metadata: Metadata = {
  title: "타로 카드 뜻과 조합 해석",
  description: "78장 타로 카드의 정·역방향 의미와 실제 조합을 근거부터 배워보세요.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return <AppShell active="home"><PublicHome /></AppShell>;
}
```

Create `app/me/page.tsx`:

```tsx
import type { Metadata } from "next";
import { AppShell } from "../components/AppShell";
import { HomeDashboard } from "../components/HomeDashboard";

export const metadata: Metadata = {
  title: "내 학습",
  robots: { index: false, follow: false },
};

export default function MyLearningPage() {
  return <AppShell active="me"><HomeDashboard /></AppShell>;
}
```

- [ ] **Step 8: Update public navigation**

In `app/components/AppShell.tsx`, replace the active type and navigation definitions with:

```tsx
import Link from "next/link";
import { BookOpen, Home, Layers3, UserRound } from "lucide-react";

type ActiveSection = "home" | "cards" | "readings" | "practice" | "me";

const navItems = [
  { id: "home", label: "홈", href: "/", Icon: Home },
  { id: "cards", label: "카드", href: "/cards", Icon: BookOpen },
  { id: "readings", label: "조합", href: "/readings", Icon: Layers3 },
  { id: "me", label: "내 학습", href: "/me", Icon: UserRound },
] as const;
```

Remove the existing `active = "home"` default from `AppShell` so guide, policy, and 404 pages do not falsely highlight Home. Keep `active?: ActiveSection` optional:

```tsx
export function AppShell({ children, active }: { children: React.ReactNode; active?: ActiveSection }) {
```

Then replace the header quick links and profile element with:

```tsx
<div className="header-links" aria-label="빠른 메뉴">
  <Link href="/cards">카드 사전</Link>
  <Link href="/readings">조합 예제</Link>
  <Link href="/guides">기초 가이드</Link>
</div>
<Link className="profile-dot" href="/me" aria-label="내 학습 기록">나</Link>
```

- [ ] **Step 9: Make homepage filter links change the initial card library filter**

In `app/components/CardLibrary.tsx`, export the filter type and accept an initial value:

```tsx
export type CardFilter = "all" | "major" | "wands" | "cups" | "swords" | "pentacles";

export function CardLibrary({ initialFilter = "all" }: { initialFilter?: CardFilter }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<CardFilter>(initialFilter);
  const [page, setPage] = useState(0);
```

Remove the original private `type CardFilter` and the original three state declarations so each is defined once.

Replace `app/cards/page.tsx` with:

```tsx
import type { Metadata } from "next";
import { AppShell } from "../components/AppShell";
import { CardLibrary, type CardFilter } from "../components/CardLibrary";

export const metadata: Metadata = {
  title: "78장 카드 도감",
  description: "메이저와 마이너 78장 타로 카드를 이름, 영문명, 핵심 동사와 키워드로 찾아보세요.",
  alternates: { canonical: "/cards" },
};

const validFilters = new Set<CardFilter>(["all", "major", "wands", "cups", "swords", "pentacles"]);

export default async function CardsPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  const initialFilter = validFilters.has(type as CardFilter) ? (type as CardFilter) : "all";
  return <AppShell active="cards"><CardLibrary initialFilter={initialFilter} /></AppShell>;
}
```

- [ ] **Step 10: Update the homepage render test before styling**

In the first test of `tests/rendered-html.test.mjs`, replace homepage assertions after `assert.equal(response.status, 200)` with:

```js
assert.match(html, /빨강타로/);
assert.match(html, /어떤 카드가 궁금하세요/);
assert.match(html, /카드 이름·키워드·궁금한 해석 검색/);
assert.match(html, /처음엔 이 카드부터/);
assert.match(html, /초보자 인기 가이드/);
assert.match(html, /카드를 함께 읽어봐요/);
assert.match(html, /첫 연습 시작/);
assert.match(html, /lang="ko"/);
assert.doesNotMatch(html, /나의 학습 정원/);
```

Add another test:

```js
test("keeps the local learning dashboard at /me", async () => {
  const response = await render("/me");
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /나의 학습 정원/);
  assert.match(html, /최근 헷갈린 카드/);
  assert.match(html, /name="robots" content="noindex, nofollow"/);
});
```

Add a query-driven card-filter test:

```js
test("uses the homepage card filter query on first render", async () => {
  const response = await render("/cards?type=major");
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, />22<small>장<\/small>/);
});
```

- [ ] **Step 11: Build and run the homepage render tests**

Run:

```bash
npm run build:sites
node --test --test-name-pattern="Red Tarot home|local learning dashboard|homepage card filter" tests/rendered-html.test.mjs
```

Expected: 3 tests PASS.

- [ ] **Step 12: Commit the search-first home**

```bash
git add app/lib/search.ts app/components/SiteSearch.tsx app/components/PublicHome.tsx app/me/page.tsx app/page.tsx app/components/AppShell.tsx app/components/CardLibrary.tsx app/cards/page.tsx tests/search.test.ts tests/rendered-html.test.mjs
git commit -m "feat: add search-first public home"
```

## Task 3: Turn card detail into an indexable long-form article

**Files:**
- Create: `app/components/FavoriteButton.tsx`
- Create: `app/components/LongFormContents.tsx`
- Modify: `app/components/CardDetail.tsx`
- Modify: `app/cards/[cardId]/page.tsx`
- Modify: `tests/rendered-html.test.mjs`

- [ ] **Step 1: Strengthen the card render test so hidden-tab markup cannot pass**

Replace the card-detail test body in `tests/rendered-html.test.mjs` with:

```js
const response = await render("/cards/the-lovers");
const html = await response.text();

assert.equal(response.status, 200);
assert.match(html, /연인 카드 뜻/);
assert.match(html, /선택한다/);
assert.match(html, /서로의 감정과 관계 방향을 선택함/);
assert.match(html, /감정과 행동 또는 가치가 일치하지 않음/);
assert.match(html, /연애에서 읽기/);
assert.match(html, /재물에서 읽기/);
assert.match(html, /건강에서 읽기/);
assert.match(html, /상징으로 더 깊이 읽기/);
assert.match(html, /흔한 오해/);
assert.match(html, /rel="canonical" href="http:\/\/localhost\/cards\/the-lovers"/);
```

- [ ] **Step 2: Run the focused render test and verify it fails**

Run:

```bash
npm run build:sites
node --test --test-name-pattern="complete card detail" tests/rendered-html.test.mjs
```

Expected: FAIL because tab-inactive content and the dynamic title/canonical are absent.

- [ ] **Step 3: Extract the favorite client boundary**

Create `app/components/FavoriteButton.tsx`:

```tsx
"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import {
  safeReadProgress,
  safeWriteProgress,
  toggleFavorite,
} from "../lib/progress";

export function FavoriteButton({ cardId }: { cardId: string }) {
  const [favorite, setFavorite] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        setFavorite(safeReadProgress(window.localStorage).favoriteCardIds.includes(cardId));
      } catch {
        setMessage("이 브라우저에서는 즐겨찾기를 저장할 수 없어요.");
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [cardId]);

  function toggle() {
    try {
      const next = toggleFavorite(safeReadProgress(window.localStorage), cardId);
      const saved = safeWriteProgress(window.localStorage, next);
      setFavorite(next.favoriteCardIds.includes(cardId));
      setMessage(saved ? "즐겨찾기를 업데이트했어요." : "즐겨찾기를 저장하지 못했어요.");
    } catch {
      setMessage("이 브라우저에서는 즐겨찾기를 저장할 수 없어요.");
    }
  }

  return (
    <div className="favorite-control">
      <button className={`favorite-button ${favorite ? "is-favorite" : ""}`} type="button" onClick={toggle} aria-pressed={favorite}>
        <Heart aria-hidden="true" /> {favorite ? "찜한 카드" : "카드 찜하기"}
      </button>
      <p className="save-message" role="status" aria-live="polite">{message}</p>
    </div>
  );
}
```

- [ ] **Step 4: Add reusable long-form contents navigation**

Create `app/components/LongFormContents.tsx`:

```tsx
export type ContentLink = { href: `#${string}`; label: string };

export function LongFormContents({ label, links }: { label: string; links: ContentLink[] }) {
  return (
    <nav className="long-form-contents" aria-label={label}>
      {links.map((link) => <a href={link.href} key={link.href}>{link.label}</a>)}
    </nav>
  );
}
```

- [ ] **Step 5: Replace the tabbed card component with a server-rendered article**

Replace `app/components/CardDetail.tsx` with:

```tsx
import { ArrowLeft, ArrowRight, BookOpenCheck, Lightbulb } from "lucide-react";
import Link from "next/link";
import { allCards, type TarotCard } from "../data/cards";
import { publicReadings } from "../lib/public-content";
import { FavoriteButton } from "./FavoriteButton";
import { LongFormContents } from "./LongFormContents";
import { SafetyNote } from "./SafetyNote";
import { TarotCardVisual } from "./TarotCardVisual";

const categoryLabels = { love: "연애", money: "재물", health: "건강" } as const;

export function CardDetail({ card }: { card: TarotCard }) {
  const cardIndex = allCards.findIndex((item) => item.id === card.id);
  const previousCard = allCards[(cardIndex - 1 + allCards.length) % allCards.length];
  const nextCard = allCards[(cardIndex + 1) % allCards.length];
  const relatedReadings = publicReadings.filter((reading) => reading.cards.some((item) => item.cardId === card.id)).slice(0, 3);

  return (
    <article className="card-article">
      <div className="detail-breadcrumb"><Link href="/">홈</Link><span aria-hidden="true">›</span><Link href="/cards">카드 사전</Link><span aria-hidden="true">›</span><strong>{card.nameKo}</strong></div>

      <header className="card-detail-hero">
        <div className="detail-visual-wrap"><TarotCardVisual card={card} size="large" priority /><span className="detail-sticker" aria-hidden="true">{card.visual.glyph}</span></div>
        <div className="detail-heading">
          <span className="eyebrow">{card.arcana === "major" ? "MAJOR ARCANA" : "MINOR ARCANA"} · {card.number}</span>
          <h1>{card.nameKo} 카드 뜻</h1>
          <p className="english-name">{card.nameEn}</p>
          <p className="card-answer">{card.coreMeaning}</p>
          <div className="verb-card"><span>핵심 동사</span><strong>{card.coreVerb}</strong></div>
          <FavoriteButton cardId={card.id} />
        </div>
      </header>

      <LongFormContents label={`${card.nameKo} 카드 설명 목차`} links={[
        { href: "#upright", label: "정방향" },
        { href: "#reversed", label: "역방향" },
        { href: "#categories", label: "분야별" },
        { href: "#symbols", label: "상징" },
        { href: "#mistakes", label: "흔한 오해" },
      ]} />

      <section className="meaning-summary article-section">
        <span className="panel-label">한 문장으로 읽기</span>
        <h2>{card.coreMeaning}</h2>
        <div className="keyword-list">{card.keywords.map((keyword) => <span key={keyword}>{keyword}</span>)}</div>
        <aside className="reading-tip"><Lightbulb aria-hidden="true" /><div><strong>명사보다 동사로 기억해요</strong><p>‘{card.nameKo}’이 나왔다면 ‘{card.coreVerb}’라는 움직임을 배열 위치의 주어에 붙여보세요.</p></div></aside>
      </section>

      <div className="orientation-grid article-section-group">
        <section className="orientation-card" id="upright"><span className="soft-pill">정방향</span><h2>{card.upright.summary}</h2><h3>잘 표현될 때</h3><ul>{card.upright.positive.map((item) => <li key={item}>{item}</li>)}</ul><h3>주의할 점</h3><ul>{card.upright.caution.map((item) => <li key={item}>{item}</li>)}</ul></section>
        <section className="orientation-card reversed-card" id="reversed"><span className="dark-pill">역방향 · {card.reversed.mode}</span><h2>{card.reversed.summary}</h2><h3>다시 볼 가능성</h3><ul>{card.reversed.positive.map((item) => <li key={item}>{item}</li>)}</ul><h3>주의할 점</h3><ul>{card.reversed.caution.map((item) => <li key={item}>{item}</li>)}</ul></section>
      </div>

      <section className="article-section" id="categories"><span className="panel-label">질문 분야에 맞춰 읽기</span><h2>분야별 의미</h2><div className="category-article-grid">{Object.entries(categoryLabels).map(([key, label]) => { const category = key as keyof typeof card.categories; return <section key={key}><h3>{label}에서 읽기</h3><p><strong>정방향</strong> {card.categories[category].upright}</p><p><strong>역방향</strong> {card.categories[category].reversed}</p>{category === "health" ? <SafetyNote /> : null}</section>; })}</div></section>

      <section className="article-section" id="symbols"><span className="panel-label">카드 그림의 단서</span><h2>상징으로 더 깊이 읽기</h2><div className="symbol-grid">{card.symbolism.map((item) => <section key={item.symbol}><span aria-hidden="true">✦</span><h3>{item.symbol}</h3><p>{item.meaning}</p></section>)}</div></section>

      <aside className="mistake-note" id="mistakes"><div><strong>흔한 오해</strong><p>{card.commonMistakes[0]}</p></div></aside>

      {relatedReadings.length ? <section className="article-section related-reading-list"><span className="panel-label">실제 조합에서 확인하기</span><h2>{card.nameKo}이 포함된 조합</h2>{relatedReadings.map((reading) => <Link href={`/readings/${reading.id}`} key={reading.id}><span>{reading.question}</span><strong>{reading.headline}</strong><ArrowRight aria-hidden="true" /></Link>)}</section> : null}

      <div className="card-pagination"><Link href={`/cards/${previousCard.id}`}><ArrowLeft aria-hidden="true" /><span>이전 카드 <strong>{previousCard.nameKo}</strong></span></Link><Link href="/practice/love-three-001" className="practice-promo"><BookOpenCheck aria-hidden="true" /> 배열에서 연습</Link><Link href={`/cards/${nextCard.id}`}><span>다음 카드 <strong>{nextCard.nameKo}</strong></span><ArrowRight aria-hidden="true" /></Link></div>
    </article>
  );
}
```

- [ ] **Step 6: Add card-specific metadata, static params, and a real 404**

Replace `app/cards/[cardId]/page.tsx` with:

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "../../components/AppShell";
import { CardDetail } from "../../components/CardDetail";
import { allCards, getCard } from "../../data/cards";

type Props = { params: Promise<{ cardId: string }> };

export function generateStaticParams() {
  return allCards.map((card) => ({ cardId: card.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cardId } = await params;
  const card = getCard(cardId);
  if (!card) return { title: "카드를 찾지 못했어요", robots: { index: false, follow: false } };

  const title = `${card.nameKo} 카드 뜻 — 정방향·역방향·분야별 해석`;
  const description = `${card.nameKo}(${card.nameEn})의 핵심 동사 ${card.coreVerb}, 정방향과 역방향, 연애·재물·건강 의미를 근거부터 알아보세요.`;
  return { title, description, alternates: { canonical: `/cards/${card.id}` }, openGraph: { title, description, type: "article" } };
}

export default async function CardPage({ params }: Props) {
  const { cardId } = await params;
  const card = getCard(cardId);
  if (!card) notFound();
  return <AppShell active="cards"><CardDetail card={card} /></AppShell>;
}
```

- [ ] **Step 7: Run the card render tests**

Run:

```bash
npm run build:sites
node --test --test-name-pattern="complete card detail" tests/rendered-html.test.mjs
```

Expected: PASS.

- [ ] **Step 8: Commit the long-form card article**

```bash
git add app/components/FavoriteButton.tsx app/components/LongFormContents.tsx app/components/CardDetail.tsx app/cards/'[cardId]'/page.tsx tests/rendered-html.test.mjs
git commit -m "feat: publish long-form card meanings"
```

## Task 4: Publish the curated reading directory and article pages

**Files:**
- Create: `app/components/ReadingArticle.tsx`
- Create: `app/readings/page.tsx`
- Create: `app/readings/[setId]/page.tsx`
- Modify: `app/practice/[setId]/page.tsx`
- Modify: `tests/rendered-html.test.mjs`

- [ ] **Step 1: Write failing reading-route tests**

Append to `tests/rendered-html.test.mjs`:

```js
test("renders the curated reading directory", async () => {
  const response = await render("/readings");
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /30개 조합 해석 예제/);
  assert.match(html, /연애/);
  assert.match(html, /재물/);
  assert.match(html, /건강/);
});

test("renders a public reading with all interpretation evidence", async () => {
  const response = await render("/readings/love-three-001");
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /이 관계의 현재 흐름은 어떻게 이어질까요/);
  assert.match(html, /카드별 핵심 근거/);
  assert.match(html, /위치에 맞춰 읽기/);
  assert.match(html, /가능한 대안/);
  assert.match(html, /달라지는 조건/);
  assert.match(html, /같은 조합 직접 풀기/);
});

test("returns 404 for a reading outside the public registry", async () => {
  const response = await render("/readings/love-five-015");
  assert.equal(response.status, 404);
});

test("marks interactive practice as noindex with a public canonical", async () => {
  const response = await render("/practice/love-three-001");
  const html = await response.text();
  assert.match(html, /name="robots" content="noindex, follow"/);
  assert.match(html, /rel="canonical" href="http:\/\/localhost\/readings\/love-three-001"/);
});
```

- [ ] **Step 2: Run the new reading tests and verify route failures**

Run:

```bash
npm run build:sites
node --test --test-name-pattern="curated reading|public reading|outside the public|interactive practice" tests/rendered-html.test.mjs
```

Expected: FAIL because `/readings` routes do not exist and practice metadata is indexable.

- [ ] **Step 3: Create the server-rendered reading article**

Create `app/components/ReadingArticle.tsx`:

```tsx
import { ArrowRight, BookOpenCheck } from "lucide-react";
import Link from "next/link";
import type { TarotCard } from "../data/cards";
import type { LearningSet } from "../data/learning-sets";
import { LongFormContents } from "./LongFormContents";
import { SafetyNote } from "./SafetyNote";
import { TarotCardVisual } from "./TarotCardVisual";

const categoryLabel = { love: "연애", money: "재물", health: "건강" } as const;

export function ReadingArticle({ reading, cards }: { reading: LearningSet; cards: TarotCard[] }) {
  return (
    <article className="reading-article">
      <div className="detail-breadcrumb"><Link href="/">홈</Link><span aria-hidden="true">›</span><Link href="/readings">조합 예제</Link><span aria-hidden="true">›</span><strong>{categoryLabel[reading.category]}</strong></div>
      <header className="reading-article-header"><span className="eyebrow">{categoryLabel[reading.category]} · {cards.length} CARDS</span><h1>{reading.question}</h1><p>{reading.headline}</p></header>
      {reading.category === "health" ? <SafetyNote /> : null}
      <section className={`reading-spread spread-${cards.length}`} aria-label={`${cards.length}장 배열`}>{cards.map((card, index) => <div key={`${card.id}-${index}`}><span>{reading.spread.positions[index]}</span><TarotCardVisual card={card} orientation={reading.cards[index].orientation} size="medium" /><strong>{card.nameKo}</strong><small>{reading.cards[index].orientation === "upright" ? "정방향" : "역방향"}</small></div>)}</section>
      <LongFormContents label="조합 해석 목차" links={[{ href: "#card-evidence", label: "카드별 근거" }, { href: "#position-evidence", label: "위치 해석" }, { href: "#full-reading", label: "종합 해석" }, { href: "#alternatives", label: "대안과 조건" }]} />
      <section className="article-section" id="card-evidence"><span className="panel-label">STEP 1</span><h2>카드별 핵심 근거</h2><div className="evidence-list">{cards.map((card, index) => <section key={card.id}><span>{index + 1}</span><div><h3>{card.nameKo} · {card.coreVerb}</h3><p>{reading.cardAnalysis[index]}</p></div></section>)}</div></section>
      <section className="article-section" id="position-evidence"><span className="panel-label">STEP 2</span><h2>위치에 맞춰 읽기</h2><div className="evidence-list">{reading.positionAnalysis.map((analysis, index) => <section key={reading.spread.positions[index]}><span>{index + 1}</span><div><h3>{reading.spread.positions[index]}</h3><p>{analysis}</p></div></section>)}</div></section>
      <section className="article-section reading-conclusion" id="full-reading"><span className="relationship-pill">{reading.relationship}</span><h2>{reading.headline}</h2><p className="connection-line">{reading.connection}</p><p>{reading.fullInterpretation}</p></section>
      <section className="article-section alternative-grid" id="alternatives"><div><span>가능한 대안</span><p>{reading.alternatives[0]}</p></div><div><span>달라지는 조건</span><p>{reading.conditions[0]}</p></div><div><span>흔한 오해</span><p>{reading.commonMistakes[0]}</p></div></section>
      <Link className="primary-button reading-practice-link" href={`/practice/${reading.id}`}><BookOpenCheck aria-hidden="true" /> 같은 조합 직접 풀기 <ArrowRight aria-hidden="true" /></Link>
    </article>
  );
}
```

- [ ] **Step 4: Create reading list and detail routes**

Create `app/readings/page.tsx`:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "../components/AppShell";
import { publicReadings } from "../lib/public-content";

export const metadata: Metadata = { title: "타로 조합 해석 예제 30개", description: "연애·재물·건강 3장 배열을 카드별 근거와 위치, 관계로 연결해 읽어보세요.", alternates: { canonical: "/readings" } };
const categoryLabel = { love: "연애", money: "재물", health: "건강" } as const;

export default function ReadingsPage() {
  return <AppShell active="readings"><section className="reading-directory"><header><span className="eyebrow">CURATED READINGS</span><h1>30개 조합 해석 예제</h1><p>결론만 보지 말고 카드 뜻이 한 문장으로 연결되는 근거를 확인해 보세요.</p></header><div className="reading-directory-grid">{publicReadings.map((reading) => <Link href={`/readings/${reading.id}`} key={reading.id}><span>{categoryLabel[reading.category]} · 3장</span><strong>{reading.question}</strong><p>{reading.headline}</p></Link>)}</div></section></AppShell>;
}
```

Create `app/readings/[setId]/page.tsx`:

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "../../components/AppShell";
import { ReadingArticle } from "../../components/ReadingArticle";
import { getLessonCard } from "../../data/learning-sets";
import type { TarotCard } from "../../data/cards";
import { getPublicReading, PUBLIC_READING_IDS } from "../../lib/public-content";

type Props = { params: Promise<{ setId: string }> };
export function generateStaticParams() { return PUBLIC_READING_IDS.map((setId) => ({ setId })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { setId } = await params; const reading = getPublicReading(setId); if (!reading) return { title: "조합을 찾지 못했어요", robots: { index: false, follow: false } }; return { title: `${reading.headline} — 타로 3장 조합 해석`, description: reading.fullInterpretation, alternates: { canonical: `/readings/${reading.id}` }, openGraph: { title: reading.headline, description: reading.fullInterpretation, type: "article" } }; }
export default async function ReadingPage({ params }: Props) { const { setId } = await params; const reading = getPublicReading(setId); if (!reading) notFound(); const cards = reading.cards.map((item) => getLessonCard(item.cardId)); if (!cards.every(Boolean)) notFound(); return <AppShell active="readings"><ReadingArticle reading={reading} cards={cards as TarotCard[]} /></AppShell>; }
```

- [ ] **Step 5: Mark practice routes as noindex and canonicalize curated sets**

In `app/practice/[setId]/page.tsx`, replace the static `metadata` export with:

```tsx
import { getPublicReading } from "../../lib/public-content";

export async function generateMetadata({ params }: { params: Promise<{ setId: string }> }): Promise<Metadata> {
  const { setId } = await params;
  const lesson = getLearningSet(setId);
  const publicReading = getPublicReading(setId);
  return {
    title: lesson ? `${lesson.question} 연습` : "학습 세트를 찾지 못했어요",
    robots: { index: false, follow: true },
    alternates: publicReading ? { canonical: `/readings/${setId}` } : undefined,
  };
}
```

Keep the existing `Metadata` import and remove only `export const metadata`.

- [ ] **Step 6: Build and run all reading-route tests**

Run:

```bash
npm run build:sites
node --test --test-name-pattern="curated reading|public reading|outside the public|interactive practice" tests/rendered-html.test.mjs
```

Expected: 4 tests PASS.

- [ ] **Step 7: Commit public reading pages**

```bash
git add app/components/ReadingArticle.tsx app/readings app/practice/'[setId]'/page.tsx tests/rendered-html.test.mjs
git commit -m "feat: publish curated reading articles"
```

## Task 5: Publish the beginner-guide directory and article pages

**Files:**
- Create: `app/components/GuideArticle.tsx`
- Create: `app/guides/page.tsx`
- Create: `app/guides/[slug]/page.tsx`
- Modify: `tests/rendered-html.test.mjs`

- [ ] **Step 1: Write failing guide-route tests**

Append to `tests/rendered-html.test.mjs`:

```js
test("renders the beginner guide directory", async () => {
  const response = await render("/guides");
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /초보자 타로 가이드/);
  assert.match(html, /정방향과 역방향/);
  assert.match(html, /3장 배열/);
  assert.match(html, /질문 만드는 법/);
});

test("renders a complete beginner guide", async () => {
  const response = await render("/guides/upright-and-reversed");
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /다섯 가지 방식/);
  assert.match(html, /차단/);
  assert.match(html, /지연/);
  assert.match(html, /관련 카드로 이어서 보기/);
});

test("returns 404 for an unknown guide", async () => {
  const response = await render("/guides/not-a-guide");
  assert.equal(response.status, 404);
});
```

- [ ] **Step 2: Run guide tests and verify route failures**

Run:

```bash
npm run build:sites
node --test --test-name-pattern="beginner guide|unknown guide" tests/rendered-html.test.mjs
```

Expected: FAIL because `/guides` routes do not exist.

- [ ] **Step 3: Create the guide article component**

Create `app/components/GuideArticle.tsx`:

```tsx
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getCard } from "../data/cards";
import type { Guide } from "../data/guides";
import { LongFormContents } from "./LongFormContents";
import { TarotCardVisual } from "./TarotCardVisual";

export function GuideArticle({ guide }: { guide: Guide }) {
  const relatedCards = guide.relatedCardIds.map(getCard).filter(Boolean);
  return (
    <article className="guide-article">
      <div className="detail-breadcrumb"><Link href="/">홈</Link><span aria-hidden="true">›</span><Link href="/guides">기초 가이드</Link><span aria-hidden="true">›</span><strong>{guide.title}</strong></div>
      <header className="guide-article-header"><span className="eyebrow">BEGINNER GUIDE</span><h1>{guide.title}</h1><p>{guide.lead}</p></header>
      <LongFormContents label={`${guide.title} 목차`} links={guide.sections.map((section) => ({ href: `#${section.id}` as `#${string}`, label: section.heading }))} />
      {guide.sections.map((section, index) => <section className="article-section guide-section" id={section.id} key={section.id}><span className="guide-number">{String(index + 1).padStart(2, "0")}</span><h2>{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.bullets ? <ul>{section.bullets.map((item) => <li key={item}>{item}</li>)}</ul> : null}</section>)}
      <section className="article-section related-cards"><span className="panel-label">CARD BOOK</span><h2>관련 카드로 이어서 보기</h2><div>{relatedCards.map((card) => card ? <Link href={`/cards/${card.id}`} key={card.id}><TarotCardVisual card={card} size="small" /><span><strong>{card.nameKo}</strong><small>{card.coreVerb}</small></span><ArrowRight aria-hidden="true" /></Link> : null)}</div></section>
    </article>
  );
}
```

- [ ] **Step 4: Create guide directory and detail routes**

Create `app/guides/page.tsx`:

```tsx
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { AppShell } from "../components/AppShell";
import { guides } from "../data/guides";

export const metadata: Metadata = { title: "초보자 타로 가이드", description: "정·역방향, 3장 배열, 좋은 질문 만들기를 근거부터 배우는 무료 타로 입문 가이드입니다.", alternates: { canonical: "/guides" } };
export default function GuidesPage() { return <AppShell><section className="guide-directory"><header><span className="eyebrow">START HERE</span><h1>초보자 타로 가이드</h1><p>카드 뜻을 외우기 전에 읽는 기준부터 익혀보세요.</p></header><div className="guide-directory-grid">{guides.map((guide, index) => <Link href={`/guides/${guide.slug}`} key={guide.slug}><span className="guide-number">0{index + 1}</span><strong>{guide.title}</strong><p>{guide.description}</p><ArrowRight aria-hidden="true" /></Link>)}</div></section></AppShell>; }
```

Create `app/guides/[slug]/page.tsx`:

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "../../components/AppShell";
import { GuideArticle } from "../../components/GuideArticle";
import { getGuide, guides } from "../../data/guides";

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return guides.map((guide) => ({ slug: guide.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { slug } = await params; const guide = getGuide(slug); if (!guide) return { title: "가이드를 찾지 못했어요", robots: { index: false, follow: false } }; return { title: guide.title, description: guide.description, alternates: { canonical: `/guides/${guide.slug}` }, openGraph: { title: guide.title, description: guide.description, type: "article" } }; }
export default async function GuidePage({ params }: Props) { const { slug } = await params; const guide = getGuide(slug); if (!guide) notFound(); return <AppShell><GuideArticle guide={guide} /></AppShell>; }
```

- [ ] **Step 5: Build and run all guide-route tests**

Run:

```bash
npm run build:sites
node --test --test-name-pattern="beginner guide|unknown guide" tests/rendered-html.test.mjs
```

Expected: 3 tests PASS.

- [ ] **Step 6: Commit public guide pages**

```bash
git add app/components/GuideArticle.tsx app/guides tests/rendered-html.test.mjs
git commit -m "feat: publish beginner tarot guides"
```

## Task 6: Add canonical URL helpers, sitemap, robots, structured data, and real 404s

**Files:**
- Create: `app/lib/site-url.ts`
- Create: `app/lib/structured-data.ts`
- Create: `app/components/JsonLd.tsx`
- Create: `app/sitemap.ts`
- Create: `app/robots.ts`
- Create: `app/not-found.tsx`
- Create: `tests/seo.test.ts`
- Modify: `tests/rendered-html.test.mjs`

- [ ] **Step 1: Write failing sitemap and robots tests**

Create `tests/seo.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import robots from "../app/robots";
import sitemap from "../app/sitemap";

test("sitemap contains only public canonical content", () => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://redtarot.example";
  const urls = sitemap().map((entry) => entry.url);
  assert.equal(urls.length, 1 + 1 + 78 + 1 + 30 + 1 + 3);
  assert.ok(urls.includes("https://redtarot.example/cards/the-lovers"));
  assert.ok(urls.includes("https://redtarot.example/readings/love-three-001"));
  assert.ok(urls.includes("https://redtarot.example/guides/upright-and-reversed"));
  assert.ok(!urls.some((url) => url.includes("/practice/")));
  assert.ok(!urls.some((url) => url.includes("/me")));
});

test("robots allows content and blocks private utility routes", () => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://redtarot.example";
  const value = robots();
  assert.equal(value.sitemap, "https://redtarot.example/sitemap.xml");
  assert.deepEqual(value.rules, [{ userAgent: "*", allow: "/", disallow: ["/auth/", "/me", "/review"] }]);
});
```

- [ ] **Step 2: Run the SEO test and verify missing modules**

Run:

```bash
npx tsx --test tests/seo.test.ts
```

Expected: FAIL because `app/sitemap.ts` and `app/robots.ts` do not exist.

- [ ] **Step 3: Implement stable production-origin resolution**

Create `app/lib/site-url.ts`:

```ts
const FALLBACK_SITE_URL = "https://red-tarot-learning.bqk2h.chatgpt.site";

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return new URL(configured || FALLBACK_SITE_URL).origin;
}
```

- [ ] **Step 4: Implement sitemap and crawler policy**

Create `app/sitemap.ts`:

```ts
import type { MetadataRoute } from "next";
import { allCards } from "./data/cards";
import { guides } from "./data/guides";
import { publicReadings } from "./lib/public-content";
import { getSiteUrl } from "./lib/site-url";

const updated = new Date("2026-08-02T00:00:00+09:00");

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const paths = ["/", "/cards", ...allCards.map((card) => `/cards/${card.id}`), "/readings", ...publicReadings.map((reading) => `/readings/${reading.id}`), "/guides", ...guides.map((guide) => `/guides/${guide.slug}`)];
  return paths.map((path) => {
    const changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = path === "/" ? "weekly" : "monthly";
    return { url: `${base}${path}`, lastModified: updated, changeFrequency, priority: path === "/" ? 1 : path.split("/").length === 2 ? 0.8 : 0.7 };
  });
}
```

Create `app/robots.ts`:

```ts
import type { MetadataRoute } from "next";
import { getSiteUrl } from "./lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/auth/", "/me", "/review"] }], sitemap: `${base}/sitemap.xml`, host: base };
}
```

- [ ] **Step 5: Create safe JSON-LD serialization and a global 404**

Create `app/components/JsonLd.tsx`:

```tsx
export function JsonLd({ data }: { data: unknown }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
```

Create `app/not-found.tsx`:

```tsx
import Link from "next/link";
import { AppShell } from "./components/AppShell";

export default function NotFound() {
  return <AppShell><section className="empty-state"><span aria-hidden="true">?</span><h1>페이지를 찾지 못했어요</h1><p>주소가 바뀌었거나 공개되지 않은 내용이에요. 카드 사전에서 다시 찾아보세요.</p><div className="button-row"><Link className="primary-button" href="/cards">카드 검색하기</Link><Link className="secondary-button" href="/">홈으로</Link></div></section></AppShell>;
}
```

- [ ] **Step 6: Add structured-data builders and render them on public articles**

Create `app/lib/structured-data.ts`:

```ts
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
```

In `app/cards/[cardId]/page.tsx`, add:

```tsx
import { JsonLd } from "../../components/JsonLd";
import { createArticleStructuredData } from "../../lib/structured-data";
```

Replace the page component's final return with:

```tsx
const structured = createArticleStructuredData({
  headline: `${card.nameKo} 카드 뜻`,
  description: card.coreMeaning,
  path: `/cards/${card.id}`,
  breadcrumbs: [
    { name: "홈", path: "/" },
    { name: "카드 사전", path: "/cards" },
    { name: card.nameKo, path: `/cards/${card.id}` },
  ],
});
return <><JsonLd data={structured.article} /><JsonLd data={structured.breadcrumb} /><AppShell active="cards"><CardDetail card={card} /></AppShell></>;
```

In `app/readings/[setId]/page.tsx`, add the same two imports using `../../`, then replace the final return with:

```tsx
const structured = createArticleStructuredData({
  headline: reading.headline,
  description: reading.fullInterpretation,
  path: `/readings/${reading.id}`,
  breadcrumbs: [
    { name: "홈", path: "/" },
    { name: "조합 예제", path: "/readings" },
    { name: reading.headline, path: `/readings/${reading.id}` },
  ],
});
return <><JsonLd data={structured.article} /><JsonLd data={structured.breadcrumb} /><AppShell active="readings"><ReadingArticle reading={reading} cards={cards as TarotCard[]} /></AppShell></>;
```

In `app/guides/[slug]/page.tsx`, add the same two imports using `../../`, then replace the final return with:

```tsx
const structured = createArticleStructuredData({
  headline: guide.title,
  description: guide.description,
  path: `/guides/${guide.slug}`,
  breadcrumbs: [
    { name: "홈", path: "/" },
    { name: "기초 가이드", path: "/guides" },
    { name: guide.title, path: `/guides/${guide.slug}` },
  ],
});
return <><JsonLd data={structured.article} /><JsonLd data={structured.breadcrumb} /><AppShell><GuideArticle guide={guide} /></AppShell></>;
```

Append this assertion to the existing complete-card render test:

```js
assert.match(html, /type="application\/ld\+json"/);
assert.match(html, /BreadcrumbList/);
```

- [ ] **Step 7: Update unknown-route tests to require 404 status**

Replace the old unknown-card test with:

```js
test("returns a real recovery 404 for unknown content", async () => {
  for (const pathname of ["/cards/not-a-card", "/readings/not-a-reading", "/guides/not-a-guide"]) {
    const response = await render(pathname);
    const html = await response.text();
    assert.equal(response.status, 404);
    assert.match(html, /페이지를 찾지 못했어요/);
    assert.match(html, /카드 검색하기/);
  }
});
```

- [ ] **Step 8: Run SEO and 404 tests**

Run:

```bash
npx tsx --test tests/seo.test.ts
npm run build:sites
node --test --test-name-pattern="recovery 404" tests/rendered-html.test.mjs
```

Expected: sitemap, robots, structured-data, and 404 assertions PASS.

- [ ] **Step 9: Commit technical SEO infrastructure**

```bash
git add app/lib/site-url.ts app/lib/structured-data.ts app/components/JsonLd.tsx app/cards/'[cardId]'/page.tsx app/readings/'[setId]'/page.tsx app/guides/'[slug]'/page.tsx app/sitemap.ts app/robots.ts app/not-found.tsx tests/seo.test.ts tests/rendered-html.test.mjs
git commit -m "feat: add technical SEO foundation"
```

## Task 7: Add accurate trust and policy pages for the current phase

**Files:**
- Create: `app/components/InfoPage.tsx`
- Create: `app/(info)/about/page.tsx`
- Create: `app/(info)/editorial-policy/page.tsx`
- Create: `app/(info)/privacy/page.tsx`
- Create: `app/(info)/terms/page.tsx`
- Create: `app/(info)/disclaimer/page.tsx`
- Create: `app/(info)/contact/page.tsx`
- Modify: `app/components/AppShell.tsx`
- Modify: `tests/rendered-html.test.mjs`

- [ ] **Step 1: Write a failing trust-page render test**

Append to `tests/rendered-html.test.mjs`:

```js
test("publishes complete trust and policy pages", async () => {
  const expectations = new Map([
    ["/about", "빨강타로 소개"],
    ["/editorial-policy", "콘텐츠 작성 기준"],
    ["/privacy", "개인정보처리방침"],
    ["/terms", "이용약관"],
    ["/disclaimer", "타로 해석의 한계"],
    ["/contact", "문의하기"],
  ]);
  for (const [pathname, heading] of expectations) {
    const response = await render(pathname);
    const html = await response.text();
    assert.equal(response.status, 200);
    assert.match(html, new RegExp(heading));
  }
});
```

- [ ] **Step 2: Run the trust-page test and verify it fails**

Run:

```bash
npm run build:sites
node --test --test-name-pattern="trust and policy" tests/rendered-html.test.mjs
```

Expected: FAIL because the six pages do not exist.

- [ ] **Step 3: Create the reusable information-page layout**

Create `app/components/InfoPage.tsx`:

```tsx
import { AppShell } from "./AppShell";

type Section = { heading: string; paragraphs: string[]; bullets?: string[] };
export function InfoPage({ title, lead, sections }: { title: string; lead: string; sections: Section[] }) {
  return <AppShell><article className="info-page"><header><span className="eyebrow">RED TAROT</span><h1>{title}</h1><p>{lead}</p></header>{sections.map((section) => <section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.bullets ? <ul>{section.bullets.map((item) => <li key={item}>{item}</li>)}</ul> : null}</section>)}</article></AppShell>;
}
```

- [ ] **Step 4: Create the six pages with current, non-speculative disclosures**

Create `app/(info)/about/page.tsx`:

```tsx
import { InfoPage } from "../../components/InfoPage";
export default function AboutPage() { return <InfoPage title="빨강타로 소개" lead="빨강타로는 완성된 점괘를 소비하는 대신 카드와 배열의 근거를 연결해 스스로 읽는 법을 배우는 무료 웹 서비스입니다." sections={[{ heading: "서비스가 돕는 일", paragraphs: ["78장 카드의 핵심 동사, 정·역방향, 분야별 의미와 실제 조합 예제를 제공합니다. 초보자가 단어를 외우는 데서 멈추지 않고 자기 문장으로 해석하도록 돕습니다."] }, { heading: "운영 원칙", paragraphs: ["미래를 확정하거나 의료·법률·재무 판단을 대신하지 않습니다. 모든 해석은 현재 상황을 살피고 선택지를 정리하는 학습 자료로 제공합니다."] }]} />; }
```

Create `app/(info)/editorial-policy/page.tsx`:

```tsx
import { InfoPage } from "../../components/InfoPage";
export default function EditorialPolicyPage() { return <InfoPage title="콘텐츠 작성 기준" lead="모든 카드와 조합 설명은 초보자가 근거를 확인할 수 있도록 같은 해석 문법과 안전 기준으로 작성합니다." sections={[{ heading: "해석 문법", paragraphs: ["카드의 중심 동사, 배열 위치, 질문 분야, 카드 관계를 순서대로 연결합니다. 역방향은 차단·지연·내면화·과잉·결핍 중 맥락에 맞는 방식으로 설명합니다."] }, { heading: "검수 기준", paragraphs: ["카드 ID와 방향, 위치, 해설의 일치 여부를 자동 검사하고 문장 흐름과 고유성은 사람이 확인합니다."], bullets: ["결과를 반드시 일어난다고 단정하지 않음", "다른 페이지의 문장을 단어만 바꿔 반복하지 않음", "건강·재물 내용에 필요한 안전 안내를 제공함"] }]} />; }
```

Create `app/(info)/privacy/page.tsx`:

```tsx
import { InfoPage } from "../../components/InfoPage";
export default function PrivacyPage() { return <InfoPage title="개인정보처리방침" lead="현재 공개 버전은 계정 정보를 수집하지 않으며 학습 기록을 사용자의 브라우저에 저장합니다." sections={[{ heading: "브라우저에 저장되는 정보", paragraphs: ["완료한 학습, 오답 학습, 즐겨찾기 카드, 마지막 학습 위치, 연속 학습일을 localStorage에 저장합니다. 이 정보는 현재 다른 기기와 공유되지 않습니다."] }, { heading: "서비스 운영 과정의 정보", paragraphs: ["호스팅 제공자는 보안과 안정적인 전송을 위해 일반적인 접속 로그를 처리할 수 있습니다. 빨강타로는 현재 광고나 별도 분석 쿠키를 활성화하지 않습니다."] }, { heading: "삭제 방법", paragraphs: ["브라우저의 사이트 데이터 또는 localStorage를 삭제하면 이 기기에 저장된 학습 기록이 삭제됩니다. 계정 동기화와 광고가 추가되기 전 이 방침을 실제 처리 구조에 맞춰 다시 고지합니다."] }]} />; }
```

Create `app/(info)/terms/page.tsx`:

```tsx
import { InfoPage } from "../../components/InfoPage";
export default function TermsPage() { return <InfoPage title="이용약관" lead="빨강타로의 무료 학습 콘텐츠를 이용할 때 적용되는 기본 조건입니다." sections={[{ heading: "서비스 이용", paragraphs: ["사용자는 개인적인 학습 목적으로 서비스를 이용할 수 있습니다. 서비스의 콘텐츠나 구조를 무단으로 대량 수집하거나 재배포해서는 안 됩니다."] }, { heading: "서비스 변경", paragraphs: ["콘텐츠의 정확성과 안정성을 높이기 위해 기능과 설명을 수정할 수 있습니다. 중요한 개인정보 처리 변경은 적용 전에 정책 페이지에서 알립니다."] }, { heading: "책임의 범위", paragraphs: ["타로 설명은 교육과 자기성찰을 위한 참고 자료이며 사용자의 의료, 법률, 재무 또는 관계 결정 결과를 보장하지 않습니다."] }]} />; }
```

Create `app/(info)/disclaimer/page.tsx`:

```tsx
import { InfoPage } from "../../components/InfoPage";
export default function DisclaimerPage() { return <InfoPage title="타로 해석의 한계" lead="타로는 상황을 다른 관점에서 살피는 학습 도구이며 사실 확인, 진단, 예측 보장 수단이 아닙니다." sections={[{ heading: "건강", paragraphs: ["카드 내용은 질병이나 임신을 진단하지 않으며 치료 효과를 판단하지 않습니다. 지속되거나 심한 증상, 위급한 상황은 의료 전문가나 응급 서비스의 평가가 우선입니다."] }, { heading: "재물과 법률", paragraphs: ["투자, 대출, 계약, 법적 대응은 카드 해석만으로 결정하지 말고 자격을 갖춘 전문가와 실제 자료를 확인해야 합니다."] }, { heading: "관계와 안전", paragraphs: ["통제, 위협, 폭력처럼 안전이 관련된 상황에서는 관계의 운세보다 안전 확보와 신뢰할 수 있는 기관의 도움을 우선합니다."] }]} />; }
```

Create `app/(info)/contact/page.tsx`:

```tsx
import { InfoPage } from "../../components/InfoPage";
export default function ContactPage() { return <InfoPage title="문의하기" lead="카드 설명의 오류, 접근성 문제, 개인정보 관련 요청을 확인합니다." sections={[{ heading: "문의에 포함할 내용", paragraphs: ["문제가 발생한 페이지 주소, 사용한 기기와 브라우저, 기대한 동작과 실제 동작을 함께 적으면 더 빠르게 확인할 수 있습니다."] }, { heading: "현재 문의 경로", paragraphs: ["공개 베타 운영 전에는 이 프로젝트를 공유한 작업 공간의 소유자에게 문의합니다. 운영 도메인과 공식 이메일이 확정되면 이 페이지의 연락처를 실제 정보로 교체한 뒤 출시합니다."] }]} />; }
```

- [ ] **Step 5: Link the now-live trust pages from every page**

In `app/components/AppShell.tsx`, add this footer immediately after `</main>` and before the bottom navigation:

```tsx
<footer className="site-footer">
  <nav aria-label="서비스 정보">
    <Link href="/about">소개</Link>
    <Link href="/editorial-policy">콘텐츠 기준</Link>
    <Link href="/privacy">개인정보</Link>
    <Link href="/terms">이용약관</Link>
    <Link href="/disclaimer">해석의 한계</Link>
    <Link href="/contact">문의</Link>
  </nav>
  <p>타로 설명은 학습과 자기성찰을 위한 참고 자료이며 의료·법률·재무 판단을 대신하지 않습니다.</p>
</footer>
```

- [ ] **Step 6: Add the now-live trust pages to the sitemap test and implementation**

In `tests/seo.test.ts`, change the expected URL count and add explicit trust-page checks:

```ts
assert.equal(urls.length, 1 + 1 + 78 + 1 + 30 + 1 + 3 + 6);
for (const path of ["/about", "/editorial-policy", "/privacy", "/terms", "/disclaimer", "/contact"]) {
  assert.ok(urls.includes(`https://redtarot.example${path}`));
}
```

In `app/sitemap.ts`, append these paths after the guide-detail paths inside the `paths` array:

```ts
"/about",
"/editorial-policy",
"/privacy",
"/terms",
"/disclaimer",
"/contact",
```

- [ ] **Step 7: Build and run the trust-page and sitemap tests**

Run:

```bash
npm run build:sites
node --test --test-name-pattern="trust and policy" tests/rendered-html.test.mjs
npx tsx --test tests/seo.test.ts
```

Expected: trust-page render and sitemap tests PASS.

- [ ] **Step 8: Commit trust pages**

```bash
git add app/components/InfoPage.tsx 'app/(info)' app/components/AppShell.tsx app/sitemap.ts tests/seo.test.ts tests/rendered-html.test.mjs
git commit -m "feat: add public trust pages"
```

## Task 8: Apply the public-content UX/UI system and responsive behavior

**Files:**
- Modify: `app/globals.css`
- Modify: `tests/rendered-html.test.mjs`

- [ ] **Step 1: Add a structural class-presence regression test**

Append to `tests/rendered-html.test.mjs`:

```js
test("renders public content landmarks without duplicate h1 elements", async () => {
  for (const pathname of ["/", "/cards/the-lovers", "/readings/love-three-001", "/guides/upright-and-reversed"]) {
    const html = await (await render(pathname)).text();
    assert.equal((html.match(/<h1/g) ?? []).length, 1, pathname);
    assert.match(html, /id="main-content"/);
  }
});
```

- [ ] **Step 2: Run the landmark test before CSS changes**

Run:

```bash
npm run build:sites
node --test --test-name-pattern="public content landmarks" tests/rendered-html.test.mjs
```

Expected: PASS. This protects structure while visual work proceeds.

- [ ] **Step 3: Append the exact public-content style layer**

Append to `app/globals.css`:

```css
/* Public content service */
.public-home,.card-article,.reading-article,.guide-article,.reading-directory,.guide-directory,.info-page{width:min(1120px,calc(100% - 40px));margin:0 auto;padding:48px 0 120px}.search-hero{padding:64px clamp(24px,6vw,80px);text-align:center;border:1px solid #f1cbd2;border-radius:36px;background:radial-gradient(circle at 85% 15%,#ffd45d 0 7%,transparent 7.5%),linear-gradient(145deg,#ffe4e8,#fff7ef)}.search-hero h1{max-width:none;margin:10px 0 12px;font-size:clamp(2.4rem,7vw,5rem);line-height:.98;color:#74162a}.search-hero>p{margin:0 auto 26px;color:#684f4d;font-size:1.05rem}.site-search{position:relative;width:min(720px,100%);margin:0 auto;text-align:left}.site-search-input{display:flex;align-items:center;gap:12px;padding:0 20px;border:2px solid #cf1739;border-radius:999px;background:#fff;box-shadow:0 14px 40px rgb(109 20 42 / 12%)}.site-search-input svg{width:22px;color:#c7183a}.site-search-input input{width:100%;min-height:58px;border:0;outline:0;background:transparent;font:inherit}.site-search-results{position:absolute;z-index:20;top:68px;right:0;left:0;padding:8px;border:1px solid #ead8d2;border-radius:22px;background:#fff;box-shadow:0 22px 60px rgb(74 30 37 / 18%)}.site-search-results>a{display:grid;grid-template-columns:42px 1fr 20px;gap:12px;align-items:center;padding:12px;border-radius:14px;color:inherit;text-decoration:none}.site-search-results>a:hover,.site-search-results>a:focus-visible{background:#fff0f2}.site-search-results>a>span:nth-child(2){display:grid;gap:2px}.site-search-results small{color:#c1173a;font-weight:800}.site-search-results strong{color:#352625}.site-search-results span span{overflow:hidden;color:#77625d;font-size:.82rem;text-overflow:ellipsis;white-space:nowrap}.search-result-icon{display:grid;width:42px;height:42px;place-items:center;border-radius:12px;background:#ffe1e6;color:#b71734}.site-search-empty{display:grid;gap:5px;padding:20px;text-align:center}.quick-search-links{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-top:18px}.quick-search-links a{padding:7px 12px;border:1px solid #e9cfd3;border-radius:999px;background:rgb(255 255 255 / 72%);color:#70464d;text-decoration:none}.public-section{margin-top:54px}.section-heading>a{display:inline-flex;align-items:center;gap:6px;color:#aa1834;font-weight:800;text-decoration:none}.popular-card-grid,.guide-preview-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}.popular-card-grid>a{display:flex;align-items:center;gap:18px;padding:20px;border:1px solid #ead9d2;border-radius:24px;background:#fff;color:inherit;text-decoration:none}.popular-card-grid>a>span{display:grid;gap:5px}.popular-card-grid small{color:#8a7069}.guide-preview-grid>a,.reading-directory-grid>a,.guide-directory-grid>a{display:grid;gap:10px;padding:24px;border:1px solid #ead9d2;border-radius:24px;background:#fff;color:inherit;text-decoration:none}.guide-preview-grid p,.reading-directory-grid p,.guide-directory-grid p{margin:0;color:#735f5a;line-height:1.6}.guide-number{color:#c7193b;font-weight:900;letter-spacing:.08em}.reading-preview,.course-preview{display:flex;align-items:center;justify-content:space-between;gap:28px;padding:32px;border-radius:28px}.reading-preview{background:#3e1a24;color:#fff}.reading-preview h2,.reading-preview p{color:#fff}.course-preview{border:2px solid #d51a3d;background:#fff2f4}.course-preview-icon{display:grid;width:58px;height:58px;flex:0 0 auto;place-items:center;border-radius:18px;background:#d41a3d;color:#fff}.card-answer{max-width:620px;color:#5f4c48;font-size:1.08rem;line-height:1.75}.long-form-contents{position:sticky;z-index:10;top:12px;display:flex;gap:8px;overflow:auto;margin:28px 0;padding:10px;border:1px solid #eadbd5;border-radius:16px;background:rgb(255 250 246 / 94%);backdrop-filter:blur(12px)}.long-form-contents a{padding:8px 12px;border-radius:10px;color:#684e4b;font-size:.88rem;font-weight:800;text-decoration:none;white-space:nowrap}.long-form-contents a:hover,.long-form-contents a:focus-visible{background:#ffe2e7;color:#ae1633}.article-section{margin-top:22px;padding:clamp(24px,4vw,44px);scroll-margin-top:90px;border:1px solid #eadbd5;border-radius:28px;background:#fff}.article-section>h2{margin:8px 0 18px;color:#3a2928;font-size:clamp(1.45rem,3vw,2.2rem)}.article-section p,.guide-section li{color:#655450;line-height:1.8}.article-section-group{scroll-margin-top:90px}.category-article-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.category-article-grid>section{padding:20px;border-radius:18px;background:#fff7f3}.category-article-grid h3{margin-top:0}.related-reading-list>a{display:grid;grid-template-columns:1fr auto;gap:6px 16px;padding:16px 0;border-top:1px solid #eee1dc;color:inherit;text-decoration:none}.related-reading-list>a span{color:#7b6761}.related-reading-list>a svg{grid-column:2;grid-row:1/3;align-self:center}.reading-directory>header,.guide-directory>header,.info-page>header,.reading-article-header,.guide-article-header{max-width:800px;margin-bottom:32px}.reading-directory>header h1,.guide-directory>header h1,.info-page h1,.reading-article-header h1,.guide-article-header h1{margin:8px 0 12px;font-size:clamp(2.2rem,6vw,4.4rem);line-height:1.04;color:#671528}.reading-directory-grid,.guide-directory-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.reading-directory-grid>a>span{color:#bd1938;font-size:.78rem;font-weight:900}.reading-spread{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin:28px 0;padding:28px;border-radius:28px;background:#3b1823}.reading-spread>div{display:grid;justify-items:center;gap:8px;color:#fff;text-align:center}.reading-spread>div>span{min-height:32px;color:#ffd6dd;font-size:.82rem;font-weight:800}.evidence-list{display:grid;gap:12px}.evidence-list>section{display:grid;grid-template-columns:38px 1fr;gap:14px;padding:16px;border-radius:16px;background:#fff7f3}.evidence-list>section>span{display:grid;width:32px;height:32px;place-items:center;border-radius:50%;background:#d51a3d;color:#fff;font-weight:900}.evidence-list h3,.evidence-list p{margin:0}.connection-line{font-weight:900;color:#b71937!important}.alternative-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.alternative-grid>div{padding:18px;border-radius:16px;background:#fff6f2}.alternative-grid span{color:#b31937;font-weight:900}.reading-practice-link{width:max-content;margin:24px auto 0}.guide-section{position:relative;padding-left:clamp(28px,6vw,72px)}.guide-section>.guide-number{position:absolute;top:34px;left:24px}.related-cards>div{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.related-cards a{display:flex;align-items:center;gap:12px;padding:14px;border-radius:16px;background:#fff7f3;color:inherit;text-decoration:none}.related-cards a>span{display:grid;margin-right:auto}.info-page{max-width:880px}.info-page>section{margin-top:18px;padding:26px;border:1px solid #eadbd5;border-radius:22px;background:#fff}.info-page>section p,.info-page>section li{color:#655450;line-height:1.8}.favorite-control{margin-top:14px}.favorite-control .save-message{min-height:20px}.profile-dot{text-decoration:none}.public-home a:focus-visible,.card-article a:focus-visible,.reading-article a:focus-visible,.guide-article a:focus-visible,.info-page a:focus-visible{outline:3px solid #201a19;outline-offset:3px}
.site-footer{display:grid;gap:12px;margin:56px 0 18px;padding:26px 0 10px;border-top:1px solid #e7d9d3;color:#78645e;font-size:.82rem}.site-footer nav{display:flex;flex-wrap:wrap;gap:10px 18px}.site-footer a{font-weight:800}.site-footer p{max-width:760px;margin:0;line-height:1.6}
@media(max-width:800px){.public-home,.card-article,.reading-article,.guide-article,.reading-directory,.guide-directory,.info-page{width:min(100% - 24px,1120px);padding-top:24px}.search-hero{padding:42px 18px;border-radius:26px}.popular-card-grid,.guide-preview-grid,.reading-directory-grid,.guide-directory-grid,.category-article-grid,.alternative-grid,.related-cards>div{grid-template-columns:1fr}.reading-preview,.course-preview{align-items:flex-start;flex-direction:column}.reading-spread{gap:10px;padding:18px}.long-form-contents{top:6px;margin-inline:-4px}.article-section{padding:22px}.guide-section{padding-left:56px}.site-search-results{position:relative;top:8px}.quick-search-links{margin-top:24px}}
@media(prefers-reduced-motion:reduce){.site-search-results,.long-form-contents{scroll-behavior:auto}}
```

- [ ] **Step 4: Run lint, build, and all tests after CSS integration**

Run:

```bash
npm run lint
npm test
```

Expected: ESLint exits 0; the vinext build succeeds; all TypeScript and rendered HTML tests PASS.

- [ ] **Step 5: Perform responsive and keyboard visual QA**

Run:

```bash
npm run dev
```

Check these routes at 360×800, 768×1024, and 1440×1000:

- `/`
- `/cards/the-lovers`
- `/readings/love-three-001`
- `/guides/upright-and-reversed`
- `/me`
- `/cards/not-a-card`

For every route, verify no horizontal overflow, no content hidden by the bottom navigation, one visible page heading, visible keyboard focus, and readable text without zoom. On the homepage, type `연인`, `the lovers`, `역방향`, and an unmatched phrase; verify correct results and the recovery message. On article pages, use Tab and Enter to traverse the contents navigation, related links, and favorite button.

- [ ] **Step 6: Commit the verified UX/UI layer**

```bash
git add app/globals.css tests/rendered-html.test.mjs
git commit -m "style: polish public content experience"
```

## Task 9: Final verification and foundation handoff

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Document public routes and canonical configuration**

Append this section to `README.md`:

```markdown
## Public content service

- `/cards/[cardId]`: 78 indexable card meaning pages
- `/readings/[setId]`: 30 curated reading examples
- `/guides/[slug]`: reviewed beginner guides
- `/practice/[setId]`: interactive learning, intentionally `noindex`
- `/me`: device-local progress dashboard, intentionally `noindex`

Set `NEXT_PUBLIC_SITE_URL` to the owned production origin before generating the production sitemap. Until a custom domain is connected, the deployed Sites origin is the canonical fallback.

Advertising, analytics, and account synchronization are not active in this foundation slice. Trust pages describe only the data behavior that is actually running.
```

- [ ] **Step 2: Run the complete verification suite from a clean build output**

Run:

```bash
npm run lint
npm test
git diff --check
```

Expected: all commands exit 0, all tests PASS, and `git diff --check` prints nothing.

- [ ] **Step 3: Verify the production bundle contains public content**

Run:

```bash
rg -n "어떤 카드가 궁금하세요|카드별 핵심 근거|다섯 가지 방식|개인정보처리방침" dist/server dist/client
```

Expected: every phrase appears at least once in the built server or client output.

- [ ] **Step 4: Inspect repository state before the final commit**

Run:

```bash
git status --short
git diff --stat
```

Expected: only `README.md` and any small QA corrections from Task 8 are modified; no generated `dist`, `.next`, `.wrangler`, or `.superpowers` files are listed.

- [ ] **Step 5: Commit the verified foundation documentation**

```bash
git add README.md app/globals.css
git commit -m "docs: document public content foundation"
```

- [ ] **Step 6: Record the handoff evidence**

Run:

```bash
git log --oneline -9
git status --short --branch
```

Expected: the task commits are visible and the branch is clean. Report the routes created, the number of public cards/readings/guides, the full verification commands, and any external setup deliberately excluded by this plan.
