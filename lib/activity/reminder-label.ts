import type { ReminderType } from "@prisma/client";

export function reminderTypeLabel(t: ReminderType): string {
  const map: Record<ReminderType, string> = {
    watering: "watering",
    fertilizing: "fertilizing",
    misting: "misting",
    pruning: "pruning",
    repotting: "repotting",
    soil_change: "soil change",
    rotation: "rotation",
    pest_check: "pest check",
    observation: "observation",
    custom: "care",
  };
  return map[t] ?? "care";
}
