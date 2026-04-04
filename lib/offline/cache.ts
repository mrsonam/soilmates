import { getOfflineDb } from "./db";

export async function saveSnapshot(key: string, value: unknown): Promise<void> {
  const db = getOfflineDb();
  if (!db) return;
  await db.snapshots.put({
    key,
    value,
    updatedAt: Date.now(),
  });
}

export async function loadSnapshot<T>(key: string): Promise<T | null> {
  const db = getOfflineDb();
  if (!db) return null;
  const row = await db.snapshots.get(key);
  return (row?.value as T) ?? null;
}

export async function deleteSnapshot(key: string): Promise<void> {
  const db = getOfflineDb();
  if (!db) return;
  await db.snapshots.delete(key);
}
