import { getOfflineDb } from "@/lib/offline/db";
import { SYNC_STUCK_MS } from "./constants";
import { updateQueueRecord } from "./queue";

/** Resets mutation rows stuck in `syncing` (crashed tab / long hang). */
export async function resetStuckSyncingMutations(): Promise<number> {
  const db = getOfflineDb();
  if (!db) return 0;
  const rows = await db.syncQueue.where("status").equals("syncing").toArray();
  let n = 0;
  const now = Date.now();
  for (const r of rows) {
    const start = r.syncingStartedAt ?? r.createdAt;
    if (now - start > SYNC_STUCK_MS) {
      await updateQueueRecord(r.localId, {
        status: "pending",
        syncingStartedAt: undefined,
        lastError: "Sync was interrupted. We’ll try again.",
      });
      n += 1;
    }
  }
  return n;
}
