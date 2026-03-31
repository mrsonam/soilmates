import { prisma } from "@/lib/prisma";
import { CollectionMemberStatus } from "@prisma/client";
import type { GlobalAssistantContextJson, PlantAssistantContextJson } from "./types";
import { getPlantDetailBySlugs } from "@/lib/plants/plant-detail";

export async function buildGlobalAssistantContext(
  userId: string,
  options?: { collectionSlug?: string | null },
): Promise<GlobalAssistantContextJson> {
  let collectionName: string | null = null;
  let collectionSlug: string | null = null;

  if (options?.collectionSlug?.trim()) {
    const slug = options.collectionSlug.trim();
    const m = await prisma.collectionMember.findFirst({
      where: {
        userId,
        status: CollectionMemberStatus.active,
        collection: { slug, archivedAt: null },
      },
      select: { collection: { select: { name: true, slug: true } } },
    });
    if (m) {
      collectionName = m.collection.name;
      collectionSlug = m.collection.slug;
    }
  }

  return {
    mode: "global",
    userProfileId: userId,
    collectionSlug,
    collectionName,
    assembledAt: new Date().toISOString(),
  };
}

export async function buildPlantAssistantContext(
  userId: string,
  collectionSlug: string,
  plantSlug: string,
): Promise<PlantAssistantContextJson | null> {
  const plant = await getPlantDetailBySlugs(userId, collectionSlug, plantSlug);
  if (!plant) return null;

  const [careLogs, reminders, images, activity] = await Promise.all([
    prisma.careLog.findMany({
      where: { plantId: plant.id, deletedAt: null },
      orderBy: { actionAt: "desc" },
      take: 12,
      select: {
        actionType: true,
        actionAt: true,
        notes: true,
      },
    }),
    prisma.reminder.findMany({
      where: { plantId: plant.id, archivedAt: null, isActive: true },
      orderBy: { nextDueAt: "asc" },
      take: 12,
      select: {
        title: true,
        reminderType: true,
        nextDueAt: true,
        isPaused: true,
      },
    }),
    prisma.plantImage.findMany({
      where: { plantId: plant.id, deletedAt: null },
      orderBy: [{ capturedAt: "desc" }, { createdAt: "desc" }],
      take: 8,
      select: {
        imageType: true,
        capturedAt: true,
        createdAt: true,
      },
    }),
    prisma.activityEvent.findMany({
      where: { plantId: plant.id },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { eventType: true, summary: true, createdAt: true },
    }),
  ]);

  return {
    mode: "plant",
    userProfileId: userId,
    plant: {
      id: plant.id,
      nickname: plant.nickname,
      slug: plant.slug,
      referenceCommonName: plant.referenceCommonName,
      plantType: plant.plantType,
      lifeStage: plant.lifeStage,
      healthStatus: plant.healthStatus,
      acquisitionType: plant.acquisitionType,
      acquiredAt: plant.acquiredAt,
      notes: plant.notes,
      isFavorite: plant.isFavorite,
      growthProgressPercent: plant.growthProgressPercent,
      area: plant.area,
      collection: plant.collection,
      counts: plant.counts,
    },
    recentCareLogs: careLogs.map((c) => ({
      actionType: String(c.actionType),
      actionAt: c.actionAt.toISOString(),
      notes: c.notes,
    })),
    activeReminders: reminders.map((r) => ({
      title: r.title,
      reminderType: String(r.reminderType),
      nextDueAt: r.nextDueAt.toISOString(),
      isPaused: r.isPaused,
    })),
    recentImages: images.map((i) => ({
      imageType: String(i.imageType),
      capturedAt: i.capturedAt?.toISOString() ?? null,
      createdAt: i.createdAt.toISOString(),
    })),
    recentActivity: activity.map((a) => ({
      eventType: a.eventType,
      summary: a.summary,
      createdAt: a.createdAt.toISOString(),
    })),
    assembledAt: new Date().toISOString(),
  };
}
