import { isIsoTimestamp } from "./progress";

export const SYNC_QUEUE_STORAGE_KEY = "red-tarot-sync-queue-v1";

export type SyncEvent = {
  eventId: string;
  kind: string;
  entityId: string;
  changedAt: string;
};

type StoredSyncQueue = {
  version: 1;
  events: SyncEvent[];
};

type ReadableStorage = Pick<Storage, "getItem">;
type WritableStorage = Pick<Storage, "setItem">;

function isSyncEvent(value: unknown): value is SyncEvent {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;

  const event = value as Record<string, unknown>;
  return (
    typeof event.eventId === "string" &&
    typeof event.kind === "string" &&
    typeof event.entityId === "string" &&
    isIsoTimestamp(event.changedAt)
  );
}

export function dedupeSyncEvents(events: SyncEvent[]): SyncEvent[] {
  const seen = new Set<string>();
  return events.filter((event) => {
    if (seen.has(event.eventId)) return false;
    seen.add(event.eventId);
    return true;
  });
}

export function parseSyncQueue(raw: string | null): SyncEvent[] {
  if (!raw) return [];

  try {
    const value = JSON.parse(raw) as Partial<StoredSyncQueue>;
    if (
      !value ||
      value.version !== 1 ||
      !Array.isArray(value.events) ||
      !value.events.every(isSyncEvent)
    ) {
      return [];
    }

    return dedupeSyncEvents(value.events).map((event) => ({ ...event }));
  } catch {
    return [];
  }
}

export function safeReadSyncQueue(
  storage: ReadableStorage | undefined,
): SyncEvent[] {
  try {
    return storage
      ? parseSyncQueue(storage.getItem(SYNC_QUEUE_STORAGE_KEY))
      : [];
  } catch {
    return [];
  }
}

export function safeWriteSyncQueue(
  storage: WritableStorage | undefined,
  events: SyncEvent[],
): boolean {
  if (!storage || !events.every(isSyncEvent)) return false;

  try {
    const queue: StoredSyncQueue = {
      version: 1,
      events: dedupeSyncEvents(events),
    };
    storage.setItem(SYNC_QUEUE_STORAGE_KEY, JSON.stringify(queue));
    return true;
  } catch {
    return false;
  }
}
