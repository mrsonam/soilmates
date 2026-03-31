"use server";

import { randomUUID } from "crypto";
import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

  let normalizedReference = null;
  if (parsed.data.referenceIdentifier) {
    try {
      normalizedReference = await getPlantReference(parsed.data.referenceIdentifier);
    } catch (error) {
      console.error(error);
      return { error: "Unable to load plant reference right now." };
    }
  }

  const plantId = randomUUID();
  let slug = "";

  try {
    await prisma.$transaction(async (tx) => {
      let referenceCatalogId: string | null = null;
      let referenceSnapshot: Prisma.InputJsonValue | undefined;

      if (normalizedReference) {
        const storedReference = await upsertPlantReference(tx, normalizedReference);
        referenceCatalogId = storedReference.id;
        referenceSnapshot = createPlantReferenceSnapshot(
          normalizedReference,
        ) as Prisma.InputJsonValue;
      }

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
            normalizedReference?.commonName ??
            normalizedReference?.scientificName ??
            parsed.data.referenceCommonName ??
            null,
          referenceCatalogId,
          referenceSnapshot,
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

  try {
    const areaRow = await prisma.area.findFirst({
      where: { id: parsed.data.areaId, collectionId },
      select: { name: true },
    });
    const who = await getActorLabel(session.user.id);
    await createActivityEvent({
      collectionId,
      plantId,
      actorUserId: session.user.id,
      eventType: ActivityEventTypes.plantAdded,
      summary: `${who} added ${parsed.data.nickname.trim()} to ${areaRow?.name ?? "an area"}`,
      payload: {
        plantSlug: slug,
        nickname: parsed.data.nickname.trim(),
        areaName: areaRow?.name ?? null,
      },
      collectionSlug,
      plantSlug: slug,
    });
  } catch (e) {
    console.error("activity event", e);
  }

  if (coverFile) {
    const coverResult = await attachCoverImageForNewPlant({
      userId: session.user.id,
      collectionId,
      plantId,
      file: coverFile,
    });
    if (!coverResult.ok) {
      try {
        await prisma.plant.delete({ where: { id: plantId } });
      } catch (delErr) {
        console.error(delErr);
      }
      return { error: coverResult.error };
    }
  }

  revalidatePath(`/collections/${collectionSlug}`);
  revalidatePath(`/collections/${collectionSlug}/plants`);
  revalidatePath(`/collections/${collectionSlug}/plants/${slug}`);
  revalidatePath(`/collections/${collectionSlug}/plants/${slug}/photos`);
  revalidatePath("/plants");
  redirect(`/collections/${collectionSlug}/plants/${slug}`);
}
