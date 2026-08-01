import {
  UNKNOWN_CHANGED_AT,
  calculateStreak,
  compareIsoTimestampInstants,
  compareIsoTimestamps,
  isCalendarDay,
  isIsoTimestamp,
  normalizeIsoTimestamp,
  type FavoriteChange,
  type LearningProgress,
  type QuizAttempt,
} from "./progress";

const sortedUnique = (values: string[]) => [...new Set(values)].sort();

function compareStrings(first: string, second: string): number {
  if (first === second) return 0;
  return first > second ? 1 : -1;
}

function compareQuizAttempts(first: QuizAttempt, second: QuizAttempt): number {
  const timestampComparison = compareIsoTimestampInstants(
    first.answeredAt,
    second.answeredAt,
  );
  if (timestampComparison !== 0) return timestampComparison;
  if (first.correct !== second.correct) return first.correct ? 1 : -1;
  return compareStrings(
    normalizeIsoTimestamp(first.answeredAt),
    normalizeIsoTimestamp(second.answeredAt),
  );
}

function mergeQuizAttempts(
  local: Record<string, QuizAttempt>,
  remote: Record<string, QuizAttempt>,
): Record<string, QuizAttempt> {
  const lessonIds = sortedUnique([
    ...Object.keys(local),
    ...Object.keys(remote),
  ]);

  return Object.fromEntries(
    lessonIds.map((lessonId) => {
      const localAttempt = local[lessonId];
      const remoteAttempt = remote[lessonId];
      const selected =
        localAttempt && remoteAttempt
          ? compareQuizAttempts(remoteAttempt, localAttempt) > 0
            ? remoteAttempt
            : localAttempt
          : (localAttempt ?? remoteAttempt);

      return [
        lessonId,
        {
          ...selected,
          answeredAt: normalizeIsoTimestamp(selected.answeredAt),
        },
      ];
    }),
  );
}

function compareFavoriteChanges(
  first: FavoriteChange,
  second: FavoriteChange,
): number {
  const timestampComparison = compareIsoTimestampInstants(
    first.changedAt,
    second.changedAt,
  );
  if (timestampComparison !== 0) return timestampComparison;
  if (first.favorite !== second.favorite) return first.favorite ? -1 : 1;
  return compareStrings(
    normalizeIsoTimestamp(first.changedAt),
    normalizeIsoTimestamp(second.changedAt),
  );
}

function favoriteChangesWithLegacy(
  progress: LearningProgress,
): Record<string, FavoriteChange> {
  const changes: Record<string, FavoriteChange> = {};
  for (const [cardId, change] of Object.entries(
    progress.favoriteChanges ?? {},
  )) {
    changes[cardId] = {
      favorite: change.favorite,
      changedAt: normalizeIsoTimestamp(change.changedAt),
    };
  }
  for (const cardId of progress.favoriteCardIds) {
    if (!changes[cardId]) {
      changes[cardId] = {
        favorite: true,
        changedAt: UNKNOWN_CHANGED_AT,
      };
    }
  }
  return changes;
}

function mergeFavoriteChanges(
  local: LearningProgress,
  remote: LearningProgress,
): Record<string, FavoriteChange> {
  const localChanges = favoriteChangesWithLegacy(local);
  const remoteChanges = favoriteChangesWithLegacy(remote);
  const cardIds = sortedUnique([
    ...Object.keys(localChanges),
    ...Object.keys(remoteChanges),
  ]);

  return Object.fromEntries(
    cardIds.map((cardId) => {
      const localChange = localChanges[cardId];
      const remoteChange = remoteChanges[cardId];
      const selected =
        localChange && remoteChange
          ? compareFavoriteChanges(remoteChange, localChange) > 0
            ? remoteChange
            : localChange
          : (localChange ?? remoteChange);
      return [cardId, { ...selected }];
    }),
  );
}

type LastLesson = Pick<
  LearningProgress,
  "lastLessonId" | "lastLessonChangedAt"
>;

function compareNullableLessonIds(
  first: string | null,
  second: string | null,
): number {
  if (first === second) return 0;
  if (first === null) return -1;
  if (second === null) return 1;
  return compareStrings(first, second);
}

function normalizedLastLesson(progress: LearningProgress): LastLesson {
  return {
    lastLessonId: progress.lastLessonId,
    lastLessonChangedAt:
      progress.lastLessonChangedAt &&
      isIsoTimestamp(progress.lastLessonChangedAt)
        ? progress.lastLessonChangedAt
        : null,
  };
}

function compareLastLessons(first: LastLesson, second: LastLesson): number {
  const firstTimestamp = first.lastLessonChangedAt;
  const secondTimestamp = second.lastLessonChangedAt;

  if (firstTimestamp && secondTimestamp) {
    const timestampComparison = compareIsoTimestampInstants(
      firstTimestamp,
      secondTimestamp,
    );
    if (timestampComparison !== 0) return timestampComparison;

    const lessonComparison = compareNullableLessonIds(
      first.lastLessonId,
      second.lastLessonId,
    );
    if (lessonComparison !== 0) return lessonComparison;
    return compareStrings(firstTimestamp, secondTimestamp);
  }
  if (firstTimestamp) return 1;
  if (secondTimestamp) return -1;
  return compareNullableLessonIds(first.lastLessonId, second.lastLessonId);
}

function selectLastLesson(
  local: LearningProgress,
  remote: LearningProgress,
): LastLesson {
  const localLesson = normalizedLastLesson(local);
  const remoteLesson = normalizedLastLesson(remote);
  return compareLastLessons(remoteLesson, localLesson) > 0
    ? remoteLesson
    : localLesson;
}

function newestTimestamp(first: string, second: string): string {
  const normalizedFirst = normalizeIsoTimestamp(first);
  const normalizedSecond = normalizeIsoTimestamp(second);
  return compareIsoTimestamps(normalizedSecond, normalizedFirst) > 0
    ? normalizedSecond
    : normalizedFirst;
}

export function mergeProgress(
  local: LearningProgress,
  remote: LearningProgress,
): LearningProgress {
  const quizAttempts = mergeQuizAttempts(
    local.quizAttempts,
    remote.quizAttempts,
  );
  const legacyWrongIds = sortedUnique([
    ...local.wrongLessonIds,
    ...remote.wrongLessonIds,
  ]).filter((lessonId) => !quizAttempts[lessonId]);
  const timestampedWrongIds = Object.entries(quizAttempts)
    .filter(([, attempt]) => !attempt.correct)
    .map(([lessonId]) => lessonId);
  const wrongLessonIds = sortedUnique([
    ...legacyWrongIds,
    ...timestampedWrongIds,
  ]);
  const studyDays = sortedUnique(
    [...local.studyDays, ...remote.studyDays].filter(isCalendarDay),
  );
  const favoriteChanges = mergeFavoriteChanges(local, remote);
  const favoriteCardIds = Object.entries(favoriteChanges)
    .filter(([, change]) => change.favorite)
    .map(([cardId]) => cardId)
    .sort();

  return {
    version: 2,
    favoriteCardIds,
    completedLessonIds: sortedUnique([
      ...local.completedLessonIds,
      ...remote.completedLessonIds,
    ]),
    wrongLessonIds,
    ...selectLastLesson(local, remote),
    streak: calculateStreak(studyDays),
    lastStudyDate: studyDays.at(-1) ?? null,
    quizAttempts,
    studyDays,
    favoriteChanges,
    updatedAt: newestTimestamp(local.updatedAt, remote.updatedAt),
  };
}
