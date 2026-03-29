"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCollectionIdForActiveMember } from "@/lib/collections/access";
import { resolveUniquePlantSlug } from "@/lib/plants/slug";
import { createPlantSchema } from "@/lib/validations/plant";
import type { CreatePlantFormState } from "./plant-form-state";

export async function createPlantAction(
  _prev: CreatePlantFormState,
  formData: FormData,
): Promise<CreatePlantFormState> {
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

  const parsed = createPlantSchema.safeParse({
    nickname: String(formData.get("nickname") ?? ""),
    referenceCommonName: String(formData.get("referenceCommonName") ?? ""),
    plantType: String(formData.get("plantType") ?? ""),
    areaId: String(formData.get("areaId") ?? ""),
    lifeStage: String(formData.get("lifeStage") ?? ""),
    healthStatus: String(formData.get("healthStatus") ?? ""),
    acquisitionType: String(formData.get("acquisitionType") ?? ""),
    acquiredAt: String(formData.get("acquiredAt") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    primaryImageUrl: String(formData.get("primaryImageUrl") ?? ""),
    growthProgressPercent: String(formData.get("growthProgressPercent") ?? ""),
    isFavorite: formData.get("isFavorite") === "on" ? "on" : undefined,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Check your input",
    };
  }

  const area = await prisma.area.findFirst({
    where: {
      id: parsed.data.areaId,
      collectionId,
      archivedAt: null,
    },
    select: { id: true },
  });
  if (!area) {
    return { error: "That area doesn’t belong to this collection." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const slug = await resolveUniquePlantSlug(
        collectionId,
        parsed.data.nickname,
        tx,
      );
      await tx.plant.create({
        data: {
          id: randomUUID(),
          collectionId,
          areaId: parsed.data.areaId,
          slug,
          nickname: parsed.data.nickname.trim(),
          referenceCommonName: parsed.data.referenceCommonName ?? null,
          referenceCatalogId: null,
          plantType: parsed.data.plantType ?? null,
          lifeStage: parsed.data.lifeStage,
          healthStatus: parsed.data.healthStatus,
          acquisitionType: parsed.data.acquisitionType,
          acquiredAt: parsed.data.acquiredAt
            ? new Date(`${parsed.data.acquiredAt}T12:00:00.000Z`)
            : null,
          notes: parsed.data.notes ?? null,
          primaryImageUrl: parsed.data.primaryImageUrl ?? null,
          growthProgressPercent: parsed.data.growthProgressPercent ?? null,
          isFavorite: parsed.data.isFavorite,
        },
      });
    });
  } catch (e) {
    console.error(e);
    return { error: "Could not create plant. Try again." };
  }

  revalidatePath(`/collections/${collectionSlug}`);
  revalidatePath(`/collections/${collectionSlug}/plants`);
  revalidatePath("/plants");
  redirect(`/collections/${collectionSlug}/plants`);
}
