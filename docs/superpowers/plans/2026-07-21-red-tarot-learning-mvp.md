# Red Tarot Learning MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 체리 팝 스타일의 반응형 웹에서 메이저 아르카나 22장과 연애 3장 배열 10세트를 단계적으로 학습하고, 기기 안에 진도·오답·즐겨찾기를 저장할 수 있게 한다.

**Architecture:** Vinext/React의 세 경로(`/`, `/cards/[cardId]`, `/practice/[setId]`)를 사용한다. 카드와 학습 세트는 정적 TypeScript 데이터로 분리하고, 화면에서 고유 ID로 조합한다. 사용자 기록만 `localStorage`에 저장하며 저장 실패 시 메모리 상태로 계속 동작한다.

**Tech Stack:** Vinext, React 19, TypeScript, CSS, Lucide React, tsx with the Node test runner, Cloudflare Sites

---

## File map

- `app/layout.tsx`: 한국어 문서 설정과 사이트 메타데이터
- `app/globals.css`: 체리 팝 디자인 토큰, 반응형 레이아웃, 모션·접근성 규칙
- `app/page.tsx`: 홈 경로와 정적 메타데이터
- `app/cards/[cardId]/page.tsx`: 카드 ID 해석과 잘못된 카드 복구 화면
- `app/practice/[setId]/page.tsx`: 학습 세트 ID 해석과 잘못된 세트 복구 화면
- `app/components/AppShell.tsx`: 공통 헤더와 내비게이션
- `app/components/TarotCardVisual.tsx`: 교체 가능한 카드 비주얼
- `app/components/HomeDashboard.tsx`: 오늘의 카드, 진도, 최근 오답, 이어서 학습
- `app/components/CardDetail.tsx`: 카드 상세 탭과 즐겨찾기
- `app/components/PracticeLesson.tsx`: 직접 해석부터 퀴즈·복습까지 이어지는 단계형 학습
- `app/components/SafetyNote.tsx`: 건강 콘텐츠의 고정 안전 안내
- `app/data/cards.ts`: 메이저 아르카나 22장
- `app/data/learning-sets.ts`: 연애 3장 배열 10세트
- `app/lib/progress.ts`: 학습 기록 스키마, 직렬화, 저장 실패 복구
- `tests/content.test.ts`: 카드·학습 세트 참조 무결성
- `tests/progress.test.ts`: 학습 기록 병합·직렬화
- `tests/rendered-html.test.mjs`: 세 경로의 서버 렌더링과 복구 화면
- `public/og.png`: 완성된 사이트의 체리 팝 소셜 공유 이미지

## Content matrix

메이저 22장의 고유 ID와 중심 동사는 다음으로 고정한다.

| 번호 | ID | 이름 | 중심 동사 |
|---:|---|---|---|
| 0 | `the-fool` | 바보 | 시작한다 |
| 1 | `the-magician` | 마법사 | 활용한다 |
| 2 | `the-high-priestess` | 여사제 | 관찰한다 |
| 3 | `the-empress` | 여황제 | 돌본다 |
| 4 | `the-emperor` | 황제 | 통제한다 |
| 5 | `the-hierophant` | 교황 | 전통을 따른다 |
| 6 | `the-lovers` | 연인 | 선택한다 |
| 7 | `the-chariot` | 전차 | 전진한다 |
| 8 | `strength` | 힘 | 다스린다 |
| 9 | `the-hermit` | 은둔자 | 성찰한다 |
| 10 | `wheel-of-fortune` | 운명의 수레바퀴 | 전환한다 |
| 11 | `justice` | 정의 | 판단한다 |
| 12 | `the-hanged-man` | 매달린 사람 | 멈춰 본다 |
| 13 | `death` | 죽음 | 끝내고 바꾼다 |
| 14 | `temperance` | 절제 | 조율한다 |
| 15 | `the-devil` | 악마 | 얽매인다 |
| 16 | `the-tower` | 탑 | 무너뜨린다 |
| 17 | `the-star` | 별 | 회복한다 |
| 18 | `the-moon` | 달 | 흔들린다 |
| 19 | `the-sun` | 태양 | 드러낸다 |
| 20 | `judgement` | 심판 | 다시 부른다 |
| 21 | `the-world` | 세계 | 완성한다 |

연애 10세트의 배열과 핵심 연결은 다음으로 고정한다.

| 세트 ID | 카드 1 → 2 → 3 | 핵심 연결 |
|---|---|---|
| `love-three-001` | 연인 정 → 소드 2 정 → 컵 8 정 | 끌림과 선택 → 결정 유보 → 거리두기 |
| `love-three-002` | 바보 정 → 마법사 정 → 전차 정 | 열린 가능성 → 적극적 표현 → 빠른 진전 |
| `love-three-003` | 여사제 정 → 달 정 → 태양 정 | 감정 숨김 → 불확실성 → 솔직한 확인 |
| `love-three-004` | 황제 정 → 악마 정 → 절제 정 | 통제 → 집착 → 건강한 경계 조율 |
| `love-three-005` | 은둔자 정 → 매달린 사람 정 → 별 정 | 거리두기 → 멈춤과 재평가 → 점진적 회복 |
| `love-three-006` | 여황제 정 → 연인 역 → 정의 정 | 돌봄 → 선택의 불균형 → 관계 기준 확인 |
| `love-three-007` | 운명의 수레바퀴 정 → 죽음 정 → 세계 정 | 전환점 → 낡은 관계 방식 종료 → 한 단계 완성 |
| `love-three-008` | 힘 역 → 탑 정 → 심판 정 | 자신감 결핍 → 감춰진 문제 폭발 → 솔직한 재평가 |
| `love-three-009` | 교황 정 → 황제 정 → 바보 역 | 전통적 기대 → 책임과 규칙 → 새 단계에 대한 두려움 |
| `love-three-010` | 절제 역 → 전차 역 → 태양 정 | 조율 부족 → 방향 상실 → 명확한 대화 |

`소드 2`와 `컵 8`은 첫 세트에서 필요한 보조 카드로 `learning-sets.ts` 안의 `supportCards`에 같은 카드 스키마로 정의한다. 카드 도감 범위에는 포함하지 않는다.

---

### Task 1: Scaffold the Vinext site and replace starter tests

**Files:**
- Create: starter files from the bundled Sites initializer
- Modify: `.gitignore`
- Modify: `package.json`
- Replace: `tests/rendered-html.test.mjs`
- Remove after replacement: `app/_sites-preview/SkeletonPreview.tsx`
- Remove after replacement: `app/_sites-preview/preview.css`

- [ ] **Step 1: Preserve design artifacts, stop the brainstorming preview, and initialize the site at the project root**

Stop the visual companion. Move `docs`, `.gitignore`, and `.superpowers` into `work/pre-site-init/`, leaving only `.git` and `work` at the root. Run the bundled `sites-building/scripts/init-site.sh` with `/Users/munseongbeen/Desktop/빨강타로` as both the working directory and target. Restore `docs`, keep the generated dependency files, and move brainstorming artifacts to `work/brainstorm-artifacts/`.

Expected: `app/page.tsx`, `.openai/hosting.json`, `package.json`, and `node_modules/` exist at the project root; the approved design document remains under `docs/superpowers/specs/`.

- [ ] **Step 2: Start the retained development preview**

Run `npm run dev` and keep the session alive. Open the exact local URL printed by the healthy server once in Codex.

Expected: the starter loading screen opens while the site is built through live updates.

- [ ] **Step 3: Install the icon dependency and remove the disposable skeleton dependency**

Run:

```bash
npm install lucide-react
npm install --save-dev tsx
npm uninstall react-loading-skeleton
```

Expected: `package.json` and `package-lock.json` contain `lucide-react` and `tsx`; neither contains `react-loading-skeleton`.

- [ ] **Step 4: Change the test command to include TypeScript domain tests**

Update the scripts in `package.json` to:

```json
{
  "scripts": {
    "dev": "WRANGLER_LOG_PATH=.wrangler/wrangler.log vinext dev",
    "build": "WRANGLER_LOG_PATH=.wrangler/wrangler.log vinext build",
    "start": "WRANGLER_LOG_PATH=.wrangler/wrangler.log vinext start",
    "test": "npm run build && tsx --test tests/*.test.ts && node --test tests/rendered-html.test.mjs",
    "lint": "eslint . --ignore-pattern dist --ignore-pattern .next",
    "db:generate": "drizzle-kit generate"
  }
}
```

- [ ] **Step 5: Replace the starter render test with an intentionally failing product test**

Write `tests/rendered-html.test.mjs` with a reusable `render(pathname)` helper and this first test:

```js
import assert from "node:assert/strict";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("renders the Red Tarot home instead of the starter", async () => {
  const response = await render("/");
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /빨강타로/);
  assert.match(html, /오늘은/);
  assert.doesNotMatch(html, /Your site is taking shape|codex-preview|react-loading-skeleton/i);
});
```

- [ ] **Step 6: Run the test to verify the starter fails the product expectation**

Run: `npm test`

Expected: FAIL because the starter does not render `빨강타로`.

