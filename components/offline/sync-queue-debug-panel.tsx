"use client";

import { useSyncQueue } from "@/hooks/useSyncQueue";
import { useSyncStatus } from "@/hooks/useSyncStatus";
import { getOfflineDb } from "@/lib/offline/db";

function SyncQueueDebugPanelInner() {
  const { items, refresh, discardConflict } = useSyncQueue();
  const { pendingMutations, pendingImages, conflictCount, phase } =
    useSyncStatus();

  return (
    <details className="fixed bottom-20 right-4 z-50 max-h-64 max-w-sm overflow-auto rounded-xl bg-surface-container-lowest p-3 text-xs shadow-lg ring-1 ring-outline-variant/20 lg:bottom-8">
      <summary className="cursor-pointer font-mono text-on-surface">
        Sync debug
      </summary>
      <div className="mt-2 space-y-1 font-mono text-on-surface-variant">
        <p>phase: {phase}</p>
        <p>
          pending: {pendingMutations} mut / {pendingImages} img / conflicts:{" "}
          {conflictCount}
        </p>
        <button
          type="button"
          className="rounded bg-primary/20 px-2 py-1 text-on-surface"
          onClick={() => void refresh()}
        >
          Refresh list
        </button>
        <button
          type="button"
          className="ml-2 rounded bg-outline-variant/20 px-2 py-1"
          onClick={async () => {
            await getOfflineDb()?.syncQueue.clear();
            await getOfflineDb()?.imageUploadQueue.clear();
            await refresh();
          }}
        >
          Clear queue (dev)
        </button>
        <ul className="mt-2 max-h-32 list-disc pl-4">
          {items.map((i) => (
            <li key={i.localId}>
              {i.operationType} — {i.status}
              {i.status === "conflict" ? (
                <button
                  type="button"
                  className="ml-1 text-primary"
                  onClick={() => void discardConflict(i.localId)}
                >
                  drop
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}

export function SyncQueueDebugPanel() {
  if (process.env.NODE_ENV === "production") return null;
  return <SyncQueueDebugPanelInner />;
}
