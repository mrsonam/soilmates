import { randomUUID } from "crypto";
import { extFromMime } from "@/lib/plants/plant-images";

export function buildCollectionCoverStoragePath(
  collectionId: string,
  mimeType: string,
): string {
  const ext = extFromMime(mimeType);
  return `collections/${collectionId}/meta/cover-${randomUUID()}.${ext}`;
}

export function buildAreaCoverStoragePath(
  collectionId: string,
  areaId: string,
  mimeType: string,
): string {
  const ext = extFromMime(mimeType);
  return `collections/${collectionId}/areas/${areaId}/cover-${randomUUID()}.${ext}`;
}
