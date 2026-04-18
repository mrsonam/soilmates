import { prisma } from "@/lib/prisma";
import {
  ALLOWED_PLANT_IMAGE_MIME,
  MAX_PLANT_IMAGE_BYTES,
} from "@/lib/plants/plant-images";
import { getCollectionIdForActiveMember } from "@/lib/collections/access";
import {
  buildAreaCoverStoragePath,
  buildCollectionCoverStoragePath,
} from "@/lib/collections/cover-images";
import {
  deletePlantImageObject,
  isSupabaseStorageConfigured,
  uploadPlantImageObject,
} from "@/lib/supabase/admin";

export function validateCoverImageFile(file: File): { ok: true } | { ok: false; error: string } {
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
  return { ok: true };
}

export async function setCollectionCoverFromFile(
  userId: string,
  collectionSlug: string,
  file: File,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isSupabaseStorageConfigured()) {
    return {
      ok: false,
      error:
        "Photo storage is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    };
  }

  const v = validateCoverImageFile(file);
  if (!v.ok) return v;

  const collectionId = await getCollectionIdForActiveMember(
    userId,
    collectionSlug,
  );
  if (!collectionId) {
    return { ok: false, error: "Collection not found or access denied." };
  }

  const col = await prisma.collection.findFirst({
    where: { id: collectionId, archivedAt: null },
    select: { coverImageStoragePath: true },
  });
  if (!col) {
    return { ok: false, error: "Collection not found." };
  }

  const mime = file.type.toLowerCase();
  const storagePath = buildCollectionCoverStoragePath(collectionId, mime);
  const buf = await file.arrayBuffer();
  const up = await uploadPlantImageObject(storagePath, buf, mime);
  if (up.error) {
    return { ok: false, error: up.error };
  }

  try {
    await prisma.collection.update({
      where: { id: collectionId },
      data: {
        coverImageStoragePath: storagePath,
        coverImageMimeType: mime,
        coverImagePublicUrl: null,
      },
    });
  } catch (e) {
    console.error(e);
    await deletePlantImageObject(storagePath);
    return { ok: false, error: "Could not save cover photo. Try again." };
  }

  if (col.coverImageStoragePath && col.coverImageStoragePath !== storagePath) {
    await deletePlantImageObject(col.coverImageStoragePath);
  }

  return { ok: true };
}

export async function clearCollectionCover(
  userId: string,
  collectionSlug: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const collectionId = await getCollectionIdForActiveMember(
    userId,
    collectionSlug,
  );
  if (!collectionId) {
    return { ok: false, error: "Collection not found or access denied." };
  }

  const col = await prisma.collection.findFirst({
    where: { id: collectionId, archivedAt: null },
    select: { coverImageStoragePath: true, coverImagePublicUrl: true },
  });
  if (!col?.coverImageStoragePath && !col?.coverImagePublicUrl?.trim()) {
    return { ok: true };
  }

  const oldPath = col.coverImageStoragePath;
  await prisma.collection.update({
    where: { id: collectionId },
    data: {
      coverImageStoragePath: null,
      coverImageMimeType: null,
      coverImagePublicUrl: null,
    },
  });
  if (oldPath) {
    await deletePlantImageObject(oldPath);
  }
  return { ok: true };
}

export async function setAreaCoverFromFile(
  userId: string,
  collectionSlug: string,
  areaId: string,
  file: File,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isSupabaseStorageConfigured()) {
    return {
      ok: false,
      error:
        "Photo storage is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    };
  }

  const v = validateCoverImageFile(file);
  if (!v.ok) return v;

  const collectionId = await getCollectionIdForActiveMember(
    userId,
    collectionSlug,
  );
  if (!collectionId) {
    return { ok: false, error: "Collection not found or access denied." };
  }

  const area = await prisma.area.findFirst({
    where: {
      id: areaId,
      collectionId,
      archivedAt: null,
    },
    select: { coverImageStoragePath: true },
  });
  if (!area) {
    return { ok: false, error: "Area not found or you can't edit it." };
  }

  const mime = file.type.toLowerCase();
  const storagePath = buildAreaCoverStoragePath(collectionId, areaId, mime);
  const buf = await file.arrayBuffer();
  const up = await uploadPlantImageObject(storagePath, buf, mime);
  if (up.error) {
    return { ok: false, error: up.error };
  }

  try {
    await prisma.area.update({
      where: { id: areaId },
      data: {
        coverImageStoragePath: storagePath,
        coverImageMimeType: mime,
        coverImagePublicUrl: null,
      },
    });
  } catch (e) {
    console.error(e);
    await deletePlantImageObject(storagePath);
    return { ok: false, error: "Could not save cover photo. Try again." };
  }

  if (area.coverImageStoragePath && area.coverImageStoragePath !== storagePath) {
    await deletePlantImageObject(area.coverImageStoragePath);
  }

  return { ok: true };
}

export async function clearAreaCover(
  userId: string,
  collectionSlug: string,
  areaId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const collectionId = await getCollectionIdForActiveMember(
    userId,
    collectionSlug,
  );
  if (!collectionId) {
    return { ok: false, error: "Collection not found or access denied." };
  }

  const area = await prisma.area.findFirst({
    where: {
      id: areaId,
      collectionId,
      archivedAt: null,
    },
    select: { coverImageStoragePath: true, coverImagePublicUrl: true },
  });
  if (!area?.coverImageStoragePath && !area?.coverImagePublicUrl?.trim()) {
    return { ok: true };
  }

  const oldPath = area.coverImageStoragePath;
  await prisma.area.update({
    where: { id: areaId },
    data: {
      coverImageStoragePath: null,
      coverImageMimeType: null,
      coverImagePublicUrl: null,
    },
  });
  if (oldPath) {
    await deletePlantImageObject(oldPath);
  }
  return { ok: true };
}
