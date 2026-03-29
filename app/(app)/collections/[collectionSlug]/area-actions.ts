"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCollectionIdForActiveMember } from "@/lib/collections/access";
import { resolveUniqueAreaSlug } from "@/lib/collections/area-slug";
import { createAreaSchema, updateAreaSchema } from "@/lib/validations/area";
import type { AreaMutationFormState } from "./area-form-state";

function revalidateCollection(collectionSlug: string) {
  revalidatePath(`/collections/${collectionSlug}`);
}

export async function createAreaAction(
  _prev: AreaMutationFormState,
  formData: FormData,
): Promise<AreaMutationFormState> {
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

  const parsed = createAreaSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
  });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Check your input",
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const slug = await resolveUniqueAreaSlug(
        collectionId,
        parsed.data.name,
        tx,
      );
      const agg = await tx.area.aggregate({
        where: { collectionId, archivedAt: null },
        _max: { sortOrder: true },
      });
      const sortOrder = (agg._max.sortOrder ?? -1) + 1;

      await tx.area.create({
        data: {
          id: randomUUID(),
          collectionId,
          slug,
          name: parsed.data.name.trim(),
          description:
            parsed.data.description !== undefined
              ? parsed.data.description
              : null,
          sortOrder,
        },
      });
    });
  } catch (e) {
    console.error(e);
    return { error: "Could not create area. Try again." };
  }

  revalidateCollection(collectionSlug);
  return { success: true };
}

export async function updateAreaAction(
  _prev: AreaMutationFormState,
  formData: FormData,
): Promise<AreaMutationFormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You need to sign in again." };
  }

  const collectionSlug = String(formData.get("collectionSlug") ?? "").trim();
  const areaId = String(formData.get("areaId") ?? "").trim();
  if (!collectionSlug || !areaId) {
    return { error: "Missing area or collection." };
  }

  const collectionId = await getCollectionIdForActiveMember(
    session.user.id,
    collectionSlug,
  );
  if (!collectionId) {
    return { error: "You don’t have access to this collection." };
  }

  const parsed = updateAreaSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
  });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Check your input",
    };
  }

  const updated = await prisma.area.updateMany({
    where: {
      id: areaId,
      collectionId,
      archivedAt: null,
    },
    data: {
      name: parsed.data.name.trim(),
      description: parsed.data.description,
    },
  });

  if (updated.count === 0) {
    return { error: "Area not found or you can’t edit it." };
  }

  revalidateCollection(collectionSlug);
  return { success: true };
}

export async function archiveAreaAction(
  _prev: AreaMutationFormState,
  formData: FormData,
): Promise<AreaMutationFormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You need to sign in again." };
  }

  const collectionSlug = String(formData.get("collectionSlug") ?? "").trim();
  const areaId = String(formData.get("areaId") ?? "").trim();
  if (!collectionSlug || !areaId) {
    return { error: "Missing area or collection." };
  }

  const collectionId = await getCollectionIdForActiveMember(
    session.user.id,
    collectionSlug,
  );
  if (!collectionId) {
    return { error: "You don’t have access to this collection." };
  }

  const area = await prisma.area.findFirst({
    where: {
      id: areaId,
      collectionId,
      archivedAt: null,
    },
    select: { id: true },
  });
  if (!area) {
    return { error: "Area not found." };
  }

  const activePlants = await prisma.plant.count({
    where: { areaId, archivedAt: null },
  });
  if (activePlants > 0) {
    return {
      error: `This area still has ${activePlants} active plant${activePlants === 1 ? "" : "s"}. Move or archive them before archiving the area.`,
    };
  }

  await prisma.area.update({
    where: { id: areaId },
    data: { archivedAt: new Date() },
  });

  revalidateCollection(collectionSlug);
  return { success: true };
}
