import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getMembershipForCollectionSlug } from "@/lib/collections/access";
import {
  CollectionMemberStatus,
  PlantDiagnosisStatus,
  type Prisma,
} from "@prisma/client";
import {
  createSignedUrlsForPaths,
  isSupabaseStorageConfigured,
} from "@/lib/supabase/admin";

export type DiagnosisHistoryItem = {
  id: string;
  status: PlantDiagnosisStatus;
  summary: string;
  suspectedIssues: string[];
  confidence: Prisma.JsonValue | null;
  recommendations: string[];
  safestNextSteps: string[];
  followUpQuestions: string[];
  reasoningNotes: string | null;
  observedEvidence: string[];
  monitorNext: string[];
  whenToRecheck: string | null;
  diagnosedAt: string;
  resolvedAt: string | null;
  suggestedAiHealthStatus: string | null;
  sourceImageIds: string[];
  imageThumbs: Array<{ id: string; signedUrl: string | null }>;
  basedOnThreadId: string | null;
};

function parseStringArray(v: Prisma.JsonValue | null | undefined): string[] {
  if (!v || !Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string");
}

export const getPlantDiagnosisHistoryForMember = cache(
  async (
    userId: string,
    collectionSlug: string,
    plantSlug: string,
  ): Promise<{
    active: DiagnosisHistoryItem | null;
    history: DiagnosisHistoryItem[];
  } | null> => {
    const membership = await getMembershipForCollectionSlug(
      userId,
      collectionSlug,
    );
    if (!membership) return null;

    const plant = await prisma.plant.findFirst({
      where: {
        collectionId: membership.collectionId,
        slug: plantSlug,
      },
      select: { id: true },
    });
    if (!plant) return null;

    const rows = await prisma.plantDiagnosis.findMany({
      where: { plantId: plant.id },
      orderBy: { diagnosedAt: "desc" },
      take: 40,
      select: {
        id: true,
        status: true,
        summary: true,
        suspectedIssues: true,
        confidence: true,
        recommendations: true,
        safestNextSteps: true,
        followUpQuestions: true,
        reasoningNotes: true,
        observedEvidence: true,
        monitorNext: true,
        whenToRecheck: true,
        diagnosedAt: true,
        resolvedAt: true,
        suggestedAiHealthStatus: true,
        sourceImageIds: true,
        basedOnThreadId: true,
      },
    });

    const allImageIds = new Set<string>();
    for (const r of rows) {
      const ids = parseStringArray(r.sourceImageIds);
      for (const id of ids) allImageIds.add(id);
    }

    const imageRows =
      allImageIds.size > 0
        ? await prisma.plantImage.findMany({
            where: {
              id: { in: [...allImageIds] },
              plantId: plant.id,
              deletedAt: null,
            },
            select: { id: true, storagePath: true },
          })
        : [];

    const pathById = new Map(imageRows.map((i) => [i.id, i.storagePath]));
    const paths = imageRows.map((i) => i.storagePath);
    const signed =
      isSupabaseStorageConfigured() && paths.length > 0
        ? await createSignedUrlsForPaths(paths)
        : new Map<string, string>();

    function thumbsForRow(sourceImageIds: Prisma.JsonValue): Array<{
      id: string;
      signedUrl: string | null;
    }> {
      const ids = parseStringArray(sourceImageIds);
      return ids.map((id) => {
        const p = pathById.get(id);
        const url = p ? signed.get(p) ?? null : null;
        return { id, signedUrl: url };
      });
    }

    const mapped: DiagnosisHistoryItem[] = rows.map((r) => ({
      id: r.id,
      status: r.status,
      summary: r.summary,
      suspectedIssues: parseStringArray(r.suspectedIssues),
      confidence: r.confidence,
      recommendations: parseStringArray(r.recommendations),
      safestNextSteps: parseStringArray(r.safestNextSteps),
      followUpQuestions: parseStringArray(r.followUpQuestions),
      reasoningNotes: r.reasoningNotes,
      observedEvidence: parseStringArray(r.observedEvidence),
      monitorNext: parseStringArray(r.monitorNext),
      whenToRecheck: r.whenToRecheck,
      diagnosedAt: r.diagnosedAt.toISOString(),
      resolvedAt: r.resolvedAt?.toISOString() ?? null,
      suggestedAiHealthStatus: r.suggestedAiHealthStatus
        ? String(r.suggestedAiHealthStatus)
        : null,
      sourceImageIds: parseStringArray(r.sourceImageIds),
      imageThumbs: thumbsForRow(r.sourceImageIds),
      basedOnThreadId: r.basedOnThreadId,
    }));

    const active =
      mapped.find((m) => m.status === PlantDiagnosisStatus.active) ?? null;

    return { active, history: mapped };
  },
);

export type DiagnosisImageThumb = { id: string; signedUrl: string | null };

/**
 * Signed thumbnails for specific diagnoses (e.g. assistant chat messages with
 * `relatedDiagnosisId`). Returns only diagnoses that belong to this plant and member.
 */
export async function getDiagnosisImageThumbsBatch(
  userId: string,
  collectionSlug: string,
  plantSlug: string,
  diagnosisIds: string[],
): Promise<Map<string, DiagnosisImageThumb[]>> {
  const out = new Map<string, DiagnosisImageThumb[]>();
  const unique = [...new Set(diagnosisIds)].filter(Boolean);
  if (unique.length === 0) return out;

  const membership = await prisma.collectionMember.findFirst({
    where: {
      userId,
      status: CollectionMemberStatus.active,
      collection: { slug: collectionSlug, archivedAt: null },
    },
    select: { collectionId: true },
  });
  if (!membership) return out;

  const plant = await prisma.plant.findFirst({
    where: {
      collectionId: membership.collectionId,
      slug: plantSlug,
      archivedAt: null,
    },
    select: { id: true },
  });
  if (!plant) return out;

  const diagnoses = await prisma.plantDiagnosis.findMany({
    where: {
      id: { in: unique },
      plantId: plant.id,
    },
    select: { id: true, sourceImageIds: true },
  });

  const allImageIds = new Set<string>();
  for (const d of diagnoses) {
    for (const id of parseStringArray(d.sourceImageIds)) {
      allImageIds.add(id);
    }
  }

  const imageRows =
    allImageIds.size > 0
      ? await prisma.plantImage.findMany({
          where: {
            id: { in: [...allImageIds] },
            plantId: plant.id,
            deletedAt: null,
          },
          select: { id: true, storagePath: true },
        })
      : [];

  const pathById = new Map(imageRows.map((i) => [i.id, i.storagePath]));
  const paths = imageRows.map((i) => i.storagePath);
  const signed =
    isSupabaseStorageConfigured() && paths.length > 0
      ? await createSignedUrlsForPaths(paths)
      : new Map<string, string>();

  function thumbsForRow(sourceImageIds: Prisma.JsonValue): DiagnosisImageThumb[] {
    const ids = parseStringArray(sourceImageIds);
    return ids.map((id) => {
      const p = pathById.get(id);
      const url = p ? signed.get(p) ?? null : null;
      return { id, signedUrl: url };
    });
  }

  for (const d of diagnoses) {
    out.set(d.id, thumbsForRow(d.sourceImageIds));
  }
  return out;
}
