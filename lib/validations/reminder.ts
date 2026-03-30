import { z } from "zod";

export const reminderTypeSchema = z.enum([
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
]);

export const intervalUnitSchema = z.enum(["days", "weeks", "months"]);

export const preferredWindowSchema = z.enum([
  "morning",
  "afternoon",
  "evening",
  "flexible",
]);

export const recurrenceRuleSchema = z.object({
  intervalValue: z.coerce.number().int().min(1).max(365),
  intervalUnit: intervalUnitSchema,
});

export const createReminderInputSchema = z.object({
  collectionSlug: z.string().trim().min(1),
  plantSlug: z.string().trim().min(1),
  reminderType: reminderTypeSchema,
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).optional(),
  intervalValue: z.coerce.number().int().min(1).max(365),
  intervalUnit: intervalUnitSchema,
  preferredWindow: preferredWindowSchema.nullable().optional(),
  gracePeriodHours: z.coerce.number().int().min(0).max(168).optional(),
  overdueAfterHours: z.coerce.number().int().min(0).max(720).optional(),
});

export const updateReminderInputSchema = z.object({
  collectionSlug: z.string().trim().min(1),
  plantSlug: z.string().trim().min(1),
  reminderId: z.string().uuid(),
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).optional(),
  intervalValue: z.coerce.number().int().min(1).max(365),
  intervalUnit: intervalUnitSchema,
  preferredWindow: preferredWindowSchema.nullable().optional(),
  gracePeriodHours: z.coerce.number().int().min(0).max(168).optional(),
  overdueAfterHours: z.coerce.number().int().min(0).max(720).optional(),
});

export type CreateReminderInput = z.infer<typeof createReminderInputSchema>;
export type UpdateReminderInput = z.infer<typeof updateReminderInputSchema>;
