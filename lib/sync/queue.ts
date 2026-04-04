import { getOfflineDb } from "@/lib/offline/db";
import type {
  QueuedImageUploadRecord,
  SyncQueueRecord,
  SyncQueueStatus,
} from "@/lib/offline/schema";
function newLocalId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export async function enqueueMutation(input: {
  operationType: string;
  entityType: string;
  entityId?: string;
  payload: Record<string, unknown>;
}): Promise<string> {
  const db = getOfflineDb();
  if (!db) throw new Error("Offline storage unavailable");
  const localId = newLocalId();
  const row: SyncQueueRecord = {
    localId,
    operationType: input.operationType,
    entityType: input.entityType,
    entityId: input.entityId,
    payload: input.payload,
    createdAt: Date.now(),
    retryCount: 0,
    status: "pending",
    lastError: null,
    conflictState: null,
  };
  await db.syncQueue.add(row);
  return localId;
}

export async function getQueueRecord(
  localId: string,
): Promise<SyncQueueRecord | undefined> {
  const db = getOfflineDb();
  if (!db) return undefined;
  return db.syncQueue.get(localId);
}

export async function listPendingQueue(): Promise<SyncQueueRecord[]> {
  const db = getOfflineDb();
  if (!db) return [];
  return db.syncQueue
    .where("status")
    .anyOf(["pending", "failed", "syncing"])
    .sortBy("createdAt");
}

/** Moves failed and dead_letter rows back to pending for another sync pass. */
export async function resetFailedAndDeadLetterForRetry(): Promise<number> {
  const db = getOfflineDb();
  if (!db) return 0;
  let n = 0;
  const failed = await db.syncQueue.where("status").equals("failed").toArray();
  for (const r of failed) {
    await db.syncQueue.update(r.localId, {
      status: "pending",
      lastError: null,
      syncingStartedAt: undefined,
    });
    n += 1;
  }
  const dead = await db.syncQueue.where("status").equals("dead_letter").toArray();
  for (const r of dead) {
    await db.syncQueue.update(r.localId, {
      status: "pending",
      retryCount: 0,
      lastError: null,
      syncingStartedAt: undefined,
    });
    n += 1;
  }

  const deadImages = await db.imageUploadQueue
    .where("status")
    .equals("dead_letter")
    .toArray();
  for (const r of deadImages) {
    await db.imageUploadQueue.update(r.localId, {
      status: "pending",
      retryCount: 0,
      lastError: null,
    });
    n += 1;
  }
  return n;
}

export async function updateQueueRecord(
  localId: string,
  patch: Partial<SyncQueueRecord>,
): Promise<void> {
  const db = getOfflineDb();
  if (!db) return;
  await db.syncQueue.update(localId, patch);
}

export async function removeQueueRecord(localId: string): Promise<void> {
  const db = getOfflineDb();
  if (!db) return;
  await db.syncQueue.delete(localId);
}

export async function getPendingMutationCount(): Promise<number> {
  const db = getOfflineDb();
  if (!db) return 0;
  const pending = await db.syncQueue.where("status").equals("pending").count();
  const failed = await db.syncQueue.where("status").equals("failed").count();
  const syncing = await db.syncQueue.where("status").equals("syncing").count();
  return pending + failed + syncing;
}

export async function getDeadLetterMutationCount(): Promise<number> {
  const db = getOfflineDb();
  if (!db) return 0;
  return db.syncQueue.where("status").equals("dead_letter").count();
}

export async function getConflictMutationCount(): Promise<number> {
  const db = getOfflineDb();
  if (!db) return 0;
  return db.syncQueue.where("status").equals("conflict").count();
}

export async function markQueueStatus(
  localId: string,
  status: SyncQueueStatus,
  lastError?: string | null,
): Promise<void> {
  const db = getOfflineDb();
  if (!db) return;
  await db.syncQueue.update(localId, {
    status,
    lastError: lastError ?? null,
  });
}

export async function enqueueImageUpload(input: {
  collectionSlug: string;
  plantSlug: string;
  mode: "cover" | "progress";
  file: File;
  capturedAt?: string | null;
}): Promise<string> {
  const db = getOfflineDb();
  if (!db) throw new Error("Offline storage unavailable");
  const localId = newLocalId();
  const buf = await input.file.arrayBuffer();
  const row: QueuedImageUploadRecord = {
    localId,
    collectionSlug: input.collectionSlug,
    plantSlug: input.plantSlug,
    mode: input.mode,
    fileName: input.file.name || "photo.jpg",
    mimeType: input.file.type || "image/jpeg",
    fileSize: input.file.size,
    blob: buf,
    capturedAt: input.capturedAt ?? null,
    status: "pending",
    createdAt: Date.now(),
    retryCount: 0,
    lastError: null,
  };
  await db.imageUploadQueue.add(row);
  return localId;
}

export async function listPendingImageUploads(): Promise<
  QueuedImageUploadRecord[]
> {
  const db = getOfflineDb();
  if (!db) return [];
  return db.imageUploadQueue
    .where("status")
    .anyOf(["pending", "failed"])
    .toArray();
}

export async function updateImageUpload(
  localId: string,
  patch: Partial<QueuedImageUploadRecord>,
): Promise<void> {
  const db = getOfflineDb();
  if (!db) return;
  await db.imageUploadQueue.update(localId, patch as QueuedImageUploadRecord);
}

export async function removeImageUpload(localId: string): Promise<void> {
  const db = getOfflineDb();
  if (!db) return;
  await db.imageUploadQueue.delete(localId);
}
