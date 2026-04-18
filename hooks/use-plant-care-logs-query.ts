"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  useCallback,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
} from "react";
import type { CareLogListItem } from "@/lib/plants/care-logs";
import {
  mergeServerCareLogsWithCache,
  sortCareLogsNewestFirst,
} from "@/lib/optimistic/reconcile-lists";
import { queryKeys } from "@/lib/query-keys";

/** Fingerprint RSC payload rows so we merge when *data* changes, not array identity. */
function careLogsSnapshotKey(rows: CareLogListItem[]): string {
  return JSON.stringify(
    [...rows]
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((l) => ({ id: l.id, u: l.updatedAt })),
  );
}

/** Enough to detect edits, new rows, and optimistic row churn without full JSON rows. */
function mergedFingerprint(rows: CareLogListItem[]): string {
  return rows
    .map(
      (r) =>
        `${r.id}\t${r.updatedAt}\t${r.actionAt}\t${r.actionType}\t${r.notes ?? ""}`,
    )
    .join("\n");
}

/**
 * Mirrors RSC care logs into the TanStack cache (for mutations / optimistic rows) while rendering
 * from a **stable** merged list.
 *
 * `useQuery(initialData)` + `setQueryData` in an effect was able to thrash observers when every
 * merge/sort produced a new array reference — leading to "Maximum update depth exceeded".
 */
export function usePlantCareLogsQuery(
  collectionSlug: string,
  plantSlug: string,
  serverLogs: CareLogListItem[],
) {
  const qc = useQueryClient();
  const key = queryKeys.plant.careLogs(collectionSlug, plantSlug);

  const serverLogsRef = useRef(serverLogs);
  serverLogsRef.current = serverLogs;

  const serverSnapRef = useRef<string | null>(null);

  const snapshotRef = useRef<{
    fp: string;
    rows: CareLogListItem[];
  } | null>(null);

  const serverSnapshotKey = careLogsSnapshotKey(serverLogs);

  useLayoutEffect(() => {
    serverSnapRef.current = null;
    snapshotRef.current = null;
  }, [collectionSlug, plantSlug]);

  useLayoutEffect(() => {
    if (serverSnapRef.current === serverSnapshotKey) return;
    serverSnapRef.current = serverSnapshotKey;
    qc.setQueryData(key, (prev) =>
      sortCareLogsNewestFirst(
        mergeServerCareLogsWithCache(
          serverLogsRef.current,
          prev as CareLogListItem[] | undefined,
        ),
      ),
    );
  }, [qc, collectionSlug, plantSlug, serverSnapshotKey]);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      return qc.getQueryCache().subscribe(() => {
        onStoreChange();
      });
    },
    [qc],
  );

  const getSnapshot = useCallback(() => {
    const cached = qc.getQueryData<CareLogListItem[]>(key);
    const merged = sortCareLogsNewestFirst(
      mergeServerCareLogsWithCache(serverLogsRef.current, cached),
    );
    const fp = mergedFingerprint(merged);
    const prev = snapshotRef.current;
    if (prev && prev.fp === fp) {
      return prev.rows;
    }
    snapshotRef.current = { fp, rows: merged };
    return merged;
  }, [qc, collectionSlug, plantSlug]);

  const getServerSnapshot = useCallback(() => serverLogsRef.current, []);

  const data = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return { data, isPending: false, isError: false, error: null } as const;
}
