export const STORAGE_KEY = "red-tarot-progress-v1";

export type QuizAttempt = {
  correct: boolean;
  answeredAt: string;
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
  lastLessonChangedAt: null,
  updatedAt: "",
};

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isValidStreak(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0
  );
}

function isQuizAttempts(value: unknown): value is Record<string, QuizAttempt> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;

  return Object.values(value).every(
    (attempt) =>
      Boolean(attempt) &&
      typeof attempt === "object" &&
      typeof (attempt as QuizAttempt).correct === "boolean" &&
      typeof (attempt as QuizAttempt).answeredAt === "string",
  );
}

const unique = (values: string[]) => [...new Set(values)];

function cloneDefaultProgress(): LearningProgress {
  return {
    ...defaultProgress,
    favoriteCardIds: [],
    completedLessonIds: [],
    wrongLessonIds: [],
    quizAttempts: {},
    studyDays: [],
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
    favoriteCardIds: unique(value.favoriteCardIds),
    completedLessonIds: unique(value.completedLessonIds),
    wrongLessonIds: unique(value.wrongLessonIds),
    lastLessonId: value.lastLessonId,
    streak: value.streak,
    lastStudyDate: value.lastStudyDate,
  };
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
        typeof record.updatedAt !== "string"
      ) {
        return cloneDefaultProgress();
      }

      return {
        version: 2,
        ...common,
        quizAttempts: Object.fromEntries(
          Object.entries(record.quizAttempts).map(([lessonId, attempt]) => [
            lessonId,
            { ...attempt },
          ]),
        ),
        studyDays: unique(record.studyDays).sort(),
        lastLessonChangedAt: record.lastLessonChangedAt,
        updatedAt: record.updatedAt,
      };
    }

    if (record.version !== undefined && record.version !== 1) {
      return cloneDefaultProgress();
    }

    return {
      version: 2,
      ...common,
      quizAttempts: {},
      studyDays: common.lastStudyDate ? [common.lastStudyDate] : [],
      lastLessonChangedAt: null,
      updatedAt: "",
    };
  } catch {
    return cloneDefaultProgress();
  }
}

function previousCalendarDay(day: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;

  const date = new Date(`${day}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== day) {
    return null;
  }

  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

export function calculateStreak(studyDays: string[]): number {
  const days = unique(studyDays).sort();
  if (days.length === 0) return 0;

  let streak = 1;
  for (let index = days.length - 1; index > 0; index -= 1) {
    if (previousCalendarDay(days[index]) !== days[index - 1]) break;
    streak += 1;
  }
  return streak;
}

export function toggleFavorite(
  progress: LearningProgress,
  cardId: string,
  changedAt = new Date().toISOString(),
): LearningProgress {
  const exists = progress.favoriteCardIds.includes(cardId);

  return {
    ...progress,
    favoriteCardIds: exists
      ? progress.favoriteCardIds.filter((id) => id !== cardId)
      : unique([...progress.favoriteCardIds, cardId]),
    updatedAt: changedAt,
  };
}

export function markLessonComplete(
  progress: LearningProgress,
  lessonId: string,
  changedAt = new Date().toISOString(),
): LearningProgress {
  return {
    ...progress,
    completedLessonIds: unique([...progress.completedLessonIds, lessonId]),
    lastLessonId: lessonId,
    lastLessonChangedAt: changedAt,
    updatedAt: changedAt,
  };
}

export function recordQuizAnswer(
  progress: LearningProgress,
  lessonId: string,
  correct: boolean,
  answeredAt = new Date().toISOString(),
): LearningProgress {
  return {
    ...progress,
    wrongLessonIds: correct
      ? progress.wrongLessonIds.filter((id) => id !== lessonId)
      : unique([...progress.wrongLessonIds, lessonId]),
    quizAttempts: {
      ...progress.quizAttempts,
      [lessonId]: { correct, answeredAt },
    },
    updatedAt: answeredAt,
  };
}

export function recordStudyDay(
  progress: LearningProgress,
  today: string,
  yesterday: string,
  changedAt = new Date().toISOString(),
): LearningProgress {
  const previousDays =
    progress.studyDays.length > 0
      ? progress.studyDays
      : progress.lastStudyDate
        ? [progress.lastStudyDate]
        : [];
  const studyDays = unique([...previousDays, today]).sort();
  const lastStudyDate = studyDays.at(-1) ?? null;

  if (
    progress.studyDays.includes(today) &&
    progress.lastStudyDate === lastStudyDate
  ) {
    return progress;
  }

  // Keep the legacy argument in the API; the complete study-day set now makes
  // streak calculation independent of call order.
  void yesterday;

  return {
    ...progress,
    studyDays,
    streak: calculateStreak(studyDays),
    lastStudyDate,
    updatedAt: changedAt,
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
