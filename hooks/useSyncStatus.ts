"use client";

import { useShallow } from "zustand/react/shallow";
import { useSyncStore } from "@/lib/stores/sync-store";

export function useSyncStatus() {
  return useSyncStore(
    useShallow((s) => ({
      phase: s.phase,
      online: s.online,
      syncing: s.syncing,
      pendingMutations: s.pendingMutations,
      pendingImages: s.pendingImages,
      conflictCount: s.conflictCount,
      deadLetterCount: s.deadLetterCount,
      lastSyncAt: s.lastSyncAt,
      lastSyncMessage: s.lastSyncMessage,
      ready: s.ready,
    })),
  );
}
