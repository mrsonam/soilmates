import Dexie, { type Table } from "dexie";
import type {
  MetaRecord,
  QueuedImageUploadRecord,
  SnapshotRecord,
  SyncQueueRecord,
} from "./schema";

const DB_NAME = "soilmates_offline_v1";

class SoilMatesDexie extends Dexie {
  syncQueue!: Table<SyncQueueRecord, string>;
  snapshots!: Table<SnapshotRecord, string>;
  imageUploadQueue!: Table<QueuedImageUploadRecord, string>;
  meta!: Table<MetaRecord, string>;

  constructor() {
    super(DB_NAME);
    this.version(1).stores({
      syncQueue: "localId, status, createdAt, operationType, entityType",
      snapshots: "key, updatedAt",
      imageUploadQueue: "localId, status, createdAt",
      meta: "key",
    });
  }
}

let _db: SoilMatesDexie | null = null;

export function getOfflineDb(): SoilMatesDexie | null {
  if (typeof window === "undefined") return null;
  if (!_db) {
    _db = new SoilMatesDexie();
  }
  return _db;
}

export async function resetOfflineDbForTests(): Promise<void> {
  if (typeof window === "undefined") return;
  await getOfflineDb()?.delete();
  _db = null;
}
