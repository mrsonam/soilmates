import { z } from "zod";
import { CareLogActionType, PlantHealthStatus, PlantLifeStage } from "@prisma/client";
import type { GlobalSearchFilters, ReminderStatusFilter, SearchEntityType } from "./types";

const SearchEntityTypeSchema = z.enum([
  "all",
  "plants",
  "collections",
  "areas",
  "care_logs",
  "reminders",
  "photos",
  "activity",
]) satisfies z.ZodType<SearchEntityType>;

const SearchParamsSchema = z.object({
  q: z.string().trim().max(160).optional(),
  type: SearchEntityTypeSchema.optional(),
  collection: z.string().trim().max(80).optional(),
  plantHealth: z.nativeEnum(PlantHealthStatus).optional(),
  plantStage: z.nativeEnum(PlantLifeStage).optional(),
  reminderStatus: z.enum(["upcoming", "due", "overdue", "paused"]).optional(),
  careAction: z.nativeEnum(CareLogActionType).optional(),
});

export function parseSearchFilters(input: unknown): GlobalSearchFilters {
  const sp = SearchParamsSchema.safeParse(input);
  const data = sp.success ? sp.data : {};

  const q = data.q?.trim() ? data.q.trim() : null;

  return {
    q,
    type: data.type ?? "all",
    collectionSlug: data.collection?.trim() ? data.collection.trim() : null,
    plantHealthStatus: data.plantHealth ?? null,
    plantLifeStage: data.plantStage ?? null,
    reminderStatus: (data.reminderStatus ?? null) as ReminderStatusFilter | null,
    careActionType: data.careAction ?? null,
  };
}