- [ ] **Step 7: Commit the scaffold and failing product test**

```bash
git add .
git commit -m "chore: scaffold red tarot learning site"
```

---

### Task 2: Define card content and validate all 22 cards

**Files:**
- Create: `app/data/cards.ts`
- Create: `tests/content.test.ts`

- [ ] **Step 1: Write the card content integrity tests**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { majorArcana } from "../app/data/cards.ts";

test("contains 22 unique major arcana cards", () => {
  assert.equal(majorArcana.length, 22);
  assert.equal(new Set(majorArcana.map((card) => card.id)).size, 22);
  assert.deepEqual(majorArcana.map((card) => card.number), Array.from({ length: 22 }, (_, i) => i));
});

test("every card has complete learning content", () => {
  for (const card of majorArcana) {
    assert.ok(card.nameKo && card.nameEn && card.coreVerb && card.coreMeaning);
    assert.ok(card.keywords.length >= 4);
    assert.ok(card.upright.summary && card.reversed.summary && card.reversed.mode);
    assert.ok(card.categories.love.upright && card.categories.money.upright && card.categories.health.upright);
    assert.ok(card.symbolism.length >= 2);
    assert.ok(card.commonMistakes.length >= 1);
  }
});
```

- [ ] **Step 2: Run the content test and verify it fails**

Run: `npx tsx --test tests/content.test.ts`

Expected: FAIL with module-not-found for `app/data/cards.ts`.

- [ ] **Step 3: Define the reusable card schema**

Start `app/data/cards.ts` with:

```ts
export type Orientation = "upright" | "reversed";
export type ReversalMode = "차단" | "지연" | "내면화" | "과잉" | "결핍";
export type Category = "love" | "money" | "health";

type DirectionMeaning = { summary: string; positive: string[]; caution: string[] };
type CategoryMeaning = { upright: string; reversed: string };

export type TarotCard = {
  id: string;
  number: number;
  nameKo: string;
  nameEn: string;
  arcana: "major" | "minor";
  coreVerb: string;
  keywords: string[];
  coreMeaning: string;
  upright: DirectionMeaning;
  reversed: DirectionMeaning & { mode: ReversalMode };
  categories: Record<Category, CategoryMeaning>;
  symbolism: { symbol: string; meaning: string }[];
  commonMistakes: string[];
  visual: { glyph: string; accent: "cherry" | "plum" | "apricot" | "gold" };
};
```

- [ ] **Step 4: Add all 22 objects using a complete typed seed list**

Use a `makeCard` helper that maps each seed into the `TarotCard` schema. Every seed below is required and contains the card-specific copy needed by the UI.

```ts
type CardSeed = Omit<TarotCard, "arcana" | "upright" | "reversed" | "categories" | "symbolism" | "commonMistakes" | "visual"> & {
  uprightSummary: string;
  positive: string[];
  caution: string[];
  reversedSummary: string;
  reversedPositive: string[];
  reversedCaution: string[];
  reversalMode: ReversalMode;
  categoryCopy: [string, string, string, string, string, string];
  symbols: [string, string, string, string];
  mistake: string;
  glyph: string;
  accent: TarotCard["visual"]["accent"];
};

const makeCard = (seed: CardSeed): TarotCard => ({
  id: seed.id,
  number: seed.number,
  nameKo: seed.nameKo,
  nameEn: seed.nameEn,
  arcana: "major",
  coreVerb: seed.coreVerb,
  keywords: seed.keywords,
  coreMeaning: seed.coreMeaning,
  upright: { summary: seed.uprightSummary, positive: seed.positive, caution: seed.caution },
  reversed: { summary: seed.reversedSummary, positive: seed.reversedPositive, caution: seed.reversedCaution, mode: seed.reversalMode },
  categories: {
    love: { upright: seed.categoryCopy[0], reversed: seed.categoryCopy[1] },
    money: { upright: seed.categoryCopy[2], reversed: seed.categoryCopy[3] },
    health: { upright: seed.categoryCopy[4], reversed: seed.categoryCopy[5] },
  },
  symbolism: [
    { symbol: seed.symbols[0], meaning: seed.symbols[1] },
    { symbol: seed.symbols[2], meaning: seed.symbols[3] },
  ],
  commonMistakes: [seed.mistake],
  visual: { glyph: seed.glyph, accent: seed.accent },
});

