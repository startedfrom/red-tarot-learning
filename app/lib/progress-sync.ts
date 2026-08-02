import { mergeProgress } from "./progress-merge";
import type { LearningProgress } from "./progress";
import type { SyncEvent } from "./sync-queue";

export type ProgressSyncStatus = "idle" | "syncing" | "synced" | "error";

export async function syncProgressSnapshot({
  local,
  remote,
  queue,
  save,
}: {
  local: LearningProgress;
  remote: LearningProgress | null;
  queue: SyncEvent[];
  save: (progress: LearningProgress) => Promise<void>;
}): Promise<{
  progress: LearningProgress;
  queue: SyncEvent[];
  status: "synced" | "error";
}> {
  const progress = remote ? mergeProgress(local, remote) : structuredClone(local);
  const pendingQueue = queue.map((event) => ({ ...event }));

  try {
    await save(progress);
    return { progress, queue: [], status: "synced" };
  } catch {
    return { progress, queue: pendingQueue, status: "error" };
  }
}
