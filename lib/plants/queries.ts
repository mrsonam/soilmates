import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { CollectionMemberStatus } from "@prisma/client";
import {
  createSignedUrlsForPaths,
  isSupabaseStorageConfigured,
} from "@/lib/supabase/admin";

export type PlantListItem = {
  id: string;
  slug: string;
  nickname: string;
  referenceCommonName: string | null;
  plantType: string | null;
  /** Resolved thumbnail: signed private cover or legacy external URL. */
  coverImageUrl: string | null;
  lifeStage: string;
  healthStatus: string;
  growthProgressPercent: number | null;
  isFavorite: boolean;
  createdAt: string;
  area: { id: string; name: string; slug: string };
  /** Owning collection (for links and all-plants catalog). */
  collection: { slug: string; name: string };
};

export type PlantCreateAreaOption = {
  id: string;
  name: string;
  slug: string;
};

export const getPlantsForCollectionMember = cache(
  async (
    userId: string,
    collectionSlug: string,
  ): Promise<{
    collection: { id: string; name: string; slug: string };
    plants: PlantListItem[];
  } | null> => {
    const membership = await prisma.collectionMember.findFirst({
      where: {
        userId,
        status: CollectionMemberStatus.active,
        collection: { slug: collectionSlug, archivedAt: null },
      },
      select: {
        collection: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
    if (!membership) return null;

    const rows = await prisma.plant.findMany({
      where: {
        collectionId: membership.collection.id,
        archivedAt: null,
      },
      orderBy: [{ isFavorite: "desc" }, { nickname: "asc" }],
      select: {
        id: true,
        slug: true,
        nickname: true,
        referenceCommonName: true,
        plantType: true,
        primaryImageUrl: true,
        primaryImage: { select: { storagePath: true } },
        lifeStage: true,
        healthStatus: true,
        growthProgressPercent: true,
        isFavorite: true,
        createdAt: true,
        area: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    const col = membership.collection;
    const plants = await mapRowsToPlantListItems(rows, {
      slug: col.slug,
      name: col.name,
    });

    return { collection: membership.collection, plants };
  },
);

/** Plants in one area (member must have access to the collection). */
export const getPlantsForAreaMember = cache(
  async (
    userId: string,
    collectionSlug: string,
    areaSlug: string,
  ): Promise<PlantListItem[] | null> => {
    const membership = await prisma.collectionMember.findFirst({
      where: {
        userId,
        status: CollectionMemberStatus.active,
        collection: { slug: collectionSlug, archivedAt: null },
      },
      select: {
        collection: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
    if (!membership) return null;

    const area = await prisma.area.findFirst({
      where: {
        collectionId: membership.collection.id,
        slug: areaSlug,
        archivedAt: null,
      },
      select: { id: true },
    });
    if (!area) return null;

    const rows = await prisma.plant.findMany({
      where: {
        collectionId: membership.collection.id,
        areaId: area.id,
        archivedAt: null,
      },
      orderBy: [{ isFavorite: "desc" }, { nickname: "asc" }],
      select: {
        id: true,
        slug: true,
        nickname: true,
        referenceCommonName: true,
        plantType: true,
        primaryImageUrl: true,
        primaryImage: { select: { storagePath: true } },
        lifeStage: true,
        healthStatus: true,
        growthProgressPercent: true,
        isFavorite: true,
        createdAt: true,
        area: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    const col = membership.collection;
    return mapRowsToPlantListItems(rows, {
      slug: col.slug,
      name: col.name,
    });
  },
);

/** All non-archived plants in collections where the user is an active member. */
export const getAllPlantsForActiveMember = cache(
  async (userId: string): Promise<PlantListItem[]> => {
    const memberships = await prisma.collectionMember.findMany({
      where: {
        userId,
        status: CollectionMemberStatus.active,
        collection: { archivedAt: null },
      },
      select: {
        collection: { select: { id: true, slug: true, name: true } },
      },
    });

    const collectionIds = memberships.map((m) => m.collection.id);
    if (collectionIds.length === 0) return [];

    const rows = await prisma.plant.findMany({
      where: {
        collectionId: { in: collectionIds },
        archivedAt: null,
      },
      orderBy: [{ isFavorite: "desc" }, { nickname: "asc" }],
      select: {
        id: true,
        slug: true,
        nickname: true,
        referenceCommonName: true,
        plantType: true,
        primaryImageUrl: true,
        primaryImage: { select: { storagePath: true } },
        lifeStage: true,
        healthStatus: true,
        growthProgressPercent: true,
        isFavorite: true,
        createdAt: true,
        area: {
          select: { id: true, name: true, slug: true },
        },
        collection: {
          select: { slug: true, name: true },
        },
      },
    });

    return mapRowsToPlantListItems(rows);
  },
);

type PlantRowForList = {
  id: string;
  slug: string;
  nickname: string;
  referenceCommonName: string | null;
  plantType: string | null;
  primaryImageUrl: string | null;
  primaryImage: { storagePath: string } | null;
  lifeStage: string;
  healthStatus: string;
  growthProgressPercent: number | null;
  isFavorite: boolean;
  createdAt: Date;
  area: { id: string; name: string; slug: string };
  collection?: { slug: string; name: string };
};

async function mapRowsToPlantListItems(
  rows: PlantRowForList[],
  defaultCollection?: { slug: string; name: string },
): Promise<PlantListItem[]> {
  const paths = rows
    .map((r) => r.primaryImage?.storagePath)
    .filter((p): p is string => Boolean(p));
  const signed =
    isSupabaseStorageConfigured() && paths.length > 0
      ? await createSignedUrlsForPaths(paths)
      : new Map<string, string>();

  return rows.map((p) => ({
    id: p.id,
    slug: p.slug,
    nickname: p.nickname,
    referenceCommonName: p.referenceCommonName,
    plantType: p.plantType,
    coverImageUrl: p.primaryImage?.storagePath
      ? (signed.get(p.primaryImage.storagePath) ?? null)
      : p.primaryImageUrl?.trim() || null,
    lifeStage: p.lifeStage,
    healthStatus: p.healthStatus,
    growthProgressPercent: p.growthProgressPercent,
    isFavorite: p.isFavorite,
    createdAt: p.createdAt.toISOString(),
    area: p.area,
    collection: p.collection ?? defaultCollection ?? { slug: "", name: "" },
  }));
}

export const getPlantCreateDependencies = cache(
  async (
    userId: string,
    collectionSlug: string,
  ): Promise<{
    collection: { id: string; name: string; slug: string };
    areas: PlantCreateAreaOption[];
  } | null> => {
    const membership = await prisma.collectionMember.findFirst({
      where: {
        userId,
        status: CollectionMemberStatus.active,
        collection: { slug: collectionSlug, archivedAt: null },
      },
      select: {
        collection: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
    if (!membership) return null;

    const areas = await prisma.area.findMany({
      where: {
        collectionId: membership.collection.id,
        archivedAt: null,
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, slug: true },
    });

    return { collection: membership.collection, areas };
  },
);

/** Collections that have at least one area — for global “add plant” flow. */
export type GlobalPlantCreateCollection = {
  slug: string;
  name: string;
};

export const getGlobalPlantCreateDependencies = cache(
  async (
    userId: string,
  ): Promise<{
    collections: GlobalPlantCreateCollection[];
    areasByCollectionSlug: Record<string, PlantCreateAreaOption[]>;
  } | null> => {
    const memberships = await prisma.collectionMember.findMany({
      where: {
        userId,
        status: CollectionMemberStatus.active,
        collection: { archivedAt: null },
      },
      orderBy: { joinedAt: "asc" },
      select: {
        collection: {
          select: {
            slug: true,
            name: true,
            areas: {
              where: { archivedAt: null },
              orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
    });

    const collections: GlobalPlantCreateCollection[] = [];
    const areasByCollectionSlug: Record<string, PlantCreateAreaOption[]> = {};

    for (const m of memberships) {
      const c = m.collection;
      if (c.areas.length === 0) continue;
      collections.push({ slug: c.slug, name: c.name });
      areasByCollectionSlug[c.slug] = c.areas.map((a) => ({
        id: a.id,
        name: a.name,
        slug: a.slug,
      }));
    }

    if (collections.length === 0) return null;

    return { collections, areasByCollectionSlug };
  },
);
