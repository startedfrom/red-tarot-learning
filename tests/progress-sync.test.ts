import assert from "node:assert/strict";
import test from "node:test";
import {
  defaultProgress,
  markLessonComplete,
  recordQuizAnswer,
  recordStudyDay,
  toggleFavorite,
  type LearningProgress,
} from "../app/lib/progress";
import {
  progressToRemoteRows,
  remoteRowsToProgress,
  type RemoteProgressRows,
} from "../app/lib/supabase/progress";
import { syncProgressSnapshot } from "../app/lib/progress-sync";
import type { SyncEvent } from "../app/lib/sync-queue";

const userId = "00000000-0000-4000-8000-000000000001";
const older = "2026-08-01T00:00:00.000Z";
const newer = "2026-08-02T00:00:00.000Z";

function localProgress(): LearningProgress {
  let progress = markLessonComplete(defaultProgress, "love-three-001", older);
  progress = toggleFavorite(progress, "the-lovers", older);
  progress = recordQuizAnswer(progress, "love-three-001", false, older);
  return recordStudyDay(progress, "2026-08-01", "2026-07-31", older);
}

const remoteRows: RemoteProgressRows = {
  lessonCompletions: [
    { user_id: userId, lesson_id: "money-one-001", completed_at: newer },
  ],
  quizAttempts: [
    { user_id: userId, lesson_id: "love-three-001", correct: true, answered_at: newer },
  ],
  favoriteCards: [
    { user_id: userId, card_id: "the-star", favorite: true, changed_at: newer },
  ],
  studyDays: [
    { user_id: userId, study_date: "2026-08-02", created_at: newer },
  ],
  userState: {
    user_id: userId,
    last_lesson_id: "money-one-001",
    last_lesson_changed_at: newer,
    updated_at: newer,
  },
};

test("maps Supabase rows into a valid progress snapshot", () => {
  const progress = remoteRowsToProgress(remoteRows);
  assert.deepEqual(progress.completedLessonIds, ["money-one-001"]);
  assert.deepEqual(progress.favoriteCardIds, ["the-star"]);
  assert.equal(progress.quizAttempts["love-three-001"].correct, true);
  assert.deepEqual(progress.wrongLessonIds, []);
  assert.deepEqual(progress.studyDays, ["2026-08-02"]);
  assert.equal(progress.lastLessonId, "money-one-001");
  assert.equal(progress.updatedAt, newer);
});

test("maps a progress snapshot to idempotent user-owned upsert rows", () => {
  let progress = localProgress();
  progress = toggleFavorite(progress, "the-lovers", newer);
  const rows = progressToRemoteRows(progress, userId);

  assert.deepEqual(rows.lessonCompletions, [
    { user_id: userId, lesson_id: "love-three-001", completed_at: older },
  ]);
  assert.deepEqual(rows.favoriteCards, [
    { user_id: userId, card_id: "the-lovers", favorite: false, changed_at: newer },
  ]);
  assert.equal(rows.quizAttempts[0].user_id, userId);
  assert.equal(rows.studyDays[0].study_date, "2026-08-01");
  assert.equal(rows.userState.user_id, userId);
});

test("first sync merges both snapshots and clears delivered events only after save", async () => {
  const queue: SyncEvent[] = [
    { eventId: "event-1", kind: "snapshot", entityId: "progress", changedAt: newer },
  ];
  let saved: LearningProgress | null = null;
  const result = await syncProgressSnapshot({
    local: localProgress(),
    remote: remoteRowsToProgress(remoteRows),
    queue,
    save: async (progress) => {
      saved = progress;
    },
  });

  assert.equal(result.status, "synced");
  assert.deepEqual(result.progress.completedLessonIds, ["love-three-001", "money-one-001"]);
  assert.deepEqual(result.progress.favoriteCardIds, ["the-lovers", "the-star"]);
  assert.equal(result.progress.quizAttempts["love-three-001"].correct, true);
  assert.deepEqual(result.queue, []);
  assert.deepEqual(saved, result.progress);
});

test("failed remote save keeps local data and the complete retry queue", async () => {
  const local = localProgress();
  const queue: SyncEvent[] = [
    { eventId: "event-1", kind: "snapshot", entityId: "progress", changedAt: newer },
  ];
  const result = await syncProgressSnapshot({
    local,
    remote: null,
    queue,
    save: async () => {
      throw new Error("offline");
    },
  });

  assert.equal(result.status, "error");
  assert.deepEqual(result.progress, local);
  assert.deepEqual(result.queue, queue);
});

test("does not mutate local remote or queue inputs", async () => {
  const local = localProgress();
  const remote = remoteRowsToProgress(remoteRows);
  const queue: SyncEvent[] = [];
  const before = JSON.stringify({ local, remote, queue });
  await syncProgressSnapshot({ local, remote, queue, save: async () => {} });
  assert.equal(JSON.stringify({ local, remote, queue }), before);
});
