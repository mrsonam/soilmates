"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCollectionIdForActiveMember } from "@/lib/collections/access";
import { resolveUniqueAreaSlug } from "@/lib/collections/area-slug";
import {
  clearAreaCover,
  setAreaCoverFromFile,
  validateCoverImageFile,
} from "@/lib/collections/cover-storage";
import { deletePlantImageObject } from "@/lib/supabase/admin";
import { createActivityEvent } from "@/lib/activity/create-event";
import { ActivityEventTypes } from "@/lib/activity/event-types";
import { getActorLabel } from "@/lib/activity/actor-label";
import { createAreaSchema, updateAreaSchema } from "@/lib/validations/area";
import type { AreaMutationFormState } from "./area-form-state";

function revalidateCollection(collectionSlug: string) {
  revalidatePath(`/collections/${collectionSlug}`);
}

function revalidateArea(collectionSlug: string, areaSlug: string) {
  revalidatePath(`/collections/${collectionSlug}/areas/${areaSlug}`);
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

  const coverFile = formData.get("coverImage") as File | null;
  if (coverFile && coverFile.size > 0) {
    const chk = validateCoverImageFile(coverFile);
    if (!chk.ok) {
      return { error: chk.error };
    }
  }

  let newAreaId: string | null = null;
  let newAreaSlug: string | null = null;

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

      const id = randomUUID();
      await tx.area.create({
        data: {
          id,
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
      newAreaId = id;
      newAreaSlug = slug;
    });
  } catch (e) {
    console.error(e);
    return { error: "Could not create area. Try again." };
  }

  const areaIdForAfter = newAreaId;
  const areaSlugForAfter = newAreaSlug;
  const areaName = parsed.data.name.trim();
  const userId = session.user.id;

  let coverPayload: { buffer: ArrayBuffer; mime: string } | null = null;
  if (coverFile && coverFile.size > 0 && areaIdForAfter) {
    coverPayload = {
      buffer: await coverFile.arrayBuffer(),
      mime: coverFile.type.toLowerCase() || "image/jpeg",
    };
  }

  after(async () => {
    try {
      if (coverPayload && areaIdForAfter) {
        const file = new File([coverPayload.buffer], "cover", {
          type: coverPayload.mime,
        });
        const up = await setAreaCoverFromFile(
          userId,
          collectionSlug,
          areaIdForAfter,
          file,
        );
        if (!up.ok) {
          console.error("area cover upload", up.error);
        }
      }

      revalidateCollection(collectionSlug);
      if (areaSlugForAfter) {
        revalidateArea(collectionSlug, areaSlugForAfter);
      }
      if (areaIdForAfter) {
        try {
          const who = await getActorLabel(userId);
          await createActivityEvent({
            collectionId,
            actorUserId: userId,
            eventType: ActivityEventTypes.areaCreated,
            summary: `${who} added ${areaName} as an area`,
            payload: { areaName },
            collectionSlug,
          });
        } catch (e) {
          console.error("activity event", e);
        }
      }
    } catch (e) {
      console.error("createAreaAction after()", e);
    }
  });

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

  const existing = await prisma.area.findFirst({
    where: {
      id: areaId,
      collectionId,
      archivedAt: null,
    },
    select: { slug: true },
  });
  if (!existing) {
    return { error: "Area not found or you can't edit it." };
  }

  const removeCover = formData.get("removeCover") === "on";
  const coverFile = formData.get("coverImage") as File | null;

  if (removeCover) {
    const cleared = await clearAreaCover(
      session.user.id,
      collectionSlug,
      areaId,
    );
    if (!cleared.ok) {
      return { error: cleared.error };
    }
  } else if (coverFile && coverFile.size > 0) {
    const chk = validateCoverImageFile(coverFile);
    if (!chk.ok) {
      return { error: chk.error };
    }
    const up = await setAreaCoverFromFile(
      session.user.id,
      collectionSlug,
      areaId,
      coverFile,
    );
    if (!up.ok) {
      return { error: up.error };
    }
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
    return { error: "Area not found or you can't edit it." };
  }

  revalidateCollection(collectionSlug);
  revalidateArea(collectionSlug, existing.slug);
  try {
    const who = await getActorLabel(session.user.id);
    await createActivityEvent({
      collectionId,
      actorUserId: session.user.id,
      eventType: ActivityEventTypes.areaUpdated,
      summary: `${who} updated ${parsed.data.name.trim()}`,
      payload: { areaName: parsed.data.name.trim() },
      collectionSlug,
    });
  } catch (e) {
    console.error("activity event", e);
  }
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
    select: { id: true, coverImageStoragePath: true, slug: true },
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

  const oldCoverPath = area.coverImageStoragePath;

  await prisma.area.update({
    where: { id: areaId },
    data: {
      archivedAt: new Date(),
      coverImageStoragePath: null,
      coverImageMimeType: null,
    },
  });

  if (oldCoverPath) {
    await deletePlantImageObject(oldCoverPath);
  }

  revalidateCollection(collectionSlug);
  revalidateArea(collectionSlug, area.slug);
  revalidatePath(`/collections/${collectionSlug}/archive`);

  try {
    const areaRow = await prisma.area.findFirst({
      where: { id: areaId },
      select: { name: true },
    });
    const who = await getActorLabel(session.user.id);
    await createActivityEvent({
      collectionId,
      actorUserId: session.user.id,
      eventType: ActivityEventTypes.areaArchived,
      summary: `${who} archived area ${areaRow?.name ?? "an area"}`,
      payload: { areaId, areaSlug: area.slug },
      collectionSlug,
    });
  } catch (e) {
    console.error("activity areaArchived", e);
  }

  return { success: true };
}