const cardSeeds: CardSeed[] = [
  { id: "the-fool", number: 0, nameKo: "바보", nameEn: "The Fool", coreVerb: "시작한다", keywords: ["시작", "자유", "모험", "가능성", "무계획"], coreMeaning: "아직 정해지지 않은 가능성을 향해 기존의 틀을 벗어나는 상태", uprightSummary: "새로운 시작과 열린 가능성", positive: ["도전", "자유로운 선택", "새로운 경험"], caution: ["준비 부족", "충동", "위험을 가볍게 봄"], reversedSummary: "시작이 막히거나 준비 없이 뛰어드는 상태", reversedPositive: ["위험을 다시 점검함"], reversedCaution: ["충동적 행동", "과도한 불안", "계획 없는 시작"], reversalMode: "차단", categoryCopy: ["새로운 만남이나 자유로운 관계의 가능성", "책임을 피하거나 관계 시작을 두려워함", "새로운 수입원이나 도전을 탐색함", "검증되지 않은 투자나 충동 소비", "새 생활 습관을 시작할 에너지", "안전과 기본적인 자기관리를 소홀히 함"], symbols: ["절벽", "미지의 영역과 위험", "흰 장미", "순수한 의도"], mistake: "무조건 어리석음으로만 해석하거나 새 시작을 반드시 좋은 결과로 단정하는 것", glyph: "✦", accent: "apricot" },
  { id: "the-magician", number: 1, nameKo: "마법사", nameEn: "The Magician", coreVerb: "활용한다", keywords: ["재능", "의지", "표현", "기술", "시작"], coreMeaning: "가진 자원과 기술을 의도적으로 연결해 결과를 만들어내는 상태", uprightSummary: "능력과 자원을 현실에 활용함", positive: ["주도성", "표현력", "실행력"], caution: ["과장", "영리한 조작", "말만 앞섬"], reversedSummary: "능력을 쓰지 못하거나 말과 행동이 어긋남", reversedPositive: ["준비 상태를 다시 확인함"], reversedCaution: ["허세", "기만", "집중력 분산"], reversalMode: "차단", categoryCopy: ["호감을 적극적으로 표현하고 관계를 시작함", "말뿐이거나 관계를 원하는 방향으로 조종함", "기술과 아이디어를 수입으로 연결함", "과장된 제안이나 불투명한 정보를 경계함", "회복 자원을 능동적으로 활용함", "아는 관리법을 실천하지 못함"], symbols: ["마법봉", "의지를 현실과 연결함", "네 가지 도구", "이미 가진 자원과 기술"], mistake: "마법사를 결과 보장 카드로 보고 과정과 숙련을 무시하는 것", glyph: "✧", accent: "gold" },
  { id: "the-high-priestess", number: 2, nameKo: "여사제", nameEn: "The High Priestess", coreVerb: "관찰한다", keywords: ["직감", "침묵", "내면", "비밀", "관찰"], coreMeaning: "겉으로 드러난 정보보다 내면의 신호를 조용히 읽는 상태", uprightSummary: "말보다 직감과 관찰을 신뢰함", positive: ["통찰", "신중함", "깊은 이해"], caution: ["수동성", "모호함", "감정 숨김"], reversedSummary: "직감을 불신하거나 비밀에 지나치게 갇힘", reversedPositive: ["숨긴 감정을 인식함"], reversedCaution: ["오해", "고립", "정보 은폐"], reversalMode: "내면화", categoryCopy: ["감정을 서두르지 않고 속마음을 살핌", "감정을 숨겨 관계가 모호해짐", "정보를 충분히 읽은 뒤 판단함", "불완전한 정보나 숨은 조건에 흔들림", "몸의 미세한 신호와 휴식 욕구를 살핌", "몸의 신호를 무시하거나 불안만 키움"], symbols: ["두 기둥", "상반된 힘 사이의 균형", "두루마리", "아직 완전히 드러나지 않은 지식"], mistake: "침묵을 무조건 비밀 연애나 거짓말로 단정하는 것", glyph: "☾", accent: "plum" },
  { id: "the-empress", number: 3, nameKo: "여황제", nameEn: "The Empress", coreVerb: "돌본다", keywords: ["풍요", "돌봄", "감각", "창조", "성장"], coreMeaning: "안전하고 풍요로운 환경을 만들어 생명과 관계를 성장시키는 상태", uprightSummary: "돌봄과 풍요가 자연스럽게 확장됨", positive: ["수용", "창조성", "안정감"], caution: ["과보호", "안일함", "감각적 과잉"], reversedSummary: "돌봄이 고갈되거나 과보호로 변함", reversedPositive: ["나를 먼저 돌볼 필요를 인식함"], reversedCaution: ["의존", "소진", "과소비"], reversalMode: "과잉", categoryCopy: ["애정과 돌봄이 관계를 풍성하게 함", "과보호나 의존으로 균형이 깨짐", "자원을 키우고 안정적으로 관리함", "편안함을 위한 과소비가 늘어남", "휴식과 영양 등 기본 돌봄을 채움", "타인을 돌보느라 자기관리가 고갈됨"], symbols: ["밀밭", "쌓여가는 풍요와 결실", "별 왕관", "감각과 직관의 넓은 연결"], mistake: "여황제를 임신이나 결혼으로 곧바로 단정하는 것", glyph: "❀", accent: "apricot" },
  { id: "the-emperor", number: 4, nameKo: "황제", nameEn: "The Emperor", coreVerb: "통제한다", keywords: ["구조", "책임", "권위", "경계", "안정"], coreMeaning: "분명한 원칙과 경계를 세워 상황을 안정시키는 상태", uprightSummary: "책임과 구조로 질서를 만듦", positive: ["리더십", "일관성", "보호"], caution: ["경직", "통제 욕구", "권위주의"], reversedSummary: "통제가 과해지거나 책임의 중심이 흔들림", reversedPositive: ["낡은 규칙을 점검함"], reversedCaution: ["독단", "무책임", "힘겨루기"], reversalMode: "과잉", categoryCopy: ["책임 있는 태도와 분명한 관계 기준", "통제와 힘겨루기가 친밀감을 막음", "예산과 원칙으로 재정을 안정시킴", "경직된 판단이나 권한 남용을 경계함", "규칙적인 생활 리듬을 세움", "몸을 지나치게 통제하거나 휴식을 억누름"], symbols: ["돌 왕좌", "흔들리지 않는 구조", "갑옷", "감정보다 앞선 방어와 책임"], mistake: "황제를 특정 남성이나 무조건 좋은 배우자로만 보는 것", glyph: "♜", accent: "cherry" },
  { id: "the-hierophant", number: 5, nameKo: "교황", nameEn: "The Hierophant", coreVerb: "전통을 따른다", keywords: ["전통", "배움", "규범", "조언", "공동체"], coreMeaning: "검증된 지식과 공동체의 기준을 통해 방향을 배우는 상태", uprightSummary: "전통과 조언에서 안정된 기준을 찾음", positive: ["멘토링", "신뢰", "공식화"], caution: ["고정관념", "형식주의", "타인의 기준"], reversedSummary: "기존 규칙이 맞지 않거나 맹목적으로 따름", reversedPositive: ["나만의 기준을 세움"], reversedCaution: ["반항을 위한 반항", "편견", "권위 의존"], reversalMode: "차단", categoryCopy: ["관계를 공식화하거나 가치관을 맞춤", "주변 기대가 두 사람의 선택을 압박함", "검증된 조언과 안정적 제도를 활용함", "관행을 의심 없이 따라 손해를 봄", "전문가의 일반적 관리 지침을 따름", "개인 상태를 무시한 획일적 습관에 매임"], symbols: ["두 열쇠", "지식에 접근하는 공인된 방식", "세 겹 왕관", "여러 층위의 책임과 전통"], mistake: "교황을 반드시 결혼 성사나 종교 문제로만 해석하는 것", glyph: "♢", accent: "gold" },
  { id: "the-lovers", number: 6, nameKo: "연인", nameEn: "The Lovers", coreVerb: "선택한다", keywords: ["끌림", "관계", "선택", "가치", "결합"], coreMeaning: "중요한 관계와 선택 앞에서 자신의 가치가 무엇인지 확인하는 상태", uprightSummary: "끌림과 가치의 일치 속에서 선택함", positive: ["교감", "솔직함", "상호 선택"], caution: ["선택 회피", "감정만 앞섬", "가치 충돌"], reversedSummary: "끌림은 있지만 선택과 가치가 어긋남", reversedPositive: ["관계의 기준을 다시 확인함"], reversedCaution: ["불균형", "우유부단", "자기기만"], reversalMode: "차단", categoryCopy: ["서로의 감정과 관계 방향을 선택함", "감정과 행동 또는 가치가 일치하지 않음", "가치에 맞는 계약이나 협업을 선택함", "눈앞의 매력 때문에 조건을 놓침", "몸에 맞는 관리 방식을 의식적으로 선택함", "서로 다른 조언 사이에서 결정을 미룸"], symbols: ["천사", "더 높은 가치와 양심", "두 사람", "서로 다른 존재의 자발적 결합"], mistake: "연인 카드를 무조건 연애 성사로 보는 것", glyph: "♥", accent: "cherry" },
  { id: "the-chariot", number: 7, nameKo: "전차", nameEn: "The Chariot", coreVerb: "전진한다", keywords: ["전진", "의지", "속도", "통제", "승부"], coreMeaning: "상반된 힘을 한 방향으로 모아 목표를 향해 밀고 나가는 상태", uprightSummary: "의지와 집중으로 빠르게 전진함", positive: ["추진력", "자신감", "목표 집중"], caution: ["성급함", "감정 억압", "과도한 경쟁"], reversedSummary: "방향을 잃거나 통제가 지나쳐 움직이지 못함", reversedPositive: ["속도와 방향을 다시 맞춤"], reversedCaution: ["폭주", "좌절", "통제 상실"], reversalMode: "차단", categoryCopy: ["관계를 진전시키려 적극적으로 행동함", "서로 다른 속도 때문에 관계가 흔들림", "목표 금액을 향해 집중적으로 실행함", "조급한 투자나 무리한 확장을 경계함", "운동과 생활 개선을 꾸준히 밀어감", "과도한 운동이나 목표 집착으로 지침"], symbols: ["두 스핑크스", "상반된 욕구를 한 방향으로 이끔", "별 장식", "명확한 목표와 정신적 집중"], mistake: "빠른 전진을 반드시 좋은 결말로 착각하는 것", glyph: "➜", accent: "plum" },
  { id: "strength", number: 8, nameKo: "힘", nameEn: "Strength", coreVerb: "다스린다", keywords: ["용기", "인내", "자기통제", "부드러움", "회복력"], coreMeaning: "강압보다 침착함과 인내로 본능과 감정을 다루는 상태", uprightSummary: "부드러운 용기와 지속적인 자기조절", positive: ["인내", "자신감", "회복력"], caution: ["감정 억누름", "과도한 참음", "통제 피로"], reversedSummary: "자신감이 약해지거나 감정을 억누르다 지침", reversedPositive: ["약한 부분을 인정함"], reversedCaution: ["자기비난", "소진", "감정 폭발"], reversalMode: "결핍", categoryCopy: ["다정함과 인내로 관계를 돌봄", "자신감 부족이나 억눌린 감정이 쌓임", "충동을 다스리고 장기 계획을 지킴", "불안 때문에 기회를 피하거나 무리하게 버팀", "무리하지 않는 꾸준한 회복 습관", "참기만 하다 몸과 마음이 소진됨"], symbols: ["사자", "강한 본능과 감정", "무한대", "지속되는 내면의 힘"], mistake: "힘 역방향을 단순한 나약함으로만 보는 것", glyph: "∞", accent: "gold" },
  { id: "the-hermit", number: 9, nameKo: "은둔자", nameEn: "The Hermit", coreVerb: "성찰한다", keywords: ["고독", "성찰", "거리", "지혜", "탐색"], coreMeaning: "외부 소음에서 물러나 스스로의 진짜 답을 찾는 상태", uprightSummary: "혼자 생각을 정리하며 본질을 찾음", positive: ["자기이해", "신중함", "깊은 탐구"], caution: ["고립", "지나친 분석", "연락 단절"], reversedSummary: "필요한 성찰이 고립이나 회피로 굳어짐", reversedPositive: ["도움을 받아들일 준비"], reversedCaution: ["외로움", "폐쇄", "생각의 반복"], reversalMode: "과잉", categoryCopy: ["혼자 관계의 의미와 욕구를 정리함", "감정 표현을 피하고 지나치게 거리를 둠", "소비를 줄이고 재정 상태를 차분히 점검함", "혼자 판단하다 필요한 정보를 놓침", "조용한 휴식과 자기 점검이 필요함", "고립과 생각의 반복으로 회복이 늦어짐"], symbols: ["등불", "지금 볼 수 있는 한 걸음의 지혜", "지팡이", "혼자 서는 경험과 지지"], mistake: "은둔자를 언제나 이별이나 잠수로만 해석하는 것", glyph: "⌁", accent: "plum" },
  { id: "wheel-of-fortune", number: 10, nameKo: "운명의 수레바퀴", nameEn: "Wheel of Fortune", coreVerb: "전환한다", keywords: ["변화", "주기", "기회", "전환점", "타이밍"], coreMeaning: "개인의 통제를 넘어 상황의 주기와 흐름이 바뀌는 상태", uprightSummary: "새로운 주기와 전환의 기회", positive: ["타이밍", "변화 수용", "뜻밖의 기회"], caution: ["수동적 기대", "변동성", "반복되는 패턴"], reversedSummary: "변화가 지연되거나 같은 패턴이 되풀이됨", reversedPositive: ["반복되는 원인을 알아차림"], reversedCaution: ["타이밍 불일치", "운에 의존", "변화 저항"], reversalMode: "지연", categoryCopy: ["관계가 예상 밖의 전환점을 맞음", "같은 관계 패턴이 반복되거나 타이밍이 어긋남", "수입과 기회의 흐름이 바뀜", "변동성을 운으로만 해결하려 함", "생활 리듬을 바꿀 계기가 생김", "좋아졌다 나빠지는 주기를 점검할 필요"], symbols: ["수레바퀴", "계속 변하는 삶의 주기", "네 생물", "변화 속에서도 유지되는 관점"], mistake: "아무 행동 없이 행운이 해결해 준다고 보는 것", glyph: "◉", accent: "gold" },
  { id: "justice", number: 11, nameKo: "정의", nameEn: "Justice", coreVerb: "판단한다", keywords: ["균형", "책임", "사실", "결정", "공정"], coreMeaning: "감정과 사실을 함께 살펴 선택의 결과를 책임지는 상태", uprightSummary: "사실과 기준에 따라 균형 있게 판단함", positive: ["공정함", "책임", "명료한 기준"], caution: ["차가운 판단", "흑백논리", "결과 집착"], reversedSummary: "기준이 흔들리거나 책임을 회피함", reversedPositive: ["불공정한 기준을 알아차림"], reversedCaution: ["편견", "책임 전가", "결정 회피"], reversalMode: "차단", categoryCopy: ["감정뿐 아니라 행동과 책임을 함께 봄", "불공정한 관계 규칙이나 책임 회피", "계약과 수치를 객관적으로 검토함", "조건을 왜곡하거나 책임 소재가 흐려짐", "생활 습관을 사실과 기록으로 점검함", "자기비난이나 한쪽 정보만으로 판단함"], symbols: ["저울", "여러 요소를 비교하는 균형", "검", "모호함을 가르는 분명한 결정"], mistake: "정의를 도덕적 심판이나 벌로만 해석하는 것", glyph: "⚖", accent: "cherry" },
  { id: "the-hanged-man", number: 12, nameKo: "매달린 사람", nameEn: "The Hanged Man", coreVerb: "멈춰 본다", keywords: ["정지", "관점", "기다림", "수용", "내려놓음"], coreMeaning: "억지로 움직이기보다 멈춰서 새로운 관점과 의미를 얻는 상태", uprightSummary: "멈춤을 받아들이며 관점을 바꿈", positive: ["통찰", "인내", "자발적 내려놓음"], caution: ["무기력", "희생 습관", "끝없는 대기"], reversedSummary: "멈춤의 의미를 얻지 못한 채 지연만 계속됨", reversedPositive: ["움직일 시점을 자각함"], reversedCaution: ["정체", "피해의식", "결정 미룸"], reversalMode: "지연", categoryCopy: ["관계를 서두르지 않고 다른 관점에서 봄", "한쪽만 희생하거나 애매한 대기가 길어짐", "즉시 결정보다 조건을 다시 살핌", "결정을 미뤄 기회비용이 커짐", "휴식과 회복을 위해 속도를 늦춤", "무기력하게 멈춰 생활 리듬이 더 흐트러짐"], symbols: ["거꾸로 선 자세", "익숙한 시각의 전환", "빛나는 머리", "멈춤에서 얻는 새로운 이해"], mistake: "정지를 아무 의미 없는 실패나 강제 희생으로만 보는 것", glyph: "↯", accent: "plum" },
  { id: "death", number: 13, nameKo: "죽음", nameEn: "Death", coreVerb: "끝내고 바꾼다", keywords: ["끝", "정리", "전환", "놓아줌", "재생"], coreMeaning: "더 이어갈 수 없는 형태를 끝내 다음 단계의 공간을 만드는 상태", uprightSummary: "필요한 끝맺음과 근본적인 전환", positive: ["정리", "새 국면", "해방"], caution: ["상실 두려움", "급격한 변화", "미련"], reversedSummary: "끝내야 할 것을 붙잡아 전환이 지연됨", reversedPositive: ["변화에 천천히 적응함"], reversedCaution: ["집착", "정체", "같은 문제 반복"], reversalMode: "지연", categoryCopy: ["낡은 관계 방식이나 관계 자체를 정리함", "끝을 받아들이지 못해 같은 갈등을 반복함", "수입·지출 구조를 근본적으로 바꿈", "손실을 인정하지 못해 자원을 묶어 둠", "해로운 생활 습관을 끝내고 새 리듬을 만듦", "바꿔야 할 습관을 계속 미룸"], symbols: ["흰 장미 깃발", "끝 속에 남아 있는 순수한 새 가능성", "떠오르는 태양", "종료 뒤 이어지는 다음 주기"], mistake: "실제 죽음이나 재난을 예언하는 카드로 보는 것", glyph: "✺", accent: "cherry" },
  { id: "temperance", number: 14, nameKo: "절제", nameEn: "Temperance", coreVerb: "조율한다", keywords: ["균형", "조화", "회복", "중용", "과정"], coreMeaning: "서로 다른 요소를 천천히 섞어 지속 가능한 균형을 만드는 상태", uprightSummary: "서두르지 않고 균형을 조율함", positive: ["협력", "회복", "적정선"], caution: ["느린 속도", "타협 과잉", "감정 희석"], reversedSummary: "조율이 깨져 한쪽으로 치우치거나 리듬이 불안정함", reversedPositive: ["불균형의 원인을 인식함"], reversedCaution: ["과잉", "충돌", "생활 리듬 붕괴"], reversalMode: "결핍", categoryCopy: ["서로의 속도와 차이를 천천히 맞춤", "주고받음이 불균형하고 감정 조절이 어려움", "수입과 지출을 지속 가능한 수준으로 맞춤", "한쪽 항목의 과도한 지출로 균형이 깨짐", "수면·식사·활동의 리듬을 조절함", "생활 패턴이 들쭉날쭉해 회복이 늦어짐"], symbols: ["두 잔", "서로 다른 요소의 지속적인 교환", "한 발씩 다른 곳", "현실과 감정 사이의 균형"], mistake: "절제를 무조건 참고 포기하라는 조언으로 보는 것", glyph: "≈", accent: "gold" },
  { id: "the-devil", number: 15, nameKo: "악마", nameEn: "The Devil", coreVerb: "얽매인다", keywords: ["집착", "유혹", "의존", "욕망", "속박"], coreMeaning: "벗어날 수 있지만 익숙한 욕망과 두려움 때문에 스스로 묶여 있는 상태", uprightSummary: "욕망과 의존이 선택을 좁힘", positive: ["숨은 욕구 직면", "강한 동기 인식", "그림자 이해"], caution: ["중독적 반복", "집착", "권력 불균형"], reversedSummary: "속박을 알아차리고 끊거나 내면의 집착이 더 깊어짐", reversedPositive: ["유해한 패턴에서 벗어남"], reversedCaution: ["문제 부정", "은밀한 의존", "반동"], reversalMode: "내면화", categoryCopy: ["강한 끌림 속 집착과 권력 차이를 점검함", "관계의 유해한 의존을 숨기거나 끊으려 함", "욕심과 단기 이익이 판단을 흔듦", "부채·투기·과소비의 반복을 부정함", "습관적 과잉과 스트레스 의존을 알아차림", "해로운 습관을 숨기거나 갑자기 끊다 반동이 옴"], symbols: ["느슨한 사슬", "선택을 바꾸면 벗어날 수 있는 속박", "거꾸로 든 횃불", "욕망이 이성을 가리는 상태"], mistake: "악마를 외부의 나쁜 사람 한 명으로만 보는 것", glyph: "♠", accent: "plum" },
  { id: "the-tower", number: 16, nameKo: "탑", nameEn: "The Tower", coreVerb: "무너뜨린다", keywords: ["충격", "붕괴", "진실", "해방", "재구성"], coreMeaning: "불안정한 기반이나 숨겨진 문제가 갑자기 드러나 기존 구조가 무너지는 상태", uprightSummary: "갑작스러운 진실과 구조의 붕괴", positive: ["거짓 안정 해체", "솔직한 직면", "재건 기회"], caution: ["충격", "갈등 폭발", "예상 밖 변화"], reversedSummary: "붕괴를 피하려 버티거나 충격을 내면에서 겪음", reversedPositive: ["큰 문제 전 작은 신호를 봄"], reversedCaution: ["변화 회피", "불안 누적", "내적 혼란"], reversalMode: "내면화", categoryCopy: ["감춰진 문제나 진실이 관계를 흔듦", "갈등을 피하다 내면의 불안이 커짐", "취약한 재정 구조나 예상 밖 지출을 점검함", "문제를 미뤄 손실 위험이 누적됨", "무리한 생활 구조를 멈추고 안전을 점검함", "몸의 경고를 무시한 채 불안을 견딤"], symbols: ["번개", "통제 밖에서 드러나는 진실", "무너지는 왕관", "지나친 확신과 권위의 해체"], mistake: "탑을 반드시 파산이나 큰 사고로 단정하는 것", glyph: "⚡", accent: "cherry" },
  { id: "the-star", number: 17, nameKo: "별", nameEn: "The Star", coreVerb: "회복한다", keywords: ["희망", "회복", "신뢰", "솔직함", "방향"], coreMeaning: "상처 뒤에 자신을 숨기지 않고 천천히 희망과 방향을 되찾는 상태", uprightSummary: "맑은 희망과 점진적인 회복", positive: ["신뢰", "치유", "진정성"], caution: ["막연한 기대", "현실 행동 부족", "취약함"], reversedSummary: "희망을 잃거나 가능성을 믿지 못함", reversedPositive: ["비현실적 기대를 조정함"], reversedCaution: ["낙담", "자기불신", "회복 조급증"], reversalMode: "결핍", categoryCopy: ["솔직함과 신뢰를 통해 관계가 회복됨", "상처 때문에 좋은 가능성도 믿지 못함", "장기적 목표와 가능성을 다시 그려봄", "막연한 낙관만 있고 실행 계획이 부족함", "무리하지 않는 점진적 회복과 자기 돌봄", "회복 속도를 불신하거나 희망을 잃음"], symbols: ["큰 별", "흔들릴 때 참고할 중심 방향", "흐르는 물", "감정과 현실에 나누어 주는 회복 에너지"], mistake: "별이 나왔다고 아무 행동 없이 모든 문제가 해결된다고 보는 것", glyph: "★", accent: "plum" },
  { id: "the-moon", number: 18, nameKo: "달", nameEn: "The Moon", coreVerb: "흔들린다", keywords: ["불확실", "불안", "직감", "환상", "무의식"], coreMeaning: "정보가 충분하지 않은 상황에서 직감과 불안이 뒤섞여 흔들리는 상태", uprightSummary: "불확실성 속에서 감정과 직감이 커짐", positive: ["무의식 탐색", "섬세한 감지", "상상력"], caution: ["오해", "불안 확대", "착각"], reversedSummary: "혼란이 걷히거나 숨은 불안이 더 선명해짐", reversedPositive: ["사실이 조금씩 드러남"], reversedCaution: ["자기기만", "불안 노출", "혼란 지속"], reversalMode: "내면화", categoryCopy: ["상대의 마음을 확신하기보다 사실을 확인해야 함", "오해가 풀리거나 숨긴 불안이 드러남", "불확실한 정보와 감정적 판단을 구분함", "소문이나 두려움 때문에 재정 판단이 흐려짐", "수면과 스트레스 등 감정적 리듬을 점검함", "불안을 진단처럼 받아들이거나 신호를 과장함"], symbols: ["달빛", "전체가 아닌 일부만 보이는 정보", "개와 늑대", "길들인 마음과 본능의 동시 반응"], mistake: "달을 무조건 거짓말이나 배신의 증거로 보는 것", glyph: "☾", accent: "plum" },
  { id: "the-sun", number: 19, nameKo: "태양", nameEn: "The Sun", coreVerb: "드러낸다", keywords: ["명확함", "기쁨", "활력", "성공", "개방"], coreMeaning: "숨겨진 것이 밝게 드러나 에너지와 자신감이 자연스럽게 퍼지는 상태", uprightSummary: "명확함과 활력이 상황을 밝힘", positive: ["솔직함", "성취", "따뜻함"], caution: ["낙관 과잉", "자기중심", "피로 무시"], reversedSummary: "좋은 에너지가 약해지거나 기쁨을 충분히 느끼지 못함", reversedPositive: ["작은 성취를 인정함"], reversedCaution: ["자신감 저하", "지연된 기쁨", "과열"], reversalMode: "결핍", categoryCopy: ["감정과 관계 방향이 솔직하게 드러남", "좋은 감정은 있지만 표현이나 확신이 약함", "성과와 수입 흐름을 명확히 확인함", "낙관으로 비용과 위험을 가볍게 봄", "활력과 긍정적인 생활 에너지를 느낌", "과열되거나 피로를 무시한 채 밝게만 행동함"], symbols: ["태양", "감춰진 것을 비추는 명확함", "해바라기", "빛을 따라 자라는 생명력"], mistake: "태양을 과정과 조건을 무시한 무조건적 성공으로 보는 것", glyph: "☀", accent: "gold" },
  { id: "judgement", number: 20, nameKo: "심판", nameEn: "Judgement", coreVerb: "다시 부른다", keywords: ["각성", "재평가", "부름", "용서", "결정"], coreMeaning: "과거를 있는 그대로 돌아보고 더 이상 미룰 수 없는 부름에 응답하는 상태", uprightSummary: "과거를 재평가하고 새로운 결정을 내림", positive: ["각성", "용서", "두 번째 기회"], caution: ["자기심판", "과거 집착", "성급한 결론"], reversedSummary: "부름을 외면하거나 자신을 지나치게 심판함", reversedPositive: ["결정 전 충분히 성찰함"], reversedCaution: ["후회 반복", "책임 회피", "자기비난"], reversalMode: "차단", categoryCopy: ["과거 관계를 재평가하고 다시 선택함", "재회 기대나 후회 속에서 결정을 미룸", "지난 선택의 결과를 검토하고 새 전략을 세움", "과거 손실을 자책하며 현재 판단을 놓침", "그동안의 생활 패턴을 돌아보고 도움을 요청함", "몸의 신호를 외면하거나 자기비난만 반복함"], symbols: ["나팔", "더 이상 무시하기 어려운 부름", "깨어나는 사람들", "과거 상태에서 벗어난 재평가"], mistake: "심판을 벌이나 반드시 일어나는 재회로 단정하는 것", glyph: "♬", accent: "cherry" },
  { id: "the-world", number: 21, nameKo: "세계", nameEn: "The World", coreVerb: "완성한다", keywords: ["완성", "통합", "성취", "마무리", "확장"], coreMeaning: "여러 경험을 하나로 통합해 한 주기를 온전히 마치고 다음으로 넘어가는 상태", uprightSummary: "한 주기의 완성과 통합", positive: ["성취", "안정", "넓어진 가능성"], caution: ["마무리 후 공백", "완벽주의", "정체"], reversedSummary: "마지막 단계가 남거나 완성을 스스로 인정하지 못함", reversedPositive: ["마무리할 부분을 정확히 봄"], reversedCaution: ["미완성", "지연", "끝없는 수정"], reversalMode: "지연", categoryCopy: ["관계가 한 단계 완성되거나 온전히 정리됨", "마무리하지 못한 문제가 다음 단계로 넘어감을 막음", "장기 목표를 달성하고 재정 구조를 통합함", "성과를 인정하지 못하거나 마지막 정리가 늦어짐", "생활 습관이 안정적으로 자리 잡음", "완벽하게 관리하려다 지속 가능성을 잃음"], symbols: ["월계관", "완성된 주기와 성취", "네 생물", "서로 다른 경험이 하나로 통합됨"], mistake: "세계를 모든 문제의 영구적 해결로 보는 것", glyph: "◎", accent: "apricot" },
];

