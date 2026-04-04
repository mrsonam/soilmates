import { CollectionMemberStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type PushPrerequisites = {
  collectionCount: number;
  plantCount: number;
  reminderCount: number;
  eligibleForPrompt: boolean;
};

export async function getPushPrerequisites(
  userId: string,
): Promise<PushPrerequisites> {
  const collectionCount = await prisma.collectionMember.count({
    where: {
      userId,
      status: CollectionMemberStatus.active,
      collection: { archivedAt: null },
    },
  });

  const plantCount = await prisma.plant.count({
    where: {
      archivedAt: null,
      collection: {
        archivedAt: null,
        members: {
          some: { userId, status: CollectionMemberStatus.active },
        },
      },
    },
  });

  const reminderCount = await prisma.reminder.count({
    where: {
      archivedAt: null,
      isActive: true,
      collection: {
        archivedAt: null,
        members: {
          some: { userId, status: CollectionMemberStatus.active },
        },
      },
      plant: { archivedAt: null },
    },
  });

  const eligibleForPrompt =
    collectionCount > 0 && plantCount > 0 && reminderCount > 0;

  return {
    collectionCount,
    plantCount,
    reminderCount,
    eligibleForPrompt,
  };
}
