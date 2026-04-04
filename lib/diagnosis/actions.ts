"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  AiMessageRole,
  PlantDiagnosisCreatorType,
  PlantDiagnosisStatus,
  PlantHealthStatus,
} from "@prisma/client";
import { getOrCreatePlantThread } from "@/lib/ai/queries";
import { getCollectionIdForActiveMember } from "@/lib/collections/access";
import { createActivityEvent } from "@/lib/activity/create-event";
import { ActivityEventTypes } from "@/lib/activity/event-types";
import { downloadPlantImageFromStorage } from "@/lib/supabase/admin";
import { buildDiagnosisContext } from "./context";
import { createDiagnosisInputSchema } from "./schemas";
import { generatePlantDiagnosisVision } from "./provider";
import { formatDiagnosisAssistantMessage } from "./format-assistant";
import type { DiagnosisAiOutput } from "./schemas";

export type CreatePlantDiagnosisResult =
  | {
      ok: true;
      diagnosisId: string;
      assistantMessageId: string;
    }
  | { ok: false; error: string };

export async function createPlantDiagnosisAction(
  raw: unknown,
): Promise<CreatePlantDiagnosisResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Unauthorized" };
  }

  const parsed = createDiagnosisInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Invalid request" };
  }

  const { collectionSlug, plantSlug, imageIds, userConcern, threadId } =
    parsed.data;
  const userId = session.user.id;

  const collectionId = await getCollectionIdForActiveMember(
    userId,
    collectionSlug,
  );
  if (!collectionId) {
    return { ok: false, error: "Collection not found" };
  }

  const plant = await prisma.plant.findFirst({
    where: {
      collectionId,
      slug: plantSlug,
      archivedAt: null,
    },
    select: {
      id: true,
      nickname: true,
      collectionId: true,
    },
  });
  if (!plant) {
    return { ok: false, error: "Plant not found" };
  }

  const canonicalThreadId = await getOrCreatePlantThread(
    userId,
    collectionId,
    plant.id,
  );

  if (threadId && threadId !== canonicalThreadId) {
    return { ok: false, error: "Thread does not match this plant" };
  }

  const images = await prisma.plantImage.findMany({
    where: {
      id: { in: imageIds },
      plantId: plant.id,
      collectionId,
      deletedAt: null,
    },
    select: { id: true, storagePath: true, mimeType: true },
  });

  if (images.length !== imageIds.length) {
    return { ok: false, error: "One or more images are invalid for this plant" };
  }

  const ctx = await buildDiagnosisContext(
    userId,
    collectionSlug,
    plantSlug,
    imageIds,
  );
  if (!ctx) {
    return { ok: false, error: "Could not build diagnosis context" };
  }

  const buffers: Array<{ buffer: ArrayBuffer; contentType: string }> = [];
  for (const im of images) {
    const dl = await downloadPlantImageFromStorage(im.storagePath);
    if (!dl) {
      return {
        ok: false,
        error: "Could not load an image from storage. Try again shortly.",
      };
    }
    buffers.push({
      buffer: dl.buffer,
      contentType: im.mimeType || dl.contentType,
    });
  }

  const aiOut: DiagnosisAiOutput = await generatePlantDiagnosisVision({
    contextBundle: ctx,
    plantNickname: plant.nickname,
    userConcern: userConcern?.trim() ?? null,
    images: buffers,
  });

  const assistantText = formatDiagnosisAssistantMessage(aiOut);
  const now = new Date();

  try {
    const result = await prisma.$transaction(async (tx) => {
      const previous = await tx.plantDiagnosis.findFirst({
        where: {
          plantId: plant.id,
          status: PlantDiagnosisStatus.active,
        },
        select: { id: true },
      });

      const newRow = await tx.plantDiagnosis.create({
        data: {
          collectionId: plant.collectionId,
          plantId: plant.id,
          basedOnThreadId: canonicalThreadId,
          status: PlantDiagnosisStatus.active,
          summary: aiOut.summary,
          suspectedIssues: aiOut.suspected_issues,
          confidence: aiOut.confidence
            ? (aiOut.confidence as object)
            : undefined,
          recommendations: aiOut.recommendations,
          safestNextSteps: aiOut.safest_next_steps,
          followUpQuestions: aiOut.follow_up_questions,
          reasoningNotes: aiOut.reasoning_notes ?? null,
          observedEvidence: aiOut.observed_evidence?.length
            ? aiOut.observed_evidence
            : undefined,
          monitorNext: aiOut.monitor_next?.length ? aiOut.monitor_next : undefined,
          whenToRecheck: aiOut.when_to_recheck?.trim() ?? null,
          diagnosedAt: now,
          createdByType: PlantDiagnosisCreatorType.ai,
          createdById: userId,
          supersedesDiagnosisId: previous?.id ?? null,
          suggestedAiHealthStatus: aiOut.suggested_ai_health_status
            ? aiOut.suggested_ai_health_status === "thriving"
              ? PlantHealthStatus.thriving
              : PlantHealthStatus.needs_attention
            : null,
          sourceImageIds: imageIds,
        },
        select: { id: true },
      });

      if (previous) {
        await tx.plantDiagnosis.update({
          where: { id: previous.id },
          data: { status: PlantDiagnosisStatus.superseded },
        });
      }

      if (aiOut.suggested_ai_health_status) {
        await tx.plant.update({
          where: { id: plant.id },
          data: {
            aiHealthStatus:
              aiOut.suggested_ai_health_status === "thriving"
                ? PlantHealthStatus.thriving
                : PlantHealthStatus.needs_attention,
          },
        });
      }

      const userLine = [
        `Plant diagnosis using ${imageIds.length} photo(s).`,
        userConcern?.trim() ? `\n\nWhat I'm concerned about: ${userConcern.trim()}` : "",
      ].join("");

      await tx.aiMessage.create({
        data: {
          threadId: canonicalThreadId,
          role: AiMessageRole.user,
          content: userLine,
          createdById: userId,
        },
      });

      const assistantMsg = await tx.aiMessage.create({
        data: {
          threadId: canonicalThreadId,
          role: AiMessageRole.assistant,
          content: assistantText,
          relatedDiagnosisId: newRow.id,
          contextSnapshot: {
            mode: "diagnosis",
            diagnosisStructured: aiOut,
            assembledAt: now.toISOString(),
          } as object,
        },
      });

      await tx.aiThread.update({
        where: { id: canonicalThreadId },
        data: { lastMessageAt: now },
      });

      return { diagnosisId: newRow.id, assistantMessageId: assistantMsg.id };
    });

    await createActivityEvent({
      collectionId: plant.collectionId,
      plantId: plant.id,
      actorUserId: userId,
      eventType: ActivityEventTypes.plantDiagnosisCreated,
      summary: `Recorded an AI diagnosis review for ${plant.nickname}`,
      payload: { diagnosisId: result.diagnosisId },
    });

    revalidatePath(`/collections/${collectionSlug}/plants/${plantSlug}`);
    revalidatePath(
      `/collections/${collectionSlug}/plants/${plantSlug}/diagnosis`,
    );

    return { ok: true, ...result };
  } catch (e) {
    console.error("[createPlantDiagnosisAction]", e);
    const msg = e instanceof Error ? e.message : "Could not save diagnosis";
    return { ok: false, error: msg.slice(0, 400) };
  }
}