export const majorArcana = cardSeeds.map(makeCard);

export function getCard(cardId: string) {
  return majorArcana.find((card) => card.id === cardId);
}
```

- [ ] **Step 5: Run the content test**

Run: `npx tsx --test tests/content.test.ts`

Expected: 2 tests PASS.

- [ ] **Step 6: Commit card content**

```bash
git add app/data/cards.ts tests/content.test.ts
git commit -m "feat: add major arcana learning content"
```

---

### Task 3: Add ten love lessons and reference validation

**Files:**
- Create: `app/data/learning-sets.ts`
- Modify: `tests/content.test.ts`

- [ ] **Step 1: Add failing lesson tests**

Append to `tests/content.test.ts`:

```ts
import { learningSets, supportCards } from "../app/data/learning-sets.ts";

test("contains ten complete love three-card lessons", () => {
  assert.equal(learningSets.length, 10);
  for (const lesson of learningSets) {
    assert.equal(lesson.category, "love");
    assert.equal(lesson.cards.length, 3);
    assert.equal(lesson.spread.positions.length, 3);
    assert.equal(lesson.cardAnalysis.length, 3);
    assert.equal(lesson.positionAnalysis.length, 3);
    assert.equal(lesson.quiz.options.length, 4);
    assert.ok(lesson.fullInterpretation && lesson.connection && lesson.alternatives.length >= 1);
  }
});

