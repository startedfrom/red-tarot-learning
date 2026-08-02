import assert from "node:assert/strict";
import test from "node:test";
import { allCards } from "../app/data/cards";
import { guides } from "../app/data/guides";
import { publicReadings } from "../app/lib/public-content";
import { searchContent, searchEntries } from "../app/lib/search";

test("builds entries for cards, guides, and curated readings", () => {
  assert.equal(searchEntries.filter((entry) => entry.kind === "card").length, allCards.length);
  assert.equal(searchEntries.filter((entry) => entry.kind === "guide").length, guides.length);
  assert.equal(searchEntries.filter((entry) => entry.kind === "reading").length, publicReadings.length);
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
