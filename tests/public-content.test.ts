import assert from "node:assert/strict";
import test from "node:test";
import { guides, getGuide } from "../app/data/guides";
import {
  PUBLIC_READING_IDS,
  getPublicReading,
  publicReadings,
} from "../app/lib/public-content";

test("ships twelve reviewed beginner guides", () => {
  assert.equal(guides.length, 12);
  assert.equal(new Set(guides.map((guide) => guide.slug)).size, 12);

  for (const guide of guides) {
    assert.ok(guide.title.length >= 8);
    assert.ok(guide.description.length >= 30);
    assert.ok(guide.lead.length >= 40);
    assert.ok(guide.sections.length >= 3);
    assert.ok(guide.relatedCardIds.length >= 3);
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
    assert.equal(reading.cardAnalysis.length, reading.cards.length);
    assert.equal(reading.positionAnalysis.length, reading.cards.length);
  }
});

test("does not publish an unreviewed reading id", () => {
  assert.equal(getPublicReading("love-five-015"), undefined);
  assert.equal(getPublicReading("not-a-reading"), undefined);
});