test("every lesson card id resolves", () => {
  const knownIds = new Set([...majorArcana, ...supportCards].map((card) => card.id));
  for (const lesson of learningSets) {
    for (const card of lesson.cards) assert.ok(knownIds.has(card.cardId), card.cardId);
  }
});
```

- [ ] **Step 2: Verify the lesson tests fail**

Run: `npx tsx --test tests/content.test.ts`

Expected: FAIL because `learning-sets.ts` is missing.

- [ ] **Step 3: Define and populate lessons**

Create `app/data/learning-sets.ts` with these types and one complete example, then add the remaining nine rows from the fixed content matrix with equally specific copy:

```ts
import type { Orientation, TarotCard } from "./cards";

export type LearningSet = {
  id: string;
  category: "love";
  difficulty: "basic";
  question: string;
  spread: { type: "three"; positions: [string, string, string] };
  cards: [
    { cardId: string; orientation: Orientation },
    { cardId: string; orientation: Orientation },
    { cardId: string; orientation: Orientation },
  ];
  headline: string;
  cardAnalysis: [string, string, string];
  positionAnalysis: [string, string, string];
  connection: string;
  relationship: "강화" | "충돌" | "원인과 결과" | "문제와 해결" | "겉과 속";
  fullInterpretation: string;
  alternatives: string[];
  conditions: string[];
  commonMistakes: string[];
  quiz: { question: string; options: [string, string, string, string]; answer: number; rationale: string };
};

