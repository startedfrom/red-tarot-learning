export const STORAGE_KEY = "red-tarot-progress-v1";
export const UNKNOWN_CHANGED_AT = "1970-01-01T00:00:00.000Z";

export type QuizAttempt = {
  correct: boolean;
  answeredAt: string;
};

export type FavoriteChange = {
  favorite: boolean;
  changedAt: string;
};

export type LearningProgress = {
  version: 2;
  favoriteCardIds: string[];
  completedLessonIds: string[];
  wrongLessonIds: string[];
  lastLessonId: string | null;
  streak: number;
  lastStudyDate: string | null;
  quizAttempts: Record<string, QuizAttempt>;
  studyDays: string[];
  favoriteChanges: Record<string, FavoriteChange>;
  lastLessonChangedAt: string | null;
  updatedAt: string;
};

export const defaultProgress: LearningProgress = {
  version: 2,
  favoriteCardIds: [],
  completedLessonIds: [],
  wrongLessonIds: [],
  lastLessonId: null,
  streak: 0,
  lastStudyDate: null,
  quizAttempts: {},
  studyDays: [],
  favoriteChanges: {},
  lastLessonChangedAt: null,
  updatedAt: UNKNOWN_CHANGED_AT,
};

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isValidStreak(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

export function isCalendarDay(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

export function isIsoTimestamp(value: unknown): value is string {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-](?:0\d|1[0-4]):[0-5]\d)$/.test(
      value,
    ) ||
    !isCalendarDay(value.slice(0, 10))
  ) {
    return false;
  }

  return !Number.isNaN(Date.parse(value));
}

export function normalizeIsoTimestamp(value: string): string {
  return isIsoTimestamp(value) ? value : UNKNOWN_CHANGED_AT;
}

export function compareIsoTimestampInstants(
  first: string,
  second: string,
): number {
  return (
    Date.parse(normalizeIsoTimestamp(first)) -
    Date.parse(normalizeIsoTimestamp(second))
  );
}

function compareStrings(first: string, second: string): number {
  if (first === second) return 0;
  return first > second ? 1 : -1;
}

export function compareIsoTimestamps(first: string, second: string): number {
  const instantComparison = compareIsoTimestampInstants(first, second);
  if (instantComparison !== 0) return instantComparison;
  return compareStrings(
    normalizeIsoTimestamp(first),
    normalizeIsoTimestamp(second),
  );
}

function isQuizAttempts(value: unknown): value is Record<string, QuizAttempt> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;

  return Object.values(value).every(
    (attempt) =>
      Boolean(attempt) &&
      typeof attempt === "object" &&
      typeof (attempt as QuizAttempt).correct === "boolean" &&
      isIsoTimestamp((attempt as QuizAttempt).answeredAt),
  );
}

function isFavoriteChanges(
  value: unknown,
): value is Record<string, FavoriteChange> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;

  return Object.values(value).every(
    (change) =>
      Boolean(change) &&
      typeof change === "object" &&
      typeof (change as FavoriteChange).favorite === "boolean" &&
      isIsoTimestamp((change as FavoriteChange).changedAt),
  );
}

const sortedUnique = (values: string[]) => [...new Set(values)].sort();

function cloneDefaultProgress(): LearningProgress {
  return {
    ...defaultProgress,
    favoriteCardIds: [],
    completedLessonIds: [],
    wrongLessonIds: [],
    quizAttempts: {},
    studyDays: [],
    favoriteChanges: {},
  };
}

function parseCommonFields(value: Record<string, unknown>) {
  if (
    !isStringArray(value.favoriteCardIds) ||
    !isStringArray(value.completedLessonIds) ||
    !isStringArray(value.wrongLessonIds) ||
    !isNullableString(value.lastLessonId) ||
    !isNullableString(value.lastStudyDate) ||
    !isValidStreak(value.streak)
  ) {
    return null;
  }

  return {
    favoriteCardIds: sortedUnique(value.favoriteCardIds),
    completedLessonIds: sortedUnique(value.completedLessonIds),
    wrongLessonIds: sortedUnique(value.wrongLessonIds),
    lastLessonId: value.lastLessonId,
    streak: value.streak,
    lastStudyDate: value.lastStudyDate,
  };
}

