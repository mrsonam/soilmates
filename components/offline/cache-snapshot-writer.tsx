"use client";

import { useEffect } from "react";
import { saveSnapshot } from "@/lib/offline/cache";

type CacheSnapshotWriterProps = {
  cacheKey: string;
  data: unknown;
};

/**
 * Persists a JSON snapshot to IndexedDB for offline reads on return visits.
 * Call from client islands fed by server-rendered props.
 */
export function CacheSnapshotWriter({ cacheKey, data }: CacheSnapshotWriterProps) {
  useEffect(() => {
    void saveSnapshot(cacheKey, data);
  }, [cacheKey, data]);
  return null;
}
