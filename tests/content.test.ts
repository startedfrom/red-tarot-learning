import assert from "node:assert/strict";
import test from "node:test";
import { majorArcana } from "../app/data/cards";

test("contains 22 unique major arcana cards", () => {
  assert.equal(majorArcana.length, 22);
  assert.equal(new Set(majorArcana.map((card) => card.id)).size, 22);
  assert.deepEqual(
    majorArcana.map((card) => card.number),
    Array.from({ length: 22 }, (_, index) => index),
  );
});

test("every card has complete learning content", () => {
  for (const card of majorArcana) {
    assert.ok(card.nameKo && card.nameEn && card.coreVerb && card.coreMeaning);
    assert.ok(card.keywords.length >= 4);
    assert.ok(
      card.upright.summary && card.reversed.summary && card.reversed.mode,
    );
    assert.ok(
      card.categories.love.upright &&
        card.categories.money.upright &&
        card.categories.health.upright,
    );
    assert.ok(card.symbolism.length >= 2);
    assert.ok(card.commonMistakes.length >= 1);
  }
});
