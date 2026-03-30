"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  clearAreaCover,
  clearCollectionCover,
  setAreaCoverFromFile,
  setCollectionCoverFromFile,
} from "@/lib/collections/cover-storage";
import { createActivityEvent } from "@/lib/activity/create-event";
import { ActivityEventTypes } from "@/lib/activity/event-types";
import { getActorLabel } from "@/lib/activity/actor-label";

export type CoverEntityActionResult =
  | { ok: true }
  | { ok: false; error: string };

function revalidateCollectionAndArea(
  collectionSlug: string,
  areaSlug?: string,
) {
  revalidatePath(`/collections/${collectionSlug}`);
  if (areaSlug) {
    revalidatePath(`/collections/${collectionSlug}/areas/${areaSlug}`);
  }
}

export async function uploadCollectionCoverAction(
  _prev: CoverEntityActionResult | undefined,
  formData: FormData,
): Promise<CoverEntityActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "You need to sign in again." };
  }

  const collectionSlug = String(formData.get("collectionSlug") ?? "").trim();
  const file = formData.get("coverImage") as File | null;
  if (!collectionSlug || !file || file.size === 0) {
    return { ok: false, error: "Choose an image." };
  }

  const r = await setCollectionCoverFromFile(
    session.user.id,
    collectionSlug,
    file,
  );
  if (!r.ok) return r;
  try {
    const col = await prisma.collection.findFirst({
      where: { slug: collectionSlug, archivedAt: null },
      select: { id: true, name: true },
    });
    if (col) {
      const who = await getActorLabel(session.user.id);
      await createActivityEvent({
        collectionId: col.id,
        actorUserId: session.user.id,
        eventType: ActivityEventTypes.collectionCoverChanged,
        summary: `${who} updated the cover for ${col.name}`,
        payload: {},
        collectionSlug,
      });
    }
  } catch (e) {
    console.error("activity event", e);
  }
  revalidatePath("/collections");
  revalidatePath(`/collections/${collectionSlug}`);
  return { ok: true };
}

export async function removeCollectionCoverAction(
  _prev: CoverEntityActionResult | undefined,
  formData: FormData,
): Promise<CoverEntityActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "You need to sign in again." };
  }

  const collectionSlug = String(formData.get("collectionSlug") ?? "").trim();
  if (!collectionSlug) {
    return { ok: false, error: "Missing collection." };
  }

  const r = await clearCollectionCover(session.user.id, collectionSlug);
  if (!r.ok) return r;
  revalidatePath("/collections");
  revalidatePath(`/collections/${collectionSlug}`);
  return { ok: true };
}

export async function uploadAreaCoverAction(
  _prev: CoverEntityActionResult | undefined,
  formData: FormData,
): Promise<CoverEntityActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "You need to sign in again." };
  }

  const collectionSlug = String(formData.get("collectionSlug") ?? "").trim();
  const areaId = String(formData.get("areaId") ?? "").trim();
  const file = formData.get("coverImage") as File | null;
  if (!collectionSlug || !areaId || !file || file.size === 0) {
    return { ok: false, error: "Choose an image." };
  }

  const r = await setAreaCoverFromFile(
    session.user.id,
    collectionSlug,
    areaId,
    file,
  );
  if (!r.ok) return r;

  const area = await prisma.area.findFirst({
    where: { id: areaId, archivedAt: null },
    select: { slug: true, name: true, collectionId: true },
  });
  if (area) {
    try {
      const who = await getActorLabel(session.user.id);
      await createActivityEvent({
        collectionId: area.collectionId,
        actorUserId: session.user.id,
        eventType: ActivityEventTypes.areaCoverChanged,
        summary: `${who} updated the cover for ${area.name}`,
        payload: { areaId, areaName: area.name },
        collectionSlug,
      });
    } catch (e) {
      console.error("activity event", e);
    }
  }
  revalidateCollectionAndArea(collectionSlug, area?.slug);
  return { ok: true };
}

export async function removeAreaCoverAction(
  _prev: CoverEntityActionResult | undefined,
  formData: FormData,
): Promise<CoverEntityActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "You need to sign in again." };
  }

  const collectionSlug = String(formData.get("collectionSlug") ?? "").trim();
  const areaId = String(formData.get("areaId") ?? "").trim();
  if (!collectionSlug || !areaId) {
    return { ok: false, error: "Missing area or collection." };
  }

  const r = await clearAreaCover(session.user.id, collectionSlug, areaId);
  if (!r.ok) return r;

  const area = await prisma.area.findFirst({
    where: { id: areaId, archivedAt: null },
    select: { slug: true },
  });
  revalidateCollectionAndArea(collectionSlug, area?.slug);
  return { ok: true };
}
