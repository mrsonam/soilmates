import { prisma } from "@/lib/prisma";
import { CollectionMemberStatus } from "@prisma/client";

/** Scoped JSON export for the signed-in user (collections they belong to). */
export async function buildUserDataExport(userId: string) {
  const memberships = await prisma.collectionMember.findMany({
    where: {
      userId,
      status: CollectionMemberStatus.active,
    },
    select: { collectionId: true },
  });
  const collectionIds = [...new Set(memberships.map((m) => m.collectionId))];
  if (collectionIds.length === 0) {
    return {
      exportVersion: 1 as const,
      exportedAt: new Date().toISOString(),
      app: "Soil Mates",
      collections: [] as unknown[],
    };
  }

  const collections = await prisma.collection.findMany({
    where: { id: { in: collectionIds } },
    orderBy: { name: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      createdAt: true,
      updatedAt: true,
      archivedAt: true,
    },
  });

  const out: unknown[] = [];

  for (const c of collections) {
    const [areas, plants, activityEvents] = await Promise.all([
      prisma.area.findMany({
        where: { collectionId: c.id },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          sortOrder: true,
          archivedAt: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.plant.findMany({
        where: { collectionId: c.id },
        orderBy: [{ nickname: "asc" }],
        select: {
          id: true,
          slug: true,
          nickname: true,
          referenceCommonName: true,
          plantType: true,
          lifeStage: true,
          healthStatus: true,
          acquisitionType: true,
          acquiredAt: true,
          notes: true,
          growthProgressPercent: true,
          isFavorite: true,
          archivedAt: true,
          createdAt: true,
          updatedAt: true,
          area: { select: { slug: true, name: true } },
          referenceSnapshot: true,
        },
      }),
      prisma.activityEvent.findMany({
        where: { collectionId: c.id },
        orderBy: { createdAt: "desc" },
        take: 500,
        select: {
          eventType: true,
          summary: true,
          createdAt: true,
        },
      }),
    ]);

    const plantsPayload = [];
    for (const p of plants) {
      const [careLogs, reminders, images, diagnoses] = await Promise.all([
        prisma.careLog.findMany({
          where: { plantId: p.id, deletedAt: null },
          orderBy: { actionAt: "desc" },
          take: 2000,
          select: {
            actionType: true,
            actionAt: true,
            notes: true,
            metadata: true,
            tags: true,
            createdAt: true,
            createdBy: {
              select: {
                fullName: true,
              },
            },
          },
        }),
        prisma.reminder.findMany({
          where: { plantId: p.id },
          orderBy: { createdAt: "desc" },
          select: {
            reminderType: true,
            title: true,
            description: true,
            recurrenceRule: true,
            nextDueAt: true,
            lastCompletedAt: true,
            isPaused: true,
            isActive: true,
            archivedAt: true,
            createdAt: true,
          },
        }),
        prisma.plantImage.findMany({
          where: { plantId: p.id, deletedAt: null },
          orderBy: { createdAt: "desc" },
          take: 500,
          select: {
            imageType: true,
            mimeType: true,
            fileSize: true,
            width: true,
            height: true,
            capturedAt: true,
            createdAt: true,
            metadata: true,
          },
        }),
        prisma.plantDiagnosis.findMany({
          where: { plantId: p.id },
          orderBy: { diagnosedAt: "desc" },
          take: 100,
          select: {
            status: true,
            summary: true,
            suspectedIssues: true,
            recommendations: true,
            safestNextSteps: true,
            diagnosedAt: true,
            resolvedAt: true,
            suggestedAiHealthStatus: true,
            createdAt: true,
          },
        }),
      ]);

      plantsPayload.push({
        id: p.id,
        slug: p.slug,
        nickname: p.nickname,
        referenceCommonName: p.referenceCommonName,
        plantType: p.plantType,
        lifeStage: p.lifeStage,
        healthStatus: p.healthStatus,
        acquisitionType: p.acquisitionType,
        acquiredAt: p.acquiredAt?.toISOString().slice(0, 10) ?? null,
        notes: p.notes,
        growthProgressPercent: p.growthProgressPercent,
        isFavorite: p.isFavorite,
        archivedAt: p.archivedAt?.toISOString() ?? null,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
        area: p.area,
        referenceSnapshot: p.referenceSnapshot,
        careLogs: careLogs.map((cl) => ({
          actionType: cl.actionType,
          actionAt: cl.actionAt.toISOString(),
          notes: cl.notes,
          metadata: cl.metadata,
          tags: cl.tags,
          createdAt: cl.createdAt.toISOString(),
          recordedBy: cl.createdBy.fullName?.trim() || "Member",
        })),
        reminders: reminders.map((r) => ({
          reminderType: r.reminderType,
          title: r.title,
          description: r.description,
          recurrenceRule: r.recurrenceRule,
          nextDueAt: r.nextDueAt.toISOString(),
          lastCompletedAt: r.lastCompletedAt?.toISOString() ?? null,
          isPaused: r.isPaused,
          isActive: r.isActive,
          archivedAt: r.archivedAt?.toISOString() ?? null,
          createdAt: r.createdAt.toISOString(),
        })),
        images: images.map((im) => ({
          imageType: im.imageType,
          mimeType: im.mimeType,
          fileSize: im.fileSize,
          width: im.width,
          height: im.height,
          capturedAt: im.capturedAt?.toISOString() ?? null,
          createdAt: im.createdAt.toISOString(),
          metadata: im.metadata,
        })),
        diagnoses: diagnoses.map((d) => ({
          status: d.status,
          summary: d.summary,
          suspectedIssues: d.suspectedIssues,
          recommendations: d.recommendations,
          safestNextSteps: d.safestNextSteps,
          diagnosedAt: d.diagnosedAt.toISOString(),
          resolvedAt: d.resolvedAt?.toISOString() ?? null,
          suggestedAiHealthStatus: d.suggestedAiHealthStatus,
          createdAt: d.createdAt.toISOString(),
        })),
      });
    }

    out.push({
      id: c.id,
      slug: c.slug,
      name: c.name,
      description: c.description,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      archivedAt: c.archivedAt?.toISOString() ?? null,
      areas: areas.map((a) => ({
        id: a.id,
        slug: a.slug,
        name: a.name,
        description: a.description,
        sortOrder: a.sortOrder,
        archivedAt: a.archivedAt?.toISOString() ?? null,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
      })),
      plants: plantsPayload,
      activityPreview: activityEvents.map((e) => ({
        eventType: e.eventType,
        summary: e.summary,
        createdAt: e.createdAt.toISOString(),
      })),
    });
  }

  return {
    exportVersion: 1 as const,
    exportedAt: new Date().toISOString(),
    app: "Soil Mates",
    collections: out,
  };
}
