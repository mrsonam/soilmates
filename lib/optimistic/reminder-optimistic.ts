import type { ReminderPreferredWindow, ReminderType } from "@prisma/client";
import type { ReminderListItem } from "@/lib/reminders/queries";
import { parseRecurrenceRule } from "@/lib/reminders/parse-rule";
import {
  computeFirstNextDueAt,
  computeNextDueAfterCompletion,
  type IntervalUnit,
} from "@/lib/reminders/recurrence";
import { reminderListItemDisplayStatus } from "@/lib/reminders/status";

export const OPTIMISTIC_REMINDER_PREFIX = "opt-rm-";

export function makeOptimisticReminderId(): string {
  return `${OPTIMISTIC_REMINDER_PREFIX}${crypto.randomUUID()}`;
}

export function isOptimisticReminderId(id: string): boolean {
  return id.startsWith(OPTIMISTIC_REMINDER_PREFIX);
}

export function optimisticReminderAfterComplete(
  item: ReminderListItem,
): ReminderListItem {
  const completedAt = new Date();
  const rule = parseRecurrenceRule(item.recurrenceRule);
  const nextDueAt = computeNextDueAfterCompletion(
    completedAt,
    rule.intervalValue,
    rule.intervalUnit,
    item.preferredWindow,
  );
  const nextIso = nextDueAt.toISOString();
  const lastIso = completedAt.toISOString();
  const next: ReminderListItem = {
    ...item,
    lastCompletedAt: lastIso,
    nextDueAt: nextIso,
  };
  return {
    ...next,
    status: reminderListItemDisplayStatus(next),
  };
}

export function optimisticReminderAfterPause(item: ReminderListItem): ReminderListItem {
  return {
    ...item,
    isPaused: true,
    pausedUntil: null,
    status: "paused",
  };
}

export function buildOptimisticReminderFromCreateInput(input: {
  id: string;
  reminderType: ReminderType;
  title: string;
  description: string | null;
  intervalValue: number;
  intervalUnit: IntervalUnit;
  preferredWindow: ReminderPreferredWindow | null;
  gracePeriodHours: number | null;
  overdueAfterHours: number | null;
}): ReminderListItem {
  const nextDueAt = computeFirstNextDueAt(
    input.intervalValue,
    input.intervalUnit,
    input.preferredWindow,
  );
  const nextIso = nextDueAt.toISOString();
  const recurrenceRule = {
    intervalValue: input.intervalValue,
    intervalUnit: input.intervalUnit,
  };
  const row: ReminderListItem = {
    id: input.id,
    reminderType: input.reminderType,
    title: input.title,
    description: input.description,
    recurrenceRule,
    preferredWindow: input.preferredWindow,
    gracePeriodHours: input.gracePeriodHours,
    overdueAfterHours: input.overdueAfterHours,
    lastCompletedAt: null,
    nextDueAt: nextIso,
    status: reminderListItemDisplayStatus({
      isPaused: false,
      nextDueAt: nextIso,
      overdueAfterHours: input.overdueAfterHours,
    }),
    isPaused: false,
    pausedUntil: null,
  };
  return row;
}

export function replaceOptimisticReminderId(
  rows: ReminderListItem[],
  tempId: string,
  realId: string,
): ReminderListItem[] {
  const hasReal = rows.some((r) => r.id === realId);
  if (hasReal) {
    return rows.filter((r) => r.id !== tempId);
  }
  return rows.map((r) => (r.id === tempId ? { ...r, id: realId } : r));
}

export function optimisticReminderAfterResume(item: ReminderListItem): ReminderListItem {
  const rule = parseRecurrenceRule(item.recurrenceRule);
  const existingNext = new Date(item.nextDueAt);
  const nextDueAt =
    existingNext.getTime() < Date.now()
      ? computeFirstNextDueAt(
          rule.intervalValue,
          rule.intervalUnit,
          item.preferredWindow,
        )
      : existingNext;
  const nextIso = nextDueAt.toISOString();
  const next: ReminderListItem = {
    ...item,
    isPaused: false,
    pausedUntil: null,
    nextDueAt: nextIso,
  };
  return {
    ...next,
    status: reminderListItemDisplayStatus(next),
  };
}
