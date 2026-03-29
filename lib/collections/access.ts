import { prisma } from "@/lib/prisma";
import { CollectionMemberStatus } from "@prisma/client";

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

  return prisma.area.findFirst({
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
      _count: {
        select: {
          plants: { where: { archivedAt: null } },
        },
      },
    },
  });
}
