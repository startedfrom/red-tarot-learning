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
