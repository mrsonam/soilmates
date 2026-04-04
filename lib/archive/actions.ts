"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getCollectionIdForActiveMember,
  getMembershipForCollectionSlug,
} from "@/lib/collections/access";
import { createActivityEvent } from "@/lib/activity/create-event";
import { ActivityEventTypes } from "@/lib/activity/event-types";
import { getActorLabel } from "@/lib/activity/actor-label";
import { countActivePlantsInCollection } from "@/lib/archive/queries";

export type ArchiveActionResult =
  | { ok: true }
  | { ok: false; error: string };

function revalidateCollectionScope(collectionSlug: string, plantSlug?: string) {
  revalidatePath(`/collections/${collectionSlug}`);
  revalidatePath(`/collections/${collectionSlug}/plants`);
  revalidatePath(`/collections/${collectionSlug}/archive`);
  revalidatePath("/collections");
  revalidatePath("/dashboard");
  revalidatePath("/plants");
  revalidatePath("/settings");
  if (plantSlug) {
    revalidatePath(`/collections/${collectionSlug}/plants/${plantSlug}`);
    revalidatePath(
      `/collections/${collectionSlug}/plants/${plantSlug}/photos`,
    );
    revalidatePath(
      `/collections/${collectionSlug}/plants/${plantSlug}/history`,
    );
  }
}

export async function archivePlantAction(input: {
  collectionSlug: string;
  plantSlug: string;
}): Promise<ArchiveActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "You need to sign in again." };
  }

  const collectionId = await getCollectionIdForActiveMember(
    session.user.id,
    input.collectionSlug,
  );
  if (!collectionId) {
    return { ok: false, error: "You don’t have access to this collection." };
  }

  const plant = await prisma.plant.findFirst({
    where: {
      collectionId,
      slug: input.plantSlug,
      archivedAt: null,
    },
    select: { id: true, nickname: true },
  });
  if (!plant) {
    return { ok: false, error: "Plant not found or already archived." };
  }

  const now = new Date();
  await prisma.plant.update({
    where: { id: plant.id },
    data: { archivedAt: now },
  });

  try {
    const who = await getActorLabel(session.user.id);
    await createActivityEvent({
      collectionId,
      plantId: plant.id,
      actorUserId: session.user.id,
      eventType: ActivityEventTypes.plantArchived,
      summary: `${who} archived ${plant.nickname}`,
      payload: { plantSlug: input.plantSlug, nickname: plant.nickname },
      collectionSlug: input.collectionSlug,
      plantSlug: input.plantSlug,
    });
  } catch (e) {
    console.error("activity plantArchived", e);
  }

  revalidateCollectionScope(input.collectionSlug, input.plantSlug);
  return { ok: true };
}

export async function restorePlantAction(input: {
  collectionSlug: string;
  plantSlug: string;
}): Promise<ArchiveActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "You need to sign in again." };
  }

  const collectionId = await getCollectionIdForActiveMember(
    session.user.id,
    input.collectionSlug,
  );
  if (!collectionId) {
    return {
      ok: false,
      error:
        "You can’t restore plants while this collection is archived. Restore the collection first.",
    };
  }

  const plant = await prisma.plant.findFirst({
    where: {
      collectionId,
      slug: input.plantSlug,
      archivedAt: { not: null },
    },
    select: { id: true, nickname: true },
  });
  if (!plant) {
    return { ok: false, error: "Plant not found or not archived." };
  }

  await prisma.plant.update({
    where: { id: plant.id },
    data: { archivedAt: null },
  });

  try {
    const who = await getActorLabel(session.user.id);
    await createActivityEvent({
      collectionId,
      plantId: plant.id,
      actorUserId: session.user.id,
      eventType: ActivityEventTypes.plantRestored,
      summary: `${who} restored ${plant.nickname}`,
      payload: { plantSlug: input.plantSlug, nickname: plant.nickname },
      collectionSlug: input.collectionSlug,
      plantSlug: input.plantSlug,
    });
  } catch (e) {
    console.error("activity plantRestored", e);
  }

  revalidateCollectionScope(input.collectionSlug, input.plantSlug);
  return { ok: true };
}

