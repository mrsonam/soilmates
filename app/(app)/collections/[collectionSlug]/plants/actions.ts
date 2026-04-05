"use server";

import { randomUUID } from "crypto";
import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCollectionIdForActiveMember } from "@/lib/collections/access";
import { attachCoverImageForNewPlant } from "@/lib/plants/attach-cover-for-new-plant";
import { resolveUniquePlantSlug } from "@/lib/plants/slug";
import { isSupabaseStorageConfigured } from "@/lib/supabase/admin";
import { createPlantSchema } from "@/lib/validations/plant";
import { createActivityEvent } from "@/lib/activity/create-event";
import { ActivityEventTypes } from "@/lib/activity/event-types";
import { getActorLabel } from "@/lib/activity/actor-label";
import { getPlantReference } from "@/lib/integrations/trefle/service";
import {
  createPlantReferenceSnapshot,
  upsertPlantReference,
} from "@/lib/plants/reference-store";
import type { CreatePlantFormState } from "./plant-form-state";

export async function createPlantAction(
  _prev: CreatePlantFormState,
  formData: FormData,
): Promise<CreatePlantFormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You need to sign in again." };
  }

  const collectionSlug = String(formData.get("collectionSlug") ?? "").trim();
  if (!collectionSlug) {
    return { error: "Missing collection." };
  }

  const collectionId = await getCollectionIdForActiveMember(
    session.user.id,
    collectionSlug,
  );
  if (!collectionId) {
    return { error: "You don’t have access to this collection." };
  }

  const coverFileRaw = formData.get("coverImage");
  const coverFile =
    coverFileRaw instanceof File && coverFileRaw.size > 0 ? coverFileRaw : null;

  if (coverFile && !isSupabaseStorageConfigured()) {
    return {
      error:
        "Photo storage is not configured (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY). Remove the image or add those env vars.",
    };
  }

  const parsed = createPlantSchema.safeParse({
    nickname: String(formData.get("nickname") ?? ""),
    referenceIdentifier: String(formData.get("referenceIdentifier") ?? ""),
    referenceCommonName: String(formData.get("referenceCommonName") ?? ""),
    plantType: String(formData.get("plantType") ?? ""),
    areaId: String(formData.get("areaId") ?? ""),
    lifeStage: String(formData.get("lifeStage") ?? ""),
    healthStatus: String(formData.get("healthStatus") ?? ""),
    acquisitionType: String(formData.get("acquisitionType") ?? ""),
    acquiredAt: String(formData.get("acquiredAt") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    primaryImageUrl: String(formData.get("primaryImageUrl") ?? ""),
    growthProgressPercent: String(formData.get("growthProgressPercent") ?? ""),
    isFavorite: formData.get("isFavorite") === "on" ? "on" : undefined,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Check your input",
    };
  }

  const primaryImageUrl =
    coverFile != null ? undefined : parsed.data.primaryImageUrl;

  const area = await prisma.area.findFirst({
    where: {
      id: parsed.data.areaId,
      collectionId,
      archivedAt: null,
    },
    select: { id: true },
  });
  if (!area) {
    return { error: "That area doesn’t belong to this collection." };
  }

  const referenceIdentifier = (parsed.data.referenceIdentifier ?? "").trim();
  const hasReferenceId = referenceIdentifier.length > 0;

  const plantId = randomUUID();
  let slug = "";

  let coverPayload: { buffer: ArrayBuffer; mime: string } | null = null;
  if (coverFile) {
    coverPayload = {
      buffer: await coverFile.arrayBuffer(),
      mime: coverFile.type.toLowerCase() || "image/jpeg",
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      slug = await resolveUniquePlantSlug(
        collectionId,
        parsed.data.nickname,
        tx,
      );
      await tx.plant.create({
        data: {
          id: plantId,
          collectionId,
          areaId: parsed.data.areaId,
          slug,
          nickname: parsed.data.nickname.trim(),
          referenceCommonName:
            parsed.data.referenceCommonName?.trim() ||
            parsed.data.nickname.trim() ||
            null,
          referenceCatalogId: null,
          referenceSnapshot: undefined,
          plantType: parsed.data.plantType ?? null,
          lifeStage: parsed.data.lifeStage,
          healthStatus: parsed.data.healthStatus,
          acquisitionType: parsed.data.acquisitionType,
          acquiredAt: parsed.data.acquiredAt
            ? new Date(`${parsed.data.acquiredAt}T12:00:00.000Z`)
            : null,
          notes: parsed.data.notes ?? null,
          primaryImageUrl: primaryImageUrl ?? null,
          growthProgressPercent: parsed.data.growthProgressPercent ?? null,
          isFavorite: parsed.data.isFavorite,
        },
      });
    });
  } catch (e) {
    console.error(e);
    return { error: "Could not create plant. Try again." };
  }

  const userId = session.user.id;
  const nickname = parsed.data.nickname.trim();
  const areaId = parsed.data.areaId;

  after(async () => {
    try {
      if (hasReferenceId) {
        try {
          const normalizedReference =
            await getPlantReference(referenceIdentifier);
          await prisma.$transaction(async (tx) => {
            const storedReference = await upsertPlantReference(
              tx,
              normalizedReference,
            );
            await tx.plant.update({
              where: { id: plantId },
              data: {
                referenceCatalogId: storedReference.id,
                referenceSnapshot: createPlantReferenceSnapshot(
                  normalizedReference,
                ) as Prisma.InputJsonValue,
                referenceCommonName:
                  normalizedReference?.commonName ??
                  normalizedReference?.scientificName ??
                  parsed.data.referenceCommonName?.trim() ??
                  nickname ??
                  null,
              },
            });
          });
        } catch (error) {
          console.error("deferred plant reference", error);
        }
      }

      const areaRow = await prisma.area.findFirst({
        where: { id: areaId, collectionId },
        select: { name: true },
      });
      const who = await getActorLabel(userId);
      await createActivityEvent({
        collectionId,
        plantId,
        actorUserId: userId,
        eventType: ActivityEventTypes.plantAdded,
        summary: `${who} added ${nickname} to ${areaRow?.name ?? "an area"}`,
        payload: {
          plantSlug: slug,
          nickname,
          areaName: areaRow?.name ?? null,
        },
        collectionSlug,
        plantSlug: slug,
      });

      if (coverPayload) {
        const file = new File([coverPayload.buffer], "cover", {
          type: coverPayload.mime,
        });
        const coverResult = await attachCoverImageForNewPlant({
          userId,
          collectionId,
          plantId,
          file,
        });
        if (!coverResult.ok) {
          console.error("plant cover attach", coverResult.error);
        }
      }

      revalidatePath(`/collections/${collectionSlug}`);
      revalidatePath(`/collections/${collectionSlug}/plants`);
      revalidatePath(`/collections/${collectionSlug}/plants/${slug}`);
      revalidatePath(`/collections/${collectionSlug}/plants/${slug}/photos`);
      revalidatePath("/plants");
    } catch (e) {
      console.error("createPlantAction after()", e);
    }
  });

  return {
    success: true,
    slug,
    collectionSlug,
  };
}
