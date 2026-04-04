import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { CollectionMemberStatus } from "@prisma/client";
export type ArchivedPlantListItem = {
  id: string;
  slug: string;
  nickname: string;
  referenceCommonName: string | null;
  archivedAt: string;
  areaName: string;
};

export type ArchivedAreaListItem = {
  id: string;
  slug: string;
  name: string;
  archivedAt: string;
};

/** Archived plants and areas for the collection archive UI (collection must be active). */
export const getArchivedEntitiesForCollection = cache(
  async (
    userId: string,
    collectionSlug: string,
  ): Promise<{
    collectionId: string;
    collectionName: string;
    plants: ArchivedPlantListItem[];
    areas: ArchivedAreaListItem[];
  } | null> => {
    const membership = await prisma.collectionMember.findFirst({
      where: {
        userId,
        status: CollectionMemberStatus.active,
        collection: { slug: collectionSlug, archivedAt: null },
      },
      select: {
        collectionId: true,
        collection: { select: { id: true, name: true } },
      },
    });
    if (!membership) return null;

    const collectionId = membership.collectionId;

    const [plants, areas] = await Promise.all([
      prisma.plant.findMany({
        where: { collectionId, archivedAt: { not: null } },
        orderBy: { archivedAt: "desc" },
        select: {
          id: true,
          slug: true,
          nickname: true,
          referenceCommonName: true,
          archivedAt: true,
          area: { select: { name: true } },
        },
      }),
      prisma.area.findMany({
        where: { collectionId, archivedAt: { not: null } },
        orderBy: { archivedAt: "desc" },
        select: {
          id: true,
          slug: true,
          name: true,
          archivedAt: true,
        },
      }),
    ]);

    return {
      collectionId,
      collectionName: membership.collection.name,
      plants: plants.map((p) => ({
        id: p.id,
        slug: p.slug,
        nickname: p.nickname,
        referenceCommonName: p.referenceCommonName,
        archivedAt: p.archivedAt!.toISOString(),
        areaName: p.area.name,
      })),
      areas: areas.map((a) => ({
        id: a.id,
        slug: a.slug,
        name: a.name,
        archivedAt: a.archivedAt!.toISOString(),
      })),
    };
  },
);

export type ArchivedCollectionListItem = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  archivedAt: string;
  plantCount: number;
};

/** Collections the user can restore from account-level UI. */
export const getArchivedCollectionsForUser = cache(
  async (userId: string): Promise<ArchivedCollectionListItem[]> => {
    const rows = await prisma.collectionMember.findMany({
      where: {
        userId,
        status: CollectionMemberStatus.active,
        collection: { archivedAt: { not: null } },
      },
      select: {
        collection: {
          select: {
            id: true,
            slug: true,
            name: true,
            description: true,
            archivedAt: true,
            _count: {
              select: {
                plants: { where: { archivedAt: null } },
              },
            },
          },
        },
      },
    });

    const seen = new Map<string, ArchivedCollectionListItem>();
    for (const r of rows) {
      const c = r.collection;
      if (!c.archivedAt) continue;
      if (seen.has(c.id)) continue;
      seen.set(c.id, {
        id: c.id,
        slug: c.slug,
        name: c.name,
        description: c.description,
        archivedAt: c.archivedAt.toISOString(),
        plantCount: c._count.plants,
      });
    }

    return [...seen.values()].sort(
      (a, b) =>
        new Date(b.archivedAt).getTime() - new Date(a.archivedAt).getTime(),
    );
  },
);

/** Whether the collection has any non-archived plants (for archive gating). */
export async function countActivePlantsInCollection(
  collectionId: string,
): Promise<number> {
  return prisma.plant.count({
    where: { collectionId, archivedAt: null },
  });
}

export async function getArchivedCountsForCollection(collectionId: string): Promise<{
  plants: number;
  areas: number;
}> {
  const [plants, areas] = await Promise.all([
    prisma.plant.count({
      where: { collectionId, archivedAt: { not: null } },
    }),
    prisma.area.count({
      where: { collectionId, archivedAt: { not: null } },
    }),
  ]);
  return { plants, areas };
}
