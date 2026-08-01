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
    studyDays: ["2026-07-21"],
    lastLessonChangedAt: null,
    updatedAt: "",
  });
});

test("updates favorites, completion, and wrong answers without duplicates", () => {
  let progress = toggleFavorite(defaultProgress, "the-lovers");
  progress = toggleFavorite(progress, "the-lovers");
  assert.deepEqual(progress.favoriteCardIds, []);

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

test("keeps learning usable when storage writes fail", () => {
  const brokenStorage = {
    setItem() {
      throw new Error("storage disabled");
    },
  };

  assert.equal(safeWriteProgress(brokenStorage, defaultProgress), false);
});
