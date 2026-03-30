import { randomUUID } from "crypto";
import { PlantImageType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
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

/**
 * After a plant row exists: upload one cover file, create `plant_images` row,
 * set `plants.primary_image_id`. Rolls back storage on DB failure.
 */
export async function attachCoverImageForNewPlant(args: {
  userId: string;
  collectionId: string;
  plantId: string;
  file: File;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isSupabaseStorageConfigured()) {
    return {
      ok: false,
      error:
        "Photo storage is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    };
  }

  const { userId, collectionId, plantId, file } = args;

  if (file.size > MAX_PLANT_IMAGE_BYTES) {
    return {
      ok: false,
      error: `Image must be under ${MAX_PLANT_IMAGE_BYTES / (1024 * 1024)} MB.`,
    };
  }

  const mime = file.type.toLowerCase();
  if (!ALLOWED_PLANT_IMAGE_MIME.has(mime)) {
    return { ok: false, error: "Use JPEG, PNG, WebP, or GIF images only." };
  }

  const imageId = randomUUID();
  const storagePath = buildPlantImageStoragePath({
    collectionId,
    plantId,
    imageId,
    mimeType: mime,
  });

  const buf = await file.arrayBuffer();
  const up = await uploadPlantImageObject(storagePath, buf, mime);
  if (up.error) {
    return { ok: false, error: up.error };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.plantImage.create({
        data: {
          id: imageId,
          collectionId,
          plantId,
          careLogId: null,
          diagnosisId: null,
          imageType: PlantImageType.cover,
          storagePath,
          mimeType: mime,
          fileSize: file.size,
          width: null,
          height: null,
          capturedAt: null,
          uploadedById: userId,
          metadata: {},
        },
      });
      await tx.plant.update({
        where: { id: plantId },
        data: { primaryImageId: imageId },
      });
    });
  } catch (e) {
    console.error(e);
    await deletePlantImageObject(storagePath);
    return { ok: false, error: "Could not save cover photo. Try again." };
  }

  return { ok: true };
}
