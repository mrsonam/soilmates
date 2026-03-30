"use server";

import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveUniqueCollectionSlug } from "@/lib/collections/slug";
import {
  createCollectionSchema,
  joinInviteSchema,
} from "@/lib/validations/collection";
import {
  setCollectionCoverFromFile,
  validateCoverImageFile,
} from "@/lib/collections/cover-storage";
import { isSupabaseStorageConfigured } from "@/lib/supabase/admin";
import { CollectionInviteStatus, CollectionMemberStatus } from "@prisma/client";
import { createActivityEvent } from "@/lib/activity/create-event";
import { ActivityEventTypes } from "@/lib/activity/event-types";
import { getActorLabel } from "@/lib/activity/actor-label";
import type { CollectionFormState } from "./collection-form-state";

export async function createCollectionAction(
  _prev: CollectionFormState,
  formData: FormData,
): Promise<CollectionFormState> {
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
      error: parsed.error.issues[0]?.message ?? "Invalid name",
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
  }

  redirect(`/collections/${collection.slug}`);
}

export async function joinCollectionByInviteAction(
  _prev: CollectionFormState,
  formData: FormData,
): Promise<CollectionFormState> {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return { error: "You need to sign in again." };
  }

  const parsed = joinInviteSchema.safeParse({
    token: String(formData.get("token") ?? ""),
  });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid invite code",
    };
  }

  const token = parsed.data.token.trim();
  const userId = session.user.id;
  const userEmail = session.user.email.trim().toLowerCase();

  const invite = await prisma.collectionInvite.findUnique({
    where: { token },
    include: {
      collection: { select: { id: true, slug: true, archivedAt: true } },
    },
  });

  if (!invite) {
    return { error: "That invite code doesn’t match any active invite." };
  }

  if (invite.collection.archivedAt) {
    return { error: "This collection is no longer available." };
  }

  if (invite.status !== CollectionInviteStatus.pending) {
    if (invite.status === CollectionInviteStatus.accepted) {
      return { error: "This invite has already been used." };
    }
    if (invite.status === CollectionInviteStatus.expired) {
      return { error: "This invite has expired." };
    }
    return { error: "This invite is no longer valid." };
  }

  if (invite.expiresAt.getTime() < Date.now()) {
    await prisma.collectionInvite.update({
      where: { id: invite.id },
      data: { status: CollectionInviteStatus.expired },
    });
    return { error: "This invite has expired." };
  }

  const inviteEmail = invite.email?.trim().toLowerCase();
  if (inviteEmail && inviteEmail !== userEmail) {
    return {
      error: "This invite was sent to a different email address.",
    };
  }

  const existing = await prisma.collectionMember.findUnique({
    where: {
      collectionId_userId: {
        collectionId: invite.collectionId,
        userId,
      },
    },
  });

  if (existing?.status === CollectionMemberStatus.active) {
    redirect(`/collections/${invite.collection.slug}`);
  }

  try {
    await prisma.$transaction(async (tx) => {
      if (existing && existing.status !== CollectionMemberStatus.active) {
        await tx.collectionMember.update({
          where: { id: existing.id },
          data: {
            status: CollectionMemberStatus.active,
            invitedById: invite.invitedById,
            joinedAt: new Date(),
          },
        });
      } else if (!existing) {
        await tx.collectionMember.create({
          data: {
            id: randomUUID(),
            collectionId: invite.collectionId,
            userId,
            invitedById: invite.invitedById,
            status: CollectionMemberStatus.active,
          },
        });
      }

      await tx.collectionInvite.update({
        where: { id: invite.id },
        data: {
          status: CollectionInviteStatus.accepted,
          acceptedAt: new Date(),
        },
      });
    });
  } catch (e) {
    console.error(e);
    return { error: "Could not join collection. Try again." };
  }

  redirect(`/collections/${invite.collection.slug}`);
}
