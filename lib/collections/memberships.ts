import { prisma } from "@/lib/prisma";

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
      collection: { select: { id: true, name: true, slug: true } },
    },
  });
  return row?.collection ?? null;
}
