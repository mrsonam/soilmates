"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  CollectionInviteStatus,
  CollectionMemberStatus,
  Prisma,
} from "@prisma/client";
import { z } from "zod";
import { normalizeInviteEmail } from "@/lib/collections/invite-email";
import {
  createActivityEvent,
  insertActivityEvent,
  publishActivitySideEffects,
} from "@/lib/activity/create-event";
import { ActivityEventTypes } from "@/lib/activity/event-types";
import { getActorLabel } from "@/lib/activity/actor-label";

const emailSchema = z.string().trim().email("Enter a valid email address.");

const INVITE_TTL_DAYS = 30;

function revalidateInvitePaths(collectionSlug: string) {
  revalidatePath("/invitations");
  revalidatePath("/dashboard");
  revalidatePath(`/collections/${collectionSlug}/members`);
  revalidatePath(`/collections/${collectionSlug}`);
}

export async function createCollectionInvite(
  collectionSlug: string,
  rawEmail: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "You need to sign in." };
  }

  const parsed = emailSchema.safeParse(rawEmail);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid email" };
  }
  const email = normalizeInviteEmail(parsed.data);

  const membership = await prisma.collectionMember.findFirst({
    where: {
      userId: session.user.id,
      status: CollectionMemberStatus.active,
      collection: { slug: collectionSlug, archivedAt: null },
    },
    select: { collectionId: true, collection: { select: { id: true, name: true, slug: true } } },
  });
  if (!membership) {
    return { ok: false, error: "You don’t have access to this collection." };
  }

  const collectionId = membership.collectionId;

  const existingProfile = await prisma.profile.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existingProfile) {
    const alreadyMember = await prisma.collectionMember.findFirst({
      where: {
        collectionId,
        userId: existingProfile.id,
        status: CollectionMemberStatus.active,
      },
    });
    if (alreadyMember) {
      return { ok: false, error: "That person is already a member of this collection." };
    }
  }

  const now = new Date();
  const pendingDup = await prisma.collectionInvite.findFirst({
    where: {
      collectionId,
      email,
      status: CollectionInviteStatus.pending,
      expiresAt: { gt: now },
    },
  });
  if (pendingDup) {
    return { ok: false, error: "An invite is already pending for that email." };
  }

  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + INVITE_TTL_DAYS);

  try {
    await prisma.collectionInvite.create({
      data: {
        id: randomUUID(),
        collectionId,
        email,
        invitedById: session.user.id,
        token: randomUUID(),
        status: CollectionInviteStatus.pending,
        expiresAt,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, error: "An invite is already pending for that email." };
    }
    throw e;
  }

  const who = await getActorLabel(session.user.id);
  const colName = membership.collection.name;
  await createActivityEvent({
    collectionId,
    actorUserId: session.user.id,
    eventType: ActivityEventTypes.inviteCreated,
    summary: `${who} invited ${email}`,
    payload: { email },
    collectionSlug,
  });

  revalidateInvitePaths(collectionSlug);
  return { ok: true };
}

export async function revokeCollectionInvite(
  collectionSlug: string,
  inviteId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "You need to sign in." };
  }

  const membership = await prisma.collectionMember.findFirst({
    where: {
      userId: session.user.id,
      status: CollectionMemberStatus.active,
      collection: { slug: collectionSlug, archivedAt: null },
    },
    select: { collectionId: true, collection: { select: { name: true, slug: true } } },
  });
  if (!membership) {
    return { ok: false, error: "You don’t have access to this collection." };
  }

  const invite = await prisma.collectionInvite.findFirst({
    where: {
      id: inviteId,
      collectionId: membership.collectionId,
      status: CollectionInviteStatus.pending,
    },
  });
  if (!invite) {
    return { ok: false, error: "Invite not found or already handled." };
  }

  const now = new Date();
  await prisma.collectionInvite.update({
    where: { id: invite.id },
    data: {
      status: CollectionInviteStatus.revoked,
      revokedAt: now,
    } as Prisma.CollectionInviteUpdateInput,
  });

  const who = await getActorLabel(session.user.id);
  await createActivityEvent({
    collectionId: membership.collectionId,
    actorUserId: session.user.id,
    eventType: ActivityEventTypes.inviteRevoked,
    summary: `${who} revoked an invite to ${invite.email}`,
    payload: { inviteId: invite.id, email: invite.email },
    collectionSlug,
  });

  revalidateInvitePaths(collectionSlug);
  return { ok: true };
}

export async function acceptCollectionInvite(
  inviteId: string,
): Promise<
  { ok: true; collectionSlug: string } | { ok: false; error: string }