export const supportCards: TarotCard[] = [
  {
    id: "two-of-swords", number: 2, nameKo: "소드 2", nameEn: "Two of Swords", arcana: "minor",
    coreVerb: "결정을 미룬다", keywords: ["판단 유보", "방어", "균형", "회피", "침묵"],
    coreMeaning: "상반된 선택 사이에서 감정을 닫고 결정을 미루는 상태",
    upright: { summary: "판단을 보류하며 균형을 유지함", positive: ["신중함", "중립", "생각할 시간"], caution: ["결정 회피", "감정 차단", "정보 부족"] },
    reversed: { summary: "미뤄 온 갈등이 안에서 커지거나 결정이 드러남", positive: ["결정의 필요를 인정함"], caution: ["혼란", "압박", "자기기만"], mode: "내면화" },
    categories: {
      love: { upright: "감정은 있어도 관계의 결정을 미룸", reversed: "숨겨 온 갈등이 드러나 선택을 피하기 어려움" },
      money: { upright: "재정 결정을 미루며 정보를 더 모음", reversed: "미뤄 온 계약이나 지출 결정을 급하게 처리함" },
      health: { upright: "몸의 신호를 판단하지 못하고 관찰함", reversed: "불편함을 외면하기 어려워 점검 필요를 느낌" },
    },
    symbolism: [{ symbol: "눈가리개", meaning: "사실을 바로 보지 않으려는 방어" }, { symbol: "교차한 검", meaning: "팽팽하게 맞선 두 선택" }],
    commonMistakes: ["감정이 전혀 없다고 단정하거나 중립을 영구적인 거절로 보는 것"],
    visual: { glyph: "⚔", accent: "plum" },
  },
  {
    id: "eight-of-cups", number: 8, nameKo: "컵 8", nameEn: "Eight of Cups", arcana: "minor",
    coreVerb: "떠난다", keywords: ["거리두기", "감정 정리", "이동", "미련", "의미 탐색"],
    coreMeaning: "정서적 의미가 줄어든 상황에서 미련을 안고도 더 나은 방향을 찾는 상태",
    upright: { summary: "익숙한 감정에서 물러나 새 의미를 찾음", positive: ["감정 정리", "자기존중", "새 방향"], caution: ["회피", "미련", "성급한 단절"] },
    reversed: { summary: "떠나지 못하고 같은 감정으로 돌아오거나 결정을 미룸", positive: ["떠날 이유를 다시 확인함"], caution: ["미련", "반복", "두려움"] , mode: "지연" },
    categories: {
      love: { upright: "관계에서 정서적으로 물러나 의미를 다시 찾음", reversed: "떠나지도 머물지도 못한 채 같은 감정을 반복함" },
      money: { upright: "수익이 있어도 의미 없는 일이나 계획을 정리함", reversed: "손실이 두려워 비효율적인 선택을 붙잡음" },
      health: { upright: "소진을 만든 환경이나 습관에서 거리를 둠", reversed: "바꿔야 할 생활 습관을 알면서도 되돌아감" },
    },
    symbolism: [{ symbol: "쌓인 컵", meaning: "완전히 비어 있지는 않은 기존 감정" }, { symbol: "먼 산", meaning: "익숙함을 떠나 찾는 더 깊은 의미" }],
    commonMistakes: ["모든 경우를 영구적인 이별로 단정하는 것"],
    visual: { glyph: "☾", accent: "apricot" },
  },
];

export const learningSets: LearningSet[] = [
  {
    id: "love-three-001",
    category: "love",
    difficulty: "basic",
    question: "이 관계의 현재 흐름은 어떻게 이어질까요?",
    spread: { type: "three", positions: ["현재 관계", "상대의 태도", "향후 흐름"] },
    cards: [
      { cardId: "the-lovers", orientation: "upright" },
      { cardId: "two-of-swords", orientation: "upright" },
      { cardId: "eight-of-cups", orientation: "upright" },
    ],
    headline: "감정이 있어도 결정을 미루면 관계가 멀어질 수 있어요",
    cardAnalysis: [
      "연인은 끌림과 함께 관계의 방향을 선택해야 하는 순간을 뜻해요.",
      "소드 2는 판단을 유보하고 마음을 쉽게 드러내지 않는 상태예요.",
      "컵 8은 현재 감정에서 한 걸음 물러나 거리를 두는 흐름이에요.",
    ],
    positionAnalysis: [
      "현재 관계가 중요하지만 방향을 정해야 해요.",
      "상대가 관계에 대한 판단을 미루고 있어요.",
      "회피가 이어지면 한쪽이 감정적으로 거리를 둘 수 있어요.",
    ],
    connection: "끌림과 선택 → 결정 유보 → 거리두기",
    relationship: "원인과 결과",
    fullInterpretation: "서로에 대한 감정이나 관계의 중요성은 있지만 상대가 명확한 결정을 피하고 있어요. 이 상태가 오래 지속되면 관계가 자연스럽게 멀어질 수 있습니다. 연인 카드는 무조건적인 성사가 아니라 선택해야 하는 관계라는 뜻이 더 강해요.",
    alternatives: ["한쪽이 기존 관계를 정리한 뒤 새로운 선택을 할 수 있어요."],
    conditions: ["상대가 솔직한 대화를 시작하면 컵 8은 이별보다 낡은 감정 패턴을 떠나는 의미가 될 수 있어요."],
    commonMistakes: ["연인을 무조건 연애 성사로 보거나 컵 8을 반드시 이별로 단정하는 것"],
    quiz: {
      question: "이 배열의 핵심 갈등은 무엇일까요?",
      options: ["감정이 전혀 없음", "선택과 결정을 미루는 태도", "경제적 문제", "주변 사람의 방해"],
      answer: 1,
      rationale: "연인의 선택 문제와 소드 2의 판단 유보가 중심 갈등을 만들어요.",
    },
  },
];

export function getLearningSet(setId: string) {
  return learningSets.find((set) => set.id === setId);
}

export function getLessonCard(cardId: string, majorArcana: TarotCard[]) {
  return [...majorArcana, ...supportCards].find((card) => card.id === cardId);
}
```

Add lessons 002–010 using the fixed content matrix. Every lesson must include its own three card analyses, three position analyses, alternative, condition, common mistake, and four-option quiz with rationale. Use each matrix row's exact card order and connection text; do not reuse lesson 001's explanatory sentences.

- [ ] **Step 4: Run all content tests**

Run: `npx tsx --test tests/content.test.ts`

Expected: 4 tests PASS.

- [ ] **Step 5: Commit lessons**

```bash
git add app/data/learning-sets.ts tests/content.test.ts
git commit -m "feat: add love spread learning sets"
```

---

### Task 4: Implement resilient local learning progress

**Files:**
- Create: `app/lib/progress.ts`
- Create: `tests/progress.test.ts`

- [ ] **Step 1: Write failing progress tests**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { defaultProgress, markLessonComplete, parseProgress, recordQuizAnswer, recordStudyDay, toggleFavorite } from "../app/lib/progress.ts";

test("repairs malformed stored progress", () => {
  assert.deepEqual(parseProgress("not-json"), defaultProgress);
  assert.deepEqual(parseProgress(JSON.stringify({ streak: -2 })), defaultProgress);
});

test("updates favorites, completion, and wrong answers without duplicates", () => {
  let progress = toggleFavorite(defaultProgress, "the-lovers");
  progress = toggleFavorite(progress, "the-lovers");
  assert.deepEqual(progress.favoriteCardIds, []);
  progress = markLessonComplete(progress, "love-three-001");
  progress = markLessonComplete(progress, "love-three-001");
  assert.deepEqual(progress.completedLessonIds, ["love-three-001"]);
  progress = recordQuizAnswer(progress, "love-three-001", false);
  assert.deepEqual(progress.wrongLessonIds, ["love-three-001"]);
});

test("increments a streak once per study day", () => {
  const first = recordStudyDay(defaultProgress, "2026-07-20", "2026-07-19");
  const sameDay = recordStudyDay(first, "2026-07-20", "2026-07-19");
  const nextDay = recordStudyDay(sameDay, "2026-07-21", "2026-07-20");
  assert.equal(first.streak, 1);
  assert.equal(sameDay.streak, 1);
  assert.equal(nextDay.streak, 2);
});
```

- [ ] **Step 2: Verify the tests fail**

