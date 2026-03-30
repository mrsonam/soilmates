import type { CareLogActionType, ReminderType } from "@prisma/client";

/** Maps reminder taxonomy to care log action for completion + auto-sync. */
export function reminderTypeToCareLogAction(
  t: ReminderType,
): CareLogActionType | null {
  const m: Record<ReminderType, CareLogActionType | null> = {
    watering: "watered",
    fertilizing: "fertilized",
    misting: "misted",
    pruning: "pruned",
    repotting: "repotted",
    soil_change: "soil_changed",
    rotation: "rotated",
    pest_check: "pest_treatment",
    observation: "observation",
    custom: null,
  };
  return m[t];
}

export function careLogActionMatchesReminderType(
  action: CareLogActionType,
  reminderType: ReminderType,
): boolean {
  const expected = reminderTypeToCareLogAction(reminderType);
  if (expected === null) return false;
  return expected === action;
}
