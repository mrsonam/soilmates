import { z } from "zod";

export const plantLifeStageSchema = z.enum(["sprout", "juvenile", "mature"]);
export const plantHealthStatusSchema = z.enum([
  "thriving",
  "needs_attention",
]);
export const plantAcquisitionTypeSchema = z.enum([
  "purchased",
  "propagated",
  "gift",
  "seed",
  "other",
]);

export const createPlantSchema = z
  .object({
    nickname: z
      .string()
      .trim()
      .min(1, "Enter a plant nickname")
      .max(120, "Nickname is too long"),
    referenceIdentifier: z.string().trim().optional(),
    referenceCommonName: z.string().trim().max(200).optional(),
    plantType: z.string().trim().max(120).optional(),
    areaId: z.string().uuid("Choose a valid area"),
    lifeStage: plantLifeStageSchema,
    healthStatus: plantHealthStatusSchema,
    acquisitionType: plantAcquisitionTypeSchema,
    acquiredAt: z.string().trim().optional(),
    notes: z.string().trim().max(5000).optional(),
    primaryImageUrl: z.string().trim().max(2048).optional(),
    growthProgressPercent: z.string().trim().optional(),
    isFavorite: z.union([z.literal("on"), z.undefined()]).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.referenceIdentifier && data.referenceIdentifier.length > 0) {
      if (!/^[a-z0-9-]+(:[a-z0-9-]+)?$/i.test(data.referenceIdentifier)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Choose a valid plant reference",
          path: ["referenceIdentifier"],
        });
      }
    }
    if (data.acquiredAt && data.acquiredAt.length > 0) {
      if (Number.isNaN(Date.parse(data.acquiredAt))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid date",
          path: ["acquiredAt"],
        });
      }
    }
    if (data.primaryImageUrl && data.primaryImageUrl.length > 0) {
      try {
        new URL(data.primaryImageUrl);
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter a valid image URL",
          path: ["primaryImageUrl"],
        });
      }
    }
  })
  .transform((d) => {
    let growth: number | undefined;
    if (d.growthProgressPercent && d.growthProgressPercent.length > 0) {
      const n = Number(d.growthProgressPercent);
      if (!Number.isNaN(n)) {
        growth = Math.min(100, Math.max(0, Math.round(n)));
      }
    }
    return {
      nickname: d.nickname,
      referenceIdentifier:
        d.referenceIdentifier && d.referenceIdentifier.length > 0
          ? d.referenceIdentifier
          : undefined,
      referenceCommonName:
        d.referenceCommonName && d.referenceCommonName.length > 0
          ? d.referenceCommonName
          : undefined,
      plantType:
        d.plantType && d.plantType.length > 0 ? d.plantType : undefined,
      areaId: d.areaId,
      lifeStage: d.lifeStage,
      healthStatus: d.healthStatus,
      acquisitionType: d.acquisitionType,
      acquiredAt:
        d.acquiredAt && d.acquiredAt.length > 0 ? d.acquiredAt : undefined,
      notes: d.notes && d.notes.length > 0 ? d.notes : undefined,
      primaryImageUrl:
        d.primaryImageUrl && d.primaryImageUrl.length > 0
          ? d.primaryImageUrl
          : undefined,
      growthProgressPercent: growth,
      isFavorite: d.isFavorite === "on",
    };
  });