Run: `npx tsx --test tests/progress.test.ts`

Expected: FAIL because `app/lib/progress.ts` is missing.

- [ ] **Step 3: Implement immutable progress helpers**

```ts
export const STORAGE_KEY = "red-tarot-progress-v1";

export type LearningProgress = {
  favoriteCardIds: string[];
  completedLessonIds: string[];
  wrongLessonIds: string[];
  lastLessonId: string | null;
  streak: number;
  lastStudyDate: string | null;
};

export const defaultProgress: LearningProgress = {
  favoriteCardIds: [],
  completedLessonIds: [],
  wrongLessonIds: [],
  lastLessonId: null,
  streak: 0,
  lastStudyDate: null,
};

export function parseProgress(raw: string | null): LearningProgress {
  if (!raw) return defaultProgress;
  try {
    const value = JSON.parse(raw) as Partial<LearningProgress>;
    if (!Array.isArray(value.favoriteCardIds) || !Array.isArray(value.completedLessonIds) ||
        !Array.isArray(value.wrongLessonIds) || typeof value.streak !== "number" || value.streak < 0) {
      return defaultProgress;
    }
    return { ...defaultProgress, ...value };
  } catch {
    return defaultProgress;
  }
}

const unique = (values: string[]) => [...new Set(values)];

export function toggleFavorite(progress: LearningProgress, cardId: string): LearningProgress {
  const exists = progress.favoriteCardIds.includes(cardId);
  return { ...progress, favoriteCardIds: exists
    ? progress.favoriteCardIds.filter((id) => id !== cardId)
    : unique([...progress.favoriteCardIds, cardId]) };
}

export function markLessonComplete(progress: LearningProgress, lessonId: string): LearningProgress {
  return { ...progress, completedLessonIds: unique([...progress.completedLessonIds, lessonId]), lastLessonId: lessonId };
}

export function recordQuizAnswer(progress: LearningProgress, lessonId: string, correct: boolean): LearningProgress {
  return { ...progress, wrongLessonIds: correct
    ? progress.wrongLessonIds.filter((id) => id !== lessonId)
    : unique([...progress.wrongLessonIds, lessonId]) };
}

export function recordStudyDay(progress: LearningProgress, today: string, yesterday: string): LearningProgress {
  if (progress.lastStudyDate === today) return progress;
  return {
    ...progress,
    streak: progress.lastStudyDate === yesterday ? progress.streak + 1 : 1,
    lastStudyDate: today,
  };
}

export function safeReadProgress(storage: Pick<Storage, "getItem"> | undefined) {
  return storage ? parseProgress(storage.getItem(STORAGE_KEY)) : defaultProgress;
}

export function safeWriteProgress(storage: Pick<Storage, "setItem"> | undefined, progress: LearningProgress) {
  try { storage?.setItem(STORAGE_KEY, JSON.stringify(progress)); return true; }
  catch { return false; }
}
```

- [ ] **Step 4: Run progress tests**

Run: `npx tsx --test tests/progress.test.ts`

Expected: 3 tests PASS.

- [ ] **Step 5: Commit progress helpers**

```bash
git add app/lib/progress.ts tests/progress.test.ts
git commit -m "feat: persist local learning progress"
```

---

### Task 5: Build the Cherry Pop shell and card visual

**Files:**
- Create: `app/components/AppShell.tsx`
- Create: `app/components/TarotCardVisual.tsx`
- Create: `app/components/SafetyNote.tsx`
- Modify: `app/layout.tsx`
- Replace: `app/globals.css`
- Delete: `app/_sites-preview/`

- [ ] **Step 1: Add shell expectations to the render test**

Append assertions in the home render test:

```js
assert.match(html, /홈/);
assert.match(html, /카드/);
assert.match(html, /연습/);
assert.match(html, /복습/);
assert.match(html, /lang="ko"/);
```

- [ ] **Step 2: Run the render test and verify it still fails**

Run: `npm test`

Expected: FAIL because the product shell does not exist.

- [ ] **Step 3: Implement the shared shell**

`AppShell.tsx` must render a landmark header, a skip link, main content, and four labeled navigation links. Use Lucide icons with `aria-hidden="true"`; include text labels so icons are never the only cue.

```tsx
import Link from "next/link";
import { BookOpen, Heart, Home, Sparkles } from "lucide-react";

export function AppShell({ children, active = "home" }: { children: React.ReactNode; active?: "home" | "cards" | "practice" | "review" }) {
  const items = [
    { id: "home", label: "홈", href: "/", Icon: Home },
    { id: "cards", label: "카드", href: "/cards/the-fool", Icon: BookOpen },
    { id: "practice", label: "연습", href: "/practice/love-three-001", Icon: Sparkles },
    { id: "review", label: "복습", href: "/#review", Icon: Heart },
  ] as const;
  return <>
    <a className="skip-link" href="#main-content">본문으로 바로가기</a>
    <div className="app-shell">
      <header className="site-header"><Link className="brand" href="/"><span aria-hidden="true">♥</span>빨강타로</Link><span className="profile-dot" aria-label="내 학습 기록">나</span></header>
      <main id="main-content">{children}</main>
      <nav className="bottom-nav" aria-label="주요 메뉴">{items.map(({ id, label, href, Icon }) => <Link key={id} href={href} aria-current={active === id ? "page" : undefined}><Icon aria-hidden="true"/><span>{label}</span></Link>)}</nav>
    </div>
  </>;
}
```

- [ ] **Step 4: Implement `TarotCardVisual` and `SafetyNote`**

`TarotCardVisual` accepts `{ card, orientation, size, priority }`, prints number, glyph, Korean and English names, applies one of four approved accent classes, and adds an explicit `역방향` badge plus a rotated inner illustration when reversed. `SafetyNote` prints exactly:

> 건강 카드는 생활 습관을 돌아보기 위한 학습 정보예요. 지속되거나 심한 증상이 있다면 카드 해석보다 의료 전문가의 평가를 먼저 받아주세요.

- [ ] **Step 5: Replace global CSS with the approved design system**

Define these tokens and use them consistently:

```css
:root {
  --cherry: #ef3850;
  --cherry-dark: #b92137;
  --cream: #fff8f2;
  --paper: #fffdf9;
  --blush: #ffe3e8;
  --sun: #ffd05d;
  --plum: #735b91;
  --apricot: #ef855b;
  --ink: #351e23;
  --muted: #80696d;
  --line: #ecd9d2;
  --radius-sm: 12px;
  --radius-md: 18px;
  --radius-lg: 28px;
  --shadow-soft: 0 18px 50px rgba(84, 43, 46, .1);
  --font-rounded: ui-rounded, "Arial Rounded MT Bold", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif;
}
```

Add mobile-first layout, a centered `max-width: 1180px` desktop surface, minimum 44px controls, visible focus rings, `prefers-reduced-motion`, and `@media (min-width: 840px)` desktop rules. Do not use horizontal scrolling for primary content.

- [ ] **Step 6: Update layout metadata and remove starter code**

Set `<html lang="ko">`, title `빨강타로 — 외우지 말고 읽는 타로 학습`, description `카드 의미와 배열 위치를 연결해 스스로 타로를 해석하는 방법을 배워요.`, and cream theme color. Remove Geist, the starter icons, `_sites-preview`, and `codex-preview` metadata.

- [ ] **Step 7: Commit the shell**

```bash
git add app package.json package-lock.json tests/rendered-html.test.mjs
git commit -m "feat: add cherry pop learning shell"
```

---

### Task 6: Build the progress-aware home screen

**Files:**
- Create: `app/components/HomeDashboard.tsx`
- Replace: `app/page.tsx`
- Modify: `tests/rendered-html.test.mjs`

- [ ] **Step 1: Strengthen the failing home render test**

```js
assert.match(html, /7분 학습 시작/);
assert.match(html, /나의 학습 정원/);
assert.match(html, /연애/);
assert.match(html, /재물/);
assert.match(html, /건강/);
assert.match(html, /최근 헷갈린 카드/);
```

- [ ] **Step 2: Verify the home test fails**

Run: `npm test`

Expected: FAIL on the first missing home section.

- [ ] **Step 3: Implement `HomeDashboard` as a client component**

On mount, read progress using `safeReadProgress(window.localStorage)`. Use `the-lovers` as the deterministic daily card and `love-three-001` as the default lesson so server and client markup remain stable. Compute love progress as `completedLessonIds.length / 10`. Compute card mastery as the unique major-card IDs referenced by completed lessons divided by 22. Show money and health as `준비 중`, not fake progress. Build `최근 헷갈린 카드` by taking the newest wrong lesson IDs, resolving their lesson cards, removing duplicate card IDs, and showing at most three cards. If saving is unavailable, show the non-blocking message `이 브라우저에서는 학습 기록을 저장할 수 없어요. 지금 학습은 계속할 수 있습니다.`

Render these sections in this order:

1. greeting and streak chip;
2. large daily card and CTA;
3. card mastery and love/money/health cards;
4. continue-learning card using `lastLessonId`;
5. recently confused card list with an honest empty state;
6. favorites preview.

