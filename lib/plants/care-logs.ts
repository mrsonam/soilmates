import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getCollectionIdForActiveMember } from "@/lib/collections/access";

export type CareLogListItem = {
  id: string;
  actionType: string;
  actionAt: string;
  notes: string | null;
  metadata: Record<string, unknown>;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdById: string;
  creator: {
    displayName: string;
    avatarUrl: string | null;
  };
  imageAttachmentCount: number;
};

/**
 * Active care logs for a plant (newest first). Null if user cannot access plant.
 */
export const getPlantCareLogs = cache(
  async (
    userId: string,
    collectionSlug: string,
    plantSlug: string,
  ): Promise<CareLogListItem[] | null> => {
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

    const rows = await prisma.careLog.findMany({
      where: { plantId: plant.id, deletedAt: null },
      orderBy: { actionAt: "desc" },
      include: {
        createdBy: {
          select: { fullName: true, email: true, avatarUrl: true },
        },
      },
    });

    return rows.map((r) => {
      const meta =
        r.metadata && typeof r.metadata === "object" && !Array.isArray(r.metadata)
          ? (r.metadata as Record<string, unknown>)
          : {};
      return {
        id: r.id,
        actionType: r.actionType,
        actionAt: r.actionAt.toISOString(),
        notes: r.notes,
        metadata: meta,
        tags: [...r.tags],
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
        createdById: r.createdById,
        creator: {
          displayName:
            r.createdBy.fullName?.trim() ||
            r.createdBy.email.split("@")[0] ||
            "Member",
          avatarUrl: r.createdBy.avatarUrl,
        },
        imageAttachmentCount: 0,
      };
    });
  },
);
