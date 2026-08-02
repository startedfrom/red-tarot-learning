"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  defaultProgress,
  safeReadProgress,
  safeWriteProgress,
  type LearningProgress,
} from "../lib/progress";
import { mergeProgress } from "../lib/progress-merge";
import type { ProgressSyncStatus } from "../lib/progress-sync";
import {
  dedupeSyncEvents,
  safeReadSyncQueue,
  safeWriteSyncQueue,
  type SyncEvent,
} from "../lib/sync-queue";
import { createBrowserSupabaseClient } from "../lib/supabase/client";
import {
  loadRemoteProgress,
  saveRemoteProgress,
} from "../lib/supabase/progress";

type ProgressUpdater = (progress: LearningProgress) => LearningProgress;

export type ProgressContextValue = {
  progress: LearningProgress;
  storageAvailable: boolean;
  syncStatus: ProgressSyncStatus;
  syncMessage: string;
  userId: string | null;
  updateProgress: (
    updater: ProgressUpdater,
    event: { kind: string; entityId: string },
  ) => { progress: LearningProgress; savedLocally: boolean };
  retrySync: () => void;
};

export const ProgressContext = createContext<ProgressContextValue | null>(null);

const statusMessages: Record<ProgressSyncStatus, string> = {
  idle: "이 기기에 저장 중",
  syncing: "계정에 저장 중…",
  synced: "계정에 저장됨",
  error: "오프라인 저장됨 · 연결되면 다시 동기화",
};
const SYNC_REQUEST_EVENT = "red-tarot:sync-request";

function queueEvent(
  storage: Storage | undefined,
  current: SyncEvent[],
  progress: LearningProgress,
  event: { kind: string; entityId: string },
) {
  const changedAt = progress.updatedAt;
  const next = dedupeSyncEvents([
    ...current,
    {
      eventId: `${event.kind}:${event.entityId}:${changedAt}`,
      kind: event.kind,
      entityId: event.entityId,
      changedAt,
    },
  ]);
  safeWriteSyncQueue(storage, next);
  return next;
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<LearningProgress>(defaultProgress);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [syncStatus, setSyncStatus] = useState<ProgressSyncStatus>("idle");
  const [userId, setUserId] = useState<string | null>(null);
  const progressRef = useRef(progress);
  const syncRunning = useRef(false);
  const syncRequested = useRef(false);
  const mounted = useRef(true);

  const writeLocal = useCallback((next: LearningProgress) => {
    let storage: Storage | undefined;
    try {
      storage = window.localStorage;
    } catch {
      setStorageAvailable(false);
    }
    const saved = safeWriteProgress(storage, next);
    if (!saved) setStorageAvailable(false);
    progressRef.current = next;
    setProgress(next);
    return { saved, storage };
  }, []);

  const runSync = useCallback(async () => {
    if (syncRunning.current) {
      syncRequested.current = true;
      return;
    }
    const client = createBrowserSupabaseClient();
    if (!client) {
      setSyncStatus("idle");
      return;
    }

    const { data } = await client.auth.getSession();
    const sessionUserId = data.session?.user.id ?? null;
    if (!sessionUserId) {
      setUserId(null);
      setSyncStatus("idle");
      return;
    }

    syncRunning.current = true;
    setUserId(sessionUserId);
    setSyncStatus("syncing");
    const localAtStart = progressRef.current;

    let storage: Storage | undefined;
    try {
      storage = window.localStorage;
    } catch {
      setStorageAvailable(false);
    }
    try {
      const remote = await loadRemoteProgress(client, sessionUserId);
      const merged = mergeProgress(localAtStart, remote);
      await saveRemoteProgress(client, sessionUserId, merged);

      if (!mounted.current) return;
      const changedDuringSync =
        JSON.stringify(progressRef.current) !== JSON.stringify(localAtStart);
      const finalProgress = changedDuringSync
        ? mergeProgress(progressRef.current, merged)
        : merged;
      writeLocal(finalProgress);
      if (changedDuringSync) {
        setSyncStatus("error");
        syncRequested.current = true;
      } else {
        safeWriteSyncQueue(storage, []);
        setSyncStatus("synced");
      }
    } catch {
      if (mounted.current) {
        setSyncStatus("error");
      }
    } finally {
      syncRunning.current = false;
      if (syncRequested.current && mounted.current) {
        syncRequested.current = false;
        window.dispatchEvent(new Event(SYNC_REQUEST_EVENT));
      }
    }
  }, [writeLocal]);

  useEffect(() => {
    mounted.current = true;
    const client = createBrowserSupabaseClient();
    const initializeTimer = window.setTimeout(() => {
      let storage: Storage | undefined;
      try {
        storage = window.localStorage;
      } catch {
        setStorageAvailable(false);
      }
      const local = safeReadProgress(storage);
      progressRef.current = local;
      setProgress(local);
      if (client) void runSync();
    }, 0);
    const authSubscription = client?.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null);
      if (session) window.setTimeout(() => void runSync(), 0);
      else setSyncStatus("idle");
    });
    const retry = () => void runSync();
    const retryWhenVisible = () => {
      if (document.visibilityState === "visible") void runSync();
    };
    window.addEventListener("online", retry);
    window.addEventListener(SYNC_REQUEST_EVENT, retry);
    document.addEventListener("visibilitychange", retryWhenVisible);

    return () => {
      mounted.current = false;
      window.clearTimeout(initializeTimer);
      authSubscription?.data.subscription.unsubscribe();
      window.removeEventListener("online", retry);
      window.removeEventListener(SYNC_REQUEST_EVENT, retry);
      document.removeEventListener("visibilitychange", retryWhenVisible);
    };
  }, [runSync]);

  const updateProgress = useCallback(
    (
      updater: ProgressUpdater,
      event: { kind: string; entityId: string },
    ) => {
      const next = updater(progressRef.current);
      const { saved, storage } = writeLocal(next);
      const queue = safeReadSyncQueue(storage);
      queueEvent(storage, queue, next, event);
      setSyncStatus(userId ? "syncing" : "idle");
      if (userId) window.setTimeout(() => void runSync(), 0);
      return { progress: next, savedLocally: saved };
    },
    [runSync, userId, writeLocal],
  );

  const value = useMemo<ProgressContextValue>(
    () => ({
      progress,
      storageAvailable,
      syncStatus,
      syncMessage: statusMessages[syncStatus],
      userId,
      updateProgress,
      retrySync: () => void runSync(),
    }),
    [progress, runSync, storageAvailable, syncStatus, updateProgress, userId],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}
