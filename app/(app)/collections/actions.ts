"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveUniqueCollectionSlug } from "@/lib/collections/slug";
import { createCollectionSchema } from "@/lib/validations/collection";
import { CollectionMemberStatus } from "@prisma/client";
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

  const userId = session.user.id;
  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!profile) {
    return { error: "Profile not found. Try signing out and back in." };
  }

  let collection: { slug: string };
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
      return col;
    });
  } catch (e) {
    console.error(e);
    return { error: "Could not create collection. Try again." };
  }

  revalidatePath("/collections");
  revalidatePath("/dashboard");

  const openAfter = formData.get("openAfter") === "1";
  if (openAfter) {
    redirect(`/collections/${collection.slug}`);
  }

  return { success: true, slug: collection.slug };
}
