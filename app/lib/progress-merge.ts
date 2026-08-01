import {
  calculateStreak,
  type LearningProgress,
  type QuizAttempt,
} from "./progress";

const unique = (values: string[]) => [...new Set(values)];

function isNewerTimestamp(candidate: string, current: string): boolean {
  const candidateTime = Date.parse(candidate);
  const currentTime = Date.parse(current);

  if (!Number.isNaN(candidateTime) && !Number.isNaN(currentTime)) {
    return candidateTime > currentTime;
  }
  if (!Number.isNaN(candidateTime)) return true;
  if (!Number.isNaN(currentTime)) return false;
  return candidate > current;
}

function newestTimestamp(first: string, second: string): string {
  return isNewerTimestamp(second, first) ? second : first;
}

function mergeQuizAttempts(
  local: Record<string, QuizAttempt>,
  remote: Record<string, QuizAttempt>,
): Record<string, QuizAttempt> {
  const merged = Object.fromEntries(
    Object.entries(local).map(([lessonId, attempt]) => [
      lessonId,
      { ...attempt },
    ]),
  );

  for (const [lessonId, remoteAttempt] of Object.entries(remote)) {
    const localAttempt = merged[lessonId];
    if (
      !localAttempt ||
      isNewerTimestamp(remoteAttempt.answeredAt, localAttempt.answeredAt)
    ) {
      merged[lessonId] = { ...remoteAttempt };
    }
  }

  return merged;
}

function selectLastLesson(
  local: LearningProgress,
  remote: LearningProgress,
): Pick<LearningProgress, "lastLessonId" | "lastLessonChangedAt"> {
  const localChangedAt = local.lastLessonChangedAt;
  const remoteChangedAt = remote.lastLessonChangedAt;

  if (localChangedAt && remoteChangedAt) {
    return isNewerTimestamp(remoteChangedAt, localChangedAt)
      ? {
          lastLessonId: remote.lastLessonId,
          lastLessonChangedAt: remoteChangedAt,
        }
      : {
          lastLessonId: local.lastLessonId,
          lastLessonChangedAt: localChangedAt,
        };
  }

  if (localChangedAt) {
    return {
      lastLessonId: local.lastLessonId,
      lastLessonChangedAt: localChangedAt,
    };
  }

  if (remoteChangedAt) {
    return {
      lastLessonId: remote.lastLessonId,
      lastLessonChangedAt: remoteChangedAt,
    };
  }

  if (local.lastLessonId === null) {
    return { lastLessonId: remote.lastLessonId, lastLessonChangedAt: null };
  }

  if (remote.lastLessonId === null) {
    return { lastLessonId: local.lastLessonId, lastLessonChangedAt: null };
  }

  if (isNewerTimestamp(remote.updatedAt, local.updatedAt)) {
    return { lastLessonId: remote.lastLessonId, lastLessonChangedAt: null };
  }

  return {
    lastLessonId: local.lastLessonId,
    lastLessonChangedAt: null,
  };
}

export function mergeProgress(
  local: LearningProgress,
  remote: LearningProgress,
): LearningProgress {
  const quizAttempts = mergeQuizAttempts(
    local.quizAttempts,
    remote.quizAttempts,
  );
  const timestampedWrongIds = Object.entries(quizAttempts)
    .filter(([, attempt]) => !attempt.correct)
    .map(([lessonId]) => lessonId);
  const legacyWrongIds = unique([
    ...local.wrongLessonIds,
    ...remote.wrongLessonIds,
  ]).filter((lessonId) => !quizAttempts[lessonId]);
  const studyDays = unique([...local.studyDays, ...remote.studyDays]).sort();

  return {
    version: 2,
    favoriteCardIds: unique([
      ...local.favoriteCardIds,
      ...remote.favoriteCardIds,
    ]),
    completedLessonIds: unique([
      ...local.completedLessonIds,
      ...remote.completedLessonIds,
    ]),
    wrongLessonIds: [...timestampedWrongIds, ...legacyWrongIds],
    ...selectLastLesson(local, remote),
    streak: calculateStreak(studyDays),
    lastStudyDate: studyDays.at(-1) ?? null,
    quizAttempts,
    studyDays,
    updatedAt: newestTimestamp(local.updatedAt, remote.updatedAt),
  };
}
