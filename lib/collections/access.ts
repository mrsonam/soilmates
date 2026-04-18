import { prisma } from "@/lib/prisma";
import { CollectionMemberStatus } from "@prisma/client";
import { createSignedUrlForStoragePath } from "@/lib/supabase/admin";

/** Collection id if the user is an active member of a non-archived collection. */
export async function getCollectionIdForActiveMember(
  userId: string,
  collectionSlug: string,
): Promise<string | null> {
  const row = await prisma.collectionMember.findFirst({
    where: {
      userId,
      status: CollectionMemberStatus.active,
      collection: { slug: collectionSlug, archivedAt: null },
    },
    select: { collectionId: true },
  });
  return row?.collectionId ?? null;
}

/**
 * Active membership for a collection slug, including when the collection is archived
 * (read-only / restore flows).
 */
export async function getMembershipForCollectionSlug(
  userId: string,
  collectionSlug: string,
): Promise<{
  collectionId: string;
  collection: {
    id: string;
    name: string;
    slug: string;
    archivedAt: Date | null;
  };
} | null> {
  const row = await prisma.collectionMember.findFirst({
    where: {
      userId,
      status: CollectionMemberStatus.active,
      collection: { slug: collectionSlug },
    },
    select: {
      collectionId: true,
      collection: {
        select: {
          id: true,
          name: true,
          slug: true,
          archivedAt: true,
        },
      },
    },
  });
  if (!row) return null;
  return {
    collectionId: row.collectionId,
    collection: row.collection,
  };
}

/** Area row if it belongs to the collection the user can access. */
export async function getAreaForActiveMember(
  userId: string,
  collectionSlug: string,
  areaId: string,
) {
  const collectionId = await getCollectionIdForActiveMember(
    userId,
    collectionSlug,
  );
  if (!collectionId) return null;

  return prisma.area.findFirst({
    where: {
      id: areaId,
      collectionId,
      archivedAt: null,
    },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      sortOrder: true,
    },
  });
}

export async function getAreaForActiveMemberBySlugs(
  userId: string,
  collectionSlug: string,
  areaSlug: string,
) {
  const collectionId = await getCollectionIdForActiveMember(
    userId,
    collectionSlug,
  );
  if (!collectionId) return null;

  const row = await prisma.area.findFirst({
    where: {
      collectionId,
      slug: areaSlug,
      archivedAt: null,
    },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      sortOrder: true,
      createdAt: true,
      coverImageStoragePath: true,
      coverImagePublicUrl: true,
      _count: {
        select: {
          plants: { where: { archivedAt: null } },
        },
      },
    },
  });
  if (!row) return null;

  const coverImageSignedUrl = row.coverImageStoragePath
    ? await createSignedUrlForStoragePath(row.coverImageStoragePath)
    : row.coverImagePublicUrl?.trim() || null;

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
    _count: row._count,
    coverImageSignedUrl,
  };
}
