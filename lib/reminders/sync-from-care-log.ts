import { ReminderEventType, type CareLogActionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { careLogActionMatchesReminderType } from "@/lib/reminders/care-type-map";
import { advanceReminderInTx } from "@/lib/reminders/advance";
import { findMatchingRemindersForCareLog } from "@/lib/reminders/find-matching";

/**
 * When a care log is created, advance any active reminders whose type matches the action.
 */
export async function syncRemindersFromCareLog(params: {
  userId: string;
  plantId: string;
  careLogId: string;
  actionType: CareLogActionType;
  actionAt: Date;
}): Promise<void> {
  const reminders = await findMatchingRemindersForCareLog(
    params.plantId,
    params.actionType,
  );

  const toAdvance = reminders.filter((r) =>
    careLogActionMatchesReminderType(params.actionType, r.reminderType),
  );
  if (toAdvance.length === 0) return;

  await prisma.$transaction(async (tx) => {
    for (const r of toAdvance) {
      await advanceReminderInTx(
        tx,
        r,
        params.actionAt,
        params.careLogId,
        params.userId,
        ReminderEventType.care_log_matched,
      );
    }
  });
}

/** Fire-and-forget wrapper with deterministic id for log creation path. */
export function syncRemindersFromCareLogSafe(params: {
  userId: string;
  plantId: string;
  careLogId: string;
  actionType: CareLogActionType;
  actionAt: Date;
}): void {
  void syncRemindersFromCareLog(params).catch((e) => {
    console.error("syncRemindersFromCareLog", e);
  });
}
