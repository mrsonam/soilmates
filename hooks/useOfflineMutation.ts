"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { readNavigatorOnline } from "@/lib/sync/network";
import { enqueueMutation } from "@/lib/sync/queue";
import { refreshPendingCounts } from "@/lib/sync/replay";
import { useSyncStore } from "@/lib/stores/sync-store";
import { getFeatureFlags } from "@/lib/feature-flags";
import { clientLogger } from "@/lib/logging/client";

type MutationResult = { ok: true } | { ok: false; error: string };

export type OfflineMutationOptions<T extends MutationResult> = {
  operationType: string;
  entityType: string;
  entityId?: string;
  buildPayload: () => Record<string, unknown>;
  mutationFn: () => Promise<T>;
  onSuccess?: () => void;
};

export function useOfflineMutation<T extends MutationResult>(
  options: OfflineMutationOptions<T>,
) {
  const router = useRouter();
  const ref = useRef(options);
  useEffect(() => {
    ref.current = options;
  });

  return useCallback(async () => {
    const o = ref.current;
    if (!readNavigatorOnline()) {
      if (!getFeatureFlags().offlineSync) {
        clientLogger.warning(
          "offline.mutation_blocked",
          "Offline queue disabled",
          { operationType: o.operationType },
        );
        return { queued: false as const, result: { ok: false, error: "You're offline. Connect to try again." } as T };
      }
      await enqueueMutation({
        operationType: o.operationType,
        entityType: o.entityType,
        entityId: o.entityId,
        payload: o.buildPayload(),
      });
      const counts = await refreshPendingCounts();
      useSyncStore.getState().setCounts({
        pendingMutations: counts.mutations,
        pendingImages: counts.images,
        conflictCount: counts.conflicts,
        deadLetterCount: counts.deadLetters,
      });
      o.onSuccess?.();
      try {
        router.refresh();
      } catch {
        /* best-effort */
      }
      return { queued: true as const };
    }

    const result = await o.mutationFn();
    if (!result.ok) {
      clientLogger.warning(
        "mutation.failed",
        "Online mutation returned error",
        { operationType: o.operationType },
      );
    }
    if (result.ok) {
      o.onSuccess?.();
      try {
        router.refresh();
      } catch {
        /* ignore */
      }
      return { queued: false as const, result };
    }
    return { queued: false as const, result };
  }, [router]);
}
