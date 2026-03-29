import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { CollectionMemberStatus } from "@prisma/client";

export type PlantDetailModel = {
  id: string;
  slug: string;
  nickname: string;
  referenceCommonName: string | null;
  plantType: string | null;
  primaryImageUrl: string | null;
  lifeStage: string;
  healthStatus: string;
  acquisitionType: string;
  acquiredAt: string | null;
  notes: string | null;
  isFavorite: boolean;
  growthProgressPercent: number | null;
  createdAt: string;
  area: { name: string; slug: string };
  collection: { name: string; slug: string };
  counts: {
    careLogs: number;
    photos: number;
    reminders: number;
  };
};

/**
 * Full plant row for the detail page; verifies active membership and non-archived plant.
 */
export const getPlantDetailBySlugs = cache(
  async (
    userId: string,
    collectionSlug: string,
    plantSlug: string,
  ): Promise<PlantDetailModel | null> => {
    const membership = await prisma.collectionMember.findFirst({
      where: {
        userId,
        status: CollectionMemberStatus.active,
        collection: { slug: collectionSlug, archivedAt: null },
      },
      select: {
        collectionId: true,
        collection: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
    if (!membership) return null;

    const row = await prisma.plant.findFirst({
      where: {
        collectionId: membership.collectionId,
        slug: plantSlug,
        archivedAt: null,
      },
      select: {
        id: true,
        slug: true,
        nickname: true,
        referenceCommonName: true,
        plantType: true,
        primaryImageUrl: true,
        lifeStage: true,
        healthStatus: true,
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

    /** Separate query: avoids `_count` in `select` when the generated client is stale. */
    const careLogCount = await prisma.careLog.count({
      where: { plantId: row.id, deletedAt: null },
    });

    return {
      id: row.id,
      slug: row.slug,
      nickname: row.nickname,
      referenceCommonName: row.referenceCommonName,
      plantType: row.plantType,
      primaryImageUrl: row.primaryImageUrl,
      lifeStage: row.lifeStage,
      healthStatus: row.healthStatus,
      acquisitionType: row.acquisitionType,
      acquiredAt: row.acquiredAt
        ? row.acquiredAt.toISOString().slice(0, 10)
        : null,
      notes: row.notes,
      isFavorite: row.isFavorite,
      growthProgressPercent: row.growthProgressPercent,
      createdAt: row.createdAt.toISOString(),
      area: row.area,
      collection: {
        name: membership.collection.name,
        slug: membership.collection.slug,
      },
      counts: {
        careLogs: careLogCount,
        photos: 0,
        reminders: 0,
      },
    };
  },
);
