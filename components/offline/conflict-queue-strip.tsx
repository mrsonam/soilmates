"use client";

import { useSyncQueue } from "@/hooks/useSyncQueue";
import { useSyncStatus } from "@/hooks/useSyncStatus";
import { ConflictResolutionCard } from "./conflict-resolution-card";

export function ConflictQueueStrip() {
  const { items, discardConflict } = useSyncQueue();
  const { conflictCount, ready } = useSyncStatus();
  const conflicts = items.filter((i) => i.status === "conflict");

  if (!ready || conflictCount === 0 || conflicts.length === 0) return null;

  const first = conflicts[0]!;
  return (
    <div className="mx-auto mb-4 w-full max-w-6xl space-y-3 px-4 sm:px-6 lg:px-8">
      <ConflictResolutionCard
        message={first.lastError ?? "This update could not be applied."}
        onDismiss={() => void discardConflict(first.localId)}
      />
    </div>
  );
}
