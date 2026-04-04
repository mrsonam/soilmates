"use client";

import { useCallback, useEffect, useState } from "react";
import { discardConflictRecord, refreshPendingCounts } from "@/lib/sync/replay";
import type { SyncQueueRecord } from "@/lib/offline/schema";
import { getOfflineDb } from "@/lib/offline/db";
import { useSyncStore } from "@/lib/stores/sync-store";

export function useSyncQueue() {
  const [items, setItems] = useState<SyncQueueRecord[]>([]);
  const ready = useSyncStore((s) => s.ready);
  const conflictCount = useSyncStore((s) => s.conflictCount);

  const refresh = useCallback(async () => {
    const db = getOfflineDb();
    if (!db) {
      setItems([]);
      return;
    }
    const rows = await db.syncQueue.toArray();
    rows.sort((a, b) => a.createdAt - b.createdAt);
    setItems(rows);
    const counts = await refreshPendingCounts();
    useSyncStore.getState().setCounts({
      pendingMutations: counts.mutations,
      pendingImages: counts.images,
      conflictCount: counts.conflicts,
    });
  }, []);

  useEffect(() => {
    if (!ready) return;
    queueMicrotask(() => void refresh());
  }, [ready, refresh]);

  useEffect(() => {
    if (conflictCount <= 0) return;
    queueMicrotask(() => void refresh());
  }, [conflictCount, refresh]);

  const discardConflict = useCallback(
    async (localId: string) => {
      await discardConflictRecord(localId);
      await refresh();
    },
    [refresh],
  );

  return { items, refresh, discardConflict };
}
