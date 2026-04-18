import { prisma } from "@/lib/prisma";
import { CollectionMemberStatus } from "@prisma/client";
import {
  createSignedUrlsForPaths,
  isSupabaseStorageConfigured,
} from "@/lib/supabase/admin";

const activeMemberWhere = {
  status: "active" as const,
  collection: { archivedAt: null },
};

/** Active memberships for dashboard / routing. */
export async function getActiveMembershipsForUser(userId: string) {
  return prisma.collectionMember.findMany({
    where: {
      userId,
      ...activeMemberWhere,
    },
    orderBy: { joinedAt: "asc" },
    select: {
      collection: {
        select: { id: true, slug: true, name: true },
      },
    },
  });
}

export async function userHasActiveCollection(userId: string): Promise<boolean> {
  const n = await prisma.collectionMember.count({
    where: { userId, ...activeMemberWhere },
  });
  return n > 0;
}

/** First collection slug (stable default home). */
export async function getFirstCollectionSlugForUser(
  userId: string,
): Promise<string | null> {
  const row = await prisma.collectionMember.findFirst({
    where: { userId, ...activeMemberWhere },
    orderBy: { joinedAt: "asc" },
    select: { collection: { select: { slug: true } } },
  });
  return row?.collection.slug ?? null;
}

export async function assertUserCanAccessCollection(
  userId: string,
  collectionSlug: string,
) {
  const row = await prisma.collectionMember.findFirst({
    where: {
      userId,
      status: "active",
      collection: { slug: collectionSlug, archivedAt: null },
    },
    select: {
      collection: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          createdAt: true,
        },
      },
    },
  });
  return row?.collection ?? null;
}

export type CollectionWithStats = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
  memberCount: number;
  plantCount: number;
  areaCount: number;
  /** Signed URL for collection cover when storage is configured. */
  coverImageSignedUrl: string | null;
};

/** Active, non-archived collections the user belongs to, with aggregate stats. */
export async function getCollectionsWithStatsForUser(
  userId: string,
): Promise<CollectionWithStats[]> {
  const memberships = await prisma.collectionMember.findMany({
    where: { userId, ...activeMemberWhere },
    select: { collectionId: true },
  });
  const ids = [...new Set(memberships.map((m) => m.collectionId))];
  if (ids.length === 0) return [];

  const collections = await prisma.collection.findMany({
    where: { id: { in: ids }, archivedAt: null },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      createdAt: true,
      coverImageStoragePath: true,
      coverImagePublicUrl: true,
    },
  });

  const memberCounts = await prisma.collectionMember.groupBy({
    by: ["collectionId"],
    where: {
      collectionId: { in: ids },
      status: CollectionMemberStatus.active,
    },
    _count: { _all: true },
  });
  const memberCountByCollection = Object.fromEntries(
    memberCounts.map((c) => [c.collectionId, c._count._all]),
  );

  const areaRows = await prisma.area.findMany({
    where: { collectionId: { in: ids }, archivedAt: null },
    select: { id: true, collectionId: true },
  });
  const areaCountByCollection: Record<string, number> = {};
  for (const a of areaRows) {
    areaCountByCollection[a.collectionId] =
      (areaCountByCollection[a.collectionId] ?? 0) + 1;
  }

  const plantGroups = await prisma.plant.groupBy({
    by: ["collectionId"],
    where: { archivedAt: null, collectionId: { in: ids } },
    _count: { _all: true },
  });
  const plantCountByCollection = Object.fromEntries(
    plantGroups.map((g) => [g.collectionId, g._count._all]),
  );

  const pathsToSign = collections
    .map((c) => c.coverImageStoragePath)
    .filter((p): p is string => Boolean(p));
  const signed =
    isSupabaseStorageConfigured() && pathsToSign.length > 0
      ? await createSignedUrlsForPaths(pathsToSign)
      : new Map<string, string>();

  return collections.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    createdAt: c.createdAt,
    memberCount: memberCountByCollection[c.id] ?? 0,
    plantCount: plantCountByCollection[c.id] ?? 0,
    areaCount: areaCountByCollection[c.id] ?? 0,
    coverImageSignedUrl: c.coverImageStoragePath
      ? (signed.get(c.coverImageStoragePath) ?? null)
      : c.coverImagePublicUrl?.trim() || null,
  }));
}
