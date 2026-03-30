import { randomUUID } from "crypto";
import type { Prisma, Reminder } from "@prisma/client";
import type { ReminderEventType as ReminderEventTypeT } from "@prisma/client";
import { parseRecurrenceRule } from "@/lib/reminders/parse-rule";
import { computeNextDueAfterCompletion } from "@/lib/reminders/recurrence";

export async function advanceReminderInTx(
  tx: Prisma.TransactionClient,
  reminder: Reminder,
  completedAt: Date,
  careLogId: string | null,
  userId: string,
  eventType: ReminderEventTypeT,
): Promise<void> {
  const rule = parseRecurrenceRule(reminder.recurrenceRule);
  const nextDueAt = computeNextDueAfterCompletion(
    completedAt,
    rule.intervalValue,
    rule.intervalUnit,
    reminder.preferredWindow,
  );

  await tx.reminder.update({
    where: { id: reminder.id },
    data: {
      lastCompletedAt: completedAt,
      nextDueAt,
    },
  });

  await tx.reminderEvent.create({
    data: {
      id: randomUUID(),
      reminderId: reminder.id,
      eventType,
      careLogId,
      metadata: {},
      createdById: userId,
    },
  });
}
