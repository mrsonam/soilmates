import type { CareLogListItem } from "@/lib/plants/care-logs";
import type { ReminderListItem } from "@/lib/reminders/queries";
import { dedupeCareLogsById, isOptimisticCareLogId } from "@/lib/optimistic/care-log";
import { isOptimisticReminderId } from "@/lib/optimistic/reminder-optimistic";

/** Same user action within this window is treated as one logical event (server vs optimistic). */
const CARE_LOG_DEDUP_MS = 12_000;
const REMINDER_DEDUP_MS = 60_000;

function isLikelySameCareLog(
  server: CareLogListItem,
  optimistic: CareLogListItem,
): boolean {
  if (isOptimisticCareLogId(server.id)) return false;
  return (
    server.actionType === optimistic.actionType &&
    server.createdById === optimistic.createdById &&
    Math.abs(
      new Date(server.actionAt).getTime() -
        new Date(optimistic.actionAt).getTime(),
    ) < CARE_LOG_DEDUP_MS
  );
}

function isLikelySameReminder(
  server: ReminderListItem,
  optimistic: ReminderListItem,
): boolean {
  if (isOptimisticReminderId(server.id)) return false;
  return (
    server.reminderType === optimistic.reminderType &&
    server.title.trim() === optimistic.title.trim() &&
    Math.abs(
      new Date(server.nextDueAt).getTime() -
        new Date(optimistic.nextDueAt).getTime(),
    ) < REMINDER_DEDUP_MS
  );
}

/**
 * Merge RSC/server snapshot with in-memory cache so optimistic rows survive
 * `router.refresh()` and realtime does not duplicate pending items.
 */
export function mergeServerCareLogsWithCache(
  serverRows: CareLogListItem[],
  cacheRows: CareLogListItem[] | undefined,
): CareLogListItem[] {
  if (!cacheRows?.length) {
    return dedupeCareLogsById(serverRows);
  }

  const pendingOptimistic = cacheRows.filter((r) => isOptimisticCareLogId(r.id));
  let merged = [...serverRows];

  for (const o of pendingOptimistic) {
    if (serverRows.some((s) => s.id === o.id)) continue;
    if (serverRows.some((s) => isLikelySameCareLog(s, o))) continue;
    merged.push(o);
  }

  return dedupeCareLogsById(merged);
}

export function sortCareLogsNewestFirst(rows: CareLogListItem[]): CareLogListItem[] {
  return [...rows].sort((a, b) => {
    const dt =
      new Date(b.actionAt).getTime() - new Date(a.actionAt).getTime();
    if (dt !== 0) return dt;
    return b.id.localeCompare(a.id);
  });
}

export function dedupeRemindersById(rows: ReminderListItem[]): ReminderListItem[] {
  const seen = new Set<string>();
  const out: ReminderListItem[] = [];
  for (const row of rows) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    out.push(row);
  }
  return out;
}

export function mergeServerRemindersWithCache(
  serverRows: ReminderListItem[],
  cacheRows: ReminderListItem[] | undefined,
): ReminderListItem[] {
  if (!cacheRows?.length) {
    return dedupeRemindersById(serverRows);
  }

  const pendingOptimistic = cacheRows.filter((r) => isOptimisticReminderId(r.id));
  let merged = [...serverRows];

  for (const o of pendingOptimistic) {
    if (serverRows.some((s) => s.id === o.id)) continue;
    if (serverRows.some((s) => isLikelySameReminder(s, o))) continue;
    merged.push(o);
  }

  return dedupeRemindersById(merged);
}

export function sortRemindersByNextDue(rows: ReminderListItem[]): ReminderListItem[] {
  return [...rows].sort((a, b) => {
    const d =
      new Date(a.nextDueAt).getTime() - new Date(b.nextDueAt).getTime();
    if (d !== 0) return d;
    return a.id.localeCompare(b.id);
  });
}
