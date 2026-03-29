"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCollectionIdForActiveMember } from "@/lib/collections/access";
import {
  createDetailedCareLogSchema,
  deleteCareLogSchema,
  updateCareLogSchema,
} from "@/lib/validations/care-log";

export type CareLogMutationResult =
  | { ok: true }
  | { ok: false; error: string };

function revalidateCarePaths(collectionSlug: string, plantSlug: string) {
  const base = `/collections/${collectionSlug}/plants/${plantSlug}`;
  revalidatePath(base);
  revalidatePath(`${base}/history`);
  revalidatePath(`/collections/${collectionSlug}/plants`);
  revalidatePath("/plants");
}

async function resolvePlantId(
  userId: string,
  collectionSlug: string,
  plantSlug: string,
): Promise<string | null> {
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
    select: { id: true },
  });
  return plant?.id ?? null;
}

export async function createDetailedCareLogAction(
  input: unknown,
): Promise<CareLogMutationResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "You need to sign in again." };
  }

  const parsed = createDetailedCareLogSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const d = parsed.data;
  const plantId = await resolvePlantId(
    session.user.id,
    d.collectionSlug,
    d.plantSlug,
  );
  if (!plantId) {
    return { ok: false, error: "Plant not found or access denied." };
  }

  try {
    await prisma.careLog.create({
      data: {
        id: randomUUID(),
        plantId,
        createdById: session.user.id,
        actionType: d.actionType,
        actionAt: d.actionAt,
        notes: d.notes && d.notes.length > 0 ? d.notes : null,
        metadata: d.metadata as Prisma.InputJsonValue,
        tags: d.tags,
      },
    });
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not save care log." };
  }

  revalidateCarePaths(d.collectionSlug, d.plantSlug);
  return { ok: true };
}

export async function updateCareLogAction(
  input: unknown,
): Promise<CareLogMutationResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "You need to sign in again." };
  }

  const parsed = updateCareLogSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const d = parsed.data;
  const plantId = await resolvePlantId(
    session.user.id,
    d.collectionSlug,
    d.plantSlug,
  );
  if (!plantId) {
    return { ok: false, error: "Plant not found or access denied." };
  }

  const existing = await prisma.careLog.findFirst({
    where: {
      id: d.careLogId,
      plantId,
      deletedAt: null,
    },
    select: { createdById: true },
  });
  if (!existing) {
    return { ok: false, error: "Log not found." };
  }
  if (existing.createdById !== session.user.id) {
    return { ok: false, error: "You can only edit your own logs." };
  }

  try {
    await prisma.careLog.update({
      where: { id: d.careLogId },
      data: {
        actionType: d.actionType,
        actionAt: d.actionAt,
        notes: d.notes && d.notes.length > 0 ? d.notes : null,
        metadata: d.metadata as Prisma.InputJsonValue,
        tags: d.tags,
      },
    });
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not update log." };
  }

  revalidateCarePaths(d.collectionSlug, d.plantSlug);
  return { ok: true };
}

export async function deleteCareLogAction(
  input: unknown,
): Promise<CareLogMutationResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "You need to sign in again." };
  }

  const parsed = deleteCareLogSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const d = parsed.data;
  const plantId = await resolvePlantId(
    session.user.id,
    d.collectionSlug,
    d.plantSlug,
  );
  if (!plantId) {
    return { ok: false, error: "Plant not found or access denied." };
  }

  const existing = await prisma.careLog.findFirst({
    where: {
      id: d.careLogId,
      plantId,
      deletedAt: null,
    },
    select: { createdById: true },
  });
  if (!existing) {
    return { ok: false, error: "Log not found." };
  }
  if (existing.createdById !== session.user.id) {
    return { ok: false, error: "You can only delete your own logs." };
  }

  try {
    await prisma.careLog.update({
      where: { id: d.careLogId },
      data: { deletedAt: new Date() },
    });
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not delete log." };
  }

  revalidateCarePaths(d.collectionSlug, d.plantSlug);
  return { ok: true };
}
