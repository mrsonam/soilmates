import { cache } from "react";
import { CollectionMemberStatus, PlantImageType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  createSignedUrlsForPaths,
  isSupabaseStorageConfigured,
} from "@/lib/supabase/admin";

export const MAX_PLANT_IMAGE_BYTES = 10 * 1024 * 1024;
export const ALLOWED_PLANT_IMAGE_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export type PlantGalleryImage = {
  id: string;
  imageType: PlantImageType;
  storagePath: string;
  signedUrl: string | null;
  capturedAt: string | null;
  createdAt: string;
  uploadedByName: string | null;
  isPrimary: boolean;
};

function extFromMime(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "bin";
}

export function buildPlantImageStoragePath(args: {
  collectionId: string;
  plantId: string;
  imageId: string;
  mimeType: string;
}): string {
  const ext = extFromMime(args.mimeType);
  return `collections/${args.collectionId}/plants/${args.plantId}/${args.imageId}.${ext}`;
}

/**
 * Active plant images with signed URLs for gallery (newest first).
 */
export const getPlantImagesForGallery = cache(
  async (
    userId: string,
    collectionSlug: string,
    plantSlug: string,
  ): Promise<PlantGalleryImage[] | null> => {
    const membership = await prisma.collectionMember.findFirst({
      where: {
        userId,
        status: CollectionMemberStatus.active,
        collection: { slug: collectionSlug, archivedAt: null },
      },
      select: { collectionId: true },
    });
    if (!membership) return null;

    const plant = await prisma.plant.findFirst({
      where: {
        collectionId: membership.collectionId,
        slug: plantSlug,
        archivedAt: null,
      },
      select: { id: true, primaryImageId: true },
    });
    if (!plant) return null;

    const rows = await prisma.plantImage.findMany({
      where: { plantId: plant.id, deletedAt: null },
      orderBy: [{ capturedAt: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        imageType: true,
        storagePath: true,
        capturedAt: true,
        createdAt: true,
        uploadedBy: { select: { fullName: true } },
      },
    });

    const paths = rows.map((r) => r.storagePath);
    const signed =
      isSupabaseStorageConfigured() && paths.length > 0
        ? await createSignedUrlsForPaths(paths)
        : new Map<string, string>();

    return rows.map((r) => ({
      id: r.id,
      imageType: r.imageType,
      storagePath: r.storagePath,
      signedUrl: signed.get(r.storagePath) ?? null,
      capturedAt: r.capturedAt ? r.capturedAt.toISOString() : null,
      createdAt: r.createdAt.toISOString(),
      uploadedByName: r.uploadedBy.fullName ?? null,
      isPrimary: plant.primaryImageId === r.id,
    }));
  },
);

export { extFromMime };
