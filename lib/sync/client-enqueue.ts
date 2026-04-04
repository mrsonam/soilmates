"use client";

import { enqueueMutation } from "./queue";
import { refreshPendingCounts } from "./replay";
import { useSyncStore } from "@/lib/stores/sync-store";

export async function clientEnqueueAndRefresh(input: {
  operationType: string;
  entityType: string;
  entityId?: string;
  payload: Record<string, unknown>;
}): Promise<void> {
  await enqueueMutation(input);
  const counts = await refreshPendingCounts();
  useSyncStore.getState().setCounts({
    pendingMutations: counts.mutations,
    pendingImages: counts.images,
    conflictCount: counts.conflicts,
    deadLetterCount: counts.deadLetters,
  });
}
