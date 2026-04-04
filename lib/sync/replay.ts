import { classifyQueueFailure } from "./conflicts";
import { SYNC_QUEUE_MAX_RETRIES } from "./constants";
import { clientLogger } from "@/lib/logging/client";
import { getOfflineDb } from "@/lib/offline/db";
import {
  getConflictMutationCount,
  getDeadLetterMutationCount,
  getPendingMutationCount,
  listPendingImageUploads,
  listPendingQueue,
  removeImageUpload,
  removeQueueRecord,
  updateImageUpload,
  updateQueueRecord,
} from "./queue";
import { readNavigatorOnline } from "./network";
import { resetStuckSyncingMutations } from "./stuck";
import { replayImageUpload, replayMutation } from "./replay-handlers";

let replayInFlight = false;

function normalizeError(e: unknown): string {
  if (e instanceof Error) return e.message;
  return "Something went wrong.";
}

export async function processSyncQueueOnce(options?: {
  onProgress?: (info: { phase: "mutation" | "image"; id: string }) => void;
}): Promise<{ processed: number; errors: number }> {
  if (!readNavigatorOnline()) {
    return { processed: 0, errors: 0 };
  }
  if (replayInFlight) {
    return { processed: 0, errors: 0 };
  }
  replayInFlight = true;
  let processed = 0;
  let errors = 0;

  try {
    await resetStuckSyncingMutations();

    const pending = await listPendingQueue();
    for (const row of pending) {
      if (!readNavigatorOnline()) break;

      if (row.retryCount >= SYNC_QUEUE_MAX_RETRIES) {
        await updateQueueRecord(row.localId, {
          status: "dead_letter",
          lastError:
            row.lastError?.includes("Max retries") === true
              ? row.lastError
              : `Could not sync after ${SYNC_QUEUE_MAX_RETRIES} tries. ${row.lastError ?? ""}`.trim(),
          syncingStartedAt: undefined,
        });
        clientLogger.warning(
          "sync.queue.dead_letter",
          "Mutation exceeded max retries",
          {
            operationType: row.operationType,
            localId: row.localId,
            retryCount: row.retryCount,
          },
        );
        errors += 1;
        continue;
      }

      await updateQueueRecord(row.localId, {
        status: "syncing",
        syncingStartedAt: Date.now(),
      });
      options?.onProgress?.({ phase: "mutation", id: row.localId });
      try {
        const result = await replayMutation(row.operationType, row.payload);
        if (result.ok) {
          await removeQueueRecord(row.localId);
          processed += 1;
        } else {
          const isConflict = "conflict" in result && result.conflict;
          const status = isConflict
            ? "conflict"
            : classifyQueueFailure(row, result.error);
          await updateQueueRecord(row.localId, {
            status,
            lastError: result.error,
            retryCount: row.retryCount + 1,
            conflictState: isConflict ? "pending_user" : null,
            syncingStartedAt: undefined,
          });
          clientLogger.warning(
            "sync.queue.mutation_failed",
            result.error,
            {
              operationType: row.operationType,
              localId: row.localId,
              conflict: Boolean(isConflict),
            },
          );
          errors += 1;
        }
      } catch (e) {
        const msg = normalizeError(e);
        const status = classifyQueueFailure(row, msg);
        await updateQueueRecord(row.localId, {
          status,
          lastError: msg,
          retryCount: row.retryCount + 1,
          syncingStartedAt: undefined,
        });
        clientLogger.error("sync.queue.mutation_error", msg, { operationType: row.operationType }, e);
        errors += 1;
      }
    }

    const images = await listPendingImageUploads();
    for (const img of images) {
      if (!readNavigatorOnline()) break;

      if (img.retryCount >= SYNC_QUEUE_MAX_RETRIES) {
        await updateImageUpload(img.localId, {
          ...img,
          status: "dead_letter",
          lastError:
            img.lastError?.includes("Max retries") === true
              ? img.lastError
              : `Upload failed after ${SYNC_QUEUE_MAX_RETRIES} tries.`,
        });
        clientLogger.warning("sync.image.dead_letter", "Image upload cap", {
          localId: img.localId,
        });
        errors += 1;
        continue;
      }

      await updateImageUpload(img.localId, { ...img, status: "uploading" });
      options?.onProgress?.({ phase: "image", id: img.localId });
      try {
        const result = await replayImageUpload(img);
        if (result.ok) {
          await removeImageUpload(img.localId);
          processed += 1;
        } else {
          await updateImageUpload(img.localId, {
            ...img,
            status: "failed",
            lastError: result.error,
            retryCount: img.retryCount + 1,
          });
          clientLogger.warning("sync.image.failed", result.error, {
            localId: img.localId,
          });
          errors += 1;
        }
      } catch (e) {
        const msg = normalizeError(e);
        await updateImageUpload(img.localId, {
          ...img,
          status: "failed",
          lastError: msg,
          retryCount: img.retryCount + 1,
        });
        clientLogger.error("sync.image.error", msg, { localId: img.localId }, e);
        errors += 1;
      }
    }
  } finally {
    replayInFlight = false;
  }

  return { processed, errors };
}

export async function refreshPendingCounts(): Promise<{
  mutations: number;
  images: number;
  conflicts: number;
  deadLetters: number;
}> {
  const db = getOfflineDb();
  const mutations = await getPendingMutationCount();
  const conflicts = await getConflictMutationCount();
  const deadMutations = await getDeadLetterMutationCount();
  const deadImages = db
    ? await db.imageUploadQueue.where("status").equals("dead_letter").count()
    : 0;
  const deadLetters = deadMutations + deadImages;
  const images = db
    ? await db.imageUploadQueue
        .where("status")
        .anyOf(["pending", "failed", "uploading"])
        .count()
    : 0;
  return { mutations, images, conflicts, deadLetters };
}

export async function discardConflictRecord(localId: string): Promise<void> {
  await removeQueueRecord(localId);
}
