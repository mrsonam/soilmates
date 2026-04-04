"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useSyncQueue } from "@/hooks/useSyncQueue";
import { useSyncStatus } from "@/hooks/useSyncStatus";
import { resetFailedAndDeadLetterForRetry } from "@/lib/sync/queue";
import { processSyncQueueOnce, refreshPendingCounts } from "@/lib/sync/replay";
import { useSyncStore } from "@/lib/stores/sync-store";
import { useRouter } from "next/navigation";

export function DeadLetterStrip() {
  const router = useRouter();
  const { items, refresh } = useSyncQueue();
  const { deadLetterCount, ready, online } = useSyncStatus();
  const [busy, setBusy] = useState(false);

  const dead = items.filter((i) => i.status === "dead_letter");
  if (!ready || deadLetterCount === 0 || dead.length === 0) return null;

  return (
    <div className="mx-auto mb-4 w-full max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 rounded-2xl bg-amber-500/10 px-4 py-3 text-sm text-on-surface ring-1 ring-amber-500/20 sm:flex-row sm:items-center sm:justify-between">
        <p className="min-w-0">
          Some changes couldn&apos;t sync after several tries. Your data is still on this
          device — you can retry or review what failed below.
        </p>
        <button
          type="button"
          disabled={busy || !online}
          onClick={async () => {
            setBusy(true);
            try {
              await resetFailedAndDeadLetterForRetry();
              await processSyncQueueOnce();
              const counts = await refreshPendingCounts();
              useSyncStore.getState().setCounts({
                pendingMutations: counts.mutations,
                pendingImages: counts.images,
                conflictCount: counts.conflicts,
                deadLetterCount: counts.deadLetters,
              });
              await refresh();
              router.refresh();
            } finally {
              setBusy(false);
            }
          }}
          className="focus-ring-premium inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-on-primary disabled:opacity-50"
        >
          <RefreshCw className="size-4" aria-hidden />
          {busy ? "Retrying…" : "Retry failed sync"}
        </button>
      </div>
    </div>
  );
}
