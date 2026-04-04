import { prisma } from "@/lib/prisma";
import { CollectionMemberStatus } from "@prisma/client";
import { buildPlantAssistantContext } from "@/lib/ai/context-builders";
import { getPlantDetailBySlugs } from "@/lib/plants/plant-detail";

export type DiagnosisContextBundle = {
  plantAssistantJson: Record<string, unknown>;
  referenceSnapshot: unknown;
  priorDiagnoses: Array<{
    id: string;
    diagnosedAt: string;
    summary: string;
    status: string;
  }>;
  selectedImages: Array<{
    id: string;
    imageType: string;
    capturedAt: string | null;
    createdAt: string;
  }>;
  assembledAt: string;
};

/**
 * Rich context for diagnosis: plant assistant snapshot + reference + prior diagnoses + selected images.
 */
export async function buildDiagnosisContext(
  userId: string,
  collectionSlug: string,
  plantSlug: string,
  selectedImageIds: string[],
): Promise<DiagnosisContextBundle | null> {
  const membership = await prisma.collectionMember.findFirst({
    where: {
      userId,
      status: CollectionMemberStatus.active,
      collection: { slug: collectionSlug, archivedAt: null },
    },
    select: { collectionId: true },
  });
  if (!membership) return null;

  const plantRow = await prisma.plant.findFirst({
    where: {
      collectionId: membership.collectionId,
      slug: plantSlug,
      archivedAt: null,
    },
    select: { id: true, referenceSnapshot: true },
  });
  if (!plantRow) return null;

  const [baseCtx, detail, rawSelected, prior] = await Promise.all([
    buildPlantAssistantContext(userId, collectionSlug, plantSlug),
    getPlantDetailBySlugs(userId, collectionSlug, plantSlug),
    prisma.plantImage.findMany({
      where: {
        id: { in: selectedImageIds },
        plantId: plantRow.id,
        deletedAt: null,
      },
      select: {
        id: true,
        imageType: true,
        capturedAt: true,
        createdAt: true,
      },
    }),
    prisma.plantDiagnosis.findMany({
      where: { plantId: plantRow.id },
      orderBy: { diagnosedAt: "desc" },
      take: 4,
      select: {
        id: true,
        diagnosedAt: true,
        summary: true,
        status: true,
      },
    }),
  ]);

  if (!baseCtx || !detail) return null;

  const byImg = new Map(rawSelected.map((r) => [r.id, r]));
  const selectedRows = selectedImageIds
    .map((id) => byImg.get(id))
    .filter((x): x is NonNullable<typeof x> => Boolean(x));
  if (selectedRows.length !== selectedImageIds.length) return null;

  const plantAssistantJson = {
    ...baseCtx,
    priorDiagnoses: prior.map((d) => ({
      id: d.id,
      diagnosedAt: d.diagnosedAt.toISOString(),
      summary: d.summary.slice(0, 400),
      status: d.status,
    })),
  } as unknown as Record<string, unknown>;

  return {
    plantAssistantJson,
    referenceSnapshot: detail.referenceSnapshot,
    priorDiagnoses: prior.map((d) => ({
      id: d.id,
      diagnosedAt: d.diagnosedAt.toISOString(),
      summary: d.summary,
      status: d.status,
    })),
    selectedImages: selectedRows.map((i) => ({
      id: i.id,
      imageType: String(i.imageType),
      capturedAt: i.capturedAt?.toISOString() ?? null,
      createdAt: i.createdAt.toISOString(),
    })),
    assembledAt: new Date().toISOString(),
  };
}
