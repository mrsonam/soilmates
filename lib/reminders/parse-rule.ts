import { recurrenceRuleSchema } from "@/lib/validations/reminder";
import type { IntervalUnit } from "@/lib/reminders/recurrence";

export function parseRecurrenceRule(raw: unknown): {
  intervalValue: number;
  intervalUnit: IntervalUnit;
} {
  const parsed = recurrenceRuleSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("Invalid recurrence_rule on reminder");
  }
  return parsed.data;
}
