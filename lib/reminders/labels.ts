import type { ReminderType } from "@prisma/client";

export const REMINDER_TYPE_LABEL: Record<ReminderType, string> = {
  watering: "Watering",
  fertilizing: "Fertilizing",
  misting: "Misting",
  pruning: "Pruning",
  repotting: "Repotting",
  soil_change: "Soil change",
  rotation: "Rotation",
  pest_check: "Pest check",
  observation: "Observation",
  custom: "Custom",
};

export function defaultTitleForReminderType(t: ReminderType): string {
  return REMINDER_TYPE_LABEL[t];
}
