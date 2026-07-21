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
