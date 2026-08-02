import type { SupabaseClient } from "@supabase/supabase-js";
import {
  UNKNOWN_CHANGED_AT,
  normalizeIsoTimestamp,
  parseProgress,
  type LearningProgress,
} from "../progress";
import type { Database } from "./database.types";

type Tables = Database["public"]["Tables"];
type LessonCompletion = Tables["lesson_completions"]["Row"];
type QuizAttemptRow = Tables["quiz_attempts"]["Row"];
type FavoriteCardRow = Tables["favorite_cards"]["Row"];
type StudyDayRow = Tables["study_days"]["Row"];
type UserStateRow = Tables["user_state"]["Row"];

export type RemoteProgressRows = {
  lessonCompletions: LessonCompletion[];
  quizAttempts: QuizAttemptRow[];
  favoriteCards: FavoriteCardRow[];
  studyDays: StudyDayRow[];
  userState: UserStateRow | null;
};

function newestTimestamp(values: Array<string | null | undefined>): string {
  return values
    .filter((value): value is string => Boolean(value))
    .map(normalizeIsoTimestamp)
    .sort((first, second) => Date.parse(first) - Date.parse(second))
    .at(-1) ?? UNKNOWN_CHANGED_AT;
}

export function remoteRowsToProgress(rows: RemoteProgressRows): LearningProgress {
  const quizAttempts = Object.fromEntries(
    rows.quizAttempts.map((attempt) => [
      attempt.lesson_id,
      { correct: attempt.correct, answeredAt: attempt.answered_at },
    ]),
  );
  const favoriteChanges = Object.fromEntries(
    rows.favoriteCards.map((favorite) => [
      favorite.card_id,
      { favorite: favorite.favorite, changedAt: favorite.changed_at },
    ]),
  );
  const studyDays = rows.studyDays.map((day) => day.study_date);
  const updatedAt = newestTimestamp([
    rows.userState?.updated_at,
    ...rows.lessonCompletions.map((row) => row.completed_at),
    ...rows.quizAttempts.map((row) => row.answered_at),
    ...rows.favoriteCards.map((row) => row.changed_at),
    ...rows.studyDays.map((row) => row.created_at),
  ]);

  return parseProgress(
    JSON.stringify({
      version: 2,
      favoriteCardIds: rows.favoriteCards
        .filter((favorite) => favorite.favorite)
        .map((favorite) => favorite.card_id),
      completedLessonIds: rows.lessonCompletions.map((row) => row.lesson_id),
      wrongLessonIds: rows.quizAttempts
        .filter((attempt) => !attempt.correct)
        .map((attempt) => attempt.lesson_id),
      lastLessonId: rows.userState?.last_lesson_id ?? null,
      streak: 0,
      lastStudyDate: studyDays.sort().at(-1) ?? null,
      quizAttempts,
      studyDays,
      favoriteChanges,
      lastLessonChangedAt: rows.userState?.last_lesson_changed_at ?? null,
      updatedAt,
    }),
  );
}

export function progressToRemoteRows(
  progress: LearningProgress,
  userId: string,
): RemoteProgressRows & { userState: UserStateRow } {
  const completedAt = normalizeIsoTimestamp(
    progress.lastLessonChangedAt ?? progress.updatedAt,
  );

  return {
    lessonCompletions: progress.completedLessonIds.map((lessonId) => ({
      user_id: userId,
      lesson_id: lessonId,
      completed_at: completedAt,
    })),
    quizAttempts: Object.entries(progress.quizAttempts).map(
      ([lessonId, attempt]) => ({
        user_id: userId,
        lesson_id: lessonId,
        correct: attempt.correct,
        answered_at: normalizeIsoTimestamp(attempt.answeredAt),
      }),
    ),
    favoriteCards: Object.entries(progress.favoriteChanges).map(
      ([cardId, change]) => ({
        user_id: userId,
        card_id: cardId,
        favorite: change.favorite,
        changed_at: normalizeIsoTimestamp(change.changedAt),
      }),
    ),
    studyDays: progress.studyDays.map((studyDate) => ({
      user_id: userId,
      study_date: studyDate,
      created_at: normalizeIsoTimestamp(progress.updatedAt),
    })),
    userState: {
      user_id: userId,
      last_lesson_id: progress.lastLessonId,
      last_lesson_changed_at: progress.lastLessonChangedAt,
      updated_at: normalizeIsoTimestamp(progress.updatedAt),
    },
  };
}

type ProgressSupabaseClient = SupabaseClient<Database>;

export async function loadRemoteProgress(
  client: ProgressSupabaseClient,
  userId: string,
): Promise<LearningProgress> {
  const [lessons, quizzes, favorites, days, state] = await Promise.all([
    client.from("lesson_completions").select("*").eq("user_id", userId),
    client.from("quiz_attempts").select("*").eq("user_id", userId),
    client.from("favorite_cards").select("*").eq("user_id", userId),
    client.from("study_days").select("*").eq("user_id", userId),
    client.from("user_state").select("*").eq("user_id", userId).maybeSingle(),
  ]);

  const error = lessons.error ?? quizzes.error ?? favorites.error ?? days.error ?? state.error;
  if (error) throw error;

  return remoteRowsToProgress({
    lessonCompletions: lessons.data ?? [],
    quizAttempts: quizzes.data ?? [],
    favoriteCards: favorites.data ?? [],
    studyDays: days.data ?? [],
    userState: state.data,
  });
}

export async function saveRemoteProgress(
  client: ProgressSupabaseClient,
  userId: string,
  progress: LearningProgress,
): Promise<void> {
  const rows = progressToRemoteRows(progress, userId);
  const writes: Array<PromiseLike<{ error: unknown | null }>> = [];
  if (rows.lessonCompletions.length) {
    writes.push(
      client.from("lesson_completions").upsert(rows.lessonCompletions, {
        onConflict: "user_id,lesson_id",
      }),
    );
  }
  if (rows.quizAttempts.length) {
    writes.push(
      client.from("quiz_attempts").upsert(rows.quizAttempts, {
        onConflict: "user_id,lesson_id",
      }),
    );
  }
  if (rows.favoriteCards.length) {
    writes.push(
      client.from("favorite_cards").upsert(rows.favoriteCards, {
        onConflict: "user_id,card_id",
      }),
    );
  }
  if (rows.studyDays.length) {
    writes.push(
      client.from("study_days").upsert(rows.studyDays, {
        onConflict: "user_id,study_date",
      }),
    );
  }

  for (const result of await Promise.all(writes)) {
    if (result.error) throw result.error;
  }

  const { error } = await client
    .from("user_state")
    .upsert(rows.userState, { onConflict: "user_id" });
  if (error) throw error;
}
