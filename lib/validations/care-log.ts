import { z } from "zod";

export const quickCareActionSchema = z.enum([
  "watered",
  "fertilized",
  "repotted",
  "pruned",
  "observation",
]);

export type QuickCareAction = z.infer<typeof quickCareActionSchema>;

export const careLogActionTypeSchema = z.enum([
  "watered",
  "fertilized",
  "misted",
  "pruned",
  "repotted",
  "soil_changed",
  "rotated",
  "moved_location",
  "pest_treatment",
  "cleaned_leaves",
  "propagated",
  "seeded",
  "germinated",
  "harvested",
  "plant_died",
  "observation",
  "custom",
]);

export type CareLogActionTypeValue = z.infer<typeof careLogActionTypeSchema>;

const metadataValue = z.union([z.string(), z.number(), z.boolean()]);

export const careLogMetadataSchema = z
  .record(z.string(), metadataValue)
  .optional()
  .transform((o) => o ?? {})
  .superRefine((obj, ctx) => {
    const keys = Object.keys(obj);
    if (keys.length > 40) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Too many metadata fields",
      });
    }
  });

export const careLogTagsSchema = z
  .array(z.string().trim().min(1).max(48))
  .max(24)
  .optional()
  .transform((t) => t ?? []);

export const createDetailedCareLogSchema = z.object({
  collectionSlug: z.string().trim().min(1),
  plantSlug: z.string().trim().min(1),
  actionType: careLogActionTypeSchema,
  actionAt: z.union([z.coerce.date(), z.string()]).transform((v) =>
    v instanceof Date ? v : new Date(v),
  ).refine((d) => !Number.isNaN(d.getTime()), "Invalid date"),
  notes: z.string().trim().max(8000).optional(),
  tags: careLogTagsSchema,
  metadata: careLogMetadataSchema,
});

export const updateCareLogSchema = z.object({
  collectionSlug: z.string().trim().min(1),
  plantSlug: z.string().trim().min(1),
  careLogId: z.string().uuid(),
  actionType: careLogActionTypeSchema,
  actionAt: z.union([z.coerce.date(), z.string()]).transform((v) =>
    v instanceof Date ? v : new Date(v),
  ).refine((d) => !Number.isNaN(d.getTime()), "Invalid date"),
  notes: z.string().trim().max(8000).optional(),
  tags: careLogTagsSchema,
  metadata: careLogMetadataSchema,
});

export const deleteCareLogSchema = z.object({
  collectionSlug: z.string().trim().min(1),
  plantSlug: z.string().trim().min(1),
  careLogId: z.string().uuid(),
});
