import { classifyQueueFailure } from "./conflicts";
import { getOfflineDb } from "@/lib/offline/db";
import {
  getConflictMutationCount,
  getPendingMutationCount,
  listPendingImageUploads,
  listPendingQueue,
  removeImageUpload,
  removeQueueRecord,
  updateImageUpload,
  updateQueueRecord,
} from "./queue";
import { readNavigatorOnline } from "./network";
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
    const pending = await listPendingQueue();
    for (const row of pending) {
      if (!readNavigatorOnline()) break;
      await updateQueueRecord(row.localId, { status: "syncing" });
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
          });
          errors += 1;
        }
      } catch (e) {
        const msg = normalizeError(e);
        const status = classifyQueueFailure(row, msg);
        await updateQueueRecord(row.localId, {
          status,
          lastError: msg,
          retryCount: row.retryCount + 1,
        });
        errors += 1;
      }
    }

    const images = await listPendingImageUploads();
    for (const img of images) {
      if (!readNavigatorOnline()) break;
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
}> {
  const db = getOfflineDb();
  const mutations = await getPendingMutationCount();
  const conflicts = await getConflictMutationCount();
  const images = db
    ? await db.imageUploadQueue
        .where("status")
        .anyOf(["pending", "failed"])
        .count()
    : 0;
  return { mutations, images, conflicts };
}

export async function discardConflictRecord(localId: string): Promise<void> {
  await removeQueueRecord(localId);
}
