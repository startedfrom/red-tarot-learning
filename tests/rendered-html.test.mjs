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
  assert.match(html, /오늘은/);
  assert.match(html, /홈/);
  assert.match(html, /카드/);
  assert.match(html, /연습/);
  assert.match(html, /복습/);
  assert.match(html, /lang="ko"/);
  assert.match(html, /7분 학습 시작/);
  assert.match(html, /나의 학습 정원/);
  assert.match(html, /연애/);
  assert.match(html, /재물/);
  assert.match(html, /건강/);
  assert.match(html, /최근 헷갈린 카드/);
  assert.doesNotMatch(
    html,
    /Your site is taking shape|codex-preview|react-loading-skeleton/i,
  );
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

test("renders a recovery view for an unknown lesson", async () => {
  const response = await render("/practice/not-a-lesson");
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /학습 세트를 찾지 못했어요/);
  assert.match(html, /첫 학습 시작/);
});
