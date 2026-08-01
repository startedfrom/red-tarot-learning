import assert from "node:assert/strict";
import test from "node:test";
import {
  defaultProgress,
  markLessonComplete,
  parseProgress,
  recordQuizAnswer,
  recordStudyDay,
  safeWriteProgress,
  toggleFavorite,
} from "../app/lib/progress";

const LEGACY_TIMESTAMP = "1970-01-01T00:00:00.000Z";

test("repairs malformed stored progress", () => {
  assert.deepEqual(parseProgress("not-json"), defaultProgress);
  assert.deepEqual(
    parseProgress(JSON.stringify({ streak: -2 })),
    defaultProgress,
  );
  assert.deepEqual(
    parseProgress(
      JSON.stringify({
        ...defaultProgress,
        quizAttempts: { lesson: { correct: "yes", answeredAt: 42 } },
      }),
    ),
    defaultProgress,
  );
  assert.deepEqual(
    parseProgress(
      JSON.stringify({
        ...defaultProgress,
        updatedAt: "not-an-iso-timestamp",
      }),
    ),
    defaultProgress,
  );
  assert.deepEqual(
    parseProgress(
      JSON.stringify({
        ...defaultProgress,
        quizAttempts: {
          lesson: { correct: false, answeredAt: "not-an-iso-timestamp" },
        },
      }),
    ),
    defaultProgress,
  );
  assert.deepEqual(
    parseProgress(
      JSON.stringify({
        ...defaultProgress,
        lastLessonChangedAt: "not-an-iso-timestamp",
      }),
    ),
    defaultProgress,
  );
  assert.deepEqual(
    parseProgress(
      JSON.stringify({
        ...defaultProgress,
        favoriteChanges: {
          "the-star": { favorite: true, changedAt: "not-an-iso-timestamp" },
        },
      }),
    ),
    defaultProgress,
  );
});

test("migrates v1 progress without losing learning state", () => {
  const migrated = parseProgress(
    JSON.stringify({
      favoriteCardIds: ["the-lovers", "the-lovers"],
      completedLessonIds: ["love-three-001"],
      wrongLessonIds: ["love-three-002"],
      lastLessonId: "love-three-001",
      streak: 3,
      lastStudyDate: "2026-07-21",
    }),
  );

  assert.deepEqual(migrated, {
    version: 2,
    favoriteCardIds: ["the-lovers"],
    completedLessonIds: ["love-three-001"],
    wrongLessonIds: ["love-three-002"],
    lastLessonId: "love-three-001",
    streak: 3,
    lastStudyDate: "2026-07-21",
    quizAttempts: {},
    studyDays: ["2026-07-19", "2026-07-20", "2026-07-21"],
    favoriteChanges: {
      "the-lovers": { favorite: true, changedAt: LEGACY_TIMESTAMP },
    },
    lastLessonChangedAt: null,
    updatedAt: LEGACY_TIMESTAMP,
  });
});

test("preserves a migrated v1 streak on the next study day", () => {
  const migrated = parseProgress(
    JSON.stringify({
      favoriteCardIds: [],
      completedLessonIds: [],
      wrongLessonIds: [],
      lastLessonId: null,
      streak: 7,
      lastStudyDate: "2026-07-21",
    }),
  );
  const next = recordStudyDay(
    migrated,
    "2026-07-22",
    "2026-07-21",
    "2026-07-22T10:00:00.000Z",
  );

  assert.equal(migrated.studyDays.length, 7);
  assert.equal(next.streak, 8);
});

test("upgrades early v2 favorites to deterministic change metadata", () => {
  const upgraded = parseProgress(
    JSON.stringify({
      version: 2,
      favoriteCardIds: ["the-star"],
      completedLessonIds: [],
      wrongLessonIds: [],
      lastLessonId: null,
      streak: 0,
      lastStudyDate: null,
      quizAttempts: {},
      studyDays: [],
      lastLessonChangedAt: null,
      updatedAt: "",
    }),
  );

  assert.deepEqual(upgraded.favoriteChanges, {
    "the-star": { favorite: true, changedAt: LEGACY_TIMESTAMP },
  });
  assert.equal(upgraded.updatedAt, LEGACY_TIMESTAMP);
});

