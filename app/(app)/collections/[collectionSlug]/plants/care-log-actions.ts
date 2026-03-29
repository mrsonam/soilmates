"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCollectionIdForActiveMember } from "@/lib/collections/access";
import { quickCareActionSchema } from "@/lib/validations/care-log";
export type QuickCareLogResult = { ok: true } | { ok: false; error: string };

export async function createQuickCareLogAction(input: {
  collectionSlug: string;
  plantSlug: string;
  actionType: string;
}): Promise<QuickCareLogResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "You need to sign in again." };
  }

  const parsed = quickCareActionSchema.safeParse(input.actionType);
  if (!parsed.success) {
    return { ok: false, error: "Invalid action." };
  }

  const collectionSlug = input.collectionSlug.trim();
  const plantSlug = input.plantSlug.trim();
  if (!collectionSlug || !plantSlug) {
    return { ok: false, error: "Missing plant context." };
  }

  const collectionId = await getCollectionIdForActiveMember(
    session.user.id,
    collectionSlug,
  );
  if (!collectionId) {
    return { ok: false, error: "You don’t have access to this collection." };
  }

  const plant = await prisma.plant.findFirst({
    where: {
      collectionId,
      slug: plantSlug,
      archivedAt: null,
    },
    select: { id: true },
  });
  if (!plant) {
    return { ok: false, error: "Plant not found." };
  }

  const now = new Date();
  try {
    await prisma.careLog.create({
      data: {
        id: randomUUID(),
        plantId: plant.id,
        createdById: session.user.id,
        actionType: parsed.data,
        actionAt: now,
        notes: null,
        metadata: {},
        tags: [],
      },
    });
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not save care log. Try again." };
  }

  revalidatePath(`/collections/${collectionSlug}/plants/${plantSlug}`);
  revalidatePath(
    `/collections/${collectionSlug}/plants/${plantSlug}/history`,
  );
  revalidatePath(`/collections/${collectionSlug}/plants`);
  revalidatePath("/plants");

  return { ok: true };
}