- [ ] **Step 4: Replace `app/page.tsx`**

```tsx
import type { Metadata } from "next";
import { AppShell } from "./components/AppShell";
import { HomeDashboard } from "./components/HomeDashboard";

export const metadata: Metadata = { title: "오늘의 학습 | 빨강타로" };

export default function HomePage() {
  return <AppShell active="home"><HomeDashboard /></AppShell>;
}
```

- [ ] **Step 5: Run the build-backed render test**

Run: `npm test`

Expected: home render test PASS; content and progress tests PASS.

- [ ] **Step 6: Commit the home**

```bash
git add app/page.tsx app/components/HomeDashboard.tsx tests/rendered-html.test.mjs
git commit -m "feat: build learning home dashboard"
```

---

### Task 7: Build card detail with tabs, favorites, and recovery

**Files:**
- Create: `app/cards/[cardId]/page.tsx`
- Create: `app/components/CardDetail.tsx`
- Modify: `tests/rendered-html.test.mjs`

- [ ] **Step 1: Add card route tests**

```js
test("renders a complete card detail", async () => {
  const response = await render("/cards/the-lovers");
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /연인/);
  assert.match(html, /선택한다/);
  assert.match(html, /핵심 의미/);
  assert.match(html, /정·역방향/);
  assert.match(html, /분야별/);
  assert.match(html, /상징/);
});

test("renders a recovery view for an unknown card", async () => {
  const response = await render("/cards/not-a-card");
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /카드를 찾지 못했어요/);
  assert.match(html, /바보 카드부터 보기/);
});
```

- [ ] **Step 2: Verify card route tests fail**

Run: `npm test`

Expected: FAIL because `/cards/[cardId]` is not implemented.

- [ ] **Step 3: Implement the route**

```tsx
import Link from "next/link";
import { AppShell } from "../../components/AppShell";
import { CardDetail } from "../../components/CardDetail";
import { getCard } from "../../data/cards";

export default async function CardPage({ params }: { params: Promise<{ cardId: string }> }) {
  const { cardId } = await params;
  const card = getCard(cardId);
  if (!card) return <AppShell active="cards"><section className="empty-state"><span aria-hidden="true">?</span><h1>카드를 찾지 못했어요</h1><p>주소가 바뀌었거나 아직 준비되지 않은 카드예요.</p><Link className="primary-button" href="/cards/the-fool">바보 카드부터 보기</Link></section></AppShell>;
  return <AppShell active="cards"><CardDetail card={card} /></AppShell>;
}
```

- [ ] **Step 4: Implement accessible tabs and favorite state**

`CardDetail` is a client component with four buttons using `role="tab"`, `aria-selected`, matching `role="tabpanel"`, and Left/Right/Home/End keyboard handling. Tabs are `핵심 의미`, `정·역방향`, `분야별`, `상징`. The 분야별 panel has 연애·재물·건강 sub-buttons and renders `SafetyNote` whenever 건강 is selected. The favorite button reads and writes local progress without blocking the page on failure. Add previous/next card links based on the 22-card order.

- [ ] **Step 5: Run all tests**

Run: `npm test`

Expected: card detail and recovery tests PASS.

- [ ] **Step 6: Commit card detail**

```bash
git add app/cards app/components/CardDetail.tsx tests/rendered-html.test.mjs
git commit -m "feat: add layered card detail learning"
```

---

### Task 8: Build the five-step practice lesson

**Files:**
- Create: `app/practice/[setId]/page.tsx`
- Create: `app/components/PracticeLesson.tsx`
- Modify: `tests/rendered-html.test.mjs`

- [ ] **Step 1: Add practice route tests**

```js
test("renders the full three-card lesson structure", async () => {
  const response = await render("/practice/love-three-001");
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /현재 관계/);
  assert.match(html, /상대의 태도/);
  assert.match(html, /향후 흐름/);
  assert.match(html, /내 해석/);
  assert.match(html, /카드별 힌트/);
  assert.match(html, /종합 해설/);
});

test("renders a recovery view for an unknown lesson", async () => {
  const response = await render("/practice/not-a-lesson");
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /학습 세트를 찾지 못했어요/);
  assert.match(html, /첫 학습 시작/);
});
```

- [ ] **Step 2: Verify practice route tests fail**

Run: `npm test`

Expected: FAIL because the dynamic practice route is missing.

- [ ] **Step 3: Implement the practice route and card resolution**

Resolve the set with `getLearningSet`, resolve all three cards with `getLessonCard`, and show a recovery state when the set or any referenced card is missing. Pass the complete objects into `PracticeLesson`.

- [ ] **Step 4: Implement the client lesson state machine**

Use this explicit state:

```ts
type LessonStage = 1 | 2 | 3 | 4 | 5;
const [stage, setStage] = useState<LessonStage>(1);
const [interpretation, setInterpretation] = useState("");
const [quizChoice, setQuizChoice] = useState<number | null>(null);
const [submitted, setSubmitted] = useState(false);
```

The five stages are:

1. three cards, positions, and an autosized text area;
2. card keyword hints;
3. position-specific interpretations;
4. connection arrow and relationship type;
5. full interpretation, alternative, condition, common mistake, quiz, and review save.

Advancing never clears `interpretation`. Back is available after stage 1. `모범 해설 바로 보기` jumps to stage 5 without forcing text input. Selecting a quiz option uses both text and a check/cross icon; submitting records correct or wrong state. Completing the lesson updates `completedLessonIds`, `lastLessonId`, and the streak date. Include next and previous lesson links.

- [ ] **Step 5: Add a save failure announcement**

When `safeWriteProgress` returns false, display a polite `role="status"` message while keeping the lesson usable. Do not use `alert()`.

- [ ] **Step 6: Run all tests**

Run: `npm test`

Expected: practice and recovery tests PASS; all previous tests remain green.

- [ ] **Step 7: Commit practice flow**

```bash
git add app/practice app/components/PracticeLesson.tsx tests/rendered-html.test.mjs
git commit -m "feat: add stepwise three-card practice"
```

---

### Task 9: Add metadata, social card, safety copy, and final quality checks

**Files:**
- Create: `public/og.png`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Modify: `tests/rendered-html.test.mjs`

- [ ] **Step 1: Freeze and generate one social-preview brief**

Generate one 1200×630 image representing the finished Cherry Pop site. The image must include the exact Korean text `빨강타로` and `외우지 말고, 읽는 법을 배우세요`, a cream background, a cherry-red tarot card, a small yellow sun motif, rounded sticker accents, and no browser chrome or watermark. Inspect the generated text; retry once only if the required text is incorrect or missing. Save the accepted result as `public/og.png`.

- [ ] **Step 2: Add host-derived Open Graph and X metadata**

Update `app/layout.tsx` so the social image URL is absolute using the incoming request host, with title and description matching the site. Do not leave a generic starter image or title.

- [ ] **Step 3: Add final server-render assertions**

```js
test("ships site-specific metadata and Korean safety copy", async () => {
  const response = await render("/");
  const html = await response.text();
  assert.match(html, /빨강타로 — 외우지 말고 읽는 타로 학습/);
  assert.doesNotMatch(html, /Starter Project|Your site is taking shape|codex-preview/i);
});
```

Also assert the practice page contains no diagnosis wording such as `질병이다`, `임신이다`, or `치료된다`.

- [ ] **Step 4: Run automated verification**

Run:

```bash
npm test
npm run lint
npm run build
```

Expected: all tests PASS, lint exits 0, and the production build exits 0.

- [ ] **Step 5: Inspect the change set without altering unrelated work**

Run `git status --short`, `git diff --check`, and `git diff --stat HEAD~1`. Confirm `_sites-preview`, the `codex-preview` marker, and `react-loading-skeleton` are absent with `rg`.

Expected: only intended site, test, content, metadata, lockfile, and plan files are changed; no whitespace errors or starter markers remain.

- [ ] **Step 6: Commit final quality work**

```bash
git add app public/og.png tests package.json package-lock.json
git commit -m "feat: finish red tarot learning MVP"
```

---

### Task 10: Publish and hand off

**Files:**
- Verify: `.openai/hosting.json`
- No product code changes expected unless hosting validation exposes a real issue

- [ ] **Step 1: Read and follow the Sites hosting instructions**

Use the `sites-hosting` skill. Preserve the generated `.openai/hosting.json`; this MVP has no D1 or R2 declarations because progress is device-local.

- [ ] **Step 2: Publish the validated build**

Deploy the site through Sites and wait for the hosted URL. If hosting reports a build error, fix only the reported issue, rerun `npm run build`, and retry.

Expected: a working private deployed URL for 빨강타로.

- [ ] **Step 3: Stop retained local preview processes**

After hosting succeeds, stop the development and brainstorming preview sessions. Do not delete the project or user content.

- [ ] **Step 4: Final handoff**

Lead with the deployed site URL. Summarize that home, 22 card details, ten love practice lessons, favorites, progress, wrong-answer review, responsive layout, and safe health guidance are complete. Mention that progress is stored only on the current device.