test("updates favorites, completion, and wrong answers without duplicates", () => {
  let progress = toggleFavorite(
    defaultProgress,
    "the-lovers",
    "2026-07-21T10:00:00.000Z",
  );
  progress = toggleFavorite(
    progress,
    "the-lovers",
    "2026-07-21T11:00:00.000Z",
  );
  assert.deepEqual(progress.favoriteCardIds, []);
  assert.deepEqual(progress.favoriteChanges, {
    "the-lovers": {
      favorite: false,
      changedAt: "2026-07-21T11:00:00.000Z",
    },
  });

  progress = markLessonComplete(progress, "love-three-001");
  progress = markLessonComplete(progress, "love-three-001");
  assert.deepEqual(progress.completedLessonIds, ["love-three-001"]);

  progress = recordQuizAnswer(progress, "love-three-001", false);
  assert.deepEqual(progress.wrongLessonIds, ["love-three-001"]);
  progress = recordQuizAnswer(progress, "love-three-001", true);
  assert.deepEqual(progress.wrongLessonIds, []);
});

test("increments a streak once per study day", () => {
  const first = recordStudyDay(defaultProgress, "2026-07-20", "2026-07-19");
  const sameDay = recordStudyDay(first, "2026-07-20", "2026-07-19");
  const nextDay = recordStudyDay(sameDay, "2026-07-21", "2026-07-20");

  assert.equal(first.streak, 1);
  assert.deepEqual(first.studyDays, ["2026-07-20"]);
  assert.equal(sameDay.streak, 1);
  assert.deepEqual(sameDay.studyDays, ["2026-07-20"]);
  assert.equal(nextDay.streak, 2);
  assert.deepEqual(nextDay.studyDays, ["2026-07-20", "2026-07-21"]);
});

test("records timestamped mutations in mergeable fields", () => {
  const answered = recordQuizAnswer(
    defaultProgress,
    "love-three-001",
    false,
    "2026-07-21T10:00:00.000Z",
  );
  assert.deepEqual(answered.quizAttempts, {
    "love-three-001": {
      correct: false,
      answeredAt: "2026-07-21T10:00:00.000Z",
    },
  });
  assert.equal(answered.updatedAt, "2026-07-21T10:00:00.000Z");

  const completed = markLessonComplete(
    answered,
    "love-three-001",
    "2026-07-21T10:01:00.000Z",
  );
  assert.equal(completed.lastLessonChangedAt, "2026-07-21T10:01:00.000Z");
  assert.equal(completed.updatedAt, "2026-07-21T10:01:00.000Z");
});

test("repairs invalid stored study days and refuses to record an invalid day", () => {
  const repaired = parseProgress(
    JSON.stringify({
      ...defaultProgress,
      streak: 99,
      lastStudyDate: "not-a-day",
      studyDays: ["2026-02-30", "2026-07-20", "not-a-day"],
      updatedAt: "2026-07-20T10:00:00.000Z",
    }),
  );

  assert.deepEqual(repaired.studyDays, ["2026-07-20"]);
  assert.equal(repaired.lastStudyDate, "2026-07-20");
  assert.equal(repaired.streak, 1);
  assert.strictEqual(
    recordStudyDay(repaired, "2026-02-30", "2026-02-29"),
    repaired,
  );

  const safelyTimestamped = toggleFavorite(
    defaultProgress,
    "the-star",
    "not-an-iso-timestamp",
  );
  assert.notEqual(safelyTimestamped.updatedAt, "not-an-iso-timestamp");
  assert.equal(Number.isNaN(Date.parse(safelyTimestamped.updatedAt)), false);
});

test("keeps learning usable when storage writes fail", () => {
  const brokenStorage = {
    setItem() {
      throw new Error("storage disabled");
    },
  };

  assert.equal(safeWriteProgress(brokenStorage, defaultProgress), false);
});
