"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveUniqueCollectionSlug } from "@/lib/collections/slug";
import { createCollectionSchema } from "@/lib/validations/collection";
import {
  setCollectionCoverFromFile,
  validateCoverImageFile,
} from "@/lib/collections/cover-storage";
import { isSupabaseStorageConfigured } from "@/lib/supabase/admin";
import { CollectionMemberStatus } from "@prisma/client";
import { createActivityEvent } from "@/lib/activity/create-event";
import { ActivityEventTypes } from "@/lib/activity/event-types";
import { getActorLabel } from "@/lib/activity/actor-label";
import type { CreateCollectionFormState } from "./create-collection-form-state";

export async function createCollectionInAppAction(
  _prev: CreateCollectionFormState,
  formData: FormData,
): Promise<CreateCollectionFormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You need to sign in again." };
  }

  const parsed = createCollectionSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
  });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Check your input",
    };
  }

  const coverFile = formData.get("coverImage") as File | null;
  const storageOn = isSupabaseStorageConfigured();

  if (storageOn) {
    if (!coverFile || coverFile.size === 0) {
      return { error: "Add a cover photo for your collection." };
    }
    const chk = validateCoverImageFile(coverFile);
    if (!chk.ok) {
      return { error: chk.error };
    }
  }

  const userId = session.user.id;
  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!profile) {
    return { error: "Profile not found. Try signing out and back in." };
  }

  let collection: { id: string; slug: string };
  try {
    collection = await prisma.$transaction(async (tx) => {
      const slug = await resolveUniqueCollectionSlug(parsed.data.name, tx);
      const col = await tx.collection.create({
        data: {
          id: randomUUID(),
          slug,
          name: parsed.data.name.trim(),
          description: parsed.data.description,
          createdById: userId,
        },
      });
      await tx.collectionMember.create({
        data: {
          id: randomUUID(),
          collectionId: col.id,
          userId,
          status: CollectionMemberStatus.active,
        },
      });
      return { id: col.id, slug: col.slug };
    });
  } catch (e) {
    console.error(e);
    return { error: "Could not create collection. Try again." };
  }

  try {
    const who = await getActorLabel(userId);
    const colName = parsed.data.name.trim();
    await createActivityEvent({
      collectionId: collection.id,
      actorUserId: userId,
      eventType: ActivityEventTypes.collectionCreated,
      summary: `${who} created ${colName}`,
      payload: { name: colName },
      collectionSlug: collection.slug,
    });
  } catch (e) {
    console.error("activity event", e);
  }

  if (storageOn && coverFile && coverFile.size > 0) {
    const up = await setCollectionCoverFromFile(
      userId,
      collection.slug,
      coverFile,
    );
    if (!up.ok) {
      try {
        await prisma.collection.delete({ where: { id: collection.id } });
      } catch (delErr) {
        console.error(delErr);
      }
      return { error: up.error };
    }
    revalidatePath(`/collections/${collection.slug}`);
  }

  revalidatePath("/collections");
  revalidatePath("/dashboard");

  const openAfter = formData.get("openAfter") === "1";
  if (openAfter) {
    redirect(`/collections/${collection.slug}`);
  }

  return { success: true, slug: collection.slug };
}
