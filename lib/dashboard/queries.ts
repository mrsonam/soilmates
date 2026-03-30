import { cache } from "react";
import { CollectionMemberStatus, PlantHealthStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  createSignedUrlsForPaths,
  isSupabaseStorageConfigured,
} from "@/lib/supabase/admin";

async function collectionIdsForUser(userId: string): Promise<string[]> {
  const rows = await prisma.collectionMember.findMany({
    where: {
      userId,
      status: CollectionMemberStatus.active,
      collection: { archivedAt: null },
    },
    select: { collectionId: true },
  });
  return rows.map((r) => r.collectionId);
}

export type DashboardSnapshot = {
  healthy: number;
  thirsty: number;
  totalPlants: number;
};

export const getDashboardSnapshot = cache(
  async (userId: string): Promise<DashboardSnapshot> => {
    const ids = await collectionIdsForUser(userId);
    if (ids.length === 0) {
      return { healthy: 0, thirsty: 0, totalPlants: 0 };
    }
    const [healthy, thirsty, totalPlants] = await Promise.all([
      prisma.plant.count({
        where: {
          collectionId: { in: ids },
          archivedAt: null,
          healthStatus: PlantHealthStatus.thriving,
        },
      }),
      prisma.plant.count({
        where: {
          collectionId: { in: ids },
          archivedAt: null,
          healthStatus: PlantHealthStatus.needs_attention,
        },
      }),
      prisma.plant.count({
        where: { collectionId: { in: ids }, archivedAt: null },
      }),
    ]);
    return { healthy, thirsty, totalPlants };
  },
);

export type RecentActivityRow = {
  id: string;
  summary: string;
  createdAt: string;
  actorDisplayName: string | null;
};

export const getDashboardRecentActivity = cache(
  async (userId: string, take = 6): Promise<RecentActivityRow[]> => {
    const ids = await collectionIdsForUser(userId);
    if (ids.length === 0) return [];

    const rows = await prisma.activityEvent.findMany({
      where: { collectionId: { in: ids } },
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        summary: true,
        createdAt: true,
        actor: {
          select: { fullName: true, email: true },
        },
      },
    });

    return rows.map((r) => ({
      id: r.id,
      summary: r.summary,
      createdAt: r.createdAt.toISOString(),
      actorDisplayName: r.actor
        ? r.actor.fullName?.trim() ||
          r.actor.email.split("@")[0] ||
          null
        : null,
    }));
  },
);

export type FavoritePlantCard = {
  id: string;
  slug: string;
  nickname: string;
  plantType: string | null;
  collectionSlug: string;
  growthProgressPercent: number | null;
  imageUrl: string | null;
};

export const getDashboardFavoritePlants = cache(
  async (userId: string, take = 8): Promise<FavoritePlantCard[]> => {
    const ids = await collectionIdsForUser(userId);
    if (ids.length === 0) return [];

    const rows = await prisma.plant.findMany({
      where: {
        collectionId: { in: ids },
        archivedAt: null,
        isFavorite: true,
      },
      orderBy: { updatedAt: "desc" },
      take,
      select: {
        id: true,
        slug: true,
        nickname: true,
        plantType: true,
        growthProgressPercent: true,
        primaryImageUrl: true,
        primaryImage: { select: { storagePath: true } },
        collection: { select: { slug: true } },
      },
    });

    const paths = rows
      .map((r) => r.primaryImage?.storagePath)
      .filter((p): p is string => Boolean(p));
    const urlMap =
      paths.length > 0 && isSupabaseStorageConfigured()
        ? await createSignedUrlsForPaths(paths)
        : new Map<string, string>();

    return rows.map((r) => {
      const path = r.primaryImage?.storagePath;
      let imageUrl: string | null =
        path && urlMap.has(path) ? urlMap.get(path)! : null;
      if (!imageUrl && r.primaryImageUrl?.trim()) {
        imageUrl = r.primaryImageUrl.trim();
      }
      return {
        id: r.id,
        slug: r.slug,
        nickname: r.nickname,
        plantType: r.plantType,
        collectionSlug: r.collection.slug,
        growthProgressPercent: r.growthProgressPercent,
        imageUrl,
      };
    });
  },
);
