import assert from "node:assert/strict";
import test from "node:test";
import {
  adsTxtLine,
  canLoadAds,
  canLoadAnalytics,
  canShowAds,
  parseConsent,
  serializeConsent,
} from "../app/lib/consent";

const publisherId = "ca-pub-1234567890123456";

test("parses only a current versioned consent choice", () => {
  assert.equal(parseConsent(null, 1).choice, "essential");
  assert.equal(parseConsent("not-json", 1).choice, "essential");
  assert.equal(parseConsent(serializeConsent("granted", 1, "2026-08-02T00:00:00.000Z"), 1).choice, "granted");
  assert.equal(parseConsent(serializeConsent("denied", 1, "2026-08-02T00:00:00.000Z"), 2).choice, "essential");
});

test("ads require consent publisher slot and explicit site approval", () => {
  assert.equal(canLoadAds({ consent: "granted", publisherId, approved: true }), true);
  assert.equal(canLoadAds({ consent: "denied", publisherId, approved: true }), false);
  assert.equal(canLoadAds({ consent: "granted", publisherId, approved: false }), false);
  assert.equal(canShowAds({ consent: "granted", publisherId, slotId: "1234567890", approved: true }), true);
  assert.equal(canShowAds({ consent: "denied", publisherId, slotId: "1234567890", approved: true }), false);
  assert.equal(canShowAds({ consent: "essential", publisherId, slotId: "1234567890", approved: true }), false);
  assert.equal(canShowAds({ consent: "granted", publisherId: "pub-123", slotId: "1234567890", approved: true }), false);
  assert.equal(canShowAds({ consent: "granted", publisherId, slotId: "slot-a", approved: true }), false);
  assert.equal(canShowAds({ consent: "granted", publisherId, slotId: "1234567890", approved: false }), false);
});

test("builds ads.txt only from a valid publisher id", () => {
  assert.equal(adsTxtLine(publisherId), "google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0\n");
  assert.equal(adsTxtLine("ca-pub-not-valid"), null);
  assert.equal(adsTxtLine(undefined), null);
});

test("analytics requires granted consent and a valid GA4 id", () => {
  assert.equal(canLoadAnalytics("granted", "G-ABC123XYZ"), true);
  assert.equal(canLoadAnalytics("denied", "G-ABC123XYZ"), false);
  assert.equal(canLoadAnalytics("granted", "UA-123"), false);
  assert.equal(canLoadAnalytics("granted", undefined), false);
});
