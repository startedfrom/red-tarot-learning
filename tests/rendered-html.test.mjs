import assert from "node:assert/strict";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("renders the Red Tarot home instead of the starter", async () => {
  const response = await render("/");
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /빨강타로/);
  assert.match(html, /어떤 카드가 궁금하세요/);
  assert.match(html, /카드 이름·키워드·궁금한 해석 검색/);
  assert.match(html, /처음엔 이 카드부터/);
  assert.match(html, /초보자 인기 가이드/);
  assert.match(html, /카드를 함께 읽어봐요/);
  assert.match(html, /첫 연습 시작/);
  assert.match(html, /lang="ko"/);
  assert.doesNotMatch(html, /나의 학습 정원/);
  assert.doesNotMatch(
    html,
    /Your site is taking shape|codex-preview|react-loading-skeleton/i,
  );
});

test("keeps the local learning dashboard at /me", async () => {
  const response = await render("/me");
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /나의 학습 정원/);
  assert.match(html, /최근 헷갈린 카드/);
  assert.match(html, /name="robots" content="noindex, nofollow"/);
});

test("uses the homepage card filter query on first render", async () => {
  const response = await render("/cards?type=major");
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, />22<small>장<\/small>/);
});

test("publishes site-specific social sharing metadata", async () => {
  const response = await render("/");
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /property="og:title" content="빨강타로/);
  assert.match(html, /property="og:image" content="http:\/\/localhost\/og\.png"/);
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
  assert.match(html, /name="twitter:image" content="http:\/\/localhost\/og\.png"/);
});

test("renders a complete card detail", async () => {
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
});

test("renders a searchable 78-card library", async () => {
  const response = await render("/cards");
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /78장 카드 도감/);
  assert.match(html, /카드 이름, 영문명, 키워드 검색/);
  assert.match(html, /메이저/);
  assert.match(html, /완드/);
  assert.match(html, /컵/);
  assert.match(html, /소드/);
  assert.match(html, /펜타클/);
});

test("renders a recovery view for an unknown card", async () => {
  const response = await render("/cards/not-a-card");
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /카드를 찾지 못했어요/);
  assert.match(html, /바보 카드부터 보기/);
});

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
  assert.doesNotMatch(html, /질병이다|임신이다|치료된다/);
});

test("renders one-card and five-card learning sets", async () => {
  const oneCardHtml = await (await render("/practice/love-one-001")).text();
  const fiveCardHtml = await (await render("/practice/health-five-001")).text();

  assert.match(oneCardHtml, /1장 배열/);
  assert.match(fiveCardHtml, /5장 배열/);
  assert.match(fiveCardHtml, /의료 전문가/);
});

test("renders a recovery view for an unknown lesson", async () => {
  const response = await render("/practice/not-a-lesson");
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /학습 세트를 찾지 못했어요/);
  assert.match(html, /첫 학습 시작/);
});

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
