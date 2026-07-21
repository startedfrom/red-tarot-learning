export const STORAGE_KEY = "red-tarot-progress-v1";

export type LearningProgress = {
  favoriteCardIds: string[];
  completedLessonIds: string[];
  wrongLessonIds: string[];
  lastLessonId: string | null;
  streak: number;
  lastStudyDate: string | null;
};

export const defaultProgress: LearningProgress = {
  favoriteCardIds: [],
  completedLessonIds: [],
  wrongLessonIds: [],
  lastLessonId: null,
  streak: 0,
  lastStudyDate: null,
};

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export function parseProgress(raw: string | null): LearningProgress {
  if (!raw) return defaultProgress;

  try {
    const value = JSON.parse(raw) as Partial<LearningProgress>;
    const validLastLesson =
      value.lastLessonId === null || typeof value.lastLessonId === "string";
    const validLastStudy =
      value.lastStudyDate === null || typeof value.lastStudyDate === "string";

    if (
      !isStringArray(value.favoriteCardIds) ||
      !isStringArray(value.completedLessonIds) ||
      !isStringArray(value.wrongLessonIds) ||
      !validLastLesson ||
      !validLastStudy ||
      typeof value.streak !== "number" ||
      !Number.isInteger(value.streak) ||
      value.streak < 0
    ) {
      return defaultProgress;
    }

    return {
      favoriteCardIds: [...new Set(value.favoriteCardIds)],
      completedLessonIds: [...new Set(value.completedLessonIds)],
      wrongLessonIds: [...new Set(value.wrongLessonIds)],
      lastLessonId: value.lastLessonId ?? null,
      streak: value.streak,
      lastStudyDate: value.lastStudyDate ?? null,
    };
  } catch {
    return defaultProgress;
  }
}

const unique = (values: string[]) => [...new Set(values)];

export function toggleFavorite(
  progress: LearningProgress,
  cardId: string,
): LearningProgress {
  const exists = progress.favoriteCardIds.includes(cardId);

  return {
    ...progress,
    favoriteCardIds: exists
      ? progress.favoriteCardIds.filter((id) => id !== cardId)
      : unique([...progress.favoriteCardIds, cardId]),
  };
}

export function markLessonComplete(
  progress: LearningProgress,
  lessonId: string,
): LearningProgress {
  return {
    ...progress,
    completedLessonIds: unique([...progress.completedLessonIds, lessonId]),
    lastLessonId: lessonId,
  };
}

export function recordQuizAnswer(
  progress: LearningProgress,
  lessonId: string,
  correct: boolean,
): LearningProgress {
  return {
    ...progress,
    wrongLessonIds: correct
      ? progress.wrongLessonIds.filter((id) => id !== lessonId)
      : unique([...progress.wrongLessonIds, lessonId]),
  };
}

export function recordStudyDay(
  progress: LearningProgress,
  today: string,
  yesterday: string,
): LearningProgress {
  if (progress.lastStudyDate === today) return progress;

  return {
    ...progress,
    streak: progress.lastStudyDate === yesterday ? progress.streak + 1 : 1,
    lastStudyDate: today,
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
      : defaultProgress;
  } catch {
    return defaultProgress;
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
