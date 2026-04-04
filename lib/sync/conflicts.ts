import type { SyncQueueRecord } from "@/lib/offline/schema";

/** Heuristic: server rejected because entity changed elsewhere */
export function isLikelyVersionConflictMessage(error: string): boolean {
  const e = error.toLowerCase();
  return (
    e.includes("changed before") ||
    e.includes("stale") ||
    e.includes("updated before") ||
    e.includes("reload") ||
    e.includes("conflict")
  );
}

export function classifyQueueFailure(
  record: SyncQueueRecord,
  error: string,
): SyncQueueRecord["status"] {
  if (isLikelyVersionConflictMessage(error)) return "conflict";
  return "failed";
}
