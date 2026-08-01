import assert from "node:assert/strict";
import test from "node:test";
import type { LearningProgress } from "../app/lib/progress";
import { mergeProgress } from "../app/lib/progress-merge";
import {
  SYNC_QUEUE_STORAGE_KEY,
  dedupeSyncEvents,
  parseSyncQueue,
  safeReadSyncQueue,
  safeWriteSyncQueue,
  type SyncEvent,
} from "../app/lib/sync-queue";

function progress(
  overrides: Partial<LearningProgress> = {},
): LearningProgress {
  return {
    version: 2,
    favoriteCardIds: [],
    completedLessonIds: [],
    wrongLessonIds: [],
    lastLessonId: null,
    streak: 0,
    lastStudyDate: null,
    quizAttempts: {},
    studyDays: [],
    lastLessonChangedAt: null,
    updatedAt: "",
    ...overrides,
  };
}

test("merges set-like progress fields without mutating either input", () => {
  const local = progress({
    favoriteCardIds: ["the-lovers"],
    completedLessonIds: ["lesson-a"],
    studyDays: ["2026-07-18", "2026-07-20"],
  });
  const remote = progress({
    favoriteCardIds: ["the-star", "the-lovers"],
    completedLessonIds: ["lesson-b", "lesson-a"],
    studyDays: ["2026-07-20", "2026-07-21"],
  });
  const localSnapshot = structuredClone(local);
  const remoteSnapshot = structuredClone(remote);

  const merged = mergeProgress(local, remote);

  assert.deepEqual(merged.favoriteCardIds, ["the-lovers", "the-star"]);
  assert.deepEqual(merged.completedLessonIds, ["lesson-a", "lesson-b"]);
  assert.deepEqual(merged.studyDays, [
    "2026-07-18",
    "2026-07-20",
    "2026-07-21",
  ]);
  assert.equal(merged.lastStudyDate, "2026-07-21");
  assert.equal(merged.streak, 2);
  assert.deepEqual(local, localSnapshot);
  assert.deepEqual(remote, remoteSnapshot);
});

test("keeps the newest quiz answer and derives wrong lessons from it", () => {
  const local = progress({
    wrongLessonIds: ["lesson-a", "legacy-local"],
    quizAttempts: {
      "lesson-a": {
        correct: false,
        answeredAt: "2026-07-20T10:00:00.000Z",
      },
      "lesson-b": {
        correct: false,
        answeredAt: "2026-07-21T08:00:00.000Z",
      },
    },
  });
  const remote = progress({
    wrongLessonIds: ["lesson-a", "legacy-remote"],
    quizAttempts: {
      "lesson-a": {
        correct: true,
        answeredAt: "2026-07-21T10:00:00.000Z",
      },
      "legacy-remote": {
        correct: true,
        answeredAt: "2026-07-22T10:00:00.000Z",
      },
    },
  });

  const merged = mergeProgress(local, remote);

  assert.equal(merged.quizAttempts["lesson-a"].correct, true);
  assert.deepEqual(merged.wrongLessonIds, ["lesson-b", "legacy-local"]);
});

test("compares ISO timestamps by instant rather than string order", () => {
  const merged = mergeProgress(
    progress({
      quizAttempts: {
        lesson: {
          correct: false,
          answeredAt: "2026-07-21T12:00:00+09:00",
        },
      },
      updatedAt: "2026-07-21T12:00:00+09:00",
    }),
    progress({
      quizAttempts: {
        lesson: {
          correct: true,
          answeredAt: "2026-07-21T04:00:00.000Z",
        },
      },
      updatedAt: "2026-07-21T04:00:00.000Z",
    }),
  );

  assert.equal(merged.quizAttempts.lesson.correct, true);
  assert.equal(merged.updatedAt, "2026-07-21T04:00:00.000Z");
});

