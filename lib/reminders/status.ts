import type { Reminder } from "@prisma/client";

export type ReminderDisplayStatus =
  | "upcoming"
  | "due"
  | "overdue"
  | "paused";

const DEFAULT_OVERDUE_AFTER_H = 48;

/**
 * Paused reminders are never due/overdue in UI lists.
 * Due: at or after next_due_at but not yet overdue.
 * Overdue: past next_due_at + overdue_after_hours (default 48h).
 */
export function computeReminderDisplayStatus(
  r: Pick<
    Reminder,
    | "isPaused"
    | "pausedUntil"
    | "nextDueAt"
    | "overdueAfterHours"
    | "isActive"
    | "archivedAt"
  >,
  now: Date = new Date(),
): ReminderDisplayStatus {
  if (r.archivedAt || !r.isActive) return "paused";
  if (r.isPaused) return "paused";

  const next = r.nextDueAt.getTime();
  const nowT = now.getTime();
  const overdueH = r.overdueAfterHours ?? DEFAULT_OVERDUE_AFTER_H;
  const overdueLine = next + overdueH * 3600 * 1000;

  if (nowT < next) return "upcoming";
  if (nowT <= overdueLine) return "due";
  return "overdue";
}
