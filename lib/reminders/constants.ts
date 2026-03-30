import type { ReminderType } from "@prisma/client";

export const REMINDER_TYPES: ReminderType[] = [
  "watering",
  "fertilizing",
  "misting",
  "pruning",
  "repotting",
  "soil_change",
  "rotation",
  "pest_check",
  "observation",
  "custom",
];

export const PREFERRED_WINDOWS = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
  { value: "flexible", label: "Flexible" },
] as const;

export const INTERVAL_UNITS = [
  { value: "days", label: "days" },
  { value: "weeks", label: "weeks" },
  { value: "months", label: "months" },
] as const;