export async function restoreAreaAction(input: {
  collectionSlug: string;
  areaId: string;
}): Promise<ArchiveActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "You need to sign in again." };
  }

  const collectionId = await getCollectionIdForActiveMember(
    session.user.id,
    input.collectionSlug,
  );
  if (!collectionId) {
    return { ok: false, error: "You don’t have access to this collection." };
  }

  const area = await prisma.area.findFirst({
    where: {
      id: input.areaId,
      collectionId,
      archivedAt: { not: null },
    },
    select: { id: true, name: true, slug: true },
  });
  if (!area) {
    return { ok: false, error: "Area not found or not archived." };
  }

  await prisma.area.update({
    where: { id: area.id },
    data: { archivedAt: null },
  });

  try {
    const who = await getActorLabel(session.user.id);
    await createActivityEvent({
      collectionId,
      actorUserId: session.user.id,
      eventType: ActivityEventTypes.areaRestored,
      summary: `${who} restored area ${area.name}`,
      payload: { areaId: area.id, areaSlug: area.slug },
      collectionSlug: input.collectionSlug,
    });
  } catch (e) {
    console.error("activity areaRestored", e);
  }

  revalidateCollectionScope(input.collectionSlug);
  revalidatePath(`/collections/${input.collectionSlug}/areas/${area.slug}`);
  return { ok: true };
}

export async function archiveCollectionAction(input: {
  collectionSlug: string;
}): Promise<ArchiveActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "You need to sign in again." };
  }

  const collectionId = await getCollectionIdForActiveMember(
    session.user.id,
    input.collectionSlug,
  );
  if (!collectionId) {
    return { ok: false, error: "You don’t have access to this collection." };
  }

  const n = await countActivePlantsInCollection(collectionId);
  if (n > 0) {
    return {
      ok: false,
      error: `Archive or move ${n} active plant${n === 1 ? "" : "s"} before archiving this collection.`,
    };
  }

  const col = await prisma.collection.findFirst({
    where: { id: collectionId, archivedAt: null },
    select: { id: true, name: true, slug: true },
  });
  if (!col) {
    return { ok: false, error: "Collection not found or already archived." };
  }

  await prisma.collection.update({
    where: { id: col.id },
    data: { archivedAt: new Date() },
  });

  try {
    const who = await getActorLabel(session.user.id);
    await createActivityEvent({
      collectionId: col.id,
      actorUserId: session.user.id,
      eventType: ActivityEventTypes.collectionArchived,
      summary: `${who} archived ${col.name}`,
      payload: { collectionSlug: col.slug },
      collectionSlug: col.slug,
    });
  } catch (e) {
    console.error("activity collectionArchived", e);
  }

  revalidatePath("/collections");
  revalidatePath("/dashboard");
  revalidatePath("/settings");
  revalidatePath(`/collections/${input.collectionSlug}`);
  return { ok: true };
}

export async function restoreCollectionAction(input: {
  collectionSlug: string;
}): Promise<ArchiveActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "You need to sign in again." };
  }

  const m = await getMembershipForCollectionSlug(
    session.user.id,
    input.collectionSlug,
  );
  if (!m || !m.collection.archivedAt) {
    return { ok: false, error: "Collection not found or not archived." };
  }

  await prisma.collection.update({
    where: { id: m.collectionId },
    data: { archivedAt: null },
  });

  try {
    const who = await getActorLabel(session.user.id);
    await createActivityEvent({
      collectionId: m.collectionId,
      actorUserId: session.user.id,
      eventType: ActivityEventTypes.collectionRestored,
      summary: `${who} restored ${m.collection.name}`,
      payload: { collectionSlug: m.collection.slug },
      collectionSlug: m.collection.slug,
    });
  } catch (e) {
    console.error("activity collectionRestored", e);
  }

  revalidatePath("/collections");
  revalidatePath("/dashboard");
  revalidatePath("/settings");
  revalidatePath(`/collections/${input.collectionSlug}`);
  return { ok: true };
}
