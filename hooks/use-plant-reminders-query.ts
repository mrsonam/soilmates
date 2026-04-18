"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  useCallback,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
} from "react";
import type { ReminderListItem } from "@/lib/reminders/queries";
import {
  mergeServerRemindersWithCache,
  sortRemindersByNextDue,
} from "@/lib/optimistic/reconcile-lists";
import { queryKeys } from "@/lib/query-keys";

/** Fingerprint RSC payload so we merge when *data* changes, not array identity. */
function remindersSnapshotKey(rows: ReminderListItem[]): string {
  return JSON.stringify(
    [...rows]
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((r) => ({ id: r.id, nextDueAt: r.nextDueAt, title: r.title })),
  );
}

/** Stable snapshot for useSyncExternalStore — only new reference when something material changed. */
function mergedFingerprint(rows: ReminderListItem[]): string {
  return rows
    .map(
      (r) =>
        [
          r.id,
          r.reminderType,
          r.title,
          r.nextDueAt,
          r.status,
          r.lastCompletedAt ?? "",
          r.isPaused,
          r.pausedUntil ?? "",
          r.description ?? "",
        ].join("\t"),
    )
    .join("\n");
}

/**
 * Same strategy as `usePlantCareLogsQuery`: avoid `useQuery(initialData)` + `setQueryData` in
 * `useEffect`, which can thrash observers when merged lists are new references every time.
 */
export function usePlantRemindersQuery(
  collectionSlug: string,
  plantSlug: string,
  serverReminders: ReminderListItem[],
) {
  const qc = useQueryClient();
  const key = queryKeys.plant.reminders(collectionSlug, plantSlug);

  const serverRef = useRef(serverReminders);
  serverRef.current = serverReminders;

  const serverSnapRef = useRef<string | null>(null);

  const snapshotRef = useRef<{
    fp: string;
    rows: ReminderListItem[];
  } | null>(null);

  const serverSnapshotKey = remindersSnapshotKey(serverReminders);

  useLayoutEffect(() => {
    serverSnapRef.current = null;
    snapshotRef.current = null;
  }, [collectionSlug, plantSlug]);

  useLayoutEffect(() => {
    if (serverSnapRef.current === serverSnapshotKey) return;
    serverSnapRef.current = serverSnapshotKey;
    qc.setQueryData(key, (prev) =>
      sortRemindersByNextDue(
        mergeServerRemindersWithCache(
          serverRef.current,
          prev as ReminderListItem[] | undefined,
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
    const cached = qc.getQueryData<ReminderListItem[]>(key);
    const merged = sortRemindersByNextDue(
      mergeServerRemindersWithCache(serverRef.current, cached),
    );
    const fp = mergedFingerprint(merged);
    const prev = snapshotRef.current;
    if (prev && prev.fp === fp) {
      return prev.rows;
    }
    snapshotRef.current = { fp, rows: merged };
    return merged;
  }, [qc, collectionSlug, plantSlug]);

  const getServerSnapshot = useCallback(() => serverRef.current, []);

  const data = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return { data, isPending: false, isError: false, error: null } as const;
}
