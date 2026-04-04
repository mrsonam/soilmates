"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { PlantImageType } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCollectionIdForActiveMember } from "@/lib/collections/access";
import {
  ALLOWED_PLANT_IMAGE_MIME,
  MAX_PLANT_IMAGE_BYTES,
  buildPlantImageStoragePath,
} from "@/lib/plants/plant-images";
import {
  deletePlantImageObject,
  isSupabaseStorageConfigured,
  uploadPlantImageObject,
} from "@/lib/supabase/admin";
import { createActivityEvent } from "@/lib/activity/create-event";
import { ActivityEventTypes } from "@/lib/activity/event-types";
import { getActorLabel } from "@/lib/activity/actor-label";

export type PlantImageActionResult =
  | { ok: true; uploadedImageIds?: string[] }
  | { ok: false; error: string };

function revalidatePlantPaths(collectionSlug: string, plantSlug: string) {
  const base = `/collections/${collectionSlug}/plants/${plantSlug}`;
  revalidatePath(base);
  revalidatePath(`${base}/photos`);
  revalidatePath(`/collections/${collectionSlug}/plants`);
  revalidatePath("/plants");
}

async function loadPlantContext(
  userId: string,
  collectionSlug: string,
  plantSlug: string,
) {
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
    select: {
      id: true,
      collectionId: true,
      primaryImageId: true,
    },
  });
  if (!plant) return null;
  return { plant, collectionId };
}

/** Upload one or more images; use FormData fields: files (or file), mode=cover|progress, optional capturedAt (YYYY-MM-DD). */
export async function uploadPlantImagesAction(
  formData: FormData,
): Promise<PlantImageActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "You need to sign in again." };
  }

  if (!isSupabaseStorageConfigured()) {
    return {
      ok: false,
      error:
        "Photo storage is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for this environment.",
    };
  }

  const collectionSlug = String(formData.get("collectionSlug") ?? "").trim();
  const plantSlug = String(formData.get("plantSlug") ?? "").trim();
  const modeRaw = String(formData.get("mode") ?? "progress").toLowerCase();
  const mode = modeRaw === "cover" ? "cover" : "progress";
  const capturedRaw = String(formData.get("capturedAt") ?? "").trim();
  let capturedAt: Date | null = null;
  if (capturedRaw) {
    const d = new Date(capturedRaw);
    if (!Number.isNaN(d.getTime())) capturedAt = d;
  }

  const rawList = formData.getAll("files") as File[];
  const single = formData.get("file") as File | null;
  const files =
    rawList.length > 0 ? rawList : single && single.size > 0 ? [single] : [];

  if (!collectionSlug || !plantSlug || files.length === 0) {
    return { ok: false, error: "Choose at least one image." };
  }

  const ctx = await loadPlantContext(
    session.user.id,
    collectionSlug,
    plantSlug,
  );
  if (!ctx) {
    return { ok: false, error: "Plant not found or access denied." };
  }

  const { plant, collectionId } = ctx;
  const existingCount = await prisma.plantImage.count({
    where: { plantId: plant.id, deletedAt: null },
  });

  let createdInBatch = 0;
  const uploadedImageIds: string[] = [];
  for (const file of files) {
    if (file.size > MAX_PLANT_IMAGE_BYTES) {
      return {
        ok: false,
        error: `Each image must be under ${MAX_PLANT_IMAGE_BYTES / (1024 * 1024)} MB.`,
      };
    }
    const mime = file.type.toLowerCase();
    if (!ALLOWED_PLANT_IMAGE_MIME.has(mime)) {
      return {
        ok: false,
        error: "Use JPEG, PNG, WebP, or GIF images only.",
      };
    }
  }

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!;
    const mime = file.type.toLowerCase();
    const imageId = randomUUID();
    const storagePath = buildPlantImageStoragePath({
      collectionId,
      plantId: plant.id,
      imageId,
      mimeType: mime,
    });

    const buf = await file.arrayBuffer();
    const up = await uploadPlantImageObject(storagePath, buf, mime);
    if (up.error) {
      return { ok: false, error: up.error };
    }

    const priorCount = existingCount + createdInBatch;
    const isCover =
      createdInBatch === 0 && (priorCount === 0 || mode === "cover");
    const imageType = isCover ? PlantImageType.cover : PlantImageType.progress;

    try {
      await prisma.$transaction(async (tx) => {
        await tx.plantImage.create({
          data: {
            id: imageId,
            collectionId,
            plantId: plant.id,
            careLogId: null,
            diagnosisId: null,
            imageType,
            storagePath,
            mimeType: mime,
            fileSize: file.size,
            width: null,
            height: null,
            capturedAt,
            uploadedById: session.user.id,
            metadata: {},
          },
        });

        if (isCover) {
          await tx.plantImage.updateMany({
            where: {
              plantId: plant.id,
              deletedAt: null,
              id: { not: imageId },
            },
            data: { imageType: PlantImageType.progress },
          });
          await tx.plantImage.update({
            where: { id: imageId },
            data: { imageType: PlantImageType.cover },
          });
          await tx.plant.update({
            where: { id: plant.id },
            data: { primaryImageId: imageId },
          });
        }
      });
    } catch (e) {
      console.error(e);
      await deletePlantImageObject(storagePath);
      return { ok: false, error: "Could not save photo metadata. Try again." };
    }

    createdInBatch += 1;
    uploadedImageIds.push(imageId);
  }

  if (createdInBatch > 0) {
    try {
      const plantInfo = await prisma.plant.findUnique({
        where: { id: ctx.plant.id },
        select: {
          nickname: true,
          slug: true,
          collection: { select: { slug: true } },
        },
      });
      if (plantInfo) {
        const who = await getActorLabel(session.user.id);
        const label =
          createdInBatch === 1
            ? "a new photo"
            : `${createdInBatch} new photos`;
        await createActivityEvent({
          collectionId: ctx.collectionId,
          plantId: ctx.plant.id,
          actorUserId: session.user.id,
          eventType: ActivityEventTypes.imageUploaded,
          summary: `${who} added ${label} to ${plantInfo.nickname}`,
          payload: { count: createdInBatch },
          collectionSlug: plantInfo.collection.slug,
          plantSlug: plantInfo.slug,
        });
      }
    } catch (e) {
      console.error("activity event", e);
    }
  }

  revalidatePlantPaths(collectionSlug, plantSlug);
  return {
    ok: true,
    uploadedImageIds:
      uploadedImageIds.length > 0 ? uploadedImageIds : undefined,
  };
}

