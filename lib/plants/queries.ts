import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { CollectionMemberStatus } from "@prisma/client";

export type PlantListItem = {
  id: string;
  slug: string;
  nickname: string;
  referenceCommonName: string | null;
  plantType: string | null;
  primaryImageUrl: string | null;
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
    const plants: PlantListItem[] = rows.map((p) => ({
      id: p.id,
      slug: p.slug,
      nickname: p.nickname,
      referenceCommonName: p.referenceCommonName,
      plantType: p.plantType,
      primaryImageUrl: p.primaryImageUrl,
      lifeStage: p.lifeStage,
      healthStatus: p.healthStatus,
      growthProgressPercent: p.growthProgressPercent,
      isFavorite: p.isFavorite,
      createdAt: p.createdAt.toISOString(),
      area: p.area,
      collection: { slug: col.slug, name: col.name },
    }));

    return { collection: membership.collection, plants };
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

    return rows.map((p) => ({
      id: p.id,
      slug: p.slug,
      nickname: p.nickname,
      referenceCommonName: p.referenceCommonName,
      plantType: p.plantType,
      primaryImageUrl: p.primaryImageUrl,
      lifeStage: p.lifeStage,
      healthStatus: p.healthStatus,
      growthProgressPercent: p.growthProgressPercent,
      isFavorite: p.isFavorite,
      createdAt: p.createdAt.toISOString(),
      area: p.area,
      collection: p.collection,
    }));
  },
);

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
