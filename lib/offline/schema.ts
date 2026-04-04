/** Local-only sync queue and cache types. Server remains source of truth. */

export type SyncQueueStatus =
  | "pending"
  | "syncing"
  | "synced"
  | "failed"
  | "conflict"
  /** Too many failures; user can retry manually from the sync strip. */
  | "dead_letter";

export type QueueConflictState = "pending_user" | "resolved_discard";

export interface SyncQueueRecord {
  localId: string;
  operationType: string;
  entityType: string;
  entityId?: string;
  payload: Record<string, unknown>;
  createdAt: number;
  retryCount: number;
  status: SyncQueueStatus;
  lastError: string | null;
  conflictState: QueueConflictState | null;
  /** Set when status becomes `syncing` — used to detect stuck rows. */
  syncingStartedAt?: number;
}

export interface SnapshotRecord {
  /** e.g. `collection:my-garden` or `plant:my-garden:monstera` */
  key: string;
  /** JSON-serializable view payload */
  value: unknown;
  updatedAt: number;
}

export type ImageUploadQueueStatus =
  | "pending"
  | "uploading"
  | "failed"
  | "synced"
  | "dead_letter";

/** Queued binary + metadata for replay when online */
export interface QueuedImageUploadRecord {
  localId: string;
  collectionSlug: string;
  plantSlug: string;
  mode: "cover" | "progress";
  fileName: string;
  mimeType: string;
  fileSize: number;
  /** Raw bytes kept locally until upload succeeds */
  blob: ArrayBuffer;
  capturedAt: string | null;
  status: ImageUploadQueueStatus;
  createdAt: number;
  retryCount: number;
  lastError: string | null;
}

export interface MetaRecord {
  key: string;
  value: string;
}