> {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return { ok: false, error: "You need to sign in." };
  }

  const userId = session.user.id;
  const userEmail = normalizeInviteEmail(session.user.email);

  const invite = await prisma.collectionInvite.findUnique({
    where: { id: inviteId },
    include: {
      collection: { select: { id: true, slug: true, name: true, archivedAt: true } },
    },
  });

  if (!invite || invite.collection.archivedAt) {
    return { ok: false, error: "That invite is no longer available." };
  }

  if (normalizeInviteEmail(invite.email ?? "") !== userEmail) {
    return { ok: false, error: "This invite was sent to a different email address." };
  }

  if (invite.status !== CollectionInviteStatus.pending) {
    if (invite.status === CollectionInviteStatus.accepted) {
      return { ok: true, collectionSlug: invite.collection.slug };
    }
    return { ok: false, error: "This invite is no longer active." };
  }

  if (invite.expiresAt.getTime() < Date.now()) {
    await prisma.collectionInvite.update({
      where: { id: invite.id },
      data: { status: CollectionInviteStatus.expired },
    });
    return { ok: false, error: "This invite has expired." };
  }

  const collectionId = invite.collectionId;
  const collectionSlug = invite.collection.slug;

  const existing = await prisma.collectionMember.findUnique({
    where: {
      collectionId_userId: { collectionId, userId },
    },
  });

  if (existing?.status === CollectionMemberStatus.active) {
    await prisma.collectionInvite.update({
      where: { id: invite.id },
      data: {
        status: CollectionInviteStatus.accepted,
        acceptedAt: new Date(),
      },
    });
    revalidateInvitePaths(collectionSlug);
    return { ok: true, collectionSlug };
  }

  const joinerName = await getActorLabel(userId);

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
          collectionId,
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

    await insertActivityEvent(tx, {
      collectionId,
      actorUserId: userId,
      eventType: ActivityEventTypes.inviteAccepted,
      summary: `${joinerName} joined ${invite.collection.name}`,
      payload: { inviteId: invite.id },
    });
  });

  await publishActivitySideEffects({
    collectionId,
    collectionSlug,
  });

  revalidateInvitePaths(collectionSlug);
  return { ok: true, collectionSlug };
}

export async function declineCollectionInvite(
  inviteId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return { ok: false, error: "You need to sign in." };
  }

  const userEmail = normalizeInviteEmail(session.user.email);

  const invite = await prisma.collectionInvite.findUnique({
    where: { id: inviteId },
    include: {
      collection: { select: { slug: true, name: true, archivedAt: true } },
    },
  });

  if (!invite || invite.collection.archivedAt) {
    return { ok: false, error: "That invite is no longer available." };
  }

  if (normalizeInviteEmail(invite.email ?? "") !== userEmail) {
    return { ok: false, error: "This invite was sent to a different email address." };
  }

  if (invite.status !== CollectionInviteStatus.pending) {
    return { ok: true };
  }

  await prisma.collectionInvite.update({
    where: { id: invite.id },
    data: {
      status: "declined" as CollectionInviteStatus,
      declinedAt: new Date(),
    } as Prisma.CollectionInviteUpdateInput,
  });

  const who = await getActorLabel(session.user.id);
  await createActivityEvent({
    collectionId: invite.collectionId,
    actorUserId: session.user.id,
    eventType: ActivityEventTypes.inviteDeclined,
    summary: `${who} declined joining ${invite.collection.name}`,
    payload: { inviteId: invite.id },
    collectionSlug: invite.collection.slug,
  });

  revalidatePath("/invitations");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function removeCollectionMember(
  collectionSlug: string,
  memberId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "You need to sign in." };
  }

  const membership = await prisma.collectionMember.findFirst({
    where: {
      userId: session.user.id,
      status: CollectionMemberStatus.active,
      collection: { slug: collectionSlug, archivedAt: null },
    },
    select: { collectionId: true, collection: { select: { name: true } } },
  });
  if (!membership) {
    return { ok: false, error: "You don’t have access to this collection." };
  }

  const target = await prisma.collectionMember.findFirst({
    where: {
      id: memberId,
      collectionId: membership.collectionId,
      status: CollectionMemberStatus.active,
    },
    include: {
      user: { select: { email: true, fullName: true } },
    },
  });

  if (!target) {
    return { ok: false, error: "Member not found." };
  }

  const activeCount = await prisma.collectionMember.count({
    where: {
      collectionId: membership.collectionId,
      status: CollectionMemberStatus.active,
    },
  });

  if (activeCount <= 1) {
    return { ok: false, error: "Can’t remove the last member of a collection." };
  }

  const actorLabel = await getActorLabel(session.user.id);
  const targetLabel =
    target.user.fullName?.trim()?.split(/\s+/)[0] ??
    target.user.email.split("@")[0];

  await prisma.collectionMember.update({
    where: { id: target.id },
    data: { status: CollectionMemberStatus.removed },
  });

  await createActivityEvent({
    collectionId: membership.collectionId,
    actorUserId: session.user.id,
    eventType: ActivityEventTypes.memberRemoved,
    summary: `${actorLabel} removed ${targetLabel} from ${membership.collection.name}`,
    payload: { removedUserId: target.userId },
    collectionSlug,
  });

  revalidateInvitePaths(collectionSlug);
  return { ok: true };
}
