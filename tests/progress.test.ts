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
  assert.equal(sameDay.streak, 1);
  assert.equal(nextDay.streak, 2);
});

test("keeps learning usable when storage writes fail", () => {
  const brokenStorage = {
    setItem() {
      throw new Error("storage disabled");
    },
  };

  assert.equal(safeWriteProgress(brokenStorage, defaultProgress), false);
});
