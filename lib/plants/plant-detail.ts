import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { PlantReferenceSnapshot } from "@/lib/integrations/trefle/types";
import { parsePlantReferenceSnapshot } from "@/lib/plants/reference-store";
import {
  createSignedUrlsForPaths,
  isSupabaseStorageConfigured,
} from "@/lib/supabase/admin";
import { getMembershipForCollectionSlug } from "@/lib/collections/access";

export type PlantDetailModel = {
  id: string;
  slug: string;
  nickname: string;
  referenceCommonName: string | null;
  plantType: string | null;
  /** Legacy external URL from plant creation (optional). */
  primaryImageUrl: string | null;
  /** Hero image URL: signed private cover when set, else `primaryImageUrl`. */
  heroImageUrl: string | null;
  primaryImageId: string | null;
  lifeStage: string;
  healthStatus: string;
  /** Latest AI assessment from diagnosis (separate from manual `healthStatus`). */
  aiHealthStatus: string | null;
  acquisitionType: string;
  acquiredAt: string | null;
  notes: string | null;
  isFavorite: boolean;
  growthProgressPercent: number | null;
  createdAt: string;
  /** When set, plant is archived (hidden from active lists). */
  archivedAt: string | null;
  /** When the parent collection is archived, most edits are disabled. */
  collectionArchivedAt: string | null;
  area: { name: string; slug: string };
  collection: { name: string; slug: string };
  counts: {
    careLogs: number;
    photos: number;
    reminders: number;
  };
  referenceSnapshot: PlantReferenceSnapshot | null;
};

/**
 * Full plant row for the detail page; verifies active membership (including archived collections).
 */
export const getPlantDetailBySlugs = cache(
  async (
    userId: string,
    collectionSlug: string,
    plantSlug: string,
  ): Promise<PlantDetailModel | null> => {
    const membership = await getMembershipForCollectionSlug(
      userId,
      collectionSlug,
    );
    if (!membership) return null;

    const row = await prisma.plant.findFirst({
      where: {
        collectionId: membership.collectionId,
        slug: plantSlug,
      },
      select: {
        id: true,
        slug: true,
        nickname: true,
        referenceCommonName: true,
        referenceSnapshot: true,
        plantType: true,
        primaryImageUrl: true,
        primaryImageId: true,
        archivedAt: true,
        primaryImage: {
          select: { storagePath: true },
        },
        lifeStage: true,
        healthStatus: true,
        aiHealthStatus: true,
        acquisitionType: true,
        acquiredAt: true,
        notes: true,
        isFavorite: true,
        growthProgressPercent: true,
        createdAt: true,
        area: { select: { name: true, slug: true } },
      },
    });

    if (!row) return null;

    const careLogCount = await prisma.careLog.count({
      where: { plantId: row.id, deletedAt: null },
    });

    const photoCount = await prisma.plantImage.count({
      where: { plantId: row.id, deletedAt: null },
    });

    const isHiddenFromCare =
      row.archivedAt != null || membership.collection.archivedAt != null;

    const reminderCount = isHiddenFromCare
      ? 0
      : await prisma.reminder.count({
          where: { plantId: row.id, archivedAt: null },
        });

    let heroImageUrl: string | null = null;
    const storagePath = row.primaryImage?.storagePath;
    if (storagePath && isSupabaseStorageConfigured()) {
      const map = await createSignedUrlsForPaths([storagePath]);
      heroImageUrl = map.get(storagePath) ?? null;
    }
    if (!heroImageUrl && row.primaryImageUrl?.trim()) {
      heroImageUrl = row.primaryImageUrl.trim();
    }

    return {
      id: row.id,
      slug: row.slug,
      nickname: row.nickname,
      referenceCommonName: row.referenceCommonName,
      plantType: row.plantType,
      primaryImageUrl: row.primaryImageUrl,
      heroImageUrl,
      primaryImageId: row.primaryImageId,
      lifeStage: row.lifeStage,
      healthStatus: row.healthStatus,
      aiHealthStatus: row.aiHealthStatus ? String(row.aiHealthStatus) : null,
      acquisitionType: row.acquisitionType,
      acquiredAt: row.acquiredAt
        ? row.acquiredAt.toISOString().slice(0, 10)
        : null,
      notes: row.notes,
      isFavorite: row.isFavorite,
      growthProgressPercent: row.growthProgressPercent,
      createdAt: row.createdAt.toISOString(),
      archivedAt: row.archivedAt?.toISOString() ?? null,
      collectionArchivedAt:
        membership.collection.archivedAt?.toISOString() ?? null,
      area: row.area,
      collection: {
        name: membership.collection.name,
        slug: membership.collection.slug,
      },
      counts: {
        careLogs: careLogCount,
        photos: photoCount,
        reminders: reminderCount,
      },
      referenceSnapshot: parsePlantReferenceSnapshot(row.referenceSnapshot),
    };
  },
);
