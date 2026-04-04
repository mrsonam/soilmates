import { z } from "zod";

export const userSettingsUpdateSchema = z
  .object({
    theme: z.enum(["light", "dark", "system"]).optional(),
    waterUnit: z.enum(["ml"]).optional(),
    lengthUnit: z.enum(["cm", "in"]).optional(),
    aiPersonalityLevel: z.enum(["factual", "balanced", "warm"]).optional(),
    careSensitivity: z.enum(["relaxed", "standard", "cautious"]).optional(),
    defaultCollectionId: z.string().uuid().nullable().optional(),
    pushNotificationsEnabled: z.boolean().optional(),
    inAppNotificationsEnabled: z.boolean().optional(),
    notificationQuietStartMinute: z.number().int().min(0).max(1439).nullable().optional(),
    notificationQuietEndMinute: z.number().int().min(0).max(1439).nullable().optional(),
    preferredNotificationWindow: z
      .enum(["morning", "afternoon", "evening", "flexible"])
      .nullable()
      .optional(),
  })
  .superRefine((data, ctx) => {
    const a = data.notificationQuietStartMinute;
    const b = data.notificationQuietEndMinute;
    if (a === undefined && b === undefined) return;
    if (a === null && b === null) return;
    if (a != null && b != null) return;
    ctx.addIssue({
      code: "custom",
      message: "Set both quiet hour times or clear both.",
      path: ["notificationQuietStartMinute"],
    });
  });

export type UserSettingsUpdateParsed = z.infer<typeof userSettingsUpdateSchema>;
