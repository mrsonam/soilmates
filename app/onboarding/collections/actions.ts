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
import { CollectionInviteStatus, CollectionMemberStatus } from "@prisma/client";
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
  });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid name",
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
