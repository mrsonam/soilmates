import { prisma } from "@/lib/prisma";
import { AiThreadType, CollectionMemberStatus } from "@prisma/client";
import { getCollectionIdForActiveMember } from "@/lib/collections/access";

export async function assertUserOwnsThread(userId: string, threadId: string) {
  const row = await prisma.aiThread.findFirst({
    where: {
      id: threadId,
      createdById: userId,
      archivedAt: null,
    },
    select: {
      id: true,
      threadType: true,
      collectionId: true,
      plantId: true,
      plant: {
        select: {
          id: true,
          collectionId: true,
          archivedAt: true,
        },
      },
      collection: {
        select: { id: true, archivedAt: true },
      },
    },
  });
  if (!row) return null;

  if (row.collectionId) {
    const member = await prisma.collectionMember.findFirst({
      where: {
        userId,
        status: CollectionMemberStatus.active,
        collectionId: row.collectionId,
        collection: { archivedAt: null },
      },
      select: { id: true },
    });
    if (!member) return null;
  }

  if (row.threadType === "plant" && row.plantId) {
    if (row.plant?.archivedAt) return null;
    if (row.plant?.collectionId) {
      const member = await prisma.collectionMember.findFirst({
        where: {
          userId,
          status: CollectionMemberStatus.active,
          collectionId: row.plant.collectionId,
          collection: { archivedAt: null },
        },
        select: { id: true },
      });
      if (!member) return null;
    }
  }

  return row;
}

export async function getGlobalThreadsForUser(userId: string) {
  return prisma.aiThread.findMany({
    where: {
      createdById: userId,
      threadType: AiThreadType.global,
      archivedAt: null,
    },
    orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
    take: 50,
    select: {
      id: true,
      title: true,
      lastMessageAt: true,
      createdAt: true,
    },
  });
}

export async function getOrCreatePlantThread(
  userId: string,
  collectionId: string,
  plantId: string,
) {
  const existing = await prisma.aiThread.findFirst({
    where: {
      createdById: userId,
      threadType: AiThreadType.plant,
      plantId,
      archivedAt: null,
    },
    select: { id: true },
  });
  if (existing) return existing.id;

  const created = await prisma.aiThread.create({
    data: {
      collectionId,
      plantId,
      createdById: userId,
      threadType: AiThreadType.plant,
      title: null,
    },
    select: { id: true },
  });
  return created.id;
}

export async function createGlobalThread(userId: string, title?: string | null) {
  const row = await prisma.aiThread.create({
    data: {
      createdById: userId,
      threadType: AiThreadType.global,
      collectionId: null,
      plantId: null,
      title: title?.trim() || null,
    },
    select: {
      id: true,
      title: true,
      lastMessageAt: true,
      createdAt: true,
    },
  });
  return row;
}

export async function getThreadMessages(threadId: string) {
  return prisma.aiMessage.findMany({
    where: { threadId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      role: true,
      content: true,
      createdAt: true,
    },
  });
}

/** For plant detail RSC: resolve or create the canonical plant thread. */
export async function getPlantAssistantThreadId(
  userId: string,
  collectionSlug: string,
  plantSlug: string,
): Promise<string | null> {
  const collectionId = await getCollectionIdForActiveMember(
    userId,
    collectionSlug,
  );
  if (!collectionId) return null;

  const plant = await prisma.plant.findFirst({
    where: {
      collectionId,
      slug: plantSlug,
      archivedAt: null,
    },
    select: { id: true },
  });
  if (!plant) return null;

  return getOrCreatePlantThread(userId, collectionId, plant.id);
}