test("chooses the last lesson with the newest change timestamp and falls back sensibly", () => {
  const timestamped = mergeProgress(
    progress({
      lastLessonId: "local-lesson",
      lastLessonChangedAt: "2026-07-20T10:00:00.000Z",
    }),
    progress({
      lastLessonId: "remote-lesson",
      lastLessonChangedAt: "2026-07-21T10:00:00.000Z",
    }),
  );
  assert.equal(timestamped.lastLessonId, "remote-lesson");
  assert.equal(
    timestamped.lastLessonChangedAt,
    "2026-07-21T10:00:00.000Z",
  );

  const fallback = mergeProgress(
    progress({ lastLessonId: null, updatedAt: "2026-07-20T10:00:00.000Z" }),
    progress({
      lastLessonId: "remote-lesson",
      updatedAt: "2026-07-21T10:00:00.000Z",
    }),
  );
  assert.equal(fallback.lastLessonId, "remote-lesson");
  assert.equal(fallback.lastLessonChangedAt, null);

  const nonNullFallback = mergeProgress(
    progress({
      lastLessonId: "local-lesson",
      updatedAt: "2026-07-20T10:00:00.000Z",
    }),
    progress({ lastLessonId: null, updatedAt: "2026-07-22T10:00:00.000Z" }),
  );
  assert.equal(nonNullFallback.lastLessonId, "local-lesson");
});

test("recomputes the latest consecutive streak across duplicates and gaps", () => {
  const merged = mergeProgress(
    progress({
      studyDays: ["2026-07-17", "2026-07-20", "2026-07-20"],
      streak: 99,
    }),
    progress({
      studyDays: ["2026-07-18", "2026-07-21", "2026-07-22"],
      streak: 99,
    }),
  );

  assert.deepEqual(merged.studyDays, [
    "2026-07-17",
    "2026-07-18",
    "2026-07-20",
    "2026-07-21",
    "2026-07-22",
  ]);
  assert.equal(merged.streak, 3);
  assert.equal(merged.lastStudyDate, "2026-07-22");
});

test("uses the newest progress update timestamp", () => {
  const merged = mergeProgress(
    progress({ updatedAt: "2026-07-20T10:00:00.000Z" }),
    progress({ updatedAt: "2026-07-22T10:00:00.000Z" }),
  );
  assert.equal(merged.updatedAt, "2026-07-22T10:00:00.000Z");
});

test("deduplicates sync events stably and rejects malformed stored queues", () => {
  const first: SyncEvent = {
    eventId: "event-1",
    kind: "quiz-answer",
    entityId: "lesson-a",
    changedAt: "2026-07-21T10:00:00.000Z",
  };
  const duplicate = { ...first, changedAt: "2026-07-22T10:00:00.000Z" };
  const second: SyncEvent = {
    eventId: "event-2",
    kind: "lesson-complete",
    entityId: "lesson-b",
    changedAt: "2026-07-22T11:00:00.000Z",
  };

  assert.deepEqual(dedupeSyncEvents([first, duplicate, second]), [first, second]);
  assert.deepEqual(parseSyncQueue("not-json"), []);
  assert.deepEqual(parseSyncQueue(JSON.stringify({ version: 1, events: [{}] })), []);
});

test("reads and writes a deduplicated versioned sync queue safely", () => {
  const values = new Map<string, string>();
  const storage = {
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      values.set(key, value);
    },
  };
  const event: SyncEvent = {
    eventId: "event-1",
    kind: "study-day",
    entityId: "2026-07-21",
    changedAt: "2026-07-21T10:00:00.000Z",
  };

  assert.match(SYNC_QUEUE_STORAGE_KEY, /v1$/);
  assert.equal(safeWriteSyncQueue(storage, [event, { ...event }]), true);
  assert.deepEqual(
    JSON.parse(values.get(SYNC_QUEUE_STORAGE_KEY) ?? ""),
    { version: 1, events: [event] },
  );
  assert.deepEqual(safeReadSyncQueue(storage), [event]);
  assert.deepEqual(safeReadSyncQueue(undefined), []);
  assert.equal(safeWriteSyncQueue(undefined, [event]), false);
});