export async function setPlantCoverImageAction(input: {
  collectionSlug: string;
  plantSlug: string;
  imageId: string;
}): Promise<PlantImageActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "You need to sign in again." };
  }

  const collectionSlug = input.collectionSlug.trim();
  const plantSlug = input.plantSlug.trim();
  const imageId = input.imageId.trim();
  if (!collectionSlug || !plantSlug || !imageId) {
    return { ok: false, error: "Missing details." };
  }

  const ctx = await loadPlantContext(
    session.user.id,
    collectionSlug,
    plantSlug,
  );
  if (!ctx) {
    return { ok: false, error: "Plant not found or access denied." };
  }

  const img = await prisma.plantImage.findFirst({
    where: {
      id: imageId,
      plantId: ctx.plant.id,
      collectionId: ctx.collectionId,
      deletedAt: null,
    },
    select: { id: true },
  });
  if (!img) {
    return { ok: false, error: "Photo not found." };
  }

  try {
    await prisma.$transaction([
      prisma.plantImage.updateMany({
        where: {
          plantId: ctx.plant.id,
          deletedAt: null,
          id: { not: imageId },
        },
        data: { imageType: PlantImageType.progress },
      }),
      prisma.plantImage.update({
        where: { id: imageId },
        data: { imageType: PlantImageType.cover },
      }),
      prisma.plant.update({
        where: { id: ctx.plant.id },
        data: { primaryImageId: imageId },
      }),
    ]);
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not update cover photo." };
  }

  try {
    const plantInfo = await prisma.plant.findUnique({
      where: { id: ctx.plant.id },
      select: {
        nickname: true,
        slug: true,
        collection: { select: { slug: true } },
      },
    });
    if (plantInfo) {
      const who = await getActorLabel(session.user.id);
      await createActivityEvent({
        collectionId: ctx.collectionId,
        plantId: ctx.plant.id,
        actorUserId: session.user.id,
        eventType: ActivityEventTypes.coverImageChanged,
        summary: `${who} changed the cover photo for ${plantInfo.nickname}`,
        payload: { imageId },
        collectionSlug: plantInfo.collection.slug,
        plantSlug: plantInfo.slug,
      });
    }
  } catch (e) {
    console.error("activity event", e);
  }

  revalidatePlantPaths(collectionSlug, plantSlug);
  return { ok: true };
}

export async function deletePlantImageAction(input: {
  collectionSlug: string;
  plantSlug: string;
  imageId: string;
}): Promise<PlantImageActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "You need to sign in again." };
  }

  const collectionSlug = input.collectionSlug.trim();
  const plantSlug = input.plantSlug.trim();
  const imageId = input.imageId.trim();
  if (!collectionSlug || !plantSlug || !imageId) {
    return { ok: false, error: "Missing details." };
  }

  const ctx = await loadPlantContext(
    session.user.id,
    collectionSlug,
    plantSlug,
  );
  if (!ctx) {
    return { ok: false, error: "Plant not found or access denied." };
  }

  const img = await prisma.plantImage.findFirst({
    where: {
      id: imageId,
      plantId: ctx.plant.id,
      collectionId: ctx.collectionId,
      deletedAt: null,
    },
    select: { id: true, storagePath: true },
  });
  if (!img) {
    return { ok: false, error: "Photo not found." };
  }

  const now = new Date();
  try {
    await prisma.$transaction(async (tx) => {
      await tx.plantImage.update({
        where: { id: imageId },
        data: { deletedAt: now },
      });

      const wasPrimary = ctx.plant.primaryImageId === imageId;
      if (wasPrimary) {
        const next = await tx.plantImage.findFirst({
          where: {
            plantId: ctx.plant.id,
            deletedAt: null,
            id: { not: imageId },
          },
          orderBy: [{ createdAt: "desc" }],
          select: { id: true },
        });

        await tx.plant.update({
          where: { id: ctx.plant.id },
          data: { primaryImageId: next?.id ?? null },
        });

        if (next) {
          await tx.plantImage.updateMany({
            where: {
              plantId: ctx.plant.id,
              deletedAt: null,
              id: { not: next.id },
            },
            data: { imageType: PlantImageType.progress },
          });
          await tx.plantImage.update({
            where: { id: next.id },
            data: { imageType: PlantImageType.cover },
          });
        }
      }
    });
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not remove photo." };
  }

  await deletePlantImageObject(img.storagePath);

  revalidatePlantPaths(collectionSlug, plantSlug);
  return { ok: true };
}