function shiftCalendarDay(day: string, offset: number): string {
  const date = new Date(`${day}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

function consecutiveStudyDays(endDay: string, count: number): string[] {
  return Array.from({ length: count }, (_, index) =>
    shiftCalendarDay(endDay, index - count + 1),
  );
}

function previousCalendarDay(day: string): string | null {
  return isCalendarDay(day) ? shiftCalendarDay(day, -1) : null;
}

export function calculateStreak(studyDays: string[]): number {
  const days = sortedUnique(studyDays.filter(isCalendarDay));
  if (days.length === 0) return 0;

  let streak = 1;
  for (let index = days.length - 1; index > 0; index -= 1) {
    if (previousCalendarDay(days[index]) !== days[index - 1]) break;
    streak += 1;
  }
  return streak;
}

function legacyFavoriteChanges(
  favoriteCardIds: string[],
): Record<string, FavoriteChange> {
  return Object.fromEntries(
    sortedUnique(favoriteCardIds).map((cardId) => [
      cardId,
      { favorite: true, changedAt: UNKNOWN_CHANGED_AT },
    ]),
  );
}

function canonicalFavoriteChanges(
  favoriteCardIds: string[],
  changes: Record<string, FavoriteChange>,
): Record<string, FavoriteChange> {
  const combined = { ...changes };
  for (const cardId of favoriteCardIds) {
    if (!combined[cardId]) {
      combined[cardId] = {
        favorite: true,
        changedAt: UNKNOWN_CHANGED_AT,
      };
    }
  }

  return Object.fromEntries(
    Object.entries(combined)
      .sort(([first], [second]) => compareStrings(first, second))
      .map(([cardId, change]) => [cardId, { ...change }]),
  );
}

function favoriteIdsFromChanges(
  changes: Record<string, FavoriteChange>,
): string[] {
  return Object.entries(changes)
    .filter(([, change]) => change.favorite)
    .map(([cardId]) => cardId)
    .sort();
}

function canonicalQuizAttempts(
  attempts: Record<string, QuizAttempt>,
): Record<string, QuizAttempt> {
  return Object.fromEntries(
    Object.entries(attempts)
      .sort(([first], [second]) => compareStrings(first, second))
      .map(([lessonId, attempt]) => [lessonId, { ...attempt }]),
  );
}

function migratedStudyDays(
  lastStudyDate: string | null,
  streak: number,
): string[] {
  if (!isCalendarDay(lastStudyDate)) return [];
  return consecutiveStudyDays(lastStudyDate, Math.max(streak, 1));
}

function repairedV2StudyDays(
  rawStudyDays: string[],
  lastStudyDate: string | null,
  storedStreak: number,
): string[] {
  const allStudyDaysValid = rawStudyDays.every(isCalendarDay);
  const days = sortedUnique(rawStudyDays.filter(isCalendarDay));
  if (isCalendarDay(lastStudyDate)) days.push(lastStudyDate);
  const canonicalDays = sortedUnique(days);

  if (
    allStudyDaysValid &&
    storedStreak > 1 &&
    canonicalDays.length === 1 &&
    canonicalDays[0] === lastStudyDate
  ) {
    return consecutiveStudyDays(lastStudyDate, storedStreak);
  }

  return canonicalDays;
}

export function parseProgress(raw: string | null): LearningProgress {
  if (!raw) return cloneDefaultProgress();

  try {
    const value = JSON.parse(raw) as unknown;
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return cloneDefaultProgress();
    }

    const record = value as Record<string, unknown>;
    const common = parseCommonFields(record);
    if (!common) return cloneDefaultProgress();

    if (record.version === 2) {
      if (
        !isQuizAttempts(record.quizAttempts) ||
        !isStringArray(record.studyDays) ||
        !isNullableString(record.lastLessonChangedAt) ||
        (record.lastLessonChangedAt !== null &&
          !isIsoTimestamp(record.lastLessonChangedAt)) ||
        typeof record.updatedAt !== "string" ||
        (record.updatedAt !== "" && !isIsoTimestamp(record.updatedAt)) ||
        (record.favoriteChanges !== undefined &&
          !isFavoriteChanges(record.favoriteChanges))
      ) {
        return cloneDefaultProgress();
      }

      const studyDays = repairedV2StudyDays(
        record.studyDays,
        common.lastStudyDate,
        common.streak,
      );
      const favoriteChanges = canonicalFavoriteChanges(
        common.favoriteCardIds,
        record.favoriteChanges ?? {},
      );

      return {
        version: 2,
        ...common,
        favoriteCardIds: favoriteIdsFromChanges(favoriteChanges),
        streak: calculateStreak(studyDays),
        lastStudyDate: studyDays.at(-1) ?? null,
        quizAttempts: canonicalQuizAttempts(record.quizAttempts),
        studyDays,
        favoriteChanges,
        lastLessonChangedAt: record.lastLessonChangedAt,
        updatedAt:
          record.updatedAt === "" ? UNKNOWN_CHANGED_AT : record.updatedAt,
      };
    }

    if (record.version !== undefined && record.version !== 1) {
      return cloneDefaultProgress();
    }

    const studyDays = migratedStudyDays(common.lastStudyDate, common.streak);
    const favoriteChanges = legacyFavoriteChanges(common.favoriteCardIds);
    return {
      version: 2,
      ...common,
      favoriteCardIds: favoriteIdsFromChanges(favoriteChanges),
      streak: calculateStreak(studyDays),
      lastStudyDate: studyDays.at(-1) ?? null,
      quizAttempts: {},
      studyDays,
      favoriteChanges,
      lastLessonChangedAt: null,
      updatedAt: UNKNOWN_CHANGED_AT,
    };
  } catch {
    return cloneDefaultProgress();
  }
}

export function toggleFavorite(
  progress: LearningProgress,
  cardId: string,
  changedAt = new Date().toISOString(),
): LearningProgress {
  const favorite = !progress.favoriteCardIds.includes(cardId);
  const timestamp = normalizeIsoTimestamp(changedAt);
  const favoriteChanges = canonicalFavoriteChanges(progress.favoriteCardIds, {
    ...(progress.favoriteChanges ?? {}),
    [cardId]: { favorite, changedAt: timestamp },
  });

  return {
    ...progress,
    favoriteCardIds: favoriteIdsFromChanges(favoriteChanges),
    favoriteChanges,
    updatedAt: timestamp,
  };
}

export function markLessonComplete(
  progress: LearningProgress,
  lessonId: string,
  changedAt = new Date().toISOString(),
): LearningProgress {
  const timestamp = normalizeIsoTimestamp(changedAt);
  return {
    ...progress,
    completedLessonIds: sortedUnique([
      ...progress.completedLessonIds,
      lessonId,
    ]),
    lastLessonId: lessonId,
    lastLessonChangedAt: timestamp,
    updatedAt: timestamp,
  };
}

export function recordQuizAnswer(
  progress: LearningProgress,
  lessonId: string,
  correct: boolean,
  answeredAt = new Date().toISOString(),
): LearningProgress {
  const timestamp = normalizeIsoTimestamp(answeredAt);
  return {
    ...progress,
    wrongLessonIds: correct
      ? progress.wrongLessonIds.filter((id) => id !== lessonId).sort()
      : sortedUnique([...progress.wrongLessonIds, lessonId]),
    quizAttempts: canonicalQuizAttempts({
      ...progress.quizAttempts,
      [lessonId]: { correct, answeredAt: timestamp },
    }),
    updatedAt: timestamp,
  };
}

function arraysEqual(first: string[], second: string[]): boolean {
  return (
    first.length === second.length &&
    first.every((value, index) => value === second[index])
  );
}

export function recordStudyDay(
  progress: LearningProgress,
  today: string,
  yesterday: string,
  changedAt = new Date().toISOString(),
): LearningProgress {
  if (!isCalendarDay(today)) return progress;

  const previousDays = progress.studyDays.filter(isCalendarDay);
  if (isCalendarDay(progress.lastStudyDate)) {
    previousDays.push(progress.lastStudyDate);
  }
  const studyDays = sortedUnique([...previousDays, today]);
  const lastStudyDate = studyDays.at(-1) ?? null;

  if (
    arraysEqual(progress.studyDays, studyDays) &&
    progress.lastStudyDate === lastStudyDate
  ) {
    return progress;
  }

  // Retained for source compatibility. The full day set now determines streaks.
  void yesterday;

  return {
    ...progress,
    studyDays,
    streak: calculateStreak(studyDays),
    lastStudyDate,
    updatedAt: normalizeIsoTimestamp(changedAt),
  };
}

type ReadableStorage = Pick<Storage, "getItem">;
type WritableStorage = Pick<Storage, "setItem">;

export function safeReadProgress(
  storage: ReadableStorage | undefined,
): LearningProgress {
  try {
    return storage
      ? parseProgress(storage.getItem(STORAGE_KEY))
      : cloneDefaultProgress();
  } catch {
    return cloneDefaultProgress();
  }
}

export function safeWriteProgress(
  storage: WritableStorage | undefined,
  progress: LearningProgress,
): boolean {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(progress));
    return Boolean(storage);
  } catch {
    return false;
  }
}
