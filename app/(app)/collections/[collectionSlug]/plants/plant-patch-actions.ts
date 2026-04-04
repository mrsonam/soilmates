"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCollectionIdForActiveMember } from "@/lib/collections/access";

const patchPlantSimpleSchema = z
  .object({
    collectionSlug: z.string().trim().min(1),
    plantSlug: z.string().trim().min(1),
    notes: z.string().trim().max(5000).nullable().optional(),
    isFavorite: z.boolean().optional(),
    areaId: z.string().uuid().optional(),
    /** ISO timestamp — when set, must match current `plant.updatedAt` */
    expectedUpdatedAt: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.notes === undefined &&
      data.isFavorite === undefined &&
      data.areaId === undefined
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Nothing to update",
      });
    }
  });

export type PlantPatchResult =
  | { ok: true }
  | { ok: false; error: string; conflict?: boolean };

function revalidatePlantPaths(collectionSlug: string, plantSlug: string) {
  const base = `/collections/${collectionSlug}/plants/${plantSlug}`;
  revalidatePath(base);
  revalidatePath(`/collections/${collectionSlug}/plants`);
  revalidatePath("/plants");
  revalidatePath("/dashboard");
}

export async function patchPlantSimpleAction(
  raw: unknown,
): Promise<PlantPatchResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "You need to sign in again." };
  }

  const parsed = patchPlantSimpleSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const d = parsed.data;
  const collectionId = await getCollectionIdForActiveMember(
    session.user.id,
    d.collectionSlug,
  );
  if (!collectionId) {
    return { ok: false, error: "You don’t have access to this collection." };
  }

  const plant = await prisma.plant.findFirst({
    where: {
      collectionId,
      slug: d.plantSlug,
      archivedAt: null,
    },
    select: {
      id: true,
      areaId: true,
      updatedAt: true,
    },
  });
  if (!plant) {
    return { ok: false, error: "Plant not found." };
  }

  if (d.expectedUpdatedAt) {
    const expected = new Date(d.expectedUpdatedAt);
    if (Number.isNaN(expected.getTime())) {
      return { ok: false, error: "Invalid version timestamp." };
    }
    if (plant.updatedAt.getTime() !== expected.getTime()) {
      return {
        ok: false,
        conflict: true,
        error:
          "This plant changed before your offline update could sync. Review and try again.",
      };
    }
  }

  if (d.areaId && d.areaId !== plant.areaId) {
    const area = await prisma.area.findFirst({
      where: {
        id: d.areaId,
        collectionId,
        archivedAt: null,
      },
      select: { id: true },
    });
    if (!area) {
      return { ok: false, error: "That area isn’t in this collection." };
    }
  }

  try {
    await prisma.plant.update({
      where: { id: plant.id },
      data: {
        ...(d.notes !== undefined ? { notes: d.notes } : {}),
        ...(d.isFavorite !== undefined ? { isFavorite: d.isFavorite } : {}),
        ...(d.areaId !== undefined ? { areaId: d.areaId } : {}),
      },
    });
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not update plant." };
  }

  revalidatePlantPaths(d.collectionSlug, d.plantSlug);
  return { ok: true };
}
