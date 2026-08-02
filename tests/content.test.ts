import assert from "node:assert/strict";
import test from "node:test";
import { allCards, majorArcana, minorArcana } from "../app/data/cards";
import { guides } from "../app/data/guides";
import { learningSets } from "../app/data/learning-sets";
import { courseDays } from "../app/data/course";
import { publicReadings } from "../app/lib/public-content";

test("contains 22 unique major arcana cards", () => {
  assert.equal(majorArcana.length, 22);
  assert.equal(new Set(majorArcana.map((card) => card.id)).size, 22);
  assert.deepEqual(
    majorArcana.map((card) => card.number),
    Array.from({ length: 22 }, (_, index) => index),
  );
});

test("contains all 78 tarot cards", () => {
  assert.equal(minorArcana.length, 56);
  assert.equal(allCards.length, 78);
  assert.equal(new Set(allCards.map((card) => card.id)).size, 78);
});

test("every card has complete learning content", () => {
  for (const card of allCards) {
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

test("contains 150 complete learning sets", () => {
  assert.equal(learningSets.length, 150);
  assert.equal(new Set(learningSets.map((lesson) => lesson.id)).size, 150);

  for (const category of ["love", "money", "health"] as const) {
    const categorySets = learningSets.filter(
      (lesson) => lesson.category === category,
    );
    assert.equal(categorySets.length, 50);
    assert.equal(categorySets.filter((lesson) => lesson.cards.length === 1).length, 10);
    assert.equal(categorySets.filter((lesson) => lesson.cards.length === 3).length, 25);
    assert.equal(categorySets.filter((lesson) => lesson.cards.length === 5).length, 15);
  }

  for (const lesson of learningSets) {
    assert.equal(lesson.cards.length, lesson.spread.positions.length);
    assert.equal(lesson.cardAnalysis.length, lesson.cards.length);
    assert.equal(lesson.positionAnalysis.length, lesson.cards.length);
    assert.equal(lesson.quiz.options.length, 4);
    assert.ok(
      lesson.fullInterpretation &&
        lesson.connection &&
        lesson.alternatives.length >= 1,
    );
  }
});

test("every lesson card id resolves", () => {
  const knownIds = new Set(allCards.map((card) => card.id));

  for (const lesson of learningSets) {
    for (const card of lesson.cards) {
      assert.ok(knownIds.has(card.cardId), card.cardId);
    }
  }
});

test("health learning content never claims a diagnosis", () => {
  const healthCopy = learningSets
    .filter((lesson) => lesson.category === "health")
    .map((lesson) => JSON.stringify(lesson))
    .join(" ");

  assert.doesNotMatch(healthCopy, /질병이다|임신이다|치료된다|진단한다/);
  assert.match(healthCopy, /의료 전문가/);
});

test("public guides and readings reference known cards", () => {
  const knownIds = new Set(allCards.map((card) => card.id));

  for (const guide of guides) {
    for (const cardId of guide.relatedCardIds) assert.ok(knownIds.has(cardId));
  }

  for (const reading of publicReadings) {
    for (const item of reading.cards) assert.ok(knownIds.has(item.cardId));
  }
});

test("course has fourteen ordered days with valid unique lessons", () => {
  assert.equal(courseDays.length, 14);
  assert.deepEqual(
    courseDays.map((day) => day.day),
    Array.from({ length: 14 }, (_, index) => index + 1),
  );
  assert.equal(new Set(courseDays.map((day) => day.lessonId)).size, 14);
  const lessonIds = new Set(learningSets.map((lesson) => lesson.id));
  for (const day of courseDays) {
    assert.ok(day.title && day.summary && day.goal);
    assert.ok(day.checklist.length >= 3);
    assert.ok(lessonIds.has(day.lessonId), day.lessonId);
  }
});