export type ResolvePlantDiagnosisResult =
  | { ok: true }
  | { ok: false; error: string };

export async function resolvePlantDiagnosisAction(input: {
  collectionSlug: string;
  plantSlug: string;
  diagnosisId: string;
}): Promise<ResolvePlantDiagnosisResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Unauthorized" };
  }

  const collectionId = await getCollectionIdForActiveMember(
    session.user.id,
    input.collectionSlug,
  );
  if (!collectionId) {
    return { ok: false, error: "Collection not found" };
  }

  const plant = await prisma.plant.findFirst({
    where: {
      collectionId,
      slug: input.plantSlug,
      archivedAt: null,
    },
    select: { id: true },
  });
  if (!plant) {
    return { ok: false, error: "Plant not found" };
  }

  const row = await prisma.plantDiagnosis.findFirst({
    where: {
      id: input.diagnosisId,
      plantId: plant.id,
      collectionId,
    },
  });
  if (!row) {
    return { ok: false, error: "Diagnosis not found" };
  }

  await prisma.plantDiagnosis.update({
    where: { id: row.id },
    data: {
      status: PlantDiagnosisStatus.resolved,
      resolvedAt: new Date(),
    },
  });

  revalidatePath(
    `/collections/${input.collectionSlug}/plants/${input.plantSlug}`,
  );
  revalidatePath(
    `/collections/${input.collectionSlug}/plants/${input.plantSlug}/diagnosis`,
  );

  return { ok: true };
}
